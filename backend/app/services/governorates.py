from __future__ import annotations

# Static mapping used only because the demo DB model stores only `Client.city`.
# Keys are city names as produced by seed_demo_data().
CITY_TO_GOVERNORATE: dict[str, str] = {
    # Tunis (city + governorate-level)
    "Tunis": "Tunis",
    "Ariana": "Ariana",
    "Ben Arous": "Ben Arous",
    "Manouba": "Manouba",

    # North-East / North
    "Nabeul": "Nabeul",
    "Bizerte": "Bizerte",
    "Zaghouan": "Zaghouan",
    "Kef": "Kef",
    "Siliana": "Siliana",

    # Sahel
    "Sousse": "Sousse",
    "Monastir": "Monastir",
    "Mahdia": "Mahdia",

    # Centre-East / East
    "Sfax": "Sfax",
    "Gabes": "Gabès",
    "Medenine": "Medenine",
    "Tozeur": "Tozeur",
    "Kairouan": "Kairouan",

    # West / South-West (best-effort)
    "Gafsa": "Gafsa",
    "Kasserine": "Kasserine",
    "Sidi Bouzid": "Sidi Bouzid",
    "Kebili": "Kebili",
    "Sfax Ville": "Sfax",
    "Djerba": "Medenine",
    "Houmt Souk": "Medenine",
}

DEFAULT_GOVERNORATE = "Autres"
