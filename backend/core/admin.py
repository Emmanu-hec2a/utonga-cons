from django.contrib import admin
from .models import (
    Campaign, Donation, RoadmapMilestone, GalleryImage,
    Booking, PartnerLead, VolunteerSignup, StaffUser, AuditLogEntry
)

@admin.register(Campaign)
class CampaignAdmin(admin.ModelAdmin):
    list_display = ('goal_usd', 'raised_usd', 'tree_goal', 'deadline')

@admin.register(Donation)
class DonationAdmin(admin.ModelAdmin):
    list_display = ('donor_name', 'amount', 'currency', 'status', 'created_at')
    list_filter = ('status', 'method', 'provider')
    search_fields = ('donor_name', 'donor_email', 'provider_reference')

@admin.register(RoadmapMilestone)
class RoadmapMilestoneAdmin(admin.ModelAdmin):
    list_display = ('title', 'status', 'phase', 'order')
    list_editable = ('status', 'order')

@admin.register(GalleryImage)
class GalleryImageAdmin(admin.ModelAdmin):
    list_display = ('title', 'category', 'order')
    list_editable = ('order',)

@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = ('contact_name', 'visit_type', 'date', 'status')
    list_filter = ('status', 'visit_type', 'date')

@admin.register(PartnerLead)
class PartnerLeadAdmin(admin.ModelAdmin):
    list_display = ('contact_name', 'org_name', 'type', 'status')
    list_filter = ('status', 'type')

@admin.register(VolunteerSignup)
class VolunteerSignupAdmin(admin.ModelAdmin):
    list_display = ('name', 'contact_email', 'interest', 'created_at')

@admin.register(StaffUser)
class StaffUserAdmin(admin.ModelAdmin):
    list_display = ('user', 'role')

@admin.register(AuditLogEntry)
class AuditLogEntryAdmin(admin.ModelAdmin):
    list_display = ('actor', 'action', 'model_name', 'created_at')
    readonly_fields = ('actor', 'action', 'model_name', 'object_id', 'changes', 'created_at')
