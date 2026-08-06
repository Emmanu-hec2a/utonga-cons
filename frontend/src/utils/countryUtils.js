const countryPrefixes = {
  '+256': 'UG',
  '+254': 'KE',
  '+255': 'TZ',
  '+250': 'RW',
  '+1': 'US',
  '+44': 'UK',
  '+27': 'ZA',
  '+971': 'AE',
  '+49': 'DE',
  '+33': 'FR',
  '+31': 'NL',
  '+86': 'CN',
  '+91': 'IN',
  '+1242': 'BS',
  '+1246': 'BB',
};

/**
 * Detects country ISO code from an E.164 formatted phone number.
 */
export const detectCountry = (phone) => {
  if (!phone) return '??';

  // Clean the number
  const cleanPhone = phone.trim();

  // Sort prefixes by length descending to match longest first (e.g. +1242 before +1)
  const sortedPrefixes = Object.keys(countryPrefixes).sort((a, b) => b.length - a.length);

  for (const prefix of sortedPrefixes) {
    if (cleanPhone.startsWith(prefix)) {
      return countryPrefixes[prefix];
    }
  }

  return '??';
};
