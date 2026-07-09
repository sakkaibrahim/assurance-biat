from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.api import ChatRequest, ChatResponse, RiskSimulationRequest
from app.services.alerts import intelligent_alerts
from app.services.analytics import charts, dashboard_summary
from app.services.copilot import client_360
from app.services.rag import answer_question
from app.services.risk import simulate_exposure

router = APIRouter()


@router.get("/dashboard/summary")
def get_dashboard_summary(db: Session = Depends(get_db)):
    return dashboard_summary(db)


@router.get("/dashboard/charts")
def get_dashboard_charts(db: Session = Depends(get_db)):
    return charts(db)


@router.post("/rag/chat", response_model=ChatResponse)
def chat(request: ChatRequest):
    return answer_question(request.question, request.client_id)


@router.get("/clients/{client_id}/360")
def get_client_360(client_id: int, db: Session = Depends(get_db)):
    return client_360(db, client_id)


@router.post("/risk/simulate")
def risk_simulation(request: RiskSimulationRequest, db: Session = Depends(get_db)):
    return simulate_exposure(db, request.event_type, request.severity, request.region)


@router.get("/alerts")
def get_alerts(db: Session = Depends(get_db)):
    return intelligent_alerts(db)

