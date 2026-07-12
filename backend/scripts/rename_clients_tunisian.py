import random
import sys
from pathlib import Path

sys.path.append(str(Path(__file__).resolve().parents[1]))

from app.db.session import SessionLocal
from app.services.naming import tunisian_email, tunisian_name

random.seed(7)


def main(limit: int | None = None) -> None:
    db = SessionLocal()
    try:
        clients = db.query(__import__("app.models.domain", fromlist=["Client"]).Client).all()
        if limit:
            clients = clients[:limit]
        for c in clients:
            name = tunisian_name()
            c.full_name = name
            c.email = tunisian_email(name, c.id)
        db.commit()
        print(f"updated {len(clients)} clients with Tunisian names")
    finally:
        db.close()


if __name__ == "__main__":
    lim = int(sys.argv[1]) if len(sys.argv) > 1 else None
    main(lim)
