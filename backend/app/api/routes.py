from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.controllers.alerts_controller import email_alerts, list_alerts, notification_history
from app.controllers.analytics_controller import get_city_exposure, get_dashboard_charts, get_dashboard_summary, get_executive_summary, get_governorates_exposure
from app.controllers.quotes_controller import quote_estimate
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


@router.get("/dashboard/executive")
def read_executive_summary(db: Session = Depends(get_db)):
    return get_executive_summary(db)


@router.get("/analytics/cities-exposure")
def read_city_exposure(db: Session = Depends(get_db)):
    return get_city_exposure(db)


@router.get("/analytics/governorates-exposure")
def read_governorates_exposure(db: Session = Depends(get_db)):
    return get_governorates_exposure(db)


@router.post("/quote/estimate")
def post_quote_estimate(product: str, age: int = 35, city: str = "", income: float = 40000.0, region_risk: float = 0.2):
    return quote_estimate(product=product, age=age, city=city, income=income, region_risk=region_risk)


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
def get_alerts(
    min_claim: float = 20000.0,
    min_risk: float = 0.72,
    include_payment: bool = True,
    include_exposure: bool = True,
    include_claim: bool = True,
    include_churn: bool = True,
    include_cross_sell: bool = True,
    include_revenue: bool = True,
    db: Session = Depends(get_db),
):
    return list_alerts(
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


@router.post("/alerts/email")
def post_alerts_email(to: str | None = None, db: Session = Depends(get_db)):
    return email_alerts(db=db, to=to)


@router.get("/alerts/notifications")
def get_notification_history():
    return notification_history()

