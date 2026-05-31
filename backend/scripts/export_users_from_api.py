#!/usr/bin/env python3
"""
Fetch RTC owners from app.rocbeurope.org API and write credentials txt.

Public API does not expose all users or passwords; RTC bulk owners use pass-123.
Run export_user_credentials management command on the server for a full DB export.
"""

from __future__ import annotations

import json
import sys
import urllib.request
from pathlib import Path

API_URL = "https://app.rocbeurope.org/api/v1/dashboard/rtc-profiles/"
RTC_BULK_PASSWORD = "pass-123"
DEFAULT_OUTPUT = Path(__file__).resolve().parent.parent / "app_user_credentials.txt"


def fetch_rtc_profiles():
    req = urllib.request.Request(
        API_URL,
        headers={
            "Accept": "application/json",
            "User-Agent": "curl/8.0 (ROCB export script)",
        },
    )
    with urllib.request.urlopen(req, timeout=60) as resp:
        return json.loads(resp.read().decode("utf-8"))


def password_for_username(username: str) -> str:
    if username.startswith("rtc_"):
        return RTC_BULK_PASSWORD
    if username in ("rtc_admin_baku", "rtc_admin_budapest"):
        return "password123"
    return "[unknown — not rtc bulk account]"


def main():
    out = Path(sys.argv[1]) if len(sys.argv) > 1 else DEFAULT_OUTPUT
    profiles = fetch_rtc_profiles()

    lines = [
        "ROCB App (app.rocbeurope.org) — credentials from API",
        "Source: GET /api/v1/dashboard/rtc-profiles/",
        "Format: Host Country | RTC Name | Username | Password",
        "=" * 80,
        "",
    ]

    seen = set()
    for p in sorted(profiles, key=lambda x: (x.get("order") or 0, x.get("host_country") or "")):
        username = p.get("owner_username") or ""
        if not username or username in seen:
            continue
        seen.add(username)
        host = p.get("host_country") or "-"
        name = p.get("name") or "-"
        pwd = password_for_username(username)
        lines.append(f"{host} | {name} | {username} | {pwd}")

    lines.extend(
        [
            "",
            "=" * 80,
            f"RTC owners from API: {len(seen)}",
            "",
            "For ALL registered users (feed, admin, etc.) run on server:",
            "  python manage.py export_user_credentials -o app_user_credentials.txt",
        ]
    )

    out.write_text("\n".join(lines), encoding="utf-8")
    print(f"Wrote {len(seen)} RTC owner rows to {out}")


if __name__ == "__main__":
    main()
