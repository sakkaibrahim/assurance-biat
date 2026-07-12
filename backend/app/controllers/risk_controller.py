from app.services.risk import simulate_exposure
from sqlalchemy.orm import Session


def simulate_risk(db: Session, event_type: str, severity: float, region: str | None = None) -> dict:
    return simulate_exposure(db=db, event_type=event_type, severity=severity, region=region)
