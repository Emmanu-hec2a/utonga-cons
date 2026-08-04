import os
from typing import Iterable, Optional, Tuple

import requests
from django.conf import settings


def send_resend_email(recipients: Iterable[str], subject: str, html_content: str, text_content: str, *, from_email: Optional[str] = None) -> Tuple[bool, dict]:
    api_key = getattr(settings, 'RESEND_API_KEY', None) or os.environ.get('RESEND_API_KEY')
    if not api_key:
        return False, {'error': 'RESEND_API_KEY not configured'}

    sender = from_email or getattr(settings, 'RESEND_FROM_EMAIL', None) or os.environ.get('RESEND_FROM_EMAIL') or 'onboarding@resend.dev'
    payload = {
        'from': sender,
        'to': list(recipients),
        'subject': subject,
        'html': html_content,
        'text': text_content,
    }

    response = requests.post(
        'https://api.resend.com/emails',
        headers={
            'Authorization': f'Bearer {api_key}',
            'Content-Type': 'application/json',
        },
        json=payload,
        timeout=10,
    )

    response.raise_for_status()
    return True, response.json()
