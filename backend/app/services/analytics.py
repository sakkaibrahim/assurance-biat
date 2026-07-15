from sqlalchemy import case, func, select
from sqlalchemy.orm import Session

from app.models.domain import Claim, Client, Contract, Payment
from app.services.governorates import CITY_TO_GOVERNORATE, DEFAULT_GOVERNORATE


def dashboard_summary(db: Session) -> dict:
    clients = db.scalar(select(func.count(Client.id))) or 0
    contracts = db.scalar(select(func.count(Contract.id))) or 0
    revenue = db.scalar(select(func.coalesce(func.sum(Payment.amount), 0)).where(Payment.status == "paid")) or 0
    claims = db.scalar(select(func.coalesce(func.sum(Claim.amount), 0))) or 0
    active = db.scalar(select(func.count(Contract.id)).where(Contract.status == "active")) or 0
    churn_proxy = round(max(0.03, min(0.42, 1 - (active / contracts if contracts else 0))), 3)

    return {
        "clients": clients,
        "contracts": contracts,
        "paid_revenue": round(revenue, 2),
        "claim_exposure": round(claims, 2),
        "active_contracts": active,
        "churn_rate": churn_proxy,
    }


def charts(db: Session) -> dict:
    product_rows = db.execute(
        select(Contract.product, func.count(Contract.id), func.sum(Contract.premium)).group_by(Contract.product)
    ).all()
    city_rows = db.execute(select(Client.city, func.count(Client.id)).group_by(Client.city).limit(12)).all()
    payment_rows = db.execute(
        select(
            Payment.status,
            func.count(Payment.id),
            func.sum(case((Payment.status == "late", Payment.amount), else_=0)),
        ).group_by(Payment.status)
    ).all()
    claims_rows = db.execute(
        select(Claim.product, func.count(Claim.id), func.coalesce(func.sum(Claim.amount), 0)).group_by(Claim.product)
    ).all()

    return {
        "products": [{"name": str(p), "contracts": c, "premium": round(float(s or 0), 2)} for p, c, s in product_rows],
        "cities": [{"name": city, "clients": count} for city, count in city_rows],
        "payments": [{"name": status, "count": count, "late_amount": round(float(amount or 0), 2)} for status, count, amount in payment_rows],
        "claims": [{"name": str(p), "claims": c, "amount": round(float(s or 0), 2)} for p, c, s in claims_rows],
    }


def executive_summary(db: Session) -> dict:
    clients = db.scalar(select(func.count(Client.id))) or 0
    contracts = db.scalar(select(func.count(Contract.id))) or 0
    active = db.scalar(select(func.count(Contract.id)).where(Contract.status == "active")) or 0
    revenue = db.scalar(select(func.coalesce(func.sum(Payment.amount), 0)).where(Payment.status == "paid")) or 0
    avg_premium = db.scalar(select(func.coalesce(func.avg(Contract.premium), 0))) or 0
    multi = db.scalar(
        select(func.count())
        .select_from(Client)
        .join(Contract)
        .group_by(Client.id)
        .having(func.count(Contract.id) > 1)
    ) or 0
    claims_open = db.scalar(select(func.count(Claim.id)).where(Claim.status == "open")) or 0
    claims_total = db.scalar(select(func.count(Claim.id))) or 0

    return {
        "clients": clients,
        "contracts": contracts,
        "active_contracts": active,
        "arpu": round(revenue / clients, 2) if clients else 0,
        "avg_premium": round(float(avg_premium), 2),
        "penetration_rate": round(multi / clients, 3) if clients else 0,
        "claims_open": claims_open,
        "claims_ratio": round(claims_open / claims_total, 3) if claims_total else 0,
    }


def city_exposure(db: Session) -> list[dict]:
    rows = (
        db.query(Client.city, func.count(Client.id), func.avg(Contract.region_risk_score), func.coalesce(func.sum(Contract.coverage_amount), 0))
        .join(Contract)
        .filter(Contract.status == "active")
        .group_by(Client.city)
        .all()
    )
    return [
        {
            "city": city,
            "clients": int(count or 0),
            "avg_risk": round(float(avg_risk or 0), 3),
            "exposure": round(float(exposure or 0), 2),
        }
        for city, count, avg_risk, exposure in rows
    ]


def governorates_exposure(db: Session) -> list[dict]:
    """
    Aggregate exposures by governorate using a static city->governorate mapping.
    Demo note: the DB only stores `Client.city`, not governorates.
    """
    # First aggregate by city (so we don't need to ship/keep heavy geo logic)
    city_rows = (
        db.query(
            Client.city,
            func.count(Client.id).label("clients_count"),
            func.avg(Contract.region_risk_score).label("avg_risk"),
            func.coalesce(func.sum(Contract.coverage_amount), 0).label("exposure"),
        )
        .join(Contract)
        .filter(Contract.status == "active")
        .group_by(Client.city)
        .all()
    )

    agg: dict[str, dict] = {}
    for city, clients_count, avg_risk, exposure in city_rows:
        gov = CITY_TO_GOVERNORATE.get(str(city), DEFAULT_GOVERNORATE)
        if gov not in agg:
            agg[gov] = {"governorate": gov, "clients": 0, "avg_risk_sum": 0.0, "avg_risk_count": 0, "exposure": 0.0}
        agg[gov]["clients"] += int(clients_count or 0)
        agg[gov]["exposure"] += float(exposure or 0)
        # Avg risk: keep a simple average across cities weighted by city clients (best-effort for demo)
        # If clients_count is 0, still avoid division by zero.
        if (clients_count or 0) > 0:
            agg[gov]["avg_risk_sum"] += float(avg_risk or 0) * int(clients_count or 0)
            agg[gov]["avg_risk_count"] += int(clients_count or 0)

    results = []
    for gov, r in agg.items():
        avg_risk = (r["avg_risk_sum"] / r["avg_risk_count"]) if r["avg_risk_count"] else 0.0
        results.append(
            {
                "governorate": gov,
                "clients": int(r["clients"]),
                "avg_risk": round(float(avg_risk or 0), 3),
                "exposure": round(float(r["exposure"] or 0), 2),
            }
        )

    # Stable ordering: highest exposure first
    results.sort(key=lambda x: x["exposure"], reverse=True)
    return results


