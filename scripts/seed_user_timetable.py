#!/usr/bin/env python3
"""Seed 4 rows into public.user_timetable for a specific user.

Usage:
  SUPABASE_URL="https://<project-ref>.supabase.co" \
  SUPABASE_SERVICE_ROLE_KEY="..." \
	python3 scripts/seed_user_timetable.py

Notes:
- Uses Supabase PostgREST upsert with on_conflict=id.
- day_of_week mapping follows app convention: Monday=0 ... Sunday=6.
"""

from __future__ import annotations

import json
import os
from pathlib import Path
import sys
import urllib.error
import urllib.parse
import urllib.request


def load_env_file() -> None:
	"""Load environment variables from .env if present.

	Search order:
	1) Current working directory/.env
	2) Project root/.env (parent of this scripts directory)
	"""
	candidates = [
		Path.cwd() / ".env",
		Path(__file__).resolve().parents[1] / ".env",
	]

	for env_path in candidates:
		if not env_path.exists():
			continue
		for raw_line in env_path.read_text(encoding="utf-8").splitlines():
			line = raw_line.strip()
			if not line or line.startswith("#") or "=" not in line:
				continue
			key, value = line.split("=", 1)
			key = key.strip()
			value = value.strip().strip('"').strip("'")
			if key and key not in os.environ:
				os.environ[key] = value
		return


def require_env(name: str, alternatives: list[str] | None = None) -> str:
	alternatives = alternatives or []
	for key in [name, *alternatives]:
		value = os.getenv(key)
		if value:
			return value
	alt_text = f" or {' or '.join(alternatives)}" if alternatives else ""
	raise RuntimeError(f"Missing environment variable: {name}{alt_text}")


def upsert_rows(
	supabase_url: str,
	service_role_key: str,
	rows: list[dict[str, str | int]],
) -> None:
	url = (
		f"{supabase_url.rstrip('/')}/rest/v1/user_timetable?"
		+ urllib.parse.urlencode({"on_conflict": "id"})
	)
	body = json.dumps(rows).encode("utf-8")

	request = urllib.request.Request(
		url=url,
		data=body,
		method="POST",
		headers={
			"Content-Type": "application/json",
			"apikey": service_role_key,
			"Authorization": f"Bearer {service_role_key}",
			"Prefer": "resolution=merge-duplicates,return=representation",
		},
	)

	try:
		with urllib.request.urlopen(request) as response:
			response_body = response.read().decode("utf-8", errors="replace")
			if response.status not in (200, 201, 204):
				raise RuntimeError(f"Unexpected response status: {response.status}")
			print("Upsert successful.")
			if response_body:
				print(response_body)
	except urllib.error.HTTPError as exc:
		details = exc.read().decode("utf-8", errors="replace")
		raise RuntimeError(f"Upsert failed: HTTP {exc.code} {details}") from exc


def build_rows() -> list[dict[str, str | int]]:
	user_id = "4e13535d-ff94-4231-a526-2284a237eea3"
	return [
		{
			"id": "921cd102-3a1d-4f11-84f1-7edb5c83fca1",
			"user_id": user_id,
			"event_name": "IE3102",
			"event_type": "class",
			"day_of_week": 0,
			"start_time": "09:00:00",
			"end_time": "10:30:00",
			"location": "",
		},
		{
			"id": "8c2fd18c-e525-4417-9075-3dab9f8a3eb7",
			"user_id": user_id,
			"event_name": "DV2008",
			"event_type": "class",
			"day_of_week": 1,
			"start_time": "11:00:00",
			"end_time": "12:30:00",
			"location": "",
		},
		{
			"id": "a96952c1-bb28-490b-95d4-99d953bf2f9d",
			"user_id": user_id,
			"event_name": "IE4791",
			"event_type": "class",
			"day_of_week": 3,
			"start_time": "14:00:00",
			"end_time": "15:30:00",
			"location": "",
		},
		{
			"id": "4198fbd6-c777-456a-b87d-f359114b227a",
			"user_id": user_id,
			"event_name": "IE4758",
			"event_type": "class",
			"day_of_week": 4,
			"start_time": "16:00:00",
			"end_time": "17:30:00",
			"location": "",
		},
	]


def main() -> int:
	load_env_file()
	supabase_url = require_env("SUPABASE_URL", alternatives=["VITE_SUPABASE_URL"])
	service_role_key = require_env("SUPABASE_SERVICE_ROLE_KEY")
	rows = build_rows()

	upsert_rows(supabase_url, service_role_key, rows)
	print(f"Done. Upserted {len(rows)} rows into public.user_timetable.")
	return 0

if __name__ == "__main__":
	try:
		raise SystemExit(main())
	except Exception as exc:  # pylint: disable=broad-except
		print(str(exc), file=sys.stderr)
		raise SystemExit(1)
