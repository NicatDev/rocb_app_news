import uuid
from django.db import models
from django.utils.text import slugify
from django.conf import settings
from django.utils.translation import gettext_lazy as _

# ---------------------------------------------------------
# Visibility Mixin
# ---------------------------------------------------------
class VisibilityStatus(models.TextChoices):
    INTERNAL = 'INTERNAL', _('Internal Feed Only') # Yalnız login olanlar üçün
    PUBLIC = 'PUBLIC', _('Public News & Highlights') # Dashboardda və News səhifəsində görünür
    PENDING = 'PENDING', _('Pending') # Hec yerde gorunmur ve status tesdiqi gozleyir

class VisibilityMixin(models.Model):
    status = models.CharField(
        max_length=20, 
        choices=VisibilityStatus.choices, 
        default=VisibilityStatus.PENDING,
        help_text="PENDING: Hec yerde gorunmur. INTERNAL: Login olanlar. PUBLIC: Hər kəs."
    )

    class Meta:
        abstract = True

# ---------------------------------------------------------
# 1. RTC Profile (Core Dashboard)
# ---------------------------------------------------------
class RTCProfile(VisibilityMixin, models.Model):
    """
    Mənbə: [2], [3] - General Information, Management, Overview.
    Bu model RTC-nin əsas profil səhifəsi üçün statik məlumatları saxlayır.
    """
    # Identifiers
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(_("Full Official Name"), max_length=255, unique=True) # [2]
    slug = models.SlugField(unique=True, blank=True, help_text="Avtomatik olaraq addan yaranır")
    owner = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='rtc_profile')
    members = models.ManyToManyField(settings.AUTH_USER_MODEL, related_name='rtc_members',null=True,blank=True)
    
    # General Info [2]
    host_country = models.CharField(_("Host Country"), max_length=100)
    address = models.TextField(_("Full Postal Address"))
    website = models.URLField(_("Official Website"), blank=True, null=True)
    coordinates = models.CharField(_("Coordinates"), max_length=255, blank=True, null=True, help_text="Format: Latitude, Longitude")
    logo = models.ImageField(upload_to='rtc_logos/', blank=True, null=True, verbose_name="School Logo")
    
    # Management [2]
    director_name = models.CharField(_("Director Name"), max_length=255)
    director_email = models.EmailField(_("Director Email"))
    director_bio = models.TextField(_("Director Bio"), blank=True, null=True) # [9]

    # Contact Person [2]
    contact_person_name = models.CharField(_("Contact Person Name"), max_length=255)
    contact_person_email = models.EmailField(_("Contact Person Email"), blank=True, null=True)
    phone_number = models.CharField(_("Primary Phone Number"), max_length=50)

    # Overview & Background [2, 3]
    establishment_year = models.PositiveIntegerField(_("Year of Establishment"))
    mission_statement = models.TextField(_("Mission & Vision Statement"))
    overview_text = models.TextField(_("Brief History/Overview")) # [10]
    specialization_areas = models.TextField(
        _("Areas of Specialization"), 
        help_text="Key training focus areas e.g., enforcement, valuation"
    ) # [3]

    order = models.PositiveIntegerField(
        _("Display order"),
        default=2,
        help_text=_("Lower numbers appear first when listing RTC profiles."),
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        # Slug-ın avtomatik yaradılması
        if not self.slug:
            base_slug = slugify(self.name)
            slug = base_slug
            counter = 1
            # Unikallığı təmin etmək üçün yoxlama
            while RTCProfile.objects.filter(slug=slug).exists():
                slug = f"{base_slug}-{counter}"
                counter += 1
            self.slug = slug
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = "RTC Profile"
        verbose_name_plural = "RTC Profiles"
        ordering = ["order", "name"]


# ---------------------------------------------------------
# 2. Strategic Documents & Resources
# ---------------------------------------------------------
class RTCResource(VisibilityMixin, models.Model):
    """
    Mənbə: [11], [12], [3], [4] - Strategic Documents & Resource Documents.
    Bütün PDF sənədlər və linklər mərkəzləşdirilmiş şəkildə burada saxlanılır.
    """
    class ResourceType(models.TextChoices):
        MANDATE = 'TOR', _('Mandate / Terms of Reference') # [11]
        MOU = 'MOU', _('Founding Memorandum') # [11]
        STRATEGY = 'STRATEGY', _('Strategic Plan') # [11]
        TRAINING_PLAN = 'PLAN', _('Annual Training Plan') # [3]
        CATALOGUE = 'CATALOGUE', _('Training Catalogue') # [12]
        REPORT = 'REPORT', _('Annual Report / Newsletter') # [12]
        PUBLICATION = 'PUB', _('Publication / Handbook') # [4]
        E_LEARNING = 'ELEARN', _('E-Learning Link') # [4]

    rtc = models.ForeignKey(RTCProfile, on_delete=models.CASCADE, related_name='resources')
    title = models.CharField(max_length=255)
    resource_type = models.CharField(max_length=20, choices=ResourceType.choices)
    
    file = models.FileField(upload_to='rtc_docs/', blank=True, null=True, verbose_name="PDF File")
    external_link = models.URLField(blank=True, null=True, verbose_name="External Link (if applicable)")
    description = models.TextField(blank=True, verbose_name="Short Description")

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.rtc.name} - {self.get_resource_type_display()}"


# ---------------------------------------------------------
# 3. Activities: Events & Projects
# ---------------------------------------------------------
class RTCEvent(VisibilityMixin, models.Model):
    """
    Mənbə: [13], [3] - Events & Activities.
    Həm gələcək (Upcoming), həm də keçmiş (Past) təlimləri idarə edir.
    """
    rtc = models.ForeignKey(RTCProfile, on_delete=models.CASCADE, related_name='events')
    title = models.CharField(max_length=255)
    topic = models.CharField(max_length=255, verbose_name="Topic")
    event_date = models.DateField(_("Event Date"))
    
    # Keçmiş tədbirlər üçün sahələr [13]
    summary = models.TextField(_("Summary/Outcomes"), blank=True, help_text="Results/Participant info for past events")
    participant_count = models.PositiveIntegerField(blank=True, null=True) 
    report_file = models.FileField(upload_to='event_reports/', blank=True, null=True, help_text="Attach report PDF")

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-event_date']

    @property
    def is_upcoming(self):
        from django.utils import timezone
        return self.event_date >= timezone.now().date()

    def __str__(self):
        return f"{self.title} ({self.event_date})"

class RTCEventFile(models.Model):
    event = models.ForeignKey(RTCEvent, on_delete=models.CASCADE, related_name='event_files')
    file = models.FileField(upload_to='event_reports/')
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"File for {self.event.title}"

class RTCProject(VisibilityMixin, models.Model):
    """
    Mənbə: [14], [4] - Projects & Initiatives.
    """
    rtc = models.ForeignKey(RTCProfile, on_delete=models.CASCADE, related_name='projects')
    name = models.CharField(max_length=255)
    description = models.TextField(verbose_name="Overview")
    timeframe = models.CharField(max_length=100, help_text="e.g., 2024-2026")
    partners = models.CharField(max_length=255, help_text="Partners Involved")
    image = models.ImageField(upload_to='project_images/', blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

class GalleryImage(VisibilityMixin, models.Model):
    rtc = models.ForeignKey(RTCProfile, on_delete=models.CASCADE, related_name='gallery')
    image = models.ImageField(upload_to='rtc_gallery/')
    caption = models.CharField(max_length=255, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Gallery Image: {self.rtc.name}"

class News(VisibilityMixin, models.Model):
    rtc = models.ForeignKey(RTCProfile, on_delete=models.CASCADE, related_name='news', null=True, blank=True)
    title = models.CharField(max_length=255)
    slug = models.SlugField(unique=True, blank=True)
    summary = models.TextField(_('Summary'), blank=True, null=True)
    content = models.TextField()
    image = models.ImageField(upload_to='news_images/', blank=True, null=True)
    order = models.PositiveIntegerField(
        _('Display order'),
        default=1,
        help_text=_('Lower numbers appear first when listing news.'),
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        if not self.slug:
            base_slug = slugify(self.title)
            slug = base_slug
            counter = 1
            while News.objects.filter(slug=slug).exists():
                slug = f"{base_slug}-{counter}"
                counter += 1
            self.slug = slug
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title

    class Meta:
        ordering = ['order', '-created_at']


class NewsImage(models.Model):
    """Additional images attached to a news article (main cover remains on News.image)."""

    news = models.ForeignKey(News, on_delete=models.CASCADE, related_name='extra_images')
    image = models.ImageField(upload_to='news_images/extra/')
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['order', 'id']

    def __str__(self):
        return f'{self.news_id} extra #{self.pk}'
