from sqlalchemy import case, func, select
from sqlalchemy.orm import Session

from app.models.domain import Claim, Client, Contract, Payment


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

