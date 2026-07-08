"""
Script d'initialisation de la base de données MySQL pour XAMPP.

Prérequis:
    - Démarrer XAMPP et activer le module MySQL
    - Créer la base de données 'assurance_biat' via phpMyAdmin ou ligne de commande

Usage:
    python setup_mysql.py
"""

from __future__ import annotations

import sys

from sqlalchemy import text

from app.database.db import Base, engine
from app.database.models import (
    AppointmentTable,
    ChatTable,
    ClientTable,
    DocumentTable,
    NotificationTable,
    TaskTable,
    UserTable,
)
from app.services.auth_service import ensure_default_admin


TABLES_TO_CREATE = [
    UserTable.__tablename__,
    DocumentTable.__tablename__,
    ChatTable.__tablename__,
    TaskTable.__tablename__,
    AppointmentTable.__tablename__,
    NotificationTable.__tablename__,
    ClientTable.__tablename__,
]


def create_schema() -> None:
    print("Création des tables...")
    Base.metadata.create_all(bind=engine)
    print("Tables créées avec succès.")


def verify_schema() -> None:
    print("Vérification des tables...")
    with engine.connect() as connection:
        for table in TABLES_TO_CREATE:
            result = connection.execute(text(f"SHOW TABLES LIKE '{table}'"))
            exists = result.fetchone() is not None
            status = "OK" if exists else "MANQUANT"
            print(f"  {table}: {status}")
            if not exists:
                sys.exit(1)


def seed_admin() -> None:
    print("Initialisation de l'administrateur par défaut...")
    ensure_default_admin()
    print("Administrateur prêt.")


def main() -> None:
    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))
        print("Connexion MySQL établie.")
    except Exception as error:
        print(f"Impossible de se connecter à MySQL: {error}")
        print("Vérifie que XAMPP est démarré et que la base 'assurance_biat' existe.")
        sys.exit(1)

    create_schema()
    verify_schema()
    seed_admin()
    print("Initialisation terminée.")


if __name__ == "__main__":
    main()
