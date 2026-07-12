from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.domain import Claim, Client, Contract, Payment

SEVERITY_RANK = {"high": 3, "medium": 2, "low": 1}

ALERT_TYPES = {
    "paiement": "Paiement",
    "exposition": "Exposition",
    "sinistre": "Sinistre",
    "churn": "Risque de résiliation",
    "cross-sell": "Vente croisée",
    "revenu": "Revenu",
}


def intelligent_alerts(db: Session) -> list[dict]:
    alerts: list[dict] = []

    # 1. Paiements en retard
    late = db.query(Payment).filter(Payment.status == "late").limit(8).all()
    for p in late:
        contract = db.get(Contract, p.contract_id)
        alerts.append({
            "id": f"pay-{p.id}",
            "type": "paiement",
            "severity": "medium",
            "title": f"Paiement en retard · contrat #{p.contract_id}",
            "description": f"Échéance impayée de {round(p.amount, 2):,.0f} TND.",
            "impact": round(float(p.amount), 2),
            "client_id": contract.client_id if contract else None,
            "score": 0.5,
        })

    # 2. Contrats à forte exposition régionale
    risky = (
        db.query(Contract)
        .filter(Contract.region_risk_score > 0.72, Contract.status == "active")
        .limit(6)
        .all()
    )
    for c in risky:
        alerts.append({
            "id": f"risk-{c.id}",
            "type": "exposition",
            "severity": "high",
            "title": f"Exposition élevée · contrat #{c.id}",
            "description": f"Score de risque région {round(c.region_risk_score, 2)} sur le produit {c.product.value}.",
            "impact": round(float(c.coverage_amount), 2),
            "client_id": c.client_id,
            "score": round(float(c.region_risk_score), 2),
        })

    # 3. Sinistres majeurs
    major_claims = db.query(Claim).filter(Claim.amount > 20000).limit(8).all()
    for cl in major_claims:
        alerts.append({
            "id": f"claim-{cl.id}",
            "type": "sinistre",
            "severity": "high",
            "title": f"Sinistre majeur #{cl.id}",
            "description": f"Montant {round(cl.amount, 2):,.0f} TND · statut {cl.status.value}.",
            "impact": round(float(cl.amount), 2),
            "client_id": cl.client_id,
            "score": min(1.0, float(cl.amount) / 100000),
        })

    # 4. Risque de churn (clients standard sous-équipés avec sinistres)
    churn_clients = (
        db.query(Client)
        .join(Contract)
        .filter(Client.segment == "standard")
        .group_by(Client)
        .having(func.count(Contract.id) <= 1)
        .limit(6)
        .all()
    )
    for cl in churn_clients:
        alerts.append({
            "id": f"churn-{cl.id}",
            "type": "churn",
            "severity": "high",
            "title": f"Risque de résiliation · {cl.full_name}",
            "description": f"Client {cl.segment} sous-équipé ({cl.city}). À re-contacter en priorité.",
            "impact": None,
            "client_id": cl.id,
            "score": 0.72,
        })

    # 5. Opportunités de vente croisée (profils aisés sous-équipés)
    xs_clients = (
        db.query(Client)
        .join(Contract)
        .filter(Client.segment.in_(["affluent", "premium"]))
        .group_by(Client)
        .having(func.count(Contract.id) == 1)
        .limit(6)
        .all()
    )
    for cl in xs_clients:
        alerts.append({
            "id": f"xs-{cl.id}",
            "type": "cross-sell",
            "severity": "low",
            "title": f"Cross-sell · {cl.full_name}",
            "description": f"Profil {cl.segment} à fort revenu, 1 seul contrat. Opportunité d'équipement.",
            "impact": None,
            "client_id": cl.id,
            "score": 0.3,
        })

    # 6. Revenu à risque (agrégé)
    late_sum = db.query(func.coalesce(func.sum(Payment.amount), 0)).filter(Payment.status == "late").scalar() or 0
    alerts.append({
        "id": "rev-risk",
        "type": "revenu",
        "severity": "medium",
        "title": "Revenu à risque (impayés)",
        "description": "Total des échéances en retard sur l'ensemble du portefeuille.",
        "impact": round(float(late_sum), 2),
        "client_id": None,
        "score": 0.55,
    })

    alerts.sort(key=lambda a: (SEVERITY_RANK.get(a["severity"], 1), a["score"]), reverse=True)
    return alerts[:24]
