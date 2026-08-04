from django.urls import path, include
from rest_framework.routers import DefaultRouter
from knox import views as knox_views
from .views import (
    CampaignView, GalleryListView, BookingCreateView,
    PartnerLeadCreateView, VolunteerSignupCreateView, initiate_donation,
    paystack_webhook, RoadmapListView
)
from .admin_views import (
    DonationAdminViewSet, BookingAdminViewSet, RoadmapAdminViewSet,
    GalleryAdminViewSet, LeadAdminViewSet, VolunteerAdminViewSet,
    AuditLogListView, admin_dashboard_stats, CampaignAdminViewSet,
    SiteSettingAdminViewSet, admin_login, admin_change_password,
    verify_token
)

router = DefaultRouter()
router.register(r'admin/donations', DonationAdminViewSet, basename='admin-donation')
router.register(r'admin/campaign', CampaignAdminViewSet, basename='admin-campaign')
router.register(r'admin/bookings', BookingAdminViewSet, basename='admin-booking')
router.register(r'admin/roadmap', RoadmapAdminViewSet, basename='admin-roadmap')
router.register(r'admin/gallery', GalleryAdminViewSet, basename='admin-gallery')
router.register(r'admin/leads', LeadAdminViewSet, basename='admin-lead')
router.register(r'admin/volunteers', VolunteerAdminViewSet, basename='admin-volunteer')
router.register(r'admin/settings', SiteSettingAdminViewSet, basename='admin-settings')

urlpatterns = [
    path('campaign/', CampaignView.as_view(), name='campaign-detail'),
    path('roadmap/', RoadmapListView.as_view(), name='roadmap-list'),
    path('gallery/', GalleryListView.as_view(), name='gallery-list'),
    path('bookings/', BookingCreateView.as_view(), name='booking-create'),
    path('partner-leads/', PartnerLeadCreateView.as_view(), name='partner-lead-create'),
    path('volunteer-signups/', VolunteerSignupCreateView.as_view(), name='volunteer-signup-create'),
    path('donations/initiate/', initiate_donation, name='donation-initiate'),
    path('webhooks/paystack/', paystack_webhook, name='paystack-webhook'),
    
    # Admin endpoints
    path('admin/login/', admin_login, name='admin-login'),
    path('admin/logout/', knox_views.LogoutView.as_view(), name='knox-logout'),
    path('admin/change-password/', admin_change_password, name='admin-change-password'),
    path('admin/verify-token/', verify_token, name='admin-verify-token'),
    path('admin/dashboard/', admin_dashboard_stats, name='admin-dashboard'),
    path('admin/audit-log/', AuditLogListView.as_view(), name='admin-audit-log'),
    path('', include(router.urls)),
]
