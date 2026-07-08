from datetime import datetime
from fastapi import APIRouter

from app.schemas.task import TaskRead
from app.services.planning_service import build_daily_plan, generate_weekly_summary

router = APIRouter(prefix="/planning", tags=["planning"])


@router.get("/daily")
def get_daily_plan(date: str | None = None):
    target_date = datetime.fromisoformat(date) if date else datetime.now()
    return build_daily_plan(target_date)


@router.get("/weekly")
def get_weekly_summary():
    return generate_weekly_summary()
