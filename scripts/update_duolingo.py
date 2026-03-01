#!/usr/bin/env python3
"""
Actualiza los datos de Duolingo en index.html consultando la API no oficial.
Usa DUOLINGO_USERNAME y DUOLINGO_PASSWORD (o DUOLINGO_JWT) desde variables de entorno.
"""

import os
import re
import sys
import json
import requests

# ─── Configuración ──────────────────────────────────────────────────────────
HTML_FILE = os.path.join(os.path.dirname(__file__), "..", "index.html")
DUOLINGO_USERNAME = os.environ.get("DUOLINGO_USERNAME", "")
DUOLINGO_PASSWORD = os.environ.get("DUOLINGO_PASSWORD", "")
DUOLINGO_JWT = os.environ.get("DUOLINGO_JWT", "")   # alternativa: token directo


# ─── Autenticación ──────────────────────────────────────────────────────────
def login(username: str, password: str) -> tuple[str, int]:
    """Inicia sesión y devuelve (jwt_token, user_id)."""
    session = requests.Session()
    session.headers.update({
        "User-Agent": (
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
            "AppleWebKit/537.36 (KHTML, like Gecko) "
            "Chrome/122.0.0.0 Safari/537.36"
        ),
        "Content-Type": "application/json",
        "Accept": "application/json",
    })

    resp = session.post(
        "https://www.duolingo.com/login",
        json={"login": username, "password": password},
        timeout=20,
    )

    if resp.status_code != 200:
        raise RuntimeError(f"Login fallido (HTTP {resp.status_code}): {resp.text[:300]}")

    data = resp.json()
    user_id = data.get("user_id") or data.get("id")
    jwt = resp.cookies.get("jwt_token") or data.get("jwt_token")

    if not jwt or not user_id:
        raise RuntimeError("No se pudo obtener jwt_token o user_id de la respuesta")

    return jwt, int(user_id)


# ─── Obtener datos del usuario ───────────────────────────────────────────────
FIELDS = (
    "streak,"
    "totalXp,"
    "courses,"
    "xpGains,"
    "achievements,"
    "currentCourse,"
    "trackingProperties,"
    "leaderboardLeague,"
    "username,"
    "joinedClassroomIds"
)

LEAGUE_NAMES = {
    0:  "Liga Bronce",
    1:  "Liga Bronce",
    2:  "Liga Plata",
    3:  "Liga Oro",
    4:  "Liga Zafiro",
    5:  "Liga Rubí",
    6:  "Liga Esmeralda",
    7:  "Liga Amatista",
    8:  "Liga Perla",
    9:  "Liga Obsidiana",
    10: "Liga Diamante",
}

LEAGUE_ICONS = {
    "Liga Bronce":   "fas fa-medal",
    "Liga Plata":    "fas fa-medal",
    "Liga Oro":      "fas fa-trophy",
    "Liga Zafiro":   "fas fa-gem",
    "Liga Rubí":     "fas fa-gem",
    "Liga Esmeralda":"fas fa-gem",
    "Liga Amatista": "fas fa-gem",
    "Liga Perla":    "fas fa-gem",
    "Liga Obsidiana":"fas fa-gem",
    "Liga Diamante": "fas fa-gem",
}


def fetch_user_data(jwt: str, user_id: int) -> dict:
    headers = {
        "Authorization": f"Bearer {jwt}",
        "User-Agent": (
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
            "AppleWebKit/537.36 (KHTML, like Gecko) "
            "Chrome/122.0.0.0 Safari/537.36"
        ),
        "Accept": "application/json",
    }
    url = f"https://www.duolingo.com/2017-06-30/users/{user_id}?fields={FIELDS}"
    resp = requests.get(url, headers=headers, timeout=20)

    if resp.status_code != 200:
        raise RuntimeError(f"Error al obtener datos del usuario (HTTP {resp.status_code})")

    return resp.json()


def parse_stats(data: dict) -> dict:
    """Extrae las métricas relevantes del JSON de usuario."""
    streak = data.get("streak", 0)
    total_xp = 0

    # XP del curso de inglés
    courses = data.get("courses", [])
    for course in courses:
        # learningLanguage = 'en', fromLanguage = 'es'
        if course.get("learningLanguage") == "en":
            total_xp = course.get("xp", 0)
            break

    if total_xp == 0:
        total_xp = data.get("totalXp", 0)

    # Coronas (crowns): suma de crowns de todas las habilidades del curso actual
    crowns = 0
    current_course = data.get("currentCourse", {})
    skills = current_course.get("skills", [])
    for skill in skills:
        crowns += skill.get("finishedLevels", 0)

    # Año de registro
    tracking = data.get("trackingProperties", {})
    join_date = tracking.get("creation_date", "")
    join_year = join_date[:4] if join_date else "2016"

    # Liga
    league_index = data.get("leaderboardLeague", 10)
    league_name = LEAGUE_NAMES.get(league_index, "Liga Diamante")
    league_icon = LEAGUE_ICONS.get(league_name, "fas fa-gem")

    return {
        "streak": streak,
        "xp": total_xp,
        "crowns": crowns,
        "join_year": join_year,
        "league_name": league_name,
        "league_icon": league_icon,
    }


# ─── Actualizar HTML ─────────────────────────────────────────────────────────
def fmt_number(n: int) -> str:
    """Formatea número con comas: 13271 → 13,271"""
    return f"{n:,}"


def update_html(stats: dict, html_path: str) -> bool:
    """Actualiza los valores en el HTML. Devuelve True si hubo cambios."""
    with open(html_path, "r", encoding="utf-8") as f:
        content = f.read()

    original = content

    # 1. Racha
    content = re.sub(
        r'(<span class="duo-stat-icon">🔥</span>\s*<span class="duo-stat-value">)'
        r'[^<]+'
        r'(</span>)',
        rf'\g<1>{stats["streak"]}\g<2>',
        content,
        count=1,
    )

    # 2. XP en inglés
    content = re.sub(
        r'(<span class="duo-stat-icon">⚡</span>\s*<span class="duo-stat-value">)'
        r'[^<]+'
        r'(</span>)',
        rf'\g<1>{fmt_number(stats["xp"])}\g<2>',
        content,
        count=1,
    )

    # 3. Coronas
    content = re.sub(
        r'(<span class="duo-stat-icon">👑</span>\s*<span class="duo-stat-value">)'
        r'[^<]+'
        r'(</span>)',
        rf'\g<1>{stats["crowns"]}\g<2>',
        content,
        count=1,
    )

    # 4. Año de registro
    content = re.sub(
        r'(<span class="duo-stat-icon">📅</span>\s*<span class="duo-stat-value">)'
        r'[^<]+'
        r'(</span>)',
        rf'\g<1>{stats["join_year"]}\g<2>',
        content,
        count=1,
    )

    # 5. Badge de liga
    content = re.sub(
        r'(<span class="duo-league-badge"><i class=")[^"]+(">\s*)[^<]+(</span>)',
        rf'\g<1>{stats["league_icon"]}\g<2>{stats["league_name"]}\g<3>',
        content,
        count=1,
    )

    if content != original:
        with open(html_path, "w", encoding="utf-8") as f:
            f.write(content)
        print("✅ index.html actualizado con los nuevos datos de Duolingo.")
        return True
    else:
        print("ℹ️  No hubo cambios: los datos ya estaban actualizados.")
        return False


# ─── Main ────────────────────────────────────────────────────────────────────
def main():
    jwt = DUOLINGO_JWT
    user_id = None

    if jwt:
        print("🔑 Usando JWT_TOKEN desde variable de entorno...")
        # Necesitamos el user_id. Intentamos obtenerlo del endpoint de perfil
        resp = requests.get(
            "https://www.duolingo.com/users/me",
            headers={"Authorization": f"Bearer {jwt}"},
            timeout=20,
        )
        if resp.status_code == 200:
            user_id = resp.json().get("id") or resp.json().get("user_id")
        if not user_id:
            print("⚠️  No se pudo obtener user_id con el JWT. Intenta con usuario/contraseña.", file=sys.stderr)
            sys.exit(1)
    else:
        if not DUOLINGO_USERNAME or not DUOLINGO_PASSWORD:
            print("❌ Faltan credenciales. Define DUOLINGO_USERNAME y DUOLINGO_PASSWORD.", file=sys.stderr)
            sys.exit(1)
        print(f"🔐 Iniciando sesión como '{DUOLINGO_USERNAME}'...")
        jwt, user_id = login(DUOLINGO_USERNAME, DUOLINGO_PASSWORD)

    print(f"👤 User ID: {user_id}")
    print("📡 Obteniendo datos del usuario...")
    data = fetch_user_data(jwt, user_id)

    stats = parse_stats(data)
    print("📊 Stats obtenidos:")
    print(f"   🔥 Racha:    {stats['streak']} días")
    print(f"   ⚡ XP:       {fmt_number(stats['xp'])}")
    print(f"   👑 Coronas:  {stats['crowns']}")
    print(f"   📅 Desde:    {stats['join_year']}")
    print(f"   🏆 Liga:     {stats['league_name']}")

    update_html(stats, HTML_FILE)


if __name__ == "__main__":
    main()
