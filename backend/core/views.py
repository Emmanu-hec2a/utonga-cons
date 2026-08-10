import requests
import hmac
import hashlib
import json
import os
from rest_framework import viewsets, status, generics
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAdminUser
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.conf import settings
from django.views.decorators.csrf import csrf_exempt
from django.http import HttpResponse, FileResponse
from .certification_service import CertificationService
from .weather_service import WeatherService
from .email_utils import send_resend_email
from .models import (
    Campaign, Donation, RoadmapMilestone, GalleryImage,
    Booking, PartnerLead, VolunteerSignup, SiteSetting, CallLog
)
from .serializers import (
    CampaignSerializer, RoadmapMilestoneSerializer,
    GalleryImageSerializer, BookingSerializer, PartnerLeadSerializer,
    VolunteerSignupSerializer, SiteSettingSerializer, CallLogSerializer
)
from .telephony import initiate_bridge_call
from twilio.twiml.voice_response import VoiceResponse

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

class SettingsListView(generics.ListAPIView):
    permission_classes = [AllowAny]
    queryset = SiteSetting.objects.all()
    serializer_class = SiteSettingSerializer

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

    data = json.loads(payload.decode('utf-8'))
    event = data.get('event')
    
    if event == 'charge.success':
        payment_data = data.get('data', {})
        reference = payment_data.get('reference')
        try:
            donation = Donation.objects.get(provider_reference=reference)
            donation.status = 'completed'
            donation.save()
            # If celery is running, send receipt
            try:
                from .tasks import send_receipt_email
                send_receipt_email.delay(donation.id)
            except Exception:
                pass
        except Donation.DoesNotExist:
            pass

    return Response({'status': 'success'})

from .ai_service import UtongaAIService

@api_view(['GET'])
@permission_classes([AllowAny])
def download_certificate(request, donation_id):
    """
    Generates and returns the Sanctuary Steward PDF certificate.
    """
    donation = get_object_or_404(Donation, id=donation_id)
    if donation.status != 'completed':
        return Response({'error': 'Donation not completed'}, status=400)
        
    buffer = CertificationService.generate_steward_certificate(donation)
    filename = f"Sanctuary_Steward_{donation_id}.pdf"
    
    return FileResponse(
        buffer,
        as_attachment=True,
        filename=filename,
        content_type='application/pdf'
    )

from django_ratelimit.decorators import ratelimit

@ratelimit(key='ip', rate='5/m', method='POST', block=True)
@api_view(['POST'])
@permission_classes([AllowAny])
def ai_chat(request):
    message = request.data.get('message')
    history = request.data.get('history', [])
    
    if not message:
        return Response({'error': 'Message required'}, status=400)
        
    ai = UtongaAIService()
    response = ai.get_response(message, history)
    
    return Response({'response': response})

@api_view(['GET'])
@permission_classes([AllowAny])
def get_donation_status(request, donation_id):
    from .models import Donation
    from .serializers import DonationSerializer
    donation = get_object_or_404(Donation, id=donation_id)
    serializer = DonationSerializer(donation)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def verify_donation_manually(request, donation_id):
    """
    Manually verify a donation by checking with Paystack API.
    Useful for local development or resolving webhook failures.
    """
    donation = get_object_or_404(Donation, id=donation_id)
    
    if not donation.provider_reference:
        return Response({'error': 'No provider reference found'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        headers = {
            "Authorization": f"Bearer {settings.PAYSTACK_SECRET_KEY}",
        }
        # Paystack verify endpoint
        response = requests.get(
            f"https://api.paystack.co/transaction/verify/{donation.provider_reference}",
            headers=headers
        )
        res_data = response.json()

        if res_data.get('status') and res_data['data'].get('status') == 'success':
            donation.status = 'completed'
            donation.save()
            return Response({'status': 'success', 'message': 'Donation verified and completed'})
        else:
            return Response({'error': 'Payment not verified by provider'}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

from .currency_service import CurrencyService

@api_view(['GET'])
@permission_classes([AllowAny])
def get_sanctuary_weather(request):
    """
    Returns current weather data for Utonga Sanctuary.
    """
    weather = WeatherService.get_current_sanctuary_weather()
    return Response(weather)

@ratelimit(key='ip', rate='5/m', method='POST', block=True)
@api_view(['POST'])
@permission_classes([AllowAny])
def initiate_donation(request):
    amount = request.data.get('amount')
    method = request.data.get('method') # card, mpesa, mobile_money, etc.
    email = request.data.get('donor_email')
    name = request.data.get('donor_name')
    phone = request.data.get('phone_number', '')

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

    # Core Logic: Live Global Currency Engine
    def initialize_transaction(target_currency, target_amount, channels, is_fallback=False):
        headers = {
            "Authorization": f"Bearer {settings.PAYSTACK_SECRET_KEY}",
            "Content-Type": "application/json"
        }
        
        # We point to a dedicated "Cleanup" page that tells the user it's safe to return
        callback_url = f"{domain}/paystack_callback.html"

        data = {
            "email": email,
            "amount": target_amount,
            "currency": target_currency,
            "channels": channels,
            "reference": f"UTG_{donation.id}_{int(timezone.now().timestamp())}{'_FB' if is_fallback else ''}",
            "callback_url": callback_url,
            "metadata": {
                "donation_id": donation.id,
                "original_amount_usd": amount,
                "is_fallback": is_fallback
            }
        }
        return requests.post("https://api.paystack.co/transaction/initialize", json=data, headers=headers)

    try:
        # Step 1: Handle Mobile Money (Dynamic Conversion)
        if method in ['mpesa', 'mobile_money']:
            conv = CurrencyService.convert_to_local(amount, phone)
            response = initialize_transaction(conv['currency'], conv['amount'], ["mobile_money", "card"])
        
        # Step 2: Handle Cards/Bank/QR (USD First with KES Fallback)
        else:
            response = initialize_transaction("USD", int(amount * 100), ["card", "bank", "ussd", "qr"])
            res_data = response.json()
            
            # If USD is not yet supported by merchant, fallback to KES
            if not res_data.get('status') and "Currency not supported" in res_data.get('message', ''):
                conv_kes = CurrencyService.convert_to_local(amount, "254") # Default KES fallback
                response = initialize_transaction("KES", conv_kes['amount'], ["card", "bank", "ussd", "qr"], is_fallback=True)

        res_data = response.json()

        if res_data.get('status'):
            donation.provider_reference = res_data['data']['reference']
            donation.save()
            return Response({
                'donation_id': donation.id,
                'checkout_url': res_data['data']['authorization_url']
            })
        else:
            return Response({'error': res_data.get('message', 'Initialization Failed')}, status=status.HTTP_400_BAD_REQUEST)

    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def initiate_call(request):
    to_number = request.data.get('to_number')
    staff_number = request.data.get('staff_number')
    related_type = request.data.get('related_type') # booking, lead, volunteer
    related_id = request.data.get('related_id')

    if not all([to_number, staff_number]):
        return Response({'error': 'Missing numbers'}, status=status.HTTP_400_BAD_REQUEST)

    related_obj = None
    if related_type == 'booking':
        related_obj = get_object_or_404(Booking, id=related_id)
    elif related_type == 'lead':
        related_obj = get_object_or_404(PartnerLead, id=related_id)
    elif related_type == 'volunteer':
        related_obj = get_object_or_404(VolunteerSignup, id=related_id)

    try:
        call_log = initiate_bridge_call(
            staff_number=staff_number,
            visitor_number=to_number,
            staff_user=request.user,
            related_object=related_obj
        )
        return Response(CallLogSerializer(call_log).data)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@csrf_exempt
def telephony_connect_visitor(request):
    """
    Twilio TwiML callback when staff answers.
    It returns TwiML to dial the visitor.
    """
    to_number = request.GET.get('to')
    log_id = request.GET.get('log_id')
    
    response = VoiceResponse()
    response.say("Connecting you to Utonga visitor. Please wait.")
    
    dial = response.dial(caller_id=os.environ.get('TWILIO_FROM_NUMBER'))
    dial.number(to_number)
    
    return HttpResponse(str(response), content_type='text/xml')

@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
def telephony_status_callback(request, log_id):
    """
    Twilio Status Callback to update our CallLog.
    """
    call_log = get_object_or_404(CallLog, id=log_id)
    call_status = request.data.get('CallStatus')
    duration = request.data.get('CallDuration')
    
    if call_status:
        # Map Twilio statuses to our choices
        status_map = {
            'queued': 'initiated',
            'ringing': 'ringing',
            'in-progress': 'in-progress',
            'completed': 'completed',
            'failed': 'failed',
            'busy': 'busy',
            'no-answer': 'no-answer',
            'canceled': 'canceled',
        }
        call_log.status = status_map.get(call_status, call_log.status)
        
    if duration:
        call_log.duration = int(duration)
        
    call_log.save()
    return Response({'status': 'ok'})
