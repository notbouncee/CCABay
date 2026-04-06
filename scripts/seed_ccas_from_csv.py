#!/usr/bin/env python3
"""Seed public.ccas from embedded semicolon-delimited CSV data.

Usage:
  SUPABASE_URL="https://<project-ref>.supabase.co" \
  SUPABASE_SERVICE_ROLE_KEY="..." \
    python3 scripts/seed_ccas_from_csv.py

Notes:
- Uses Supabase PostgREST upsert with on_conflict=id.
- Source data is embedded below in CSV_EXPORT.
"""

from __future__ import annotations

import argparse
import csv
import io
import json
import os
import sys
import urllib.error
import urllib.parse
import urllib.request
from typing import Any


CSV_EXPORT = """id;name;description;category;tags;image_url;weekly_commitment;hall_points;training_days;training_time;tryout_dates;audition_dates;contact_email;instagram_url;about;is_beginner_friendly;created_at;updated_at
683c5390-f85b-429e-8a68-dc280b1ad300;Contemp{minated};Express yourself through contemporary dance, performance, and team spirit.;Performance & Creativity;"[""Contemporary Dance"",""Beginner-Friendly"",""Performance & Creativity""]";;6 hrs/Week;3;"[""Tuesday"",""Friday""]";1900-2130;;;;;Are you looking for a community of passionate, well-spirited dancers to grow and express yourself with? Welcome to Contemp{minated}, NTU's very own contemporary dance club that celebrates creativity, connection, and self-expression. From our first steps into this environment, it wasn't just the movement or music that resonated with us, it was the atmosphere. There was something deeply heartwarming about being surrounded by dancers who weren't afraid to try, fail, and try again. This club has become a safe space where dancers can express themselves freely and experiment with their own styles, all while being supported by like-minded individuals.;true;2026-04-01 12:45:06.65759+00;2026-04-01 12:45:06.65759+00
2199b49d-e450-4462-8bd3-5ef0fc79ad16;NTU Fashion & Makeup;Discover your style through fashion, makeup artistry, and creative expression.;Performance & Creativity;"[""Fashion"",""Beginner-Friendly""]";;3 hrs/Week;0;"[""Wednesday""]";1900-2200;;;;;NTU Fashion & Makeup is the premier club for students passionate about fashion design, styling, and makeup artistry. We organize runway shows, workshops, and collaborative projects.;true;2026-04-01 12:45:06.65759+00;2026-04-01 12:45:06.65759+00
7c527531-dac4-4852-b8ce-e8470474a2e5;Chinese Society;Promoting Chinese culture and heritage through events, performances and community.;Cultural;"[""Cultural"",""Chinese"",""Community""]";;3 hrs/Week;2;"[""Thursday""]";1900-2100;;;;;The Chinese Society organizes cultural events, performances, and activities that promote Chinese heritage among NTU students.;true;2026-04-01 12:45:06.65759+00;2026-04-01 12:45:06.65759+00
d16d0f36-d2dc-411a-8c3f-5c015163951f;Outdoor Adventure Club;Explore the great outdoors with hiking, camping, kayaking and more.;Community & Lifestyle;"[""Outdoor"",""Adventure"",""Sports""]";;4 hrs/Week;3;"[""Saturday""]";0800-1700;;;;;ODAC is NTU's premier outdoor adventure club. We organize regular hikes, overnight camps, kayaking trips, and overseas expeditions.;true;2026-04-01 12:45:06.65759+00;2026-04-01 12:45:06.65759+00
eed50f67-68ac-45c2-b822-fa86bb457cd3;Debating Society;Sharpen your critical thinking and public speaking through competitive debating.;Competition & Academics;"[""Debating"",""Public Speaking"",""Competition""]";;6 hrs/Week;3;"[""Monday"",""Wednesday""]";1900-2200;;;;;NTU Debating Society participates in national and international debating tournaments. Members develop critical thinking, argumentation, and public speaking skills.;false;2026-04-01 12:45:06.65759+00;2026-04-01 12:45:06.65759+00
e5c8f817-c45c-47ed-a36c-dceadb6a1ca2;Entrepreneurship Society;Foster innovation and startup culture among NTU students.;Competition & Academics;"[""Entrepreneurship"",""Business"",""Startup""]";;3 hrs/Week;2;"[""Tuesday""]";1900-2100;;;;;NTU Entrepreneurship Society connects aspiring entrepreneurs, organizes pitch competitions, networking events, and startup workshops.;true;2026-04-01 12:45:06.65759+00;2026-04-01 12:45:06.65759+00
691aaf4c-21ab-467c-ba6c-75db035e2966;Earthlink;Environmental conservation and sustainability initiatives on campus.;Community & Lifestyle;"[""Environment"",""Sustainability"",""Community""]";;3 hrs/Week;2;"[""Wednesday""]";1800-2100;;;;;Earthlink NTU is dedicated to environmental conservation. We organize beach cleanups, tree planting, sustainability workshops, and eco-campaigns.;true;2026-04-01 12:45:06.65759+00;2026-04-01 12:45:06.65759+00
2a162323-ae46-4d4a-82cc-4232206131f7;Aerospace Society;Explore aviation and aerospace engineering through projects and competitions.;Competition & Academics;"[""Aerospace"",""Engineering"",""Competition""]";;4 hrs/Week;2;"[""Thursday""]";1900-2200;;;;;The Aerospace Society brings together students passionate about aviation and space. We build drones, participate in aerospace competitions, and organize industry talks.;false;2026-04-01 12:45:06.65759+00;2026-04-01 12:45:06.65759+00
d8c00168-7517-4530-9649-0fa48502d262;Film Society;Create films, learn cinematography, and appreciate the art of filmmaking.;Performance & Creativity;"[""Film"",""Photography"",""Creative""]";;4 hrs/Week;2;"[""Friday""]";1900-2200;;;;;NTU Film Society is for aspiring filmmakers and cinema enthusiasts. We produce short films, organize film screenings, and conduct workshops on cinematography and editing.;true;2026-04-01 12:45:06.65759+00;2026-04-01 12:45:06.65759+00
17665eb9-3d64-46e4-bf10-1596bc848946;Cats Management Network;Caring for the campus cat community through feeding and TNR programs.;Community & Lifestyle;"[""Animals"",""Community"",""Volunteering""]";;3 hrs/Week;1;"[""Monday"",""Thursday""]";1800-1930;;;;;The Cats Management Network manages the welfare of campus cats through regular feeding, Trap-Neuter-Return programs, and rehoming initiatives.;true;2026-04-01 12:45:06.65759+00;2026-04-01 12:45:06.65759+00
ffb32d56-ad3d-4e7c-99d2-969f7c38afbe;Street Dance Club;Express yourself through hip-hop, breaking, popping, and locking.;Performance & Creativity;"[""Dance"",""Hip-Hop"",""Performance""]";;8 hrs/Week;3;"[""Monday"",""Wednesday"",""Friday""]";1900-2130;;;;;NTU Street Dance Club is one of the most active dance CCAs on campus. We cover various street dance genres including hip-hop, breaking, popping, and locking.;false;2026-04-01 12:45:06.65759+00;2026-04-01 12:45:06.65759+00
879a77a6-f508-4066-9490-4d5a8ff64b92;Investment Interactive Club;Learn about financial markets, trading strategies, and investment principles.;Competition & Academics;"[""Finance"",""Investment"",""Trading""]";;3 hrs/Week;2;"[""Tuesday""]";1900-2100;;;;;IIC provides members with financial literacy through workshops, trading simulations, and talks by industry professionals.;true;2026-04-01 12:45:06.65759+00;2026-04-01 12:45:06.65759+00
3afd1b13-327c-4e61-9f99-f4c5fa46c978;NTU Open Source Society;Contribute to open-source projects and build software together.;Competition & Academics;"[""Technology"",""Programming"",""Open Source""]";;4 hrs/Week;2;"[""Wednesday""]";1900-2200;;;;;NTU OSS promotes open-source culture and software development. We organize hackathons, coding workshops, and collaborative development projects.;true;2026-04-01 12:45:06.65759+00;2026-04-01 12:45:06.65759+00
322bbd02-a952-4270-853e-b1fa5b11bb69;Red Cross Youth - NTU Chapter;Humanitarian service, first aid training, and community outreach.;Community & Lifestyle;"[""Volunteering"",""First Aid"",""Community""]";;4 hrs/Week;3;"[""Saturday""]";0900-1300;;;;;NTU Red Cross Youth provides first aid training, organizes blood donation drives, and participates in community service projects.;true;2026-04-01 12:45:06.65759+00;2026-04-01 12:45:06.65759+00
1757a248-a91d-45c8-92ce-329063d71aac;Nanyang Arts Ensemble;Chinese orchestral music performance and cultural appreciation.;Performance & Creativity;"[""Music"",""Chinese Orchestra"",""Performance""]";;6 hrs/Week;3;"[""Tuesday"",""Thursday""]";1900-2130;;;;;Nanyang Arts Ensemble is NTU's Chinese Orchestra. We perform at university events, national competitions, and organize public concerts.;false;2026-04-01 12:45:06.65759+00;2026-04-01 12:45:06.65759+00
96ab2168-6a37-41a7-a737-fc5685aebea8;Japanese Appreciation Club;Explore Japanese language, culture, anime, and traditions.;Cultural;"[""Japanese"",""Cultural"",""Language""]";;3 hrs/Week;1;"[""Friday""]";1900-2100;;;;;JAC promotes Japanese culture through language classes, cultural events, anime screenings, and exchanges with Japanese students.;true;2026-04-01 12:45:06.65759+00;2026-04-01 12:45:06.65759+00
1f573343-de65-4b5a-a3fa-91c9a3da937f;Korean Cultural Society;Experience Korean culture through K-pop, language, and food.;Cultural;"[""Korean"",""K-Pop"",""Cultural""]";;3 hrs/Week;1;"[""Wednesday""]";1900-2100;;;;;KCS brings Korean culture to NTU through K-pop dance workshops, Korean language classes, Korean cooking sessions, and cultural exchange events.;true;2026-04-01 12:45:06.65759+00;2026-04-01 12:45:06.65759+00
65ff60fb-1c49-4dd7-b6e0-d7a0a4ea9b03;Sport Shooting Club;Learn precision shooting sports in a safe and competitive environment.;Sports;"[""Shooting"",""Competition"",""Sports""]";;4 hrs/Week;3;"[""Saturday""]";1000-1400;;;;;NTU Sport Shooting Club trains members in air pistol and air rifle shooting. We compete in national inter-university championships.;false;2026-04-01 12:45:06.65759+00;2026-04-01 12:45:06.65759+00
9e4868e8-1130-4249-86b1-3ab99a39caa7;Toastmasters Club;Develop public speaking and leadership skills in a supportive environment.;Competition & Academics;"[""Public Speaking"",""Leadership"",""Communication""]";;2 hrs/Week;1;"[""Monday""]";1900-2100;;;;;NTU Toastmasters helps members improve public speaking, communication, and leadership skills through regular meetings and speech evaluations.;true;2026-04-01 12:45:06.65759+00;2026-04-01 12:45:06.65759+00
552ad7c3-6d88-45ce-91d8-2e22da484fd2;Visual Arts Society;Express creativity through painting, drawing, and mixed media art.;Performance & Creativity;"[""Art"",""Painting"",""Creative""]";;3 hrs/Week;1;"[""Thursday""]";1900-2200;;;;;VAS organizes art workshops, exhibitions, and collaborative art projects. All skill levels welcome.;true;2026-04-01 12:45:06.65759+00;2026-04-01 12:45:06.65759+00
36c8385d-677f-4f42-a58a-7fdafd7f37a6;Rotaract Club of NTU;Community service and professional development through Rotary values.;Community & Lifestyle;"[""Volunteering"",""Community Service"",""Leadership""]";;3 hrs/Week;2;"[""Tuesday""]";1900-2100;;;;;Rotaract NTU combines community service with professional development. We organize volunteering projects, fundraising events, and leadership workshops.;true;2026-04-01 12:45:06.65759+00;2026-04-01 12:45:06.65759+00
265482a6-94b6-4006-861e-e0633af15e51;Buddhist Society;Explore Buddhist teachings, meditation, and mindfulness practices.;Cultural;"[""Religion"",""Meditation"",""Mindfulness""]";;2 hrs/Week;1;"[""Wednesday""]";1900-2100;;;;;NTU Buddhist Society provides a space for students to learn about Buddhist teachings, practice meditation, and engage in community service.;true;2026-04-01 12:45:06.65759+00;2026-04-01 12:45:06.65759+00
e85591ec-7414-445d-af04-c8fa42bcef06;NTU eSports Society;Competitive gaming across multiple titles with regular tournaments.;Community & Lifestyle;"[""Gaming"",""eSports"",""Competition""]";;6 hrs/Week;1;"[""Monday"",""Wednesday"",""Friday""]";2000-2300;;;;;NTU eSports Society organizes competitive gaming events, inter-university tournaments, and casual gaming sessions across titles like Valorant, League of Legends, and more.;true;2026-04-01 12:45:06.65759+00;2026-04-01 12:45:06.65759+00
592b0c6b-1e56-4039-a4ac-ef6e60b54c93;Epiphany, the NTU English and Drama Society;Theatre productions, acting workshops, and dramatic performances.;Performance & Creativity;"[""Drama"",""Theatre"",""Acting""]";;6 hrs/Week;3;"[""Monday"",""Thursday""]";1900-2200;;;;;Epiphany produces full-scale theatre productions, conducts acting workshops, and provides a creative outlet for students passionate about the dramatic arts.;true;2026-04-01 12:45:06.65759+00;2026-04-01 12:45:06.65759+00
6dc4da1f-d142-4628-8c1a-4dfe031a83c0;Photo-Videographic Society;Capture moments through photography and videography.;Performance & Creativity;"[""Photography"",""Videography"",""Creative""]";;3 hrs/Week;1;"[""Saturday""]";1000-1300;;;;;PVS teaches photography and videography skills through workshops, photowalks, and collaborative projects. We cover events and create visual content.;true;2026-04-01 12:45:06.65759+00;2026-04-01 12:45:06.65759+00
9005b992-7e71-4778-937a-a4d276154ae6;Anglers' Club;Recreational fishing trips and marine conservation awareness.;Community & Lifestyle;"[""Fishing"",""Outdoor"",""Recreation""]";;4 hrs/Week;1;"[""Saturday""]";0600-1200;;;;;NTU Anglers' Club organizes fishing trips, teaches fishing techniques, and promotes marine conservation among members.;true;2026-04-01 12:45:06.65759+00;2026-04-01 12:45:06.65759+00
d5683c85-7089-4fe8-9915-a9c043b312c7;Animal Lovers' Society;Animal welfare advocacy and volunteering at shelters.;Community & Lifestyle;"[""Animals"",""Volunteering"",""Welfare""]";;3 hrs/Week;1;"[""Saturday""]";1000-1300;;;;;ALS volunteers at animal shelters, organizes adoption drives, and raises awareness about animal welfare issues.;true;2026-04-01 12:45:06.65759+00;2026-04-01 12:45:06.65759+00
90fb58c8-9317-4664-8742-a3ce92fd2c8d;Malay Language and Cultural Society;Celebrate Malay culture through language, arts, and traditions.;Cultural;"[""Malay"",""Cultural"",""Language""]";;3 hrs/Week;2;"[""Thursday""]";1900-2100;;;;;Perbayu promotes Malay language and culture through traditional performances, cultural events, and community outreach.;true;2026-04-01 12:45:06.65759+00;2026-04-01 12:45:06.65759+00
cd0e51bb-dc4a-4128-877d-354a76247f77;Heritage Club;Preserving and promoting Singapore's multicultural heritage.;Cultural;"[""Heritage"",""Cultural"",""History""]";;3 hrs/Week;1;"[""Wednesday""]";1900-2100;;;;;Heritage Club explores Singapore's rich multicultural heritage through heritage trails, museum visits, and cultural exchange events.;true;2026-04-01 12:45:06.65759+00;2026-04-01 12:45:06.65759+00
c6b94f3e-80e3-4c3b-bc68-e1eb226ae9c0;Tamil Literary Society;Promoting Tamil language, literature, and cultural arts.;Cultural;"[""Tamil"",""Cultural"",""Literature""]";;3 hrs/Week;2;"[""Friday""]";1900-2100;;;;;Tamil Literary Society organizes Tamil cultural events, literary competitions, and language workshops to promote Tamil heritage.;true;2026-04-01 12:45:06.65759+00;2026-04-01 12:45:06.65759+00
"""


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Seed public.ccas from embedded data.")
    parser.add_argument(
        "--batch-size",
        type=int,
        default=200,
        help="Number of rows per upsert request.",
    )
    return parser.parse_args()


def require_env(name: str, alternatives: list[str] | None = None) -> str:
    alternatives = alternatives or []
    for key in [name, *alternatives]:
        value = os.getenv(key)
        if value:
            return value
    alt_text = f" or {' or '.join(alternatives)}" if alternatives else ""
    raise RuntimeError(f"Missing environment variable: {name}{alt_text}")


def parse_json_array(raw: str) -> list[str]:
    if not raw:
        return []
    try:
        parsed = json.loads(raw)
        if isinstance(parsed, list):
            return [str(item) for item in parsed]
    except json.JSONDecodeError:
        pass
    return []


def to_int(raw: str, default: int = 0) -> int:
    try:
        return int(raw)
    except (TypeError, ValueError):
        return default


def to_bool(raw: str) -> bool:
    return str(raw).strip().lower() == "true"


def row_to_payload(row: dict[str, str]) -> dict[str, Any]:
    return {
        "id": row.get("id", ""),
        "name": row.get("name", ""),
        "description": row.get("description", ""),
        "category": row.get("category", "General"),
        "tags": parse_json_array(row.get("tags", "")),
        "image_url": row.get("image_url", ""),
        "weekly_commitment": row.get("weekly_commitment", ""),
        "hall_points": to_int(row.get("hall_points", ""), 0),
        "training_days": parse_json_array(row.get("training_days", "")),
        "training_time": row.get("training_time", ""),
        "tryout_dates": row.get("tryout_dates", ""),
        "audition_dates": row.get("audition_dates", ""),
        "contact_email": row.get("contact_email", ""),
        "instagram_url": row.get("instagram_url", ""),
        "about": row.get("about", ""),
        "is_beginner_friendly": to_bool(row.get("is_beginner_friendly", "")),
        "created_at": row.get("created_at", ""),
        "updated_at": row.get("updated_at", ""),
    }


def read_embedded_rows() -> list[dict[str, Any]]:
    required_headers = {
        "id",
        "name",
        "description",
        "category",
        "tags",
        "image_url",
        "weekly_commitment",
        "hall_points",
        "training_days",
        "training_time",
        "tryout_dates",
        "audition_dates",
        "contact_email",
        "instagram_url",
        "about",
        "is_beginner_friendly",
        "created_at",
        "updated_at",
    }

    with io.StringIO(CSV_EXPORT, newline="") as f:
        reader = csv.DictReader(f, delimiter=";", quotechar='"')
        if not reader.fieldnames:
            raise RuntimeError("Embedded CSV data has no headers.")

        missing = sorted(required_headers - set(reader.fieldnames))
        if missing:
            raise RuntimeError(f"Embedded CSV missing required columns: {', '.join(missing)}")

        rows = [row_to_payload({k: v or "" for k, v in row.items()}) for row in reader if row]

    return rows


def upsert_batch(supabase_url: str, service_role_key: str, batch: list[dict[str, Any]]) -> None:
    url = (
        f"{supabase_url.rstrip('/')}/rest/v1/ccas?"
        + urllib.parse.urlencode({"on_conflict": "id"})
    )
    body = json.dumps(batch).encode("utf-8")

    request = urllib.request.Request(
        url=url,
        data=body,
        method="POST",
        headers={
            "Content-Type": "application/json",
            "apikey": service_role_key,
            "Authorization": f"Bearer {service_role_key}",
            "Prefer": "resolution=merge-duplicates,return=minimal",
        },
    )

    try:
        with urllib.request.urlopen(request) as response:
            if response.status not in (200, 201, 204):
                raise RuntimeError(f"Unexpected response status: {response.status}")
    except urllib.error.HTTPError as exc:
        details = exc.read().decode("utf-8", errors="replace")
        raise RuntimeError(f"Upsert failed: HTTP {exc.code} {details}") from exc


def main() -> int:
    args = parse_args()

    supabase_url = require_env("SUPABASE_URL", alternatives=["VITE_SUPABASE_URL"])
    service_role_key = require_env("SUPABASE_SERVICE_ROLE_KEY")

    rows = read_embedded_rows()
    if not rows:
        print("No rows found in embedded data, nothing to seed.")
        return 0

    batch_size = max(1, args.batch_size)
    total = len(rows)
    processed = 0

    for start in range(0, total, batch_size):
        batch = rows[start : start + batch_size]
        upsert_batch(supabase_url, service_role_key, batch)
        processed += len(batch)
        print(f"Upserted {processed}/{total} rows")

    print(f"Done. Seeded {total} CCA rows from embedded dataset.")
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except Exception as exc:  # pylint: disable=broad-except
        print(str(exc), file=sys.stderr)
        raise SystemExit(1)
