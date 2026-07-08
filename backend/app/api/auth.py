from fastapi import APIRouter, HTTPException

from app.schemas.user import AuthResponse, UserCreate, UserRead, UserRegister
from app.services.auth_service import authenticate_user, create_access_token, register_user

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login", response_model=AuthResponse)
def login(payload: UserCreate):
    user = authenticate_user(payload.email, payload.password)
    if user is None:
        raise HTTPException(status_code=401, detail="Identifiants invalides")
    token = create_access_token(user)

    return AuthResponse(
        user=UserRead(id=user.id or 0, email=user.email, full_name=user.full_name, is_admin=user.is_admin),
        **token,
    )


@router.post("/register", response_model=AuthResponse)
def register(payload: UserRegister):
    try:
        user = register_user(payload.email, payload.password, payload.full_name)
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error)) from error

    token = create_access_token(user)
    return AuthResponse(
        user=UserRead(id=user.id or 0, email=user.email, full_name=user.full_name, is_admin=user.is_admin),
        **token,
    )
