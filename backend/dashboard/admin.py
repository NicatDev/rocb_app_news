from django.contrib import admin
from .models import RTCProfile, RTCResource, RTCEvent, RTCProject, GalleryImage, News, NewsImage, NewsSection

class RTCResourceInline(admin.StackedInline):
    model = RTCResource
    extra = 1

class RTCEventInline(admin.StackedInline):
    model = RTCEvent
    extra = 1

class RTCProjectInline(admin.StackedInline):
    model = RTCProject
    extra = 1

class GalleryImageInline(admin.StackedInline):
    model = GalleryImage
    extra = 1

class NewsInline(admin.StackedInline):
    model = News
    extra = 1


class NewsImageInline(admin.TabularInline):
    model = NewsImage
    extra = 1


class NewsSectionInline(admin.TabularInline):
    model = NewsSection
    fk_name = 'news'
    extra = 1
    fields = ('order',  'title', 'content')


@admin.register(RTCProfile)
class RTCProfileAdmin(admin.ModelAdmin):
    list_display = ('name', 'host_country', 'order', 'director_name', 'status')
    list_filter = ('host_country', 'status')
    search_fields = ('name', 'host_country', 'director_name')
    prepopulated_fields = {'slug': ('name',)}
    inlines = [RTCResourceInline, RTCEventInline, RTCProjectInline, GalleryImageInline, NewsInline]

@admin.register(RTCResource)
class RTCResourceAdmin(admin.ModelAdmin):
    list_display = ('title', 'rtc', 'resource_type', 'status')
    list_filter = ('rtc', 'resource_type', 'status')

@admin.register(RTCEvent)
class RTCEventAdmin(admin.ModelAdmin):
    list_display = ('title', 'rtc', 'event_date', 'status')
    list_filter = ('rtc', 'status')

@admin.register(RTCProject)
class RTCProjectAdmin(admin.ModelAdmin):
    list_display = ('name', 'rtc', 'timeframe', 'status')
    list_filter = ('rtc', 'status')

@admin.register(GalleryImage)
class GalleryImageAdmin(admin.ModelAdmin):
    list_display = ('caption', 'rtc', 'status')
    list_filter = ('rtc', 'status')

@admin.register(News)
class NewsAdmin(admin.ModelAdmin):
    list_display = ('title', 'rtc', 'order', 'created_at', 'status')
    list_filter = ('rtc', 'status')
    search_fields = ('title', 'summary', 'content')
    prepopulated_fields = {'slug': ('title',)}
    inlines = [NewsSectionInline, NewsImageInline]
