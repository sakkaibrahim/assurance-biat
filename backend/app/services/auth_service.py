from __future__ import annotations

from datetime import datetime, timedelta, timezone

from app.database.db import SessionLocal
from app.database.models import UserTable
from app.models.user import User


def authenticate_user(email: str, password: str) -> User | None:
    with SessionLocal() as session:
        user_row = session.query(UserTable).filter(UserTable.email == email, UserTable.password == password).first()
        if user_row is None:
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

        user_row = UserTable(email=email, password=password, full_name=full_name, is_admin=False)
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
            password="admin123",
            full_name="Administrateur",
            is_admin=True,
        )
        session.add(admin_user)
        session.commit()


def create_access_token(user: User) -> dict[str, str]:
    expires_at = datetime.now(timezone.utc) + timedelta(hours=8)
    return {
        "access_token": f"token-{user.id}-{int(expires_at.timestamp())}",
        "token_type": "bearer",
    }
