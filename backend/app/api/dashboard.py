from datetime import datetime, timedelta

from fastapi import APIRouter
from sqlalchemy import func

from app.database.db import SessionLocal
from app.database.models import (
    ClientInteractionTable,
    DocumentTable,
    DropoffRiskScoreTable,
    OnboardingCaseTable,
    OnboardingStepTable,
)

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("/onboarding")
def get_onboarding_dashboard():
    now = datetime.now()
    week_start = now - timedelta(days=7)
    with SessionLocal() as session:
        total_docs = session.query(func.count(DocumentTable.id)).scalar() or 0
        total_chats = session.query(func.count()).select_from(session.query(DocumentTable).subquery()).count() if False else 0

        cases_en_cours = session.query(func.count(OnboardingCaseTable.id)).filter(
            OnboardingCaseTable.status == "en_cours"
        ).scalar() or 0

        steps_bloques = session.query(func.count(OnboardingStepTable.id)).filter(
            OnboardingStepTable.status == "bloquee"
        ).scalar() or 0

        steps_en_retard = session.query(func.count(OnboardingStepTable.id)).filter(
            OnboardingStepTable.status != "terminee",
            OnboardingStepTable.status != "bloquee",
            OnboardingStepTable.deadline < now,
        ).scalar() or 0

        onboardings_termines_semaine = session.query(func.count(OnboardingCaseTable.id)).filter(
            OnboardingCaseTable.status == "termine",
            OnboardingCaseTable.updated_at >= week_start,
        ).scalar() or 0

        total_steps = session.query(func.count(OnboardingStepTable.id)).scalar() or 0
        steps_termines = session.query(func.count(OnboardingStepTable.id)).filter(
            OnboardingStepTable.status == "terminee"
        ).scalar() or 0
        taux_completion = round((steps_termines / total_steps * 100), 1) if total_steps > 0 else 0.0

        risques_eleves = session.query(func.count(DropoffRiskScoreTable.id)).filter(
            DropoffRiskScoreTable.risk_level.in_(["eleve", "critique"])
        ).scalar() or 0

        interactions_recentes = session.query(ClientInteractionTable).filter(
            ClientInteractionTable.created_at >= week_start
        ).count()

        return {
            "documents_indexes": total_docs,
            "conversations_ia": total_chats,
            "onboardings_en_cours": cases_en_cours,
            "dossiers_bloques": steps_bloques,
            "etapes_en_retard": steps_en_retard,
            "onboardings_termines_semaine": onboardings_termines_semaine,
            "taux_completion_global": taux_completion,
            "clients_haut_risque": risques_eleves,
            "activite_recente": interactions_recentes,
            "generated_at": now.isoformat(),
        }
