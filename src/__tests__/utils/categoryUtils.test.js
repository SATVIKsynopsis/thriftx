import {
  getCategoryDisplayName,
  getCategoryKeywords,
  productMatchesCategory,
  CATEGORY_DISPLAY_NAMES
} from '../../utils/categoryUtils';

const mockProduct = {
  name: 'Red Dress',
  category: 'dresses',
  description: 'Beautiful red dress'
};

describe('getCategoryDisplayName', () => {
  it('returns "Products" for empty category', () => {
    expect(getCategoryDisplayName('')).toBe('Products');
    expect(getCategoryDisplayName(null)).toBe('Products');
    expect(getCategoryDisplayName(undefined)).toBe('Products');
  });

  it('returns display name for known categories', () => {
    expect(getCategoryDisplayName('womens-clothing')).toBe('Women\'s Clothing');
    expect(getCategoryDisplayName('mens-clothing')).toBe('Men\'s Clothing');
    expect(getCategoryDisplayName('jackets-coats')).toBe('Jackets & Coats');
  });

  it('formats unknown categories properly', () => {
    expect(getCategoryDisplayName('custom-category')).toBe('Custom Category');
    expect(getCategoryDisplayName('another-example')).toBe('Another Example');
  });
});

describe('getCategoryKeywords', () => {
  it('returns empty array for empty category', () => {
    expect(getCategoryKeywords('')).toEqual([]);
    expect(getCategoryKeywords(null)).toEqual([]);
    expect(getCategoryKeywords(undefined)).toEqual([]);
  });

  it('returns keywords for known categories', () => {
    expect(getCategoryKeywords('dresses')).toEqual(['dress', 'gown', 'frock']);
    expect(getCategoryKeywords('shoes')).toEqual(['shoes', 'footwear', 'boots', 'sandals', 'sneakers']);
  });

  it('returns formatted category name for unknown categories', () => {
    expect(getCategoryKeywords('custom-category')).toEqual(['custom category']);
  });
});

describe('productMatchesCategory', () => {
  it('returns false for invalid inputs', () => {
    expect(productMatchesCategory(null, 'dresses')).toBe(false);
    expect(productMatchesCategory(mockProduct, null)).toBe(false);
    expect(productMatchesCategory({}, '')).toBe(false);
  });

  it('matches product category against keywords', () => {
    expect(productMatchesCategory(mockProduct, 'dresses')).toBe(true);
    expect(productMatchesCategory({ name: 'Red Shirt', category: 'apparel' }, 'dresses')).toBe(false);
  });

  it('matches product name against keywords', () => {
    expect(productMatchesCategory(mockProduct, 'dresses')).toBe(true);
    expect(productMatchesCategory({ name: 'Red Dress', category: 'other' }, 'dresses')).toBe(true);
  });

  it('is case insensitive', () => {
    expect(productMatchesCategory({ name: 'RED DRESS', category: 'DRESSES' }, 'dresses')).toBe(true);
  });

  it('handles products without category field', () => {
    expect(productMatchesCategory({ name: 'Red Dress' }, 'dresses')).toBe(true);
  });

  it('handles products without name field', () => {
    expect(productMatchesCategory({ category: 'dresses' }, 'dresses')).toBe(true);
  });
});

describe('CATEGORY_DISPLAY_NAMES constant', () => {
  it('contains expected mappings', () => {
    expect(CATEGORY_DISPLAY_NAMES['womens-clothing']).toBe('Women\'s Clothing');
    expect(CATEGORY_DISPLAY_NAMES['mens-clothing']).toBe('Men\'s Clothing');
    expect(CATEGORY_DISPLAY_NAMES['jackets-coats']).toBe('Jackets & Coats');
    expect(Object.keys(CATEGORY_DISPLAY_NAMES)).toHaveLength(12);
  });
});
