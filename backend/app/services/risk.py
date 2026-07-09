from sqlalchemy.orm import Session

from app.models.domain import Contract


EVENT_MULTIPLIERS = {"inondation": 1.35, "tempete": 1.15, "seisme": 1.65}


def simulate_exposure(db: Session, event_type: str, severity: float, region: str | None = None) -> dict:
    severity = max(0.0, min(severity, 1.0))
    multiplier = EVENT_MULTIPLIERS.get(event_type.lower(), 1.1)
    query = db.query(Contract).filter(Contract.status == "active")
    contracts = query.limit(50000).all()
    exposed = []
    total = 0.0
    for contract in contracts:
        loss = contract.coverage_amount * contract.region_risk_score * severity * multiplier
        if loss > 1000:
            exposed.append({"contract_id": contract.id, "client_id": contract.client_id, "product": contract.product.value, "estimated_loss": round(loss, 2)})
            total += loss
    exposed.sort(key=lambda item: item["estimated_loss"], reverse=True)
    return {
        "event_type": event_type,
        "severity": severity,
        "estimated_loss": round(total, 2),
        "affected_contracts": len(exposed),
        "top_exposures": exposed[:10],
    }

