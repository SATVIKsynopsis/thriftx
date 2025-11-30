import { searchProducts } from '../../utils/fuzzySearch';

// Mock fetch global for Firebase
global.fetch = jest.fn();

// Mock Firebase
jest.mock('../../firebase/config', () => ({
  db: {}
}));

// Note: levenshteinDistance and fuzzyMatch are internal functions but can be imported if needed

const mockProducts = [
  {
    id: 1,
    name: 'iPhone 15 Pro',
    description: 'Latest iPhone with advanced camera',
    category: 'electronics',
    brand: 'Apple',
    tags: ['smartphone', 'mobile']
  },
  {
    id: 2,
    name: 'Samsung Galaxy S24',
    description: 'Android smartphone with great features',
    category: 'electronics',
    brand: 'Samsung',
    tags: []
  },
  {
    id: 3,
    name: 'Nike Air Max Shoes',
    description: 'Comfortable running shoes',
    category: 'footwear',
    brand: 'Nike',
    tags: ['shoes', 'running']
  }
];

describe('searchProducts', () => {
  it('returns all products with max score when search term is empty', () => {
    const results = searchProducts(mockProducts, '');
    expect(results).toHaveLength(3);
    results.forEach(product => {
      expect(product.searchScore).toBe(100);
    });
  });

  it('returns all products with max score when search term is whitespace only', () => {
    const results = searchProducts(mockProducts, '   ');
    expect(results).toHaveLength(3);
    results.forEach(product => {
      expect(product.searchScore).toBe(100);
    });
  });

  it('filters and ranks products by name match with exact match', () => {
    const results = searchProducts(mockProducts, 'iPhone 15 Pro');
    expect(results).toHaveLength(1);
    expect(results[0].id).toBe(1);
    expect(results[0].searchScore).toBe(50); // Name match = 100 * 0.5
  });

  it('ranks products with name containing search term higher', () => {
    const results = searchProducts(mockProducts, 'iPhone');
    expect(results).toHaveLength(2); // iPhone 15 Pro + Samsung Galaxy S24 (contains "phone")
    expect(results[0].id).toBe(1); // iPhone should be first
    expect(results[0].searchScore).toBeGreaterThan(results[1].searchScore);
  });

  it('finds products by brand', () => {
    const results = searchProducts(mockProducts, 'Apple');
    expect(results).toHaveLength(1);
    expect(results[0].id).toBe(1);
    expect(results[0].searchScore).toBeLessThan(50); // Brand match = score * 0.05
  });

  it('finds products by category', () => {
    const results = searchProducts(mockProducts, 'electronics');
    expect(results).toHaveLength(2);
    expect(results[0].id).toBe(1);
    expect(results[1].id).toBe(2);
  });

  it('finds products by tags and description', () => {
    const results = searchProducts(mockProducts, 'smartphone');
    expect(results).toHaveLength(2); // Product with tag + Samsung with smartphone in description
    expect(results.some(r => r.id === 1)).toBe(true); // iPhone should be in results (tag match)
    expect(results.some(r => r.id === 2)).toBe(true); // Samsung should be in results (description match)
  });

  it('finds products by description', () => {
    const results = searchProducts(mockProducts, 'camera');
    expect(results).toHaveLength(1);
    expect(results[0].id).toBe(1);
    expect(results[0].searchScore).toBeGreaterThan(20); // Description match = score * 0.3
  });

  it('ranks name matches higher than description matches', () => {
    // This tests ranking: name (50%) vs description (30%)
    const results = searchProducts(mockProducts, 'phone');
    expect(results[0].searchScore).toBeGreaterThan(results[1].searchScore);
  });

  it('returns empty array when no products match', () => {
    const results = searchProducts(mockProducts, 'nonexistentproduct');
    expect(results).toHaveLength(0);
  });

  it('handles fuzzy matching for typos', () => {
    const results = searchProducts(mockProducts, 'iphon'); // Typo in "iphone"
    expect(results).toHaveLength(1);
    expect(results[0].id).toBe(1);
  });

  it('sorts results by relevance score', () => {
    const results = searchProducts(mockProducts, 'phone');
    for (let i = 0; i < results.length - 1; i++) {
      expect(results[i].searchScore).toBeGreaterThanOrEqual(results[i + 1].searchScore);
    }
  });

  it('includes searchScore and matches properties in results', () => {
    const results = searchProducts(mockProducts, 'Apple');
    expect(results[0]).toHaveProperty('searchScore');
    expect(results[0]).toHaveProperty('matches');
    expect(results[0].matches).toBe(true);
  });
});
