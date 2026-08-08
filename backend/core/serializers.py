from rest_framework import serializers
from .models import (
    Campaign, Donation, RoadmapMilestone, GalleryImage,
    Booking, PartnerLead, VolunteerSignup, StaffUser, AuditLogEntry, SiteSetting, CallLog
)

class CampaignSerializer(serializers.ModelSerializer):
    days_left = serializers.SerializerMethodField()
    trees_pledged = serializers.SerializerMethodField()

    class Meta:
        model = Campaign
        fields = ['goal_usd', 'tree_goal', 'cost_per_tree', 'raised_usd', 'deadline', 'days_left', 'trees_pledged']

    def get_days_left(self, obj):
        from django.utils import timezone
        delta = obj.deadline - timezone.now()
        return max(0, delta.days)

    def get_trees_pledged(self, obj):
        return int(obj.raised_usd / obj.cost_per_tree) if obj.cost_per_tree > 0 else 0

class RoadmapMilestoneSerializer(serializers.ModelSerializer):
    class Meta:
        model = RoadmapMilestone
        fields = '__all__'

class GalleryImageSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = GalleryImage
        fields = ['id', 'title', 'category', 'image', 'image_url', 'image_key', 'order', 'alt_text']

    def get_image_url(self, obj):
        if obj.image:
            return obj.image.url
        if obj.image_key and obj.image_key.startswith('http'):
            return obj.image_key
        return None

class DonationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Donation
        fields = '__all__'

class BookingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Booking
        fields = '__all__'

class PartnerLeadSerializer(serializers.ModelSerializer):
    class Meta:
        model = PartnerLead
        fields = '__all__'

class VolunteerSignupSerializer(serializers.ModelSerializer):
    class Meta:
        model = VolunteerSignup
        fields = '__all__'

class StaffUserSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    class Meta:
        model = StaffUser
        fields = ['id', 'username', 'role']

class AuditLogEntrySerializer(serializers.ModelSerializer):
    actor_name = serializers.CharField(source='actor.username', read_only=True)
    class Meta:
        model = AuditLogEntry
        fields = '__all__'

class SiteSettingSerializer(serializers.ModelSerializer):
    class Meta:
        model = SiteSetting
        fields = '__all__'

class CallLogSerializer(serializers.ModelSerializer):
    staff_name = serializers.CharField(source='staff_actor.username', read_only=True)
    class Meta:
        model = CallLog
        fields = '__all__'
