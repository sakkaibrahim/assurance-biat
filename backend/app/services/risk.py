from sqlalchemy.orm import Session

from app.models.domain import Client, Contract

EVENT_MULTIPLIERS = {"inondation": 1.35, "tempete": 1.15, "seisme": 1.65}

PRODUCT_LABELS = {
    "auto": "Auto",
    "home": "Habitation",
    "health": "Santé",
    "life": "Vie",
    "travel": "Voyage",
    "business": "Entreprise",
}

SEVERITY_LABELS = {
    "inondation": "Crue / submersion",
    "tempete": "Vent violent / grêle",
    "seisme": "Séisme / réplique",
}


def _scenarios():
    return [
        {"event_type": et, "multiplier": mult, "label": SEVERITY_LABELS.get(et, et)}
        for et, mult in EVENT_MULTIPLIERS.items()
    ]


def simulate_exposure(db: Session, event_type: str, severity: float, region: str | None = None) -> dict:
    severity = max(0.0, min(severity, 1.0))
    key = event_type.lower()
    multiplier = EVENT_MULTIPLIERS.get(key, 1.1)

    query = db.query(Contract, Client.city).join(Client).filter(Contract.status == "active")
    if region:
        query = query.filter(Client.city == region)
    rows = query.limit(50000).all()

    exposed = []
    total = 0.0
    exposed_coverage = 0.0
    by_product: dict[str, float] = {}
    by_city: dict[str, float] = {}
    product_count: dict[str, int] = {}
    city_count: dict[str, int] = {}

    for contract, city in rows:
        loss = contract.coverage_amount * contract.region_risk_score * severity * multiplier
        if loss > 1000:
            exposed.append({
                "contract_id": contract.id,
                "client_id": contract.client_id,
                "product": contract.product.value,
                "estimated_loss": round(loss, 2),
            })
            total += loss
            exposed_coverage += contract.coverage_amount
            p = contract.product.value
            c = city or "Inconnu"
            by_product[p] = by_product.get(p, 0.0) + loss
            by_city[c] = by_city.get(c, 0.0) + loss
            product_count[p] = product_count.get(p, 0) + 1
            city_count[c] = city_count.get(c, 0) + 1

    exposed.sort(key=lambda item: item["estimated_loss"], reverse=True)

    by_product_list = [
        {"product": p, "label": PRODUCT_LABELS.get(p, p), "estimated_loss": round(v, 2), "count": product_count[p]}
        for p, v in sorted(by_product.items(), key=lambda kv: kv[1], reverse=True)
    ]
    by_city_list = [
        {"city": c, "estimated_loss": round(v, 2), "count": city_count[c]}
        for c, v in sorted(by_city.items(), key=lambda kv: kv[1], reverse=True)
    ]

    return {
        "event_type": event_type,
        "severity": severity,
        "multiplier": multiplier,
        "scenarios": _scenarios(),
        "estimated_loss": round(total, 2),
        "exposed_coverage": round(exposed_coverage, 2),
        "affected_contracts": len(exposed),
        "by_product": by_product_list,
        "by_city": by_city_list,
        "top_exposures": exposed[:10],
    }
