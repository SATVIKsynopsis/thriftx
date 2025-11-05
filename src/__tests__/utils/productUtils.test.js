import {
  normalizeToArray,
  parsePrice,
  getSortedProducts,
  filterProducts,
  hasActiveFilters,
  getActiveFilterCount,
  getUniqueCategories,
  getUniqueBrands,
  getUniqueSizes,
  getUniqueColors
} from '../../utils/productUtils';

const mockProducts = [
  {
    id: 1,
    name: 'Product A',
    price: '₹1000',
    category: 'electronics',
    colors: ['red', 'blue'],
    sizes: ['M', 'L'],
    brand: 'Brand A',
    rating: 4.5,
    reviews: 20
  },
  {
    id: 2,
    name: 'Product B',
    price: 2000,
    category: 'clothing',
    colors: 'red,green',
    sizes: ['S'],
    brand: 'Brand B',
    rating: 3.8,
    reviews: 15
  },
  {
    id: 3,
    name: 'Product C',
    price: '₹500',
    category: 'electronics',
    colors: ['blue'],
    sizes: 'L,XL',
    brand: 'Brand A',
    rating: 4.2,
    reviews: 30
  }
];

describe('normalizeToArray', () => {
  it('returns array as-is if already an array', () => {
    expect(normalizeToArray(['red', 'blue'])).toEqual(['red', 'blue']);
    expect(normalizeToArray([])).toEqual([]);
  });

  it('converts comma-separated string to trimmed array', () => {
    expect(normalizeToArray('red, blue, green')).toEqual(['red', 'blue', 'green']);
    expect(normalizeToArray(' red , blue , green ')).toEqual(['red', 'blue', 'green']);
  });

  it('filters out empty items after trimming', () => {
    expect(normalizeToArray('red,,blue,')).toEqual(['red', 'blue']);
  });

  it('returns empty array for invalid inputs', () => {
    expect(normalizeToArray(null)).toEqual([]);
    expect(normalizeToArray(undefined)).toEqual([]);
    expect(normalizeToArray(123)).toEqual([]);
  });
});

describe('parsePrice', () => {
  it('returns number as-is if already a number', () => {
    expect(parsePrice(1000)).toBe(1000);
    expect(parsePrice(0)).toBe(0);
  });

  it('parses string price by removing currency symbols and commas', () => {
    expect(parsePrice('₹1,000')).toBe(1000);
    expect(parsePrice('₹100')).toBe(100);
    expect(parsePrice('2000')).toBe(2000);
  });

  it('returns 0 for invalid inputs', () => {
    expect(parsePrice(null)).toBe(0);
    expect(parsePrice(undefined)).toBe(0);
    expect(parsePrice('')).toBe(0);
    expect(parsePrice('invalid')).toBe(0);
  });
});

describe('getSortedProducts', () => {
  const products = [...mockProducts];

  it('returns products sorted by price low to high', () => {
    const sorted = getSortedProducts(products, 'Price: Low to High');
    expect(sorted[0].id).toBe(3); // ₹500
    expect(sorted[1].id).toBe(1); // ₹1000
    expect(sorted[2].id).toBe(2); // 2000
  });

  it('returns products sorted by price high to low', () => {
    const sorted = getSortedProducts(products, 'Price: High to Low');
    expect(sorted[0].id).toBe(2); // 2000
    expect(sorted[1].id).toBe(1); // ₹1000
    expect(sorted[2].id).toBe(3); // ₹500
  });

  it('returns products sorted by newest', () => {
    const sorted = getSortedProducts(products, 'Newest');
    expect(sorted[0].id).toBe(3); // id=3
    expect(sorted[1].id).toBe(2); // id=2
    expect(sorted[2].id).toBe(1); // id=1
  });

  it('returns products sorted by popularity', () => {
    const sorted = getSortedProducts(products, 'Most Popular');
    expect(sorted[0].id).toBe(3); // rating 4.2 * reviews 30 = 126
    expect(sorted[1].id).toBe(1); // rating 4.5 * reviews 20 = 90
    expect(sorted[2].id).toBe(2); // rating 3.8 * reviews 15 = 57
  });

  it('returns original array for unknown sort criteria', () => {
    const sorted = getSortedProducts(products, 'Unknown');
    expect(sorted).toEqual(products);
  });
});

describe('filterProducts', () => {
  it('filters products by category', () => {
    const filters = {
      categories: ['electronics'],
      colors: [],
      sizes: [],
      brands: []
    };
    const filtered = filterProducts(mockProducts, filters, [0, 10000]);
    expect(filtered).toHaveLength(2);
    expect(filtered.every(p => p.category === 'electronics')).toBe(true);
  });

  it('filters products by colors with string and array formats', () => {
    const filters = {
      categories: [],
      colors: ['red'],
      sizes: [],
      brands: []
    };
    const filtered = filterProducts(mockProducts, filters, [0, 10000]);
    expect(filtered).toHaveLength(2); // Product A (array) and Product B (string)
  });

  it('filters products by sizes', () => {
    const filters = {
      categories: [],
      colors: [],
      sizes: ['L'],
      brands: []
    };
    const filtered = filterProducts(mockProducts, filters, [0, 10000]);
    expect(filtered).toHaveLength(2); // Product A and Product C have L
  });

  it('filters products by brand', () => {
    const filters = {
      categories: [],
      colors: [],
      sizes: [],
      brands: ['Brand A']
    };
    const filtered = filterProducts(mockProducts, filters, [0, 10000]);
    expect(filtered).toHaveLength(2);
    expect(filtered.every(p => p.brand === 'Brand A')).toBe(true);
  });

  it('filters products by price range', () => {
    const filters = { categories: [], colors: [], sizes: [], brands: [] };
    const filtered = filterProducts(mockProducts, filters, [600, 1500]);
    expect(filtered).toHaveLength(1);
    expect(filtered[0].id).toBe(1); // ₹1000
  });

  it('applies multiple filters', () => {
    const filters = {
      categories: ['electronics'],
      colors: ['blue'],
      sizes: [],
      brands: []
    };
    const filtered = filterProducts(mockProducts, filters, [0, 10000]);
    expect(filtered).toHaveLength(2); // Product A and Product C (both electronics, both have blue)
  });

  it('returns all products when no filters applied', () => {
    const filters = { categories: [], colors: [], sizes: [], brands: [] };
    const filtered = filterProducts(mockProducts, filters, [0, 10000]);
    expect(filtered).toHaveLength(3);
  });
});

describe('hasActiveFilters', () => {
  const defaultPriceRange = [0, 5000];

  it('returns true when categories filter is active', () => {
    const filters = { categories: ['electronics'], colors: [], sizes: [], brands: [] };
    expect(hasActiveFilters(filters, [0, 5000], defaultPriceRange)).toBe(true);
  });

  it('returns true when colors filter is active', () => {
    const filters = { categories: [], colors: ['red'], sizes: [], brands: [] };
    expect(hasActiveFilters(filters, [0, 5000], defaultPriceRange)).toBe(true);
  });

  it('returns true when sizes filter is active', () => {
    const filters = { categories: [], colors: [], sizes: ['M'], brands: [] };
    expect(hasActiveFilters(filters, [0, 5000], defaultPriceRange)).toBe(true);
  });

  it('returns true when brands filter is active', () => {
    const filters = { categories: [], colors: [], sizes: [], brands: ['Brand A'] };
    expect(hasActiveFilters(filters, [0, 5000], defaultPriceRange)).toBe(true);
  });

  it('returns true when price range is different from default', () => {
    const filters = { categories: [], colors: [], sizes: [], brands: [] };
    expect(hasActiveFilters(filters, [100, 2000], defaultPriceRange)).toBe(true);
  });

  it('returns false when no filters are active', () => {
    const filters = { categories: [], colors: [], sizes: [], brands: [] };
    expect(hasActiveFilters(filters, [0, 5000], defaultPriceRange)).toBe(false);
  });
});

describe('getActiveFilterCount', () => {
  const defaultPriceRange = [0, 5000];

  it('counts each category filter', () => {
    const filters = { categories: ['electronics', 'clothing'], colors: [], sizes: [], brands: [] };
    expect(getActiveFilterCount(filters, [0, 5000], defaultPriceRange)).toBe(2);
  });

  it('counts multiple filter types', () => {
    const filters = {
      categories: ['electronics'],
      colors: ['red', 'blue'],
      sizes: ['M'],
      brands: ['Brand A']
    };
    expect(getActiveFilterCount(filters, [0, 5000], defaultPriceRange)).toBe(5);
  });

  it('includes price range changes in count', () => {
    const filters = { categories: [], colors: [], sizes: [], brands: [] };
    expect(getActiveFilterCount(filters, [100, 2000], defaultPriceRange)).toBe(1);
  });

  it('combines filter counts with price range', () => {
    const filters = { categories: ['electronics'], colors: [], sizes: [], brands: [] };
    expect(getActiveFilterCount(filters, [100, 2000], defaultPriceRange)).toBe(2);
  });

  it('returns 0 when no filters are active', () => {
    const filters = { categories: [], colors: [], sizes: [], brands: [] };
    expect(getActiveFilterCount(filters, [0, 5000], defaultPriceRange)).toBe(0);
  });
});

describe('getUniqueCategories', () => {
  it('returns empty array for empty or invalid input', () => {
    expect(getUniqueCategories([])).toEqual([]);
    expect(getUniqueCategories(null)).toEqual([]);
    expect(getUniqueCategories(undefined)).toEqual([]);
  });

  it('extracts unique categories from products', () => {
    const products = [
      { category: 'electronics' },
      { category: 'clothing' },
      { category: 'electronics' },
      { category: 'books' }
    ];
    expect(getUniqueCategories(products)).toEqual(['books', 'clothing', 'electronics']);
  });

  it('filters out invalid categories', () => {
    const products = [
      { category: 'electronics' },
      { category: null },
      { category: '' },
      { category: 'clothing' },
      { category: undefined },
      { category: '   ' }
    ];
    expect(getUniqueCategories(products)).toEqual(['clothing', 'electronics']);
  });

  it('handles products without category field', () => {
    const products = [
      { name: 'Product A' },
      { category: 'electronics' }
    ];
    expect(getUniqueCategories(products)).toEqual(['electronics']);
  });

  it('returns sorted unique categories', () => {
    const products = [
      { category: 'zebra' },
      { category: 'apple' },
      { category: 'banana' },
      { category: 'apple' }
    ];
    expect(getUniqueCategories(products)).toEqual(['apple', 'banana', 'zebra']);
  });
});

describe('getUniqueBrands', () => {
  it('returns empty array for empty or invalid input', () => {
    expect(getUniqueBrands([])).toEqual([]);
    expect(getUniqueBrands(null)).toEqual([]);
    expect(getUniqueBrands(undefined)).toEqual([]);
  });

  it('extracts unique brands from products', () => {
    const products = [
      { brand: 'Nike' },
      { brand: 'Adidas' },
      { brand: 'Nike' },
      { brand: 'Puma' }
    ];
    expect(getUniqueBrands(products)).toEqual(['Adidas', 'Nike', 'Puma']);
  });

  it('filters out invalid brands', () => {
    const products = [
      { brand: 'Nike' },
      { brand: null },
      { brand: '' },
      { brand: 'Adidas' },
      { brand: undefined },
      { brand: '   ' }
    ];
    expect(getUniqueBrands(products)).toEqual(['Adidas', 'Nike']);
  });

  it('handles products without brand field', () => {
    const products = [
      { name: 'Product A' },
      { brand: 'Nike' }
    ];
    expect(getUniqueBrands(products)).toEqual(['Nike']);
  });

  it('returns sorted unique brands', () => {
    const products = [
      { brand: 'Zara' },
      { brand: 'Apple' },
      { brand: 'Banana' },
      { brand: 'Apple' }
    ];
    expect(getUniqueBrands(products)).toEqual(['Apple', 'Banana', 'Zara']);
  });
});

describe('getUniqueSizes', () => {
  it('returns empty array for empty or invalid input', () => {
    expect(getUniqueSizes([])).toEqual([]);
    expect(getUniqueSizes(null)).toEqual([]);
    expect(getUniqueSizes(undefined)).toEqual([]);
  });

  it('extracts unique sizes from products', () => {
    const products = [
      { sizes: ['M', 'L'] },
      { sizes: ['S'] },
      { sizes: ['M', 'XL'] },
      { sizes: ['L'] }
    ];
    expect(getUniqueSizes(products)).toEqual(['L', 'M', 'S', 'XL']);
  });

  it('handles string sizes', () => {
    const products = [
      { sizes: 'M,L' },
      { sizes: ['S'] }
    ];
    expect(getUniqueSizes(products)).toEqual(['L', 'M', 'S']);
  });

  it('filters out invalid sizes', () => {
    const products = [
      { sizes: ['M', null, ''] },
      { sizes: ['S', undefined, '  '] }
    ];
    expect(getUniqueSizes(products)).toEqual(['M', 'S']);
  });

  it('handles products without sizes field', () => {
    const products = [
      { name: 'Product A' },
      { sizes: ['M'] }
    ];
    expect(getUniqueSizes(products)).toEqual(['M']);
  });

  it('returns sorted unique sizes', () => {
    const products = [
      { sizes: ['XL', 'S'] },
      { sizes: ['M', 'XXL'] }
    ];
    expect(getUniqueSizes(products)).toEqual(['M', 'S', 'XL', 'XXL']);
  });
});

describe('getUniqueColors', () => {
  it('returns empty array for empty or invalid input', () => {
    expect(getUniqueColors([])).toEqual([]);
    expect(getUniqueColors(null)).toEqual([]);
    expect(getUniqueColors(undefined)).toEqual([]);
  });

  it('extracts unique colors from products', () => {
    const products = [
      { colors: ['red', 'blue'] },
      { colors: ['green'] },
      { colors: ['red', 'yellow'] },
      { colors: ['blue'] }
    ];
    expect(getUniqueColors(products)).toEqual(['blue', 'green', 'red', 'yellow']);
  });

  it('handles string colors', () => {
    const products = [
      { colors: 'red,blue' },
      { colors: ['green'] }
    ];
    expect(getUniqueColors(products)).toEqual(['blue', 'green', 'red']);
  });

  it('filters out invalid colors', () => {
    const products = [
      { colors: ['red', null, ''] },
      { colors: ['blue', undefined, '  '] }
    ];
    expect(getUniqueColors(products)).toEqual(['blue', 'red']);
  });

  it('handles products without colors field', () => {
    const products = [
      { name: 'Product A' },
      { colors: ['red'] }
    ];
    expect(getUniqueColors(products)).toEqual(['red']);
  });

  it('returns sorted unique colors', () => {
    const products = [
      { colors: ['yellow', 'blue'] },
      { colors: ['red', 'green'] }
    ];
    expect(getUniqueColors(products)).toEqual(['blue', 'green', 'red', 'yellow']);
  });
});
