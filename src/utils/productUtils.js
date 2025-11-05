/**
 * Product utility functions
 */

/**
 * Normalize array-like data to ensure it's always an array
 * @param {Array|string|undefined|null} data - Input data that might be string, array, or undefined
 * @returns {Array} Normalized array
 */
export const normalizeToArray = (data) => {
  if (Array.isArray(data)) return data;
  if (typeof data === 'string') {
    return data.split(',').map(item => item.trim()).filter(item => item.length > 0);
  }
  return [];
};

/**
 * Parse price from various formats to number
 * @param {string|number} priceString - Price in string or number format
 * @returns {number} Parsed price as number
 */
export const parsePrice = (priceString) => {
  // Handle both string and number formats
  if (typeof priceString === 'number') return priceString;
  if (typeof priceString === 'string') {
    return parseInt(priceString.replace(/[₹,]/g, '')) || 0;
  }
  return 0;
};

/**
 * Sort products based on criteria
 * @param {Array} products - Array of product objects
 * @param {string} sortBy - Sort criteria
 * @returns {Array} Sorted products array
 */
export const getSortedProducts = (products, sortBy) => {
  const sorted = [...products];
  switch(sortBy) {
    case 'Price: Low to High':
      return sorted.sort((a, b) => parsePrice(a.price) - parsePrice(b.price));
    case 'Price: High to Low':
      return sorted.sort((a, b) => parsePrice(b.price) - parsePrice(a.price));
    case 'Newest':
      return sorted.sort((a, b) => b.id - a.id);
    case 'Most Popular':
      return sorted.sort((a, b) => (b.rating * b.reviews) - (a.rating * a.reviews));
    default:
      return sorted;
  }
};

/**
 * Filter products based on criteria
 * @param {Array} products - Array of product objects
 * @param {Object} filters - Filter criteria
 * @param {Array} priceRange - Price range [min, max]
 * @returns {Array} Filtered products array
 */
export const filterProducts = (products, filters, priceRange) => {
  return products.filter(product => {
    const productPrice = parsePrice(product.price);

    // Category filter
    if (filters.categories.length > 0 &&
        !filters.categories.includes(product.category)) {
      return false;
    }

    // Color filter - check if any product colors match selected filters
    if (filters.colors.length > 0) {
      const productColors = normalizeToArray(product.colors);
      const hasMatchingColor = filters.colors.some(filterColor =>
        productColors.some(productColor =>
          productColor.toLowerCase().trim() === filterColor.toLowerCase().trim()
        )
      );
      if (!hasMatchingColor) {
        return false;
      }
    }

    // Size filter - check if any product sizes match selected filters
    if (filters.sizes.length > 0) {
      const productSizes = normalizeToArray(product.sizes);
      const hasMatchingSize = filters.sizes.some(filterSize =>
        productSizes.some(productSize =>
          productSize.toLowerCase().trim() === filterSize.toLowerCase().trim()
        )
      );
      if (!hasMatchingSize) {
        return false;
      }
    }

    // Brand filter
    if (filters.brands.length > 0 &&
        !filters.brands.includes(product.brand)) {
      return false;
    }

    // Price range filter
    if (productPrice < priceRange[0] || productPrice > priceRange[1]) {
      return false;
    }

    return true;
  });
};

/**
 * Check if any filters are active
 * @param {Object} filters - Filter criteria
 * @param {Array} priceRange - Price range [min, max]
 * @param {Array} defaultPriceRange - Default price range for comparison
 * @returns {boolean} True if any filters are active
 */
export const hasActiveFilters = (filters, priceRange, defaultPriceRange) => {
  const isPriceFilterActive = priceRange[0] > defaultPriceRange[0] ||
                             priceRange[1] < defaultPriceRange[1];

  return filters.categories.length > 0 ||
         filters.colors.length > 0 ||
         filters.sizes.length > 0 ||
         filters.brands.length > 0 ||
         isPriceFilterActive;
};

/**
 * Extract unique categories from products array
 * @param {Array} products - Array of product objects
 * @returns {Array} Array of unique category values
 */
export const getUniqueCategories = (products) => {
  if (!Array.isArray(products)) return [];

  const categories = products
    .map(product => product.category)
    .filter(category => category && typeof category === 'string' && category.trim().length > 0);

  return [...new Set(categories)].sort();
};

/**
 * Extract unique brands from products array
 * @param {Array} products - Array of product objects
 * @returns {Array} Array of unique brand values
 */
export const getUniqueBrands = (products) => {
  if (!Array.isArray(products)) return [];

  const brands = products
    .map(product => product.brand)
    .filter(brand => brand && typeof brand === 'string' && brand.trim().length > 0);

  return [...new Set(brands)].sort();
};

/**
 * Extract unique sizes from products array
 * @param {Array} products - Array of product objects
 * @returns {Array} Array of unique size values
 */
export const getUniqueSizes = (products) => {
  if (!Array.isArray(products)) return [];

  const allSizes = products
    .flatMap(product => normalizeToArray(product.sizes))
    .filter(size => size && typeof size === 'string' && size.trim().length > 0);

  return [...new Set(allSizes)].sort();
};

/**
 * Extract unique colors from products array
 * @param {Array} products - Array of product objects
 * @returns {Array} Array of unique color names
 */
export const getUniqueColors = (products) => {
  if (!Array.isArray(products)) return [];

  const allColors = products
    .flatMap(product => normalizeToArray(product.colors))
    .filter(color => color && typeof color === 'string' && color.trim().length > 0);

  return [...new Set(allColors)].sort();
};

/**
 * Calculate active filter count for UI
 * @param {Object} filters - Filter criteria
 * @param {Array} priceRange - Price range [min, max]
 * @param {Array} defaultPriceRange - Default price range for comparison
 * @returns {number} Count of active filters
 */
export const getActiveFilterCount = (filters, priceRange, defaultPriceRange) => {
  let count = filters.categories.length +
              filters.colors.length +
              filters.sizes.length +
              filters.brands.length;

  const isPriceFilterActive = priceRange[0] > defaultPriceRange[0] ||
                             priceRange[1] < defaultPriceRange[1];

  if (isPriceFilterActive) {
    count++;
  }

  return count;
};
