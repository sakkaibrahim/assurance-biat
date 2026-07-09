from fastapi import APIRouter, HTTPException

from app.schemas.onboarding import ClientInteractionCreate, ClientInteractionRead, ClientInteractionUpdate, InteractionType
from app.services.interaction_service import (
    create_interaction,
    delete_interaction,
    get_interaction,
    list_interactions,
    update_interaction,
)

router = APIRouter(prefix="/interactions", tags=["interactions"])


@router.get("", response_model=list[ClientInteractionRead])
def get_interactions(case_id: int | None = None):
    return list_interactions(case_id=case_id)


@router.get("/{interaction_id}", response_model=ClientInteractionRead)
def get_interaction_route(interaction_id: int):
    interaction = get_interaction(interaction_id)
    if interaction is None:
        raise HTTPException(status_code=404, detail="Interaction introuvable")
    return interaction


@router.post("", response_model=ClientInteractionRead)
def create_interaction_route(payload: ClientInteractionCreate):
    return create_interaction(payload)


@router.put("/{interaction_id}", response_model=ClientInteractionRead)
def update_interaction_route(interaction_id: int, payload: ClientInteractionUpdate):
    interaction = update_interaction(interaction_id, payload)
    if interaction is None:
        raise HTTPException(status_code=404, detail="Interaction introuvable")
    return interaction


@router.delete("/{interaction_id}")
def delete_interaction_route(interaction_id: int):
    if not delete_interaction(interaction_id):
        raise HTTPException(status_code=404, detail="Interaction introuvable")
    return {"message": "Interaction supprimee avec succes"}
