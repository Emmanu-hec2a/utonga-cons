from django.db import models
from django.contrib.auth.models import User
from django.utils.translation import gettext_lazy as _

class Campaign(models.Model):
    goal_usd = models.DecimalField(max_digits=12, decimal_places=2)
    tree_goal = models.IntegerField()
    cost_per_tree = models.DecimalField(max_digits=10, decimal_places=2, default=1.00)
    raised_usd = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    deadline = models.DateTimeField()
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Campaign - {self.raised_usd}/{self.goal_usd}"

class Donation(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
    ]
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    currency = models.CharField(max_length=3, default='USD')
    method = models.CharField(max_length=50) # card, mpesa, bank_transfer, qr
    provider = models.CharField(max_length=50) # stripe, paystack
    provider_reference = models.CharField(max_length=255, unique=True, null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    donor_name = models.CharField(max_length=255)
    donor_email = models.EmailField()
    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        is_new = self.pk is None
        old_status = None
        if not is_new:
            old_status = Donation.objects.get(pk=self.pk).status
            
        super().save(*args, **kwargs)
        
        # If a donation is marked as completed, update the Campaign total
        if self.status == 'completed' and (is_new or old_status != 'completed'):
            campaign = Campaign.objects.first()
            if campaign:
                campaign.raised_usd += self.amount
                campaign.save()
        # If a completed donation is moved to another status, deduct from total
        elif self.status != 'completed' and not is_new and old_status == 'completed':
            campaign = Campaign.objects.first()
            if campaign:
                campaign.raised_usd -= self.amount
                campaign.save()

    def __str__(self):
        return f"{self.donor_name} - {self.amount} {self.currency}"

class RoadmapMilestone(models.Model):
    STATUS_CHOICES = [
        ('done', 'Done'),
        ('in_progress', 'In Progress'),
        ('upcoming', 'Upcoming'),
    ]
    CATEGORY_CHOICES = [
        ('trails_garden', 'Trails & Garden'),
        ('camping_experiences', 'Camping & Experiences'),
        ('visibility_bookings', 'Visibility & Bookings'),
        ('infrastructure', 'Infrastructure'), # General for Phase 2
    ]
    title = models.CharField(max_length=255)
    description = models.TextField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES)
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES, default='trails_garden')
    phase = models.IntegerField(default=1)
    target_date = models.DateField(null=True, blank=True)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['order', 'phase']

    def __str__(self):
        return self.title

class GalleryImage(models.Model):
    CATEGORY_CHOICES = [
        ('trail', 'Trail'),
        ('wetland', 'Wetland'),
        ('hippo', 'Hippo'),
        ('garden', 'Garden'),
        ('camp', 'Camp'),
    ]
    title = models.CharField(max_length=255)
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES)
    image = models.ImageField(upload_to='gallery/', null=True, blank=True)
    image_key = models.CharField(max_length=255, blank=True) # For direct R2 path if needed
    order = models.PositiveIntegerField(default=0)
    alt_text = models.TextField(blank=True)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return self.title

class Booking(models.Model):
    VISIT_TYPE_CHOICES = [
        ('camp', 'Camping'),
        ('day_visit', 'Day Visit'),
        ('tour', 'Tour'),
    ]
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('declined', 'Declined'),
    ]
    visit_type = models.CharField(max_length=20, choices=VISIT_TYPE_CHOICES)
    date = models.DateField()
    party_size = models.PositiveIntegerField()
    contact_name = models.CharField(max_length=255)
    contact_phone = models.CharField(max_length=20)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    internal_notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.contact_name} - {self.visit_type} on {self.date}"

class PartnerLead(models.Model):
    TYPE_CHOICES = [
        ('tour_operator', 'Tour Operator'),
        ('investor', 'Investor'),
        ('diaspora', 'Diaspora Community'),
    ]
    STATUS_CHOICES = [
        ('new', 'New'),
        ('contacted', 'Contacted'),
        ('in_discussion', 'In Discussion'),
        ('closed', 'Closed'),
    ]
    org_name = models.CharField(max_length=255, blank=True)
    contact_name = models.CharField(max_length=255)
    contact_email = models.EmailField()
    type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    message = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='new')
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.contact_name} ({self.org_name or 'Individual'})"

class VolunteerSignup(models.Model):
    INTEREST_CHOICES = [
        ('hiking_club', 'Hiking Club'),
        ('volunteer', 'General Volunteering'),
    ]
    name = models.CharField(max_length=255)
    contact_email = models.EmailField()
    location = models.CharField(max_length=255)
    skills = models.TextField()
    interest = models.CharField(max_length=20, choices=INTEREST_CHOICES)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

class StaffUser(models.Model):
    ROLE_CHOICES = [
        ('admin', 'Admin'),
        ('viewer', 'Viewer'),
    ]
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='staff_profile')
    role = models.CharField(max_length=20, choices=ROLE_CHOICES)

    def __str__(self):
        return f"{self.user.username} - {self.role}"

class AuditLogEntry(models.Model):
    actor = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    action = models.CharField(max_length=255)
    model_name = models.CharField(max_length=100)
    object_id = models.CharField(max_length=100)
    changes = models.JSONField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.actor} - {self.action} on {self.model_name}"

class SiteSetting(models.Model):
    key = models.CharField(max_length=100, unique=True)
    value = models.TextField()
    description = models.CharField(max_length=255, blank=True)

    def __str__(self):
        return self.key
