"""
Staff notifications from RTC admin (pending News, Events, etc.).
Uses the same SMTP / recipient settings as documented in config/settings.py.
"""
import logging

from django.conf import settings
from django.core.mail import send_mail

logger = logging.getLogger(__name__)


def send_staff_mail(subject: str, message: str) -> None:
    user = getattr(settings, "EMAIL_HOST_USER", "") or ""
    password = getattr(settings, "EMAIL_HOST_PASSWORD", "") or ""
    if not user or not password:
        logger.warning("Email credentials not configured; skipping: %s", subject)
        return
    recipients = list(getattr(settings, "ROCB_NOTIFY_STAFF_EMAILS", []) or [])
    if not recipients:
        logger.warning("ROCB_NOTIFY_STAFF_EMAILS empty; skipping: %s", subject)
        return
    try:
        send_mail(
            subject=subject[:998],
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=recipients,
            fail_silently=False,
        )
    except Exception:
        logger.exception("Failed to send staff email: %s", subject)


def notify_pending_rtc_submission(instance, rtc) -> None:
    """Notify staff when RTC owner creates content that is still PENDING."""
    label = instance._meta.verbose_name.capitalize()
    title = _instance_title(instance)
    rtc_name = getattr(rtc, "name", None) or getattr(getattr(instance, "rtc", None), "name", None) or "—"
    subject = f"[ROCB Europe] Pending approval: {label} — {title}"[:998]
    lines = [
        "A new item was submitted from the RTC admin app and is awaiting approval.",
        "",
        f"Type: {label}",
        f"RTC: {rtc_name}",
        f"Title: {title}",
        "Status: PENDING",
        "",
        "Please review and approve or reject in the ROCB RTC admin / dashboard.",
        "",
        f"Item ID: {instance.pk}",
    ]
    send_staff_mail(subject, "\n".join(lines))


def _instance_title(instance) -> str:
    for attr in ("title", "name"):
        if hasattr(instance, attr):
            v = getattr(instance, attr)
            if v:
                return str(v)[:500]
    cap = getattr(instance, "caption", None)
    if cap:
        return str(cap)[:500]
    return str(instance.pk)
