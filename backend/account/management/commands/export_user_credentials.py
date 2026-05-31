"""
Export app users to a text file (username + known/default passwords).

Passwords in DB are hashed; only template passwords for bulk-created RTC owners
and seed accounts are included.
"""

from pathlib import Path

from django.conf import settings
from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand

from dashboard.models import RTCProfile

User = get_user_model()

RTC_BULK_PASSWORD = "pass-123"
SEED_PASSWORDS = {
    "rtc_admin_baku": "password123",
    "rtc_admin_budapest": "password123",
}


def resolve_export_password(user):
    if user.username in SEED_PASSWORDS:
        return SEED_PASSWORDS[user.username]
    if user.username.startswith("rtc_"):
        return RTC_BULK_PASSWORD
    return "[unknown — set at registration or admin]"


class Command(BaseCommand):
    help = "Export CustomUser list with known credentials to a .txt file."

    def add_arguments(self, parser):
        default_out = Path(settings.BASE_DIR) / "app_user_credentials.txt"
        parser.add_argument(
            "--output",
            "-o",
            type=str,
            default=str(default_out),
            help=f"Output file path (default: {default_out})",
        )
        parser.add_argument(
            "--rtc-only",
            action="store_true",
            help="Only users linked as RTC profile owners",
        )

    def handle(self, *args, **options):
        output = Path(options["output"])
        rtc_only = options["rtc_only"]

        owner_ids = set(RTCProfile.objects.values_list("owner_id", flat=True))
        member_ids = set(
            RTCProfile.objects.filter(members__isnull=False).values_list("members__id", flat=True)
        )

        users = User.objects.all().order_by("username")
        if rtc_only:
            users = users.filter(id__in=owner_ids)

        lines = [
            "ROCB App (app.rocbeurope.org) — user credentials",
            "Format: Username | Password | Email | Role | RTC",
            "=" * 80,
            "",
        ]

        for user in users:
            password = resolve_export_password(user)
            roles = []
            if user.is_superuser:
                roles.append("superuser")
            if user.is_staff:
                roles.append("staff")
            if not roles:
                roles.append("user")
            if not user.is_active:
                roles.append("inactive")

            rtc_bits = []
            for profile in RTCProfile.objects.filter(owner=user).select_related():
                rtc_bits.append(f"owner:{profile.host_country}")
            for profile in RTCProfile.objects.filter(members=user).select_related():
                rtc_bits.append(f"member:{profile.host_country}")
            rtc_col = "; ".join(rtc_bits) if rtc_bits else "-"

            lines.append(
                f"{user.username} | {password} | {user.email or '-'} | {','.join(roles)} | {rtc_col}"
            )

        lines.extend(
            [
                "",
                "=" * 80,
                f"Total users: {users.count()}",
                "Note: rtc_* owners from bulk import use pass-123. Other passwords are not stored in plaintext.",
            ]
        )

        output.parent.mkdir(parents=True, exist_ok=True)
        output.write_text("\n".join(lines), encoding="utf-8")
        self.stdout.write(self.style.SUCCESS(f"Wrote {users.count()} users to {output}"))
