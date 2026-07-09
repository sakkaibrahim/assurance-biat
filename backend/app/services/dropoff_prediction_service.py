from __future__ import annotations

import json
from datetime import datetime
from typing import Sequence

from app.database.db import SessionLocal
from app.database.models import DropoffRiskScoreTable, OnboardingCaseTable, OnboardingStepTable, ClientInteractionTable
from app.services.step_tracking_service import get_overdue_steps
from app.services.interaction_service import list_interactions

W_AVG_STEP = 0.20
W_RELANCE = 0.25
W_DOCS = 0.20
W_INACTIVITY = 0.25
W_DEADLINE = 0.10

PRODUCT_ABANDON_RATES = {
    "sante": 0.15,
    "auto": 0.10,
    "habitation": 0.08,
    "vie": 0.20,
}


def _normalize(value: float, max_val: float) -> float:
    if max_val == 0:
        return 0.0
    return min(value / max_val, 1.0)


def calculate_dropoff_risk(case_id: int) -> dict:
    with SessionLocal() as session:
        case = session.query(OnboardingCaseTable).filter(OnboardingCaseTable.id == case_id).first()
        if case is None:
            return {"error": "Dossier introuvable"}

        all_steps = session.query(OnboardingStepTable).filter(OnboardingStepTable.case_id == case_id).all()
        interactions = session.query(ClientInteractionTable).filter(ClientInteractionTable.case_id == case_id).all()

    total_steps = len(all_steps)
    if total_steps == 0:
        return {"error": "Aucune etape definie pour ce dossier"}

    now = datetime.now()
    overdue_steps = [s for s in all_steps if s.status not in ["terminee", "bloquee"] and s.deadline and s.deadline < now]
    avg_step_duration = 3
    max_avg_step_duration = 7
    step_duration_factor = _normalize(float(len(overdue_steps)), max_avg_step_duration)

    relances_sans_reponse = sum(1 for i in interactions if i.next_followup_date and i.next_followup_date < now)
    relance_factor = _normalize(float(relances_sans_reponse), 3.0)

    required_docs = sum(len(json.loads(s.required_documents or "[]")) for s in all_steps)
    completed_docs = 0
    completed_steps = [s for s in all_steps if s.status == "terminee"]
    for step in completed_steps:
        docs = json.loads(step.required_documents or "[]")
        completed_docs += len(docs)
    missing_docs = max(0, required_docs - completed_docs)
    doc_factor = _normalize(float(missing_docs), 5.0)

    last_interaction = max((i.interaction_date for i in interactions), default=case.start_date)
    if last_interaction:
        days_inactive = (now - last_interaction).days
    else:
        days_inactive = 30
    inactivity_factor = _normalize(float(days_inactive), 14.0)

    days_to_deadline = (case.expected_completion_date - now).days if case.expected_completion_date else 14
    deadline_factor = _normalize(max(0.0, -float(days_to_deadline)), 14.0)

    score = (
        W_AVG_STEP * step_duration_factor
        + W_RELANCE * relance_factor
        + W_DOCS * doc_factor
        + W_INACTIVITY * inactivity_factor
        + W_DEADLINE * deadline_factor
    )

    score = max(0.0, min(1.0, score))

    if score < 0.3:
        risk_level = "faible"
    elif score < 0.6:
        risk_level = "moyen"
    elif score < 0.8:
        risk_level = "eleve"
    else:
        risk_level = "critique"

    risk_factors = {
        "etapes_retard": len(overdue_steps),
        "relances_sans_reponse": relances_sans_reponse,
        "documents_manquants": missing_docs,
        "jours_inactivite": days_inactive,
        "jours_avant_echeance": days_to_deadline,
    }

    if relances_sans_reponse >= 3:
        suggested_action = "Contacter le client en urgence par telephone"
    elif missing_docs > 0:
        suggested_action = "Envoyer un rappel pour les documents manquants"
    elif days_inactive > 7:
        suggested_action = "Planifier une relance prioritaire"
    elif len(overdue_steps) > 0:
        suggested_action = "Identifier le blocage et escalader si necessaire"
    else:
        suggested_action = "Surveiller le dossier de pres"

    return {
        "case_id": case_id,
        "risk_score": round(score, 2),
        "risk_level": risk_level,
        "risk_factors": json.dumps(risk_factors, ensure_ascii=False),
        "suggested_action": suggested_action,
    }


def save_risk_score(result: dict) -> DropoffRiskScoreTable:
    with SessionLocal() as session:
        existing = session.query(DropoffRiskScoreTable).filter(
            DropoffRiskScoreTable.case_id == result["case_id"]
        ).first()
        if existing:
            existing.risk_score = result["risk_score"]
            existing.risk_level = result["risk_level"]
            existing.risk_factors = result["risk_factors"]
            existing.suggested_action = result["suggested_action"]
            existing.calculated_at = datetime.now()
            session.commit()
            session.refresh(existing)
            return existing

        score = DropoffRiskScoreTable(
            case_id=result["case_id"],
            risk_score=result["risk_score"],
            risk_level=result["risk_level"],
            risk_factors=result["risk_factors"],
            suggested_action=result["suggested_action"],
        )
        session.add(score)
        session.commit()
        session.refresh(score)
        return score


def get_risk_score(case_id: int) -> DropoffRiskScoreTable | None:
    with SessionLocal() as session:
        return session.query(DropoffRiskScoreTable).filter(DropoffRiskScoreTable.case_id == case_id).first()


def list_risk_scores(min_level: str | None = None) -> Sequence[DropoffRiskScoreTable]:
    with SessionLocal() as session:
        query = session.query(DropoffRiskScoreTable)
        if min_level:
            query = query.filter(
                DropoffRiskScoreTable.risk_level.in_([min_level, "eleve", "critique"])
            )
        return query.order_by(DropoffRiskScoreTable.risk_score.desc()).all()


def get_prioritized_cases(limit: int = 10) -> list[dict]:
    with SessionLocal() as session:
        cases = session.query(OnboardingCaseTable).filter(
            OnboardingCaseTable.status.in_(["en_cours", "bloque"])
        ).all()

    prioritized = []
    for case in cases:
        result = calculate_dropoff_risk(case.id)
        if "error" not in result:
            prioritized.append({
                "case_id": case.id,
                "client_name": case.client_name,
                "product_type": case.product_type,
                "assigned_agent": case.assigned_agent,
                **result,
            })

    prioritized.sort(key=lambda x: x.get("risk_score", 0.0), reverse=True)
    return prioritized[:limit]
