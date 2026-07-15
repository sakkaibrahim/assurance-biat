from sqlalchemy.orm import Session

from app.services.analytics import charts, city_exposure, dashboard_summary, executive_summary, governorates_exposure


def get_dashboard_summary(db: Session) -> dict:
    return dashboard_summary(db)


def get_dashboard_charts(db: Session) -> dict:
    return charts(db)


def get_executive_summary(db: Session) -> dict:
    return executive_summary(db)


def get_city_exposure(db: Session) -> list[dict]:
    return city_exposure(db)


def get_governorates_exposure(db: Session) -> list[dict]:
    return governorates_exposure(db)
