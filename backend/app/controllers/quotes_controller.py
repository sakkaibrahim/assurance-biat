from app.services.quotes import estimate_quote


def quote_estimate(product: str, age: int = 35, city: str = "", income: float = 40000.0, region_risk: float = 0.2) -> dict:
    return estimate_quote(product=product, age=age, city=city, income=income, region_risk=region_risk)
