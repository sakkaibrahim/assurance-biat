from fastapi import APIRouter, HTTPException

from app.schemas.onboarding import OnboardingStepCreate, OnboardingStepRead, OnboardingStepUpdate, StepStatus
from app.services.step_tracking_service import (
    create_step,
    delete_step,
    get_overdue_steps,
    get_step,
    list_steps,
    update_step,
)

router = APIRouter(prefix="/steps", tags=["steps"])


@router.get("", response_model=list[OnboardingStepRead])
def get_steps(case_id: int | None = None):
    return list_steps(case_id=case_id)


@router.get("/overdue", response_model=list[OnboardingStepRead])
def get_overdue_steps_route():
    return get_overdue_steps()


@router.get("/{step_id}", response_model=OnboardingStepRead)
def get_step_route(step_id: int):
    step = get_step(step_id)
    if step is None:
        raise HTTPException(status_code=404, detail="Etape introuvable")
    return step


@router.post("", response_model=OnboardingStepRead)
def create_step_route(payload: OnboardingStepCreate):
    return create_step(payload)


@router.put("/{step_id}", response_model=OnboardingStepRead)
def update_step_route(step_id: int, payload: OnboardingStepUpdate):
    step = update_step(step_id, payload)
    if step is None:
        raise HTTPException(status_code=404, detail="Etape introuvable")
    return step


@router.put("/{step_id}/status")
def update_step_status_route(step_id: int, status: StepStatus):
    step = update_step(step_id, OnboardingStepUpdate(status=status))
    if step is None:
        raise HTTPException(status_code=404, detail="Etape introuvable")
    return step


@router.delete("/{step_id}")
def delete_step_route(step_id: int):
    if not delete_step(step_id):
        raise HTTPException(status_code=404, detail="Etape introuvable")
    return {"message": "Etape supprimee avec succes"}
