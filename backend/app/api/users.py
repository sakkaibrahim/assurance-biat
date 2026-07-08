from fastapi import APIRouter, Depends

from app.api.dependencies import get_current_user
from app.schemas.user import UserRead

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/me", response_model=UserRead)
def get_current_user_info(payload: dict = Depends(get_current_user)):
    return UserRead(
        id=int(payload.get("sub", 0)),
        email=payload.get("email", ""),
        full_name=payload.get("full_name"),
        is_admin=payload.get("is_admin", False),
    )
