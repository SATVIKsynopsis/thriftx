import {
  formatPrice,
  formatDate,
  formatFileSize,
  truncateText,
  capitalizeFirst,
  generateSlug,
  validateEmail,
  validatePhone,
  getInitials,
  calculateDiscount,
  formatPhoneNumber
} from '../../utils/formatters';

describe('formatPrice', () => {
  it('formats valid numbers correctly using INR currency', () => {
    expect(formatPrice(1000)).toBe('₹1,000.00');
    expect(formatPrice(0)).toBe('₹0.00');
    expect(formatPrice(123.45)).toBe('₹123.45');
  });

  it('handles invalid inputs by returning default value', () => {
    expect(formatPrice('invalid')).toBe('₹0.00');
    expect(formatPrice(null)).toBe('₹0.00');
    expect(formatPrice(undefined)).toBe('₹0.00');
  });
});

describe('formatDate', () => {
  beforeAll(() => {
    // Mock Date for consistent testing
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2024-01-15T10:30:00Z'));
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  it('formats Date objects correctly', () => {
    const date = new Date('2024-01-15T10:30:00Z');
    expect(formatDate(date)).toBe('Jan 15, 2024, 04:00 PM');
  });

  it('formats Firebase timestamp objects', () => {
    const firebaseTimestamp = { toDate: () => new Date('2024-01-15T10:30:00Z') };
    expect(formatDate(firebaseTimestamp)).not.toBe('N/A');
  });

  it('returns N/A for invalid inputs', () => {
    expect(formatDate(null)).toBe('N/A');
    expect(formatDate(undefined)).toBe('N/A');
  });
});

describe('formatFileSize', () => {
  it('formats bytes correctly', () => {
    expect(formatFileSize(0)).toBe('0 Bytes');
    expect(formatFileSize(1023)).toBe('1023 Bytes');
    expect(formatFileSize(1024)).toBe('1 KB');
    expect(formatFileSize(1024 * 1024)).toBe('1 MB');
  });

  it('formats larger sizes correctly', () => {
    expect(formatFileSize(1024 * 1024 * 1024)).toBe('1 GB');
  });
});

describe('truncateText', () => {
  it('returns full text if under max length', () => {
    expect(truncateText('Short text', 100)).toBe('Short text');
  });

  it('truncates and adds ellipsis if over max length', () => {
    expect(truncateText('This is a very long text that should be truncated', 20))
      .toBe('This is a very long...');
    expect(truncateText('Long text that exceeds maximum length', 10))
      .toBe('Long text...');
  });

  it('handles edge cases', () => {
    expect(truncateText('', 10)).toBe('');
    expect(truncateText(null)).toBe('');
    expect(truncateText(undefined)).toBe('');
  });
});

describe('capitalizeFirst', () => {
  it('capitalizes first letter correctly', () => {
    expect(capitalizeFirst('hello')).toBe('Hello');
    expect(capitalizeFirst('world')).toBe('World');
  });

  it('handles edge cases', () => {
    expect(capitalizeFirst('')).toBe('');
    expect(capitalizeFirst(null)).toBe('');
    expect(capitalizeFirst('A')).toBe('A');
  });
});

describe('generateSlug', () => {
  it('generates URL-friendly slugs', () => {
    expect(generateSlug('Hello World')).toBe('hello-world');
    expect(generateSlug('Special Characters! @#$%')).toBe('special-characters-');
    expect(generateSlug('Multiple   Spaces')).toBe('multiple-spaces');
  });

  it('handles empty and invalid inputs', () => {
    expect(generateSlug('')).toBe('');
  });
});

describe('validateEmail', () => {
  it('validates correct email formats', () => {
    expect(validateEmail('test@example.com')).toBe(true);
    expect(validateEmail('user.name@domain.co.uk')).toBe(true);
  });

  it('rejects invalid email formats', () => {
    expect(validateEmail('invalid')).toBe(false);
    expect(validateEmail('test@')).toBe(false);
    expect(validateEmail('@example.com')).toBe(false);
    expect(validateEmail('')).toBe(false);
  });
});

describe('validatePhone', () => {
  it('validates correct phone formats', () => {
    expect(validatePhone('+1234567890')).toBe(true);
    expect(validatePhone('123-456-7890')).toBe(true);
    expect(validatePhone('(123) 456-7890')).toBe(true);
  });

  it('rejects invalid phone formats', () => {
    expect(validatePhone('invalid')).toBe(false);
    expect(validatePhone('')).toBe(false);
  });
});

describe('getInitials', () => {
  it('extracts initials from names', () => {
    expect(getInitials('John Doe')).toBe('JD');
    expect(getInitials('Jane')).toBe('J');
    expect(getInitials('A B C')).toBe('AB');
  });

  it('returns U for empty inputs', () => {
    expect(getInitials('')).toBe('U');
    expect(getInitials(null)).toBe('U');
  });

  it('limits to 2 characters', () => {
    expect(getInitials('First Second Third Fourth')).toBe('FS');
  });
});

describe('calculateDiscount', () => {
  it('calculates discount percentage correctly', () => {
    expect(calculateDiscount(200, 150)).toBe(25);
    expect(calculateDiscount(1000, 800)).toBe(20);
    expect(calculateDiscount(100, 99)).toBe(Math.round(1));
  });

  it('returns 0 for invalid cases', () => {
    expect(calculateDiscount(100, 100)).toBe(0);
    expect(calculateDiscount(100, 150)).toBe(0);
    expect(calculateDiscount(null, 100)).toBe(0);
    expect(calculateDiscount(100, null)).toBe(0);
  });
});

describe('formatPhoneNumber', () => {
  it('formats 10-digit phone numbers correctly', () => {
    expect(formatPhoneNumber('1234567890')).toBe('(123) 456-7890');
  });

  it('returns unformatted string for invalid inputs', () => {
    expect(formatPhoneNumber('123')).toBe('123');
    expect(formatPhoneNumber('')).toBe('');
    expect(formatPhoneNumber(null)).toBe('');
  });
});
