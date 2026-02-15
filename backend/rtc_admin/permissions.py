from rest_framework import permissions

class IsRTCOwner(permissions.BasePermission):
    """
    Custom permission to only allow owners of an RTC to edit it.
    """

    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed to any request,
        # so we'll always allow GET, HEAD or OPTIONS requests.
        # if request.method in permissions.SAFE_METHODS:
        #     return True

        # Write permissions are only allowed to the owner of the RTC.
        # For RTCProfile
        if hasattr(obj, 'owner'):
            return obj.owner == request.user
        
        # For related models (News, Events, etc.) which have 'rtc' field
        if hasattr(obj, 'rtc'):
            return obj.rtc.owner == request.user

        return False
