from celery import shared_task
from django.conf import settings
from .models import Donation
import time

@shared_task
def trigger_mpesa_stk_push(donation_id, phone_number):
    # Logic for Paystack M-Pesa STK push
    time.sleep(2) # Simulate network call
    print(f"Triggering STK push for {donation_id} to {phone_number}")
    # Update status to pending/processing if needed

@shared_task
def process_payment_webhook(provider, payload):
    print(f"Processing {provider} webhook")
    
    if provider == 'paystack':
        event = payload.get('event')
        if event == 'charge.success':
            data = payload.get('data', {})
            reference = data.get('reference')
            try:
                donation = Donation.objects.get(provider_reference=reference)
                donation.status = 'completed'
                donation.save()
                send_receipt_email.delay(donation.id)
            except Donation.DoesNotExist:
                print(f"Donation with reference {reference} not found for Paystack event")

@shared_task
def send_receipt_email(donation_id):
    # Logic to send receipt
    print(f"Sending receipt for {donation_id}")

@shared_task
def reconcile_payments():
    # Logic for Celery Beat reconciliation
    print("Running periodic reconciliation")

@shared_task
def optimize_image(image_id):
    # Logic to resize/optimize image on R2
    print(f"Optimizing image {image_id}")
