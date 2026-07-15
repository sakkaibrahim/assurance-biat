from app.models.domain import ProductType

PRODUCT_BASE = {
    "auto": 450.0,
    "home": 320.0,
    "health": 600.0,
    "life": 380.0,
    "travel": 220.0,
    "business": 900.0,
}

PRODUCT_LABELS = {
    "auto": "Auto",
    "home": "Habitation",
    "health": "Santé",
    "life": "Vie",
    "travel": "Voyage",
    "business": "Entreprise",
}


def estimate_quote(product: str, age: int = 35, city: str = "", income: float = 40000.0, region_risk: float = 0.2) -> dict:
    base = PRODUCT_BASE.get(product, 400.0)
    age_factor = 1.0 + max(0.0, (age - 30)) / 100.0 * 0.6
    risk_factor = 1.0 + float(region_risk)
    income_factor = 1.0 + min(0.3, max(0.0, (float(income) - 20000) / 200000.0))
    prime_annual = base * age_factor * risk_factor * income_factor
    return {
        "product": product,
        "product_label": PRODUCT_LABELS.get(product, product),
        "prime_annual": round(prime_annual, 2),
        "prime_monthly": round(prime_annual / 12.0, 2),
        "factors": {
            "base": round(base, 2),
            "age_factor": round(age_factor, 3),
            "risk_factor": round(risk_factor, 3),
            "income_factor": round(income_factor, 3),
        },
        "currency": "TND",
    }
