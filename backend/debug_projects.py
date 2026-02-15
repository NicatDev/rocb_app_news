from dashboard.models import RTCProfile, RTCProject

target_id = 'a1fd4347-7323-4ba0-85d8-ce808c7f8d84'
print(f"Checking RTC with ID: {target_id}")

try:
    rtc = RTCProfile.objects.get(id=target_id)
    print(f"RTC Found: {rtc.name}")
    
    projects = RTCProject.objects.filter(rtc=rtc)
    print(f"Projects associated with this RTC: {projects.count()}")
    
    for p in projects:
        print(f" - Project: {p.name} (ID: {p.id})")
        
except RTCProfile.DoesNotExist:
    print(f"RTC with ID {target_id} does NOT exist.")

total_projects = RTCProject.objects.count()
print(f"Total RTCProjects in database: {total_projects}")

if total_projects > 0 and projects.count() == 0:
    print("Projects exist but not for this RTC. Listing first 5 project RTC IDs:")
    for p in RTCProject.objects.all()[:5]:
        print(f" - Project {p.name} belongs to RTC ID: {p.rtc.id}")
