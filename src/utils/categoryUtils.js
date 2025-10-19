/**
 * Category utility functions and mappings
 */

/**
 * Mapping of URL category parameters to display names
 */
export const CATEGORY_DISPLAY_NAMES = {
  'womens-clothing': 'Women\'s Clothing',
  'mens-clothing': 'Men\'s Clothing',
  'dresses': 'Dresses',
  'shoes': 'Shoes',
  'bags-accessories': 'Bags & Accessories',
  'jewelry': 'Jewelry',
  'jackets-coats': 'Jackets & Coats',
  'vintage': 'Vintage',
  'designer': 'Designer',
  'tops-blouses': 'Tops & Blouses',
  'pants-jeans': 'Pants & Jeans',
  'skirts-shorts': 'Skirts & Shorts'
};

/**
 * Mapping of URL category parameters to search keywords
 * Used for filtering products by category
 */
export const CATEGORY_KEYWORDS = {
  'womens-clothing': ['women', 'female', 'women\'s', 'ladies'],
  'mens-clothing': ['men', 'male', 'men\'s', 'gentlemen'],
  'dresses': ['dress', 'gown', 'frock'],
  'shoes': ['shoes', 'footwear', 'boots', 'sandals', 'sneakers'],
  'bags-accessories': ['bag', 'accessory', 'purse', 'wallet', 'belt', 'scarf'],
  'jewelry': ['jewelry', 'jewellery', 'necklace', 'earrings', 'bracelet', 'ring'],
  'jackets-coats': ['jacket', 'coat', 'blazer', 'overcoat'],
  'vintage': ['vintage', 'retro', 'classic', 'antique'],
  'designer': ['designer', 'branded', 'luxury'],
  'tops-blouses': ['top', 'blouse', 'shirt', 't-shirt', 'tee'],
  'pants-jeans': ['pants', 'trousers', 'jeans', 'leggings'],
  'skirts-shorts': ['skirt', 'shorts', 'culottes']
};

/**
 * Get display name for a category
 * @param {string} category - The category URL parameter
 * @returns {string} - The display name or formatted category name
 */
export const getCategoryDisplayName = (category) => {
  if (!category) return 'Products';

  return CATEGORY_DISPLAY_NAMES[category] ||
         category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
};

/**
 * Get search keywords for a category
 * @param {string} category - The category URL parameter
 * @returns {string[]} - Array of keywords to search for
 */
export const getCategoryKeywords = (category) => {
  if (!category) return [];

  return CATEGORY_KEYWORDS[category] || [category.replace('-', ' ')];
};

/**
 * Check if a product matches a category
 * @param {Object} product - The product object
 * @param {string} category - The category URL parameter
 * @returns {boolean} - Whether the product matches the category
 */
export const productMatchesCategory = (product, category) => {
  if (!product || !category) return false;

  const keywords = getCategoryKeywords(category);
  const productCategory = (product.category || '').toLowerCase();
  const productName = (product.name || '').toLowerCase();

  return keywords.some(keyword =>
    productCategory.includes(keyword) || productName.includes(keyword)
  );
};
