import logging
import threading

from django.db import connection
from django.db.models.signals import post_save
from django.dispatch import receiver

from config.mail_notify import notify_pending_rtc_submission
from dashboard.models import GalleryImage, News, RTCEvent, RTCProject, RTCResource

logger = logging.getLogger(__name__)


def _run_pending_notify(model_cls, pk) -> None:
    connection.close()
    try:
        obj = model_cls.objects.get(pk=pk)
        if getattr(obj, "status", None) != "PENDING":
            return
        rtc = getattr(obj, "rtc", None)
        notify_pending_rtc_submission(obj, rtc)
    except Exception:
        logger.exception("Async RTC pending notify failed model=%s pk=%s", model_cls.__name__, pk)
    finally:
        connection.close()


@receiver(post_save, sender=News)
@receiver(post_save, sender=RTCEvent)
@receiver(post_save, sender=RTCResource)
@receiver(post_save, sender=RTCProject)
@receiver(post_save, sender=GalleryImage)
def notify_staff_on_pending_create(sender, instance, created, **kwargs):
    if not created:
        return
    if getattr(instance, "status", None) != "PENDING":
        return
    pk = instance.pk
    threading.Thread(target=_run_pending_notify, args=(sender, pk), daemon=True).start()
