from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.controllers.alerts_controller import email_alerts, list_alerts, notification_history
from app.controllers.analytics_controller import get_dashboard_charts, get_dashboard_summary
from app.controllers.rag_controller import chat
from app.controllers.risk_controller import simulate_risk
from app.controllers.sales_controller import get_client_360, list_clients, list_facets
from app.db.session import get_db
from app.schemas.api import ChatRequest, ChatResponse, RiskSimulationRequest

router = APIRouter()


@router.get("/dashboard/summary")
def read_dashboard_summary(db: Session = Depends(get_db)):
    return get_dashboard_summary(db)


@router.get("/dashboard/charts")
def read_dashboard_charts(db: Session = Depends(get_db)):
    return get_dashboard_charts(db)


@router.post("/rag/chat", response_model=ChatResponse)
def rag_chat(request: ChatRequest, db: Session = Depends(get_db)):
    return chat(question=request.question, client_id=request.client_id, db=db)


@router.get("/clients")
def clients_list(
    search: str | None = None,
    city: str | None = None,
    segment: str | None = None,
    limit: int = 24,
    offset: int = 0,
    db: Session = Depends(get_db),
):
    return list_clients(db=db, search=search, city=city, segment=segment, limit=limit, offset=offset)


@router.get("/clients/facets")
def clients_facets(db: Session = Depends(get_db)):
    return list_facets(db=db)


@router.get("/clients/{client_id}/360")
def client_360(client_id: int, db: Session = Depends(get_db)):
    return get_client_360(db=db, client_id=client_id)


@router.post("/risk/simulate")
def risk_simulation(request: RiskSimulationRequest, db: Session = Depends(get_db)):
    return simulate_risk(db=db, event_type=request.event_type, severity=request.severity, region=request.region)


@router.get("/alerts")
def get_alerts(db: Session = Depends(get_db)):
    return list_alerts(db)


@router.post("/alerts/email")
def post_alerts_email(to: str | None = None, db: Session = Depends(get_db)):
    return email_alerts(db=db, to=to)


@router.get("/alerts/notifications")
def get_notification_history():
    return notification_history()

