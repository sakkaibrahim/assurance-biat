import argparse
import random
import sys
from datetime import date, datetime, timedelta
from pathlib import Path

from faker import Faker

try:
    import numpy as np
except ImportError:
    np = None

try:
    import pandas as pd
except ImportError:
    pd = None

sys.path.append(str(Path(__file__).resolve().parents[1]))

from app.db.session import Base, SessionLocal, engine
from app.models.domain import Claim, ClaimStatus, Client, Contract, Interaction, Payment, ProductType
from app.services.naming import tunisian_email, tunisian_name

fake = Faker("fr_FR")
random.seed(42)
if np:
    np.random.seed(42)


def normal(mean: float, std: float) -> float:
    return float(np.random.normal(mean, std)) if np else random.gauss(mean, std)


def lognormal(mean: float, sigma: float) -> float:
    return float(np.random.lognormal(mean, sigma)) if np else random.lognormvariate(mean, sigma)


def beta(alpha: float, beta_value: float) -> float:
    return float(np.random.beta(alpha, beta_value)) if np else random.betavariate(alpha, beta_value)


def poisson(lam: float) -> int:
    if np:
        return int(np.random.poisson(lam))
    count = 0
    threshold = 2.718281828 ** -lam
    product = 1.0
    while product > threshold:
        count += 1
        product *= random.random()
    return max(0, count - 1)


def clip(value: float, low: float, high: float) -> float:
    return max(low, min(value, high))


def weighted_product() -> ProductType:
    return random.choices(
        list(ProductType),
        weights=[0.28, 0.24, 0.18, 0.12, 0.1, 0.08],
        k=1,
    )[0]


def main(rows: int) -> None:
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    cities = ["Tunis", "Sfax", "Sousse", "Nabeul", "Bizerte", "Monastir", "Gabes", "Ariana", "Ben Arous", "Manouba"]
    segments = ["standard", "affluent", "premium", "young", "senior"]
    client_ids: list[int] = []

    for idx in range(rows):
        full_name = tunisian_name()
        client = Client(
            full_name=full_name,
            email=tunisian_email(full_name, idx),
            city=random.choice(cities),
            segment=random.choices(segments, weights=[0.46, 0.2, 0.12, 0.12, 0.1], k=1)[0],
            age=int(clip(normal(42, 13), 18, 82)),
            income=float(clip(lognormal(10.55, 0.55), 12000, 180000)),
        )
        db.add(client)
        db.flush()
        client_ids.append(client.id)

        for _ in range(random.randint(1, 4)):
            product = weighted_product()
            premium = float(clip(normal(1100, 420), 180, 4200))
            start = fake.date_between(start_date="-5y", end_date="-1m")
            contract = Contract(
                client_id=client.id,
                product=product,
                premium=round(premium, 2),
                coverage_amount=round(premium * random.uniform(30, 140), 2),
                start_date=start,
                end_date=start + timedelta(days=365),
                status=random.choices(["active", "expired", "cancelled"], weights=[0.78, 0.14, 0.08], k=1)[0],
                region_risk_score=round(beta(2, 5), 3),
            )
            db.add(contract)
            db.flush()
            for month in range(1, 7):
                due = date.today() - timedelta(days=30 * month)
                paid = random.random() > 0.14
                db.add(
                    Payment(
                        contract_id=contract.id,
                        amount=round(premium / 12, 2),
                        due_date=due,
                        paid_date=due + timedelta(days=random.randint(0, 12)) if paid else None,
                        status="paid" if paid else random.choice(["late", "pending"]),
                    )
                )

        for _ in range(poisson(0.45)):
            db.add(
                Claim(
                    client_id=client.id,
                    product=weighted_product(),
                    status=random.choice(list(ClaimStatus)),
                    amount=round(float(clip(lognormal(8.8, 0.9), 300, 95000)), 2),
                    claim_date=fake.date_between(start_date="-3y", end_date="today"),
                    description=fake.sentence(nb_words=12),
                )
            )

        for _ in range(random.randint(1, 5)):
            db.add(
                Interaction(
                    client_id=client.id,
                    channel=random.choice(["phone", "email", "agency", "mobile_app", "web"]),
                    intent=random.choice(["quote", "claim_followup", "complaint", "renewal", "support", "cross_sell"]),
                    sentiment=round(float(normal(0.08, 0.45)), 3),
                    created_at=datetime.utcnow() - timedelta(days=random.randint(0, 500)),
                    notes=fake.sentence(nb_words=14),
                )
            )

    db.commit()
    db.close()
    generated_at = datetime.utcnow().isoformat()
    if pd:
        print(pd.DataFrame({"clients": [rows], "generated_at": [generated_at]}).to_string(index=False))
    else:
        print(f"clients={rows} generated_at={generated_at}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--rows", type=int, default=5000)
    args = parser.parse_args()
    main(args.rows)
