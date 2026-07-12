from sqlalchemy.orm import Session

from app.services.alerts import intelligent_alerts
from app.services.notifications import list_notifications, send_alert_digest


def list_alerts(db: Session) -> list[dict]:
    return intelligent_alerts(db)


def email_alerts(db: Session, to: str | None = None) -> dict:
    alerts = intelligent_alerts(db)
    return send_alert_digest(alerts, to)


def notification_history(limit: int = 20) -> list[dict]:
    return list_notifications(limit=limit)
