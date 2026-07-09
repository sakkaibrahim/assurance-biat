from sqlalchemy.orm import Session

from app.models.domain import Claim, Contract, Payment


def intelligent_alerts(db: Session) -> list[dict]:
    late = db.query(Payment).filter(Payment.status == "late").limit(5).all()
    risky = db.query(Contract).filter(Contract.region_risk_score > 0.72, Contract.status == "active").limit(5).all()
    high_claims = db.query(Claim).filter(Claim.amount > 20000).limit(5).all()
    alerts = []
    alerts += [{"type": "payment", "severity": "medium", "title": f"Paiement en retard contrat #{p.contract_id}", "amount": p.amount} for p in late]
    alerts += [{"type": "risk", "severity": "high", "title": f"Exposition élevée contrat #{c.id}", "score": c.region_risk_score} for c in risky]
    alerts += [{"type": "claim", "severity": "high", "title": f"Sinistre majeur #{c.id}", "amount": c.amount} for c in high_claims]
    return alerts[:12]

