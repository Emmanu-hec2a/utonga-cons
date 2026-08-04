import requests
import hmac
import hashlib
import json
from rest_framework import viewsets, status, generics
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAdminUser
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.conf import settings
from .email_utils import send_resend_email
from .models import (
    Campaign, Donation, RoadmapMilestone, GalleryImage,
    Booking, PartnerLead, VolunteerSignup
)
from .serializers import (
    CampaignSerializer, RoadmapMilestoneSerializer,
    GalleryImageSerializer, BookingSerializer, PartnerLeadSerializer,
    VolunteerSignupSerializer
)

class CampaignView(generics.RetrieveAPIView):
    permission_classes = [AllowAny]
    serializer_class = CampaignSerializer

    def get_object(self):
        # Assuming only one active campaign for now
        campaign = Campaign.objects.first()
        if not campaign:
            # Create a default campaign if none exists for demo/init
            campaign = Campaign.objects.create(
                goal_usd=100000,
                tree_goal=100000,
                cost_per_tree=1.00,
                deadline=timezone.now() + timezone.timedelta(days=365)
            )
        return campaign

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        # Top 3 milestones only for home summary
        roadmap = RoadmapMilestone.objects.all()[:3]
        roadmap_serializer = RoadmapMilestoneSerializer(roadmap, many=True)
        return Response({
            **serializer.data,
            'roadmap': roadmap_serializer.data
        })

class RoadmapListView(generics.ListAPIView):
    permission_classes = [AllowAny]
    queryset = RoadmapMilestone.objects.all().order_by('phase', 'order')
    serializer_class = RoadmapMilestoneSerializer

class GalleryListView(generics.ListAPIView):
    permission_classes = [AllowAny]
    queryset = GalleryImage.objects.all()
    serializer_class = GalleryImageSerializer

class BookingCreateView(generics.CreateAPIView):
    permission_classes = [AllowAny]
    queryset = Booking.objects.all()
    serializer_class = BookingSerializer

    def perform_create(self, serializer):
        booking = serializer.save()
        recipients = [getattr(settings, 'RESEND_TO_EMAIL', 'admin@utonga.org')]
        send_resend_email(
            recipients,
            'New visit booking request',
            f'<p>A new visit booking request was submitted.</p><ul><li>Contact: {booking.contact_name}</li><li>Phone: {booking.contact_phone}</li><li>Visit type: {booking.visit_type}</li><li>Date: {booking.date}</li><li>Party size: {booking.party_size}</li><li>Notes: {booking.internal_notes or "None"}</li></ul>',
            f"A new visit booking request was submitted.\nContact: {booking.contact_name}\nPhone: {booking.contact_phone}\nVisit type: {booking.visit_type}\nDate: {booking.date}\nParty size: {booking.party_size}\nNotes: {booking.internal_notes or 'None'}",
        )

class PartnerLeadCreateView(generics.CreateAPIView):
    permission_classes = [AllowAny]
    queryset = PartnerLead.objects.all()
    serializer_class = PartnerLeadSerializer

    def perform_create(self, serializer):
        lead = serializer.save()
        recipients = [getattr(settings, 'RESEND_TO_EMAIL', 'admin@utonga.org')]
        send_resend_email(
            recipients,
            'New partnership inquiry',
            f'<p>A new partnership inquiry was submitted.</p><ul><li>Contact: {lead.contact_name}</li><li>Email: {lead.contact_email}</li><li>Organization: {lead.org_name or "N/A"}</li><li>Type: {lead.type}</li><li>Message: {lead.message}</li><li>Notes: {lead.notes or "None"}</li></ul>',
            f"A new partnership inquiry was submitted.\nContact: {lead.contact_name}\nEmail: {lead.contact_email}\nOrganization: {lead.org_name or 'N/A'}\nType: {lead.type}\nMessage: {lead.message}\nNotes: {lead.notes or 'None'}",
        )

class VolunteerSignupCreateView(generics.CreateAPIView):
    permission_classes = [AllowAny]
    queryset = VolunteerSignup.objects.all()
    serializer_class = VolunteerSignupSerializer

    def perform_create(self, serializer):
        volunteer = serializer.save()
        recipients = [getattr(settings, 'RESEND_TO_EMAIL', 'admin@utonga.org')]
        send_resend_email(
            recipients,
            'New volunteer signup',
            f'<p>A new volunteer signup was submitted.</p><ul><li>Name: {volunteer.name}</li><li>Email: {volunteer.contact_email}</li><li>Location: {volunteer.location}</li><li>Interest: {volunteer.interest}</li><li>Skills: {volunteer.skills}</li></ul>',
            f"A new volunteer signup was submitted.\nName: {volunteer.name}\nEmail: {volunteer.contact_email}\nLocation: {volunteer.location}\nInterest: {volunteer.interest}\nSkills: {volunteer.skills}",
        )

@api_view(['POST'])
@permission_classes([AllowAny])
def paystack_webhook(request):
    payload = request.body
    signature = request.META.get('HTTP_X_PAYSTACK_SIGNATURE')
    secret = getattr(settings, 'PAYSTACK_SECRET_KEY', '')

    computed_hmac = hmac.new(
        secret.encode('utf-8'),
        payload,
        hashlib.sha512
    ).hexdigest()

    if computed_hmac != signature:
        return Response({'error': 'Invalid signature'}, status=status.HTTP_400_BAD_REQUEST)

    from .tasks import process_payment_webhook
    process_payment_webhook.delay('paystack', json.loads(payload.decode('utf-8')))
    return Response({'status': 'success'})

@api_view(['POST'])
@permission_classes([AllowAny])
def initiate_donation(request):
    amount = request.data.get('amount')
    method = request.data.get('method') # card, mpesa, etc.
    email = request.data.get('donor_email')
    name = request.data.get('donor_name')

    if not all([amount, method, email, name]):
        return Response({'error': 'Missing required fields'}, status=status.HTTP_400_BAD_REQUEST)

    donation = Donation.objects.create(
        amount=amount,
        method=method,
        donor_email=email,
        donor_name=name,
        status='pending',
        provider='paystack'
    )

    domain = getattr(settings, 'UTONGA_PRIMARY_DOMAIN', 'https://utongoconservation.org')

    # All methods (Card, M-Pesa, etc.) handled by Paystack
    try:
        headers = {
            "Authorization": f"Bearer {settings.PAYSTACK_SECRET_KEY}",
            "Content-Type": "application/json"
        }
        data = {
            "email": email,
            "amount": int(amount * 100),
            "reference": f"UTG_{donation.id}_{int(timezone.now().timestamp())}",
            "callback_url": f"{domain}/give?status=success&id={donation.id}",
            "metadata": {"donation_id": donation.id}
        }
        
        response = requests.post("https://api.paystack.co/transaction/initialize", json=data, headers=headers)
        res_data = response.json()
        
        if res_data['status']:
            donation.provider_reference = res_data['data']['reference']
            donation.save()
            return Response({
                'donation_id': donation.id,
                'checkout_url': res_data['data']['authorization_url']
            })
        else:
            return Response({'error': res_data['message']}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
