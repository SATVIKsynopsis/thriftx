// Product utility functions

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

    // Color filter
    if (filters.colors.length > 0 &&
        !filters.colors.includes(product.color)) {
      return false;
    }

    // Size filter
    if (filters.sizes.length > 0 &&
        !filters.sizes.includes(product.size)) {
      return false;
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
