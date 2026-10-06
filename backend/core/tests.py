import hmac
import hashlib
import json
from decimal import Decimal
from unittest.mock import patch

from django.test import TestCase, SimpleTestCase
from rest_framework.test import APIClient

from .models import Campaign, Donation
from .email_utils import send_resend_email


class ResendEmailTests(SimpleTestCase):
    @patch('core.email_utils.requests.post')
    def test_send_resend_email_sends_payload_to_resend(self, mock_post):
        mock_post.return_value.status_code = 200
        mock_post.return_value.raise_for_status.return_value = None
        mock_post.return_value.json.return_value = {'id': 'email_123'}

        with self.settings(RESEND_API_KEY='test-key', RESEND_FROM_EMAIL='hello@utonga.org'):
            sent, payload = send_resend_email(
                ['admin@utonga.org'],
                'New booking request',
                '<p>Details here</p>',
                'Details here',
            )

        self.assertTrue(sent)
        self.assertEqual(payload['id'], 'email_123')
        mock_post.assert_called_once()


class PaystackIntegrationTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.campaign = Campaign.objects.create(
            goal_usd=10000,
            tree_goal=10000,
            cost_per_tree=1.00,
            raised_usd=0.00,
            deadline='2030-01-01T00:00:00Z'
        )
        self.secret_key = 'test_secret_key'

    @patch('core.views.requests.post')
    def test_initiate_donation_decimal_precision_and_string_handling(self, mock_post):
        mock_post.return_value.status_code = 200
        mock_post.return_value.json.return_value = {
            'status': True,
            'data': {
                'reference': 'UTG_TEST_123',
                'authorization_url': 'https://checkout.paystack.com/test'
            }
        }

        with self.settings(PAYSTACK_SECRET_KEY=self.secret_key):
            # Test string amount input "19.99"
            response = self.client.post('/api/donations/initiate/', {
                'amount': '19.99',
                'method': 'card',
                'donor_email': 'donor@example.com',
                'donor_name': 'Jane Donor',
                'phone_number': '+254712345678'
            }, format='json')

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['checkout_url'], 'https://checkout.paystack.com/test')

        donation = Donation.objects.get(id=response.data['donation_id'])
        self.assertEqual(donation.amount, Decimal('19.99'))

        # Verify payload sent to Paystack had amount=1999 (minor units), not string repetition
        args, kwargs = mock_post.call_args
        sent_json = kwargs['json']
        self.assertEqual(sent_json['amount'], 1999)

    @patch('core.tasks.send_receipt_email.delay')
    def test_paystack_webhook_valid_signature_and_amount(self, mock_receipt_delay):
        donation = Donation.objects.create(
            amount=Decimal('50.00'),
            currency='USD',
            method='card',
            provider='paystack',
            provider_reference='REF_PAYSTACK_VALID_1',
            donor_email='donor@example.com',
            donor_name='Valid Donor',
            status='pending'
        )

        payload = {
            'event': 'charge.success',
            'data': {
                'reference': 'REF_PAYSTACK_VALID_1',
                'amount': 5000, # 50.00 USD in minor units
                'currency': 'USD'
            }
        }
        body_bytes = json.dumps(payload).encode('utf-8')
        signature = hmac.new(self.secret_key.encode('utf-8'), body_bytes, hashlib.sha512).hexdigest()

        with self.settings(PAYSTACK_SECRET_KEY=self.secret_key):
            response = self.client.post(
                '/api/webhooks/paystack/',
                data=body_bytes,
                content_type='application/json',
                HTTP_X_PAYSTACK_SIGNATURE=signature
            )

        self.assertEqual(response.status_code, 200)
        donation.refresh_from_db()
        self.assertEqual(donation.status, 'completed')

        self.campaign.refresh_from_db()
        self.assertEqual(self.campaign.raised_usd, Decimal('50.00'))

    def test_paystack_webhook_invalid_signature_rejected(self):
        payload = {'event': 'charge.success', 'data': {'reference': 'REF_1'}}
        body_bytes = json.dumps(payload).encode('utf-8')

        with self.settings(PAYSTACK_SECRET_KEY=self.secret_key):
            response = self.client.post(
                '/api/webhooks/paystack/',
                data=body_bytes,
                content_type='application/json',
                HTTP_X_PAYSTACK_SIGNATURE='invalid_signature'
            )

        self.assertEqual(response.status_code, 400)

    def test_paystack_webhook_underpaid_amount_rejected(self):
        donation = Donation.objects.create(
            amount=Decimal('100.00'),
            currency='USD',
            method='card',
            provider='paystack',
            provider_reference='REF_PAYSTACK_UNDERPAID',
            donor_email='donor@example.com',
            donor_name='Malicious Donor',
            status='pending'
        )

        payload = {
            'event': 'charge.success',
            'data': {
                'reference': 'REF_PAYSTACK_UNDERPAID',
                'amount': 100, # Paid only 1 USD (100 cents) instead of 100 USD (10000 cents)
                'currency': 'USD'
            }
        }
        body_bytes = json.dumps(payload).encode('utf-8')
        signature = hmac.new(self.secret_key.encode('utf-8'), body_bytes, hashlib.sha512).hexdigest()

        with self.settings(PAYSTACK_SECRET_KEY=self.secret_key):
            response = self.client.post(
                '/api/webhooks/paystack/',
                data=body_bytes,
                content_type='application/json',
                HTTP_X_PAYSTACK_SIGNATURE=signature
            )

        self.assertEqual(response.status_code, 400)
        donation.refresh_from_db()
        self.assertEqual(donation.status, 'failed')

        self.campaign.refresh_from_db()
        self.assertEqual(self.campaign.raised_usd, Decimal('0.00'))

    @patch('core.tasks.send_receipt_email.delay')
    def test_paystack_webhook_idempotency_duplicate_calls(self, mock_receipt_delay):
        donation = Donation.objects.create(
            amount=Decimal('25.00'),
            currency='USD',
            method='card',
            provider='paystack',
            provider_reference='REF_PAYSTACK_IDEMPOTENT',
            donor_email='donor@example.com',
            donor_name='Idempotent Donor',
            status='pending'
        )

        payload = {
            'event': 'charge.success',
            'data': {
                'reference': 'REF_PAYSTACK_IDEMPOTENT',
                'amount': 2500,
                'currency': 'USD'
            }
        }
        body_bytes = json.dumps(payload).encode('utf-8')
        signature = hmac.new(self.secret_key.encode('utf-8'), body_bytes, hashlib.sha512).hexdigest()

        # Send Webhook First Time
        with self.settings(PAYSTACK_SECRET_KEY=self.secret_key):
            res1 = self.client.post('/api/webhooks/paystack/', data=body_bytes, content_type='application/json', HTTP_X_PAYSTACK_SIGNATURE=signature)
            # Send Duplicate Webhook Second Time
            res2 = self.client.post('/api/webhooks/paystack/', data=body_bytes, content_type='application/json', HTTP_X_PAYSTACK_SIGNATURE=signature)

        self.assertEqual(res1.status_code, 200)
        self.assertEqual(res2.status_code, 200)

        donation.refresh_from_db()
        self.assertEqual(donation.status, 'completed')

        # Campaign should ONLY be incremented ONCE ($25.00), not twice ($50.00)
        self.campaign.refresh_from_db()
        self.assertEqual(self.campaign.raised_usd, Decimal('25.00'))

    @patch('core.views.requests.get')
    def test_get_donation_status_auto_verifies_pending_payment_with_paystack(self, mock_get):
        donation = Donation.objects.create(
            amount=Decimal('10.00'),
            currency='USD',
            method='mpesa',
            provider='paystack',
            provider_reference='UTG_AUTO_VERIFY_123',
            donor_email='mpesa_donor@example.com',
            donor_name='Mpesa Donor',
            status='pending'
        )

        mock_get.return_value.status_code = 200
        mock_get.return_value.json.return_value = {
            'status': True,
            'data': {
                'status': 'success',
                'reference': 'UTG_AUTO_VERIFY_123',
                'amount': 13000,
                'currency': 'KES'
            }
        }

        with self.settings(PAYSTACK_SECRET_KEY=self.secret_key):
            response = self.client.get(f'/api/donations/{donation.id}/status/')

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['status'], 'completed')

        donation.refresh_from_db()
        self.assertEqual(donation.status, 'completed')
        self.assertEqual(donation.currency, 'KES')

        self.campaign.refresh_from_db()
        self.assertEqual(self.campaign.raised_usd, Decimal('10.00'))
