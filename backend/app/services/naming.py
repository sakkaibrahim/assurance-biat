import random

FIRST_MALE = [
    "Mohamed", "Ahmed", "Youssef", "Ali", "Ismail", "Karim", "Sofiene", "Anis",
    "Walid", "Hatem", "Bilel", "Amine", "Mehdi", "Yassine", "Oussama", "Chiheb",
    "Fedi", "Aziz", "Seif", "Skander", "Wassim", "Zied", "Marwen", "Ghassen",
    "Hedi", "Nadhem", "Kais", "Ala", "Sabri", "Dhia", "Rayen", "Nidhal",
    "Slim", "Ferid", "Mondher", "Tarek", "Khaled", "Adel", "Sami", "Moez",
]

FIRST_FEMALE = [
    "Amel", "Leila", "Salma", "Mariem", "Fatma", "Soumaya", "Ichrak", "Emna",
    "Yosra", "Rahma", "Nour", "Chaima", "Houda", "Sarra", "Manel", "Asma",
    "Rym", "Ines", "Eya", "Hiba", "Dorsaf", "Wiem", "Amira", "Ons",
    "Zeineb", "Faten", "Najet", "Ahlem", "Henda", "Naouel", "Selma", "Kaouther",
    "Safa", "Yasmine", "Nesrine", "Wided", "Imen", "Maha", "Sana", "Rim",
]

LAST_NAMES = [
    "Ben Ahmed", "Ben Ali", "Trabelsi", "Ben Salem", "Bouazizi", "Hammami",
    "Matri", "Mnif", "Karoui", "Belaid", "Gharbi", "Khalfaoui", "Mechmeche",
    "Jaziri", "Sahli", "Ben Youssef", "Slimani", "Marsit", "Chelbi", "Ouertani",
    "Ben Hassine", "Chatti", "Dridi", "Khedher", "Labidi", "Mahjoub", "Nasri",
    "Rezgui", "Sbai", "Chouikh", "Ferjani", "Amdouni", "Mechergui", "Toumi",
    "Ben Moussa", "Brahmi", "Ghannouchi", "Khelifi", "Louati", "Miled",
    "Zouari", "Arfaoui", "Ben Abdallah", "Bessrour", "Ben Romdhane", "Chakroun",
]


def tunisian_name() -> str:
    first = random.choice(FIRST_MALE + FIRST_FEMALE)
    last = random.choice(LAST_NAMES)
    return f"{first} {last}"


def tunisian_email(full_name: str, salt: str | int) -> str:
    parts = full_name.lower().split()
    first = parts[0]
    last = "".join(parts[1:]) if len(parts) > 1 else "client"
    return f"{first}.{last}{salt}@biat.tn"
