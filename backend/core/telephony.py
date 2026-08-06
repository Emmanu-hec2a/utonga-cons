import os
from twilio.rest import Client
from django.conf import settings
from .models import CallLog

def get_twilio_client():
    account_sid = os.environ.get('TWILIO_ACCOUNT_SID')
    auth_token = os.environ.get('TWILIO_AUTH_TOKEN')
    if not account_sid or not auth_token:
        return None
    return Client(account_sid, auth_token)

def initiate_bridge_call(staff_number, visitor_number, staff_user, related_object=None):
    """
    Initiates a bridge call. 
    Twilio calls the staff member first. 
    When they answer, Twilio executes the URL (webhook) to dial the visitor.
    """
    client = get_twilio_client()
    from_number = os.environ.get('TWILIO_FROM_NUMBER')
    
    if not client or not from_number:
        raise Exception("Telephony provider not configured.")

    # Create initial CallLog
    log_entry = CallLog.objects.create(
        staff_actor=staff_user,
        from_number=from_number,
        to_number=visitor_number,
        status='initiated'
    )
    
    # Set link to related object
    from .models import Booking, PartnerLead, VolunteerSignup
    if isinstance(related_object, Booking):
        log_entry.booking = related_object
    elif isinstance(related_object, PartnerLead):
        log_entry.partner_lead = related_object
    elif isinstance(related_object, VolunteerSignup):
        log_entry.volunteer = related_object
    log_entry.save()

    # Webhook URL for Twilio to know what to do next (TwiML)
    # This must be a publicly accessible URL
    # We will use a view that returns TwiML to <Dial> the visitor
    callback_url = f"{settings.UTONGA_API_DOMAIN}/api/telephony/connect-visitor/?to={visitor_number}&log_id={log_entry.id}"

    try:
        call = client.calls.create(
            to=staff_number,
            from_=from_number,
            url=callback_url,
            status_callback=f"{settings.UTONGA_API_DOMAIN}/api/telephony/status-callback/{log_entry.id}/",
            status_callback_event=['initiated', 'ringing', 'answered', 'completed'],
        )
        
        log_entry.sid = call.sid
        log_entry.save()
        return log_entry
    except Exception as e:
        log_entry.status = 'failed'
        log_entry.notes = f"Initial error: {str(e)}"
        log_entry.save()
        raise e
