import requests
from django.core.cache import cache
from django.conf import settings

# Comprehensive Mapping of African and Global Mobile Money Prefix -> Currency
# This allows the engine to be truly borderless.
COUNTRY_PREFIX_MAP = {
    '254': 'KES', # Kenya
    '256': 'UGX', # Uganda
    '255': 'TZS', # Tanzania
    '250': 'RWF', # Rwanda
    '233': 'GHS', # Ghana
    '234': 'NGN', # Nigeria
    '260': 'ZMW', # Zambia
    '263': 'ZWL', # Zimbabwe
    '225': 'XOF', # Cote d'Ivoire
    '221': 'XOF', # Senegal
    '237': 'XAF', # Cameroon
    '27':  'ZAR', # South Africa
}

# Currencies that do NOT use minor units (cents) in Paystack API
ZERO_DECIMAL_CURRENCIES = ['UGX', 'RWF', 'GNF', 'XAF', 'XOF', 'BIF', 'CLP', 'DJF', 'JPY', 'KMF', 'KRW', 'MGA', 'PYG', 'VUV', 'XPF']

class CurrencyService:
    @staticmethod
    def get_rate(to_currency):
        """Fetch live rate for 1 USD to to_currency with caching."""
        if to_currency == 'USD':
            return 1.0

        cache_key = f"fx_rate_usd_{to_currency}"
        cached_rate = cache.get(cache_key)
        if cached_rate:
            return cached_rate

        try:
            # Using ExchangeRate-API (Free tier)
            api_url = f"https://open.er-api.com/v6/latest/USD"
            response = requests.get(api_url, timeout=5)
            data = response.json()
            
            if data.get('result') == 'success':
                rate = data['rates'].get(to_currency)
                if rate:
                    # Cache for 1 hour to ensure stability during the user session
                    cache.set(cache_key, rate, 3600)
                    return rate
        except Exception as e:
            print(f"Currency API Error: {e}")
            
        # Hardcoded Fallbacks for high-stability
        fallbacks = {
            'KES': 130.0,
            'UGX': 3700.0,
            'GHS': 15.0,
            'NGN': 1500.0,
            'ZMW': 26.0
        }
        return fallbacks.get(to_currency, 1.0)

    @staticmethod
    def resolve_currency_by_prefix(phone_number):
        """
        Universal Resolver: Detects local currency from any phone prefix.
        Returns 'USD' if no specific mobile money match is found.
        """
        # Remove all non-numeric characters
        clean_phone = ''.join(filter(str.isdigit, str(phone_number)))
        
        # Check longest prefixes first (e.g., 254 before 2)
        sorted_prefixes = sorted(COUNTRY_PREFIX_MAP.keys(), key=len, reverse=True)
        
        for prefix in sorted_prefixes:
            if clean_phone.startswith(prefix):
                return COUNTRY_PREFIX_MAP[prefix]
        
        return 'USD'

    @classmethod
    def convert_to_local(cls, amount_usd, phone_number):
        """
        Calculates the localized Paystack amount with a 2.5% safety buffer.
        """
        currency = cls.resolve_currency_by_prefix(phone_number)
        
        # If the number is international (non-MM country), we stay in USD
        if currency == 'USD':
            return {
                'amount': int(amount_usd * 100),
                'currency': 'USD',
                'rate': 1.0,
                'buffered_rate': 1.0
            }

        rate = cls.get_rate(currency)
        
        # 2.5% buffer to cover market volatility and Paystack's cross-currency fees
        buffered_rate = rate * 1.025
        local_amount = amount_usd * buffered_rate
        
        # Handle zero-decimal currencies (like UGX) vs standard (like KES)
        if currency in ZERO_DECIMAL_CURRENCIES:
            paystack_amount = int(local_amount)
        else:
            paystack_amount = int(local_amount * 100)
            
        return {
            'amount': paystack_amount,
            'currency': currency,
            'rate': rate,
            'buffered_rate': buffered_rate
        }
