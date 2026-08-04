from rest_framework import viewsets, generics, status
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from django.contrib.auth import authenticate, login
from django.contrib.auth.models import User
from knox.models import AuthToken
from knox.auth import TokenAuthentication
from .models import (
    Donation, Booking, RoadmapMilestone, GalleryImage,
    PartnerLead, VolunteerSignup, AuditLogEntry, StaffUser, Campaign, SiteSetting
)
from .serializers import (
    DonationSerializer, BookingSerializer, RoadmapMilestoneSerializer,
    GalleryImageSerializer, PartnerLeadSerializer, VolunteerSignupSerializer,
    AuditLogEntrySerializer, StaffUserSerializer, CampaignSerializer, SiteSettingSerializer
)

class IsStaffUser(IsAuthenticated):
    def has_permission(self, request, view):
        is_authenticated = super().has_permission(request, view)
        if not is_authenticated:
            return False
        
        # Superusers are always staff
        if request.user.is_superuser:
            return True
            
        # Check for staff profile
        return hasattr(request.user, 'staff_profile')

@api_view(['POST'])
@permission_classes([AllowAny])
def admin_login(request):
    username = request.data.get('username')
    password = request.data.get('password')
    user = authenticate(request, username=username, password=password)
    if user is not None:
        # Create token
        _, token = AuthToken.objects.create(user)
        
        # Check for StaffUser profile to determine role
        role = 'viewer' # Default
        if hasattr(user, 'staff_profile'):
            role = user.staff_profile.role
        elif user.is_superuser:
            role = 'admin'

        needs_password_change = user.is_superuser and user.last_login is None
        return Response({
            'success': True,
            'token': token,
            'needs_password_change': needs_password_change,
            'username': user.username,
            'role': role
        })
    return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
@authentication_classes([TokenAuthentication])
def admin_change_password(request):
    new_password = request.data.get('new_password')
    confirm_password = request.data.get('confirm_password')
    if new_password != confirm_password:
        return Response({'error': 'Passwords do not match'}, status=status.HTTP_400_BAD_REQUEST)
    
    request.user.set_password(new_password)
    request.user.save()
    return Response({'success': 'Password updated'})

class DonationAdminViewSet(viewsets.ModelViewSet):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsStaffUser]
    queryset = Donation.objects.all().order_by('-created_at')
    serializer_class = DonationSerializer

    def perform_update(self, serializer):
        instance = serializer.save()
        AuditLogEntry.objects.create(
            actor=self.request.user,
            action='update',
            model_name='Donation',
            object_id=str(instance.id),
            changes=serializer.data
        )

class CampaignAdminViewSet(viewsets.ModelViewSet):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsStaffUser]
    queryset = Campaign.objects.all()
    serializer_class = CampaignSerializer

    def perform_update(self, serializer):
        instance = serializer.save()
        AuditLogEntry.objects.create(
            actor=self.request.user,
            action='update',
            model_name='Campaign',
            object_id=str(instance.id),
            changes=serializer.data
        )

class BookingAdminViewSet(viewsets.ModelViewSet):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsStaffUser]
    queryset = Booking.objects.all().order_by('-date')
    serializer_class = BookingSerializer

class RoadmapAdminViewSet(viewsets.ModelViewSet):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsStaffUser]
    queryset = RoadmapMilestone.objects.all().order_by('order')
    serializer_class = RoadmapMilestoneSerializer

class GalleryAdminViewSet(viewsets.ModelViewSet):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsStaffUser]
    queryset = GalleryImage.objects.all().order_by('order')
    serializer_class = GalleryImageSerializer

class LeadAdminViewSet(viewsets.ModelViewSet):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsStaffUser]
    queryset = PartnerLead.objects.all().order_by('-created_at')
    serializer_class = PartnerLeadSerializer

class VolunteerAdminViewSet(viewsets.ModelViewSet):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsStaffUser]
    queryset = VolunteerSignup.objects.all().order_by('-created_at')
    serializer_class = VolunteerSignupSerializer

class SiteSettingAdminViewSet(viewsets.ModelViewSet):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsStaffUser]
    queryset = SiteSetting.objects.all()
    serializer_class = SiteSettingSerializer

class AuditLogListView(generics.ListAPIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsStaffUser]
    queryset = AuditLogEntry.objects.all().order_by('-created_at')
    serializer_class = AuditLogEntrySerializer

@api_view(['GET'])
@permission_classes([IsAuthenticated])
@authentication_classes([TokenAuthentication])
def verify_token(request):
    return Response({
        'username': request.user.username,
        'is_staff': request.user.is_staff,
        'is_superuser': request.user.is_superuser
    })

@api_view(['GET'])
@permission_classes([IsStaffUser])
@authentication_classes([TokenAuthentication])
def admin_dashboard_stats(request):
    total_raised = sum(d.amount for d in Donation.objects.filter(status='completed'))
    pending_bookings = Booking.objects.filter(status='pending').count()
    new_leads = PartnerLead.objects.filter(status='new').count()
    
    return Response({
        'total_raised': total_raised,
        'pending_bookings': pending_bookings,
        'new_leads': new_leads,
    })
