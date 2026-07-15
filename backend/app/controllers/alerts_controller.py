from sqlalchemy.orm import Session

from app.services.alerts import intelligent_alerts
from app.services.notifications import list_notifications, send_alert_digest


def list_alerts(
    db: Session,
    min_claim: float = 20000.0,
    min_risk: float = 0.72,
    include_payment: bool = True,
    include_exposure: bool = True,
    include_claim: bool = True,
    include_churn: bool = True,
    include_cross_sell: bool = True,
    include_revenue: bool = True,
) -> list[dict]:
    return intelligent_alerts(
        db,
        min_claim=min_claim,
        min_risk=min_risk,
        include_payment=include_payment,
        include_exposure=include_exposure,
        include_claim=include_claim,
        include_churn=include_churn,
        include_cross_sell=include_cross_sell,
        include_revenue=include_revenue,
    )


def email_alerts(db: Session, to: str | None = None) -> dict:
    alerts = intelligent_alerts(db)
    return send_alert_digest(alerts, to)


def notification_history(limit: int = 20) -> list[dict]:
    return list_notifications(limit=limit)
