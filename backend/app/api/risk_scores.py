from fastapi import APIRouter, HTTPException

from app.schemas.onboarding import DropoffRiskScoreRead
from app.services.dropoff_prediction_service import (
    calculate_dropoff_risk,
    get_prioritized_cases,
    get_risk_score,
    list_risk_scores,
    save_risk_score,
)

router = APIRouter(prefix="/risk-scores", tags=["risk-scores"])


@router.get("", response_model=list[DropoffRiskScoreRead])
def get_risk_scores(min_level: str | None = None):
    return list_risk_scores(min_level=min_level)


@router.get("/{case_id}", response_model=DropoffRiskScoreRead)
def get_risk_score_route(case_id: int):
    score = get_risk_score(case_id)
    if score is None:
        raise HTTPException(status_code=404, detail="Score de risque introuvable")
    return score


@router.post("/calculate")
def calculate_risk_score(case_id: int):
    result = calculate_dropoff_risk(case_id)
    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])
    saved = save_risk_score(result)
    return {
        "case_id": saved.case_id,
        "risk_score": saved.risk_score,
        "risk_level": saved.risk_level,
        "risk_factors": saved.risk_factors,
        "suggested_action": saved.suggested_action,
        "calculated_at": saved.calculated_at,
    }


@router.get("/prioritized", response_model=list[dict])
def get_prioritized_route(limit: int = 10):
    return get_prioritized_cases(limit=limit)
