from fastapi import APIRouter, HTTPException

from app.schemas.onboarding import OnboardingCaseCreate, OnboardingCaseRead, OnboardingCaseUpdate, OnboardingStatus
from app.services.onboarding_service import (
    create_case,
    delete_case,
    get_case,
    list_cases,
    update_case,
)

router = APIRouter(prefix="/onboarding", tags=["onboarding"])


@router.get("", response_model=list[OnboardingCaseRead])
def get_onboarding_cases(product_type: str | None = None, status: str | None = None, agent: str | None = None):
    status_enum = OnboardingStatus(status) if status else None
    return list_cases(product_type=product_type, status=status, agent=agent)


@router.get("/{case_id}", response_model=OnboardingCaseRead)
def get_onboarding_case(case_id: int):
    case = get_case(case_id)
    if case is None:
        raise HTTPException(status_code=404, detail="Dossier d'onboarding introuvable")
    return case


@router.post("", response_model=OnboardingCaseRead)
def create_onboarding_case(payload: OnboardingCaseCreate):
    return create_case(payload)


@router.put("/{case_id}", response_model=OnboardingCaseRead)
def update_onboarding_case(case_id: int, payload: OnboardingCaseUpdate):
    case = update_case(case_id, payload)
    if case is None:
        raise HTTPException(status_code=404, detail="Dossier d'onboarding introuvable")
    return case


@router.put("/{case_id}/status")
def update_onboarding_case_status(case_id: int, status: OnboardingStatus):
    case = update_case(case_id, OnboardingCaseUpdate(status=status))
    if case is None:
        raise HTTPException(status_code=404, detail="Dossier d'onboarding introuvable")
    return case


@router.delete("/{case_id}")
def delete_onboarding_case(case_id: int):
    if not delete_case(case_id):
        raise HTTPException(status_code=404, detail="Dossier d'onboarding introuvable")
    return {"message": "Dossier supprime avec succes"}
