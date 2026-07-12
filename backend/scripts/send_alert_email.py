import argparse
import sys
from pathlib import Path

sys.path.append(str(Path(__file__).resolve().parents[1]))

from app.db.session import SessionLocal
from app.controllers.alerts_controller import email_alerts


def main(to: str | None = None) -> None:
    db = SessionLocal()
    try:
        result = email_alerts(db=db, to=to)
        print(result)
    finally:
        db.close()


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Send the BIAT alert digest by email.")
    parser.add_argument("--to", default=None, help="Recipient override (else ALERT_TO_EMAIL from .env)")
    args = parser.parse_args()
    main(args.to)
