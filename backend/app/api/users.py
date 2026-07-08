from fastapi import APIRouter

from app.schemas.user import UserRead

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/me", response_model=UserRead)
def get_current_user():
    return UserRead(id=1, email="admin@example.com", full_name="Administrateur", is_admin=True)
