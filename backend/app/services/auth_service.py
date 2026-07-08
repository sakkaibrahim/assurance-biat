from __future__ import annotations

from datetime import datetime, timedelta, timezone

from jose import JWTError, jwt
from passlib.context import CryptContext

from app.database.db import SessionLocal
from app.database.models import UserTable
from app.models.user import User
from app.utils.config import get_settings

settings = get_settings()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def authenticate_user(email: str, password: str) -> User | None:
    with SessionLocal() as session:
        user_row = session.query(UserTable).filter(UserTable.email == email).first()
        if user_row is None or not verify_password(password, user_row.password):
            return None

        return User(
            id=user_row.id,
            email=user_row.email,
            full_name=user_row.full_name,
            is_admin=user_row.is_admin,
        )


def register_user(email: str, password: str, full_name: str | None = None) -> User:
    with SessionLocal() as session:
        existing_user = session.query(UserTable).filter(UserTable.email == email).first()
        if existing_user is not None:
            raise ValueError("Un utilisateur avec cet email existe déjà")

        user_row = UserTable(email=email, password=hash_password(password), full_name=full_name, is_admin=False)
        session.add(user_row)
        session.commit()
        session.refresh(user_row)
        return User(
            id=user_row.id,
            email=user_row.email,
            full_name=user_row.full_name,
            is_admin=user_row.is_admin,
        )


def ensure_default_admin() -> None:
    with SessionLocal() as session:
        existing_admin = session.query(UserTable).filter(UserTable.email == "admin@example.com").first()
        if existing_admin is not None:
            return

        admin_user = UserTable(
            email="admin@example.com",
            password=hash_password("admin123"),
            full_name="Administrateur",
            is_admin=True,
        )
        session.add(admin_user)
        session.commit()


def create_access_token(user: User) -> dict[str, str]:
    expires_at = datetime.now(timezone.utc) + timedelta(hours=8)
    payload = {
        "sub": str(user.id),
        "email": user.email,
        "full_name": user.full_name or "",
        "is_admin": user.is_admin,
        "exp": expires_at,
    }
    token = jwt.encode(payload, settings.secret_key, algorithm="HS256")
    return {
        "access_token": token,
        "token_type": "bearer",
    }


def decode_access_token(token: str) -> dict | None:
    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=["HS256"])
        return payload
    except JWTError:
        return None
