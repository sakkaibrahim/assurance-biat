from sqlalchemy.orm import Session

from app.models.domain import Claim, Client, Contract, Interaction, ProductType


def client_360(db: Session, client_id: int) -> dict:
    client = db.get(Client, client_id)
    if not client:
        return {}
    contracts = db.query(Contract).filter(Contract.client_id == client_id).all()
    claims = db.query(Claim).filter(Claim.client_id == client_id).order_by(Claim.claim_date.desc()).limit(10).all()
    interactions = db.query(Interaction).filter(Interaction.client_id == client_id).order_by(Interaction.created_at.desc()).limit(10).all()
    owned = {contract.product.value for contract in contracts}

    return {
        "client": {
            "id": client.id,
            "full_name": client.full_name,
            "email": client.email,
            "city": client.city,
            "segment": client.segment,
            "age": client.age,
            "income": client.income,
        },
        "contracts": [
            {
                "id": c.id,
                "product": c.product.value,
                "premium": c.premium,
                "coverage_amount": c.coverage_amount,
                "status": c.status,
                "risk": c.region_risk_score,
            }
            for c in contracts
        ],
        "claims": [{"id": c.id, "product": c.product.value, "amount": c.amount, "status": c.status.value} for c in claims],
        "interactions": [{"channel": i.channel, "intent": i.intent, "sentiment": i.sentiment, "notes": i.notes} for i in interactions],
        "recommendations": recommendations_for(client, owned),
        "churn": churn_score(client, contracts, claims, interactions),
    }


def recommendations_for(client: Client, owned_products: set[str]) -> list[dict]:
    candidates = []
    rules = [
        (ProductType.life.value, client.age > 35 or client.income > 50000, "Protection familiale et patrimoine"),
        (ProductType.home.value, "home" not in owned_products and client.income > 30000, "Couverture habitation adaptée au profil"),
        (ProductType.health.value, client.age > 45, "Renforcement santé prioritaire"),
        (ProductType.travel.value, client.segment in {"premium", "affluent"}, "Offre voyage annuelle premium"),
        (ProductType.business.value, client.income > 80000, "Protection activité et responsabilité"),
    ]
    for product, match, reason in rules:
        if product not in owned_products and match:
            candidates.append({"product": product, "score": 0.72 + min(client.income / 500000, 0.2), "reason": reason})
    return sorted(candidates, key=lambda item: item["score"], reverse=True)[:4]


def churn_score(client: Client, contracts: list[Contract], claims: list[Claim], interactions: list[Interaction]) -> dict:
    late_factor = 0.08 if client.segment == "standard" else 0.03
    claim_factor = min(len(claims) * 0.06, 0.24)
    sentiment_factor = 0.2 if interactions and sum(i.sentiment for i in interactions) / len(interactions) < -0.15 else 0.04
    coverage_factor = 0.1 if len(contracts) <= 1 else 0.02
    score = min(0.92, late_factor + claim_factor + sentiment_factor + coverage_factor)
    factors = [
        {"factor": "Historique sinistres", "impact": round(claim_factor, 2)},
        {"factor": "Sentiment interactions", "impact": round(sentiment_factor, 2)},
        {"factor": "Faible multi-equipement", "impact": round(coverage_factor, 2)},
        {"factor": "Segment/prix", "impact": round(late_factor, 2)},
    ]
    return {"score": round(score, 3), "level": "high" if score > 0.45 else "medium" if score > 0.22 else "low", "factors": factors}

