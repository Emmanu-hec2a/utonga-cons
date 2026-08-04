from unittest.mock import patch

from django.test import SimpleTestCase

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
