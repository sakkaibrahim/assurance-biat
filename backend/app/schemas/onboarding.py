from datetime import datetime
from enum import Enum
from pydantic import BaseModel, Field


class OnboardingStatus(str, Enum):
    en_cours = "en_cours"
    bloque = "bloque"
    termine = "termine"
    abandonne = "abandonne"


class StepStatus(str, Enum):
    a_faire = "a_faire"
    en_cours = "en_cours"
    terminee = "terminee"
    bloquee = "bloquee"


class OnboardingCaseBase(BaseModel):
    client_name: str = Field(min_length=1, max_length=255)
    client_email: str | None = None
    client_phone: str | None = None
    product_type: str = Field(min_length=1, max_length=100)
    current_step: int = Field(ge=1, default=1)
    expected_completion_date: datetime | None = None
    assigned_agent: str | None = None


class OnboardingCaseCreate(OnboardingCaseBase):
    pass


class OnboardingCaseUpdate(BaseModel):
    client_name: str | None = Field(min_length=1, max_length=255)
    client_email: str | None = None
    client_phone: str | None = None
    product_type: str | None = Field(min_length=1, max_length=100)
    current_step: int | None = Field(ge=1)
    status: OnboardingStatus | None = None
    expected_completion_date: datetime | None = None
    assigned_agent: str | None = None


class OnboardingCaseRead(OnboardingCaseBase):
    id: int
    status: OnboardingStatus
    start_date: datetime | None = None
    created_at: datetime | None = None
    updated_at: datetime | None = None

    class Config:
        from_attributes = True


class OnboardingStepBase(BaseModel):
    step_name: str = Field(min_length=1, max_length=255)
    status: StepStatus = StepStatus.a_faire
    deadline: datetime | None = None
    required_documents: str | None = None
    notes: str | None = None


class OnboardingStepCreate(OnboardingStepBase):
    case_id: int


class OnboardingStepUpdate(BaseModel):
    step_name: str | None = Field(min_length=1, max_length=255)
    status: StepStatus | None = None
    deadline: datetime | None = None
    completed_at: datetime | None = None
    required_documents: str | None = None
    notes: str | None = None


class OnboardingStepRead(OnboardingStepBase):
    id: int
    case_id: int
    completed_at: datetime | None = None
    created_at: datetime | None = None

    class Config:
        from_attributes = True


class InteractionType(str, Enum):
    appel = "appel"
    email = "email"
    sms = "sms"
    reunion = "reunion"


class ClientInteractionBase(BaseModel):
    interaction_type: InteractionType
    notes: str | None = None
    next_followup_date: datetime | None = None


class ClientInteractionCreate(ClientInteractionBase):
    case_id: int
    created_by: str | None = None


class ClientInteractionUpdate(BaseModel):
    interaction_type: InteractionType | None = None
    notes: str | None = None
    next_followup_date: datetime | None = None


class ClientInteractionRead(ClientInteractionBase):
    id: int
    case_id: int
    interaction_date: datetime | None = None
    created_by: str | None = None
    created_at: datetime | None = None

    class Config:
        from_attributes = True


class RiskLevel(str, Enum):
    faible = "faible"
    moyen = "moyen"
    eleve = "eleve"
    critique = "critique"


class DropoffRiskScoreRead(BaseModel):
    id: int
    case_id: int
    risk_score: float
    risk_level: RiskLevel
    risk_factors: str | None = None
    suggested_action: str | None = None
    calculated_at: datetime | None = None

    class Config:
        from_attributes = True


class DropoffRiskScoreCreate(BaseModel):
    case_id: int
    risk_score: float = Field(ge=0.0, le=1.0)
    risk_level: RiskLevel
    risk_factors: str | None = None
    suggested_action: str | None = None
