from sqlalchemy.orm import Session

from app.services.analytics import charts, dashboard_summary


def get_dashboard_summary(db: Session) -> dict:
    return dashboard_summary(db)


def get_dashboard_charts(db: Session) -> list[dict]:
    return charts(db)
