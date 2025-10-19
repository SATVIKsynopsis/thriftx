/**
 * Navigation Context Utilities
 * Provides consistent navigation context management across the application
 */

// Context types for different entry points
export const NAVIGATION_CONTEXTS = {
  TRENDING_FINDS: 'trending_finds',
  NEW_ARRIVALS: 'new_arrivals',
  BROWSE: 'browse',
  SEARCH: 'search',
  CATEGORY: 'category',
  WISHLIST: 'wishlist',
  HOME: 'home'
};

// Context display names for UI
export const CONTEXT_DISPLAY_NAMES = {
  [NAVIGATION_CONTEXTS.TRENDING_FINDS]: 'Trending Finds',
  [NAVIGATION_CONTEXTS.NEW_ARRIVALS]: 'New Arrivals',
  [NAVIGATION_CONTEXTS.BROWSE]: 'Browse All Products',
  [NAVIGATION_CONTEXTS.SEARCH]: 'Search Results',
  [NAVIGATION_CONTEXTS.CATEGORY]: 'Category',
  [NAVIGATION_CONTEXTS.WISHLIST]: 'Wishlist',
  [NAVIGATION_CONTEXTS.HOME]: 'Home'
};

/**
 * Set navigation context for current page
 * @param {string} context - The navigation context type
 * @param {string} customName - Optional custom display name
 */
export const setNavigationContext = (context, customName = null) => {
  try {
    const contextData = {
      type: context,
      displayName: customName || CONTEXT_DISPLAY_NAMES[context] || context,
      timestamp: Date.now(),
      url: window.location.pathname
    };

    // Primary storage method
    sessionStorage.setItem('navigation_context', JSON.stringify(contextData));

    // Backup storage method
    localStorage.setItem('thriftx_navigation_context', JSON.stringify(contextData));

    // Set referrer for smart back navigation
    setReferrer(window.location.pathname);

  } catch (error) {
    console.warn('Failed to set navigation context:', error);
  }
};

/**
 * Get current navigation context
 * @returns {Object|null} - Navigation context data or null
 */
export const getNavigationContext = () => {
  try {
    // Try primary storage first
    const contextData = sessionStorage.getItem('navigation_context');
    if (contextData) {
      return JSON.parse(contextData);
    }

    // Fallback to backup storage
    const backupContext = localStorage.getItem('thriftx_navigation_context');
    if (backupContext) {
      return JSON.parse(backupContext);
    }

    return null;
  } catch (error) {
    console.warn('Failed to get navigation context:', error);
    return null;
  }
};

/**
 * Clear navigation context
 */
export const clearNavigationContext = () => {
  try {
    sessionStorage.removeItem('navigation_context');
    localStorage.removeItem('thriftx_navigation_context');
  } catch (error) {
    console.warn('Failed to clear navigation context:', error);
  }
};

/**
 * Set referrer for smart back navigation
 * @param {string} path - The referrer path
 */
export const setReferrer = (path) => {
  try {
    sessionStorage.setItem('app_referrer', path);
  } catch (error) {
    console.warn('Failed to set referrer:', error);
  }
};

/**
 * Get referrer for smart back navigation
 * @returns {string|null} - Referrer path or null
 */
export const getReferrer = () => {
  try {
    return sessionStorage.getItem('app_referrer');
  } catch (error) {
    console.warn('Failed to get referrer:', error);
    return null;
  }
};

/**
 * Get smart back path based on current context
 * @param {string} currentPath - Current page path
 * @param {string} fallbackPath - Fallback path if no context found
 * @returns {string} - Smart back path
 */
export const getSmartBackPath = (currentPath, fallbackPath = '/') => {
  const context = getNavigationContext();
  const referrer = getReferrer();

  // If we have context, use it
  if (context && context.type !== NAVIGATION_CONTEXTS.HOME) {
    switch (context.type) {
      case NAVIGATION_CONTEXTS.TRENDING_FINDS:
        return '/';
      case NAVIGATION_CONTEXTS.NEW_ARRIVALS:
        return '/';
      case NAVIGATION_CONTEXTS.BROWSE:
        return '/browse';
      case NAVIGATION_CONTEXTS.SEARCH:
        return '/search';
      case NAVIGATION_CONTEXTS.CATEGORY:
        return '/category';
      case NAVIGATION_CONTEXTS.WISHLIST:
        return '/wishlist';
      default:
        return '/';
    }
  }

  // Fallback to referrer-based logic
  if (referrer) {
    // Don't go back to the same page or auth pages
    if (referrer === currentPath ||
        referrer.includes('/login') ||
        referrer.includes('/register') ||
        referrer.includes('/admin') ||
        referrer.includes('/seller')) {
      return fallbackPath;
    }

    // For product pages, prefer category or search pages
    if (currentPath.includes('/product/')) {
      if (referrer.includes('/category') || referrer.includes('/search')) {
        return referrer;
      }
      // If referrer is home page, go back to home
      if (referrer === '/') {
        return '/';
      }
    }

    return referrer;
  }

  return fallbackPath;
};

/**
 * Get breadcrumb data for current context
 * @returns {Object|null} - Breadcrumb data or null
 */
export const getBreadcrumbData = () => {
  const context = getNavigationContext();

  if (!context) {
    return null;
  }

  return {
    name: context.displayName,
    href: getContextHref(context.type),
    isActive: false
  };
};

/**
 * Get href for a context type
 * @param {string} contextType - The context type
 * @returns {string} - The href for the context
 */
export const getContextHref = (contextType) => {
  switch (contextType) {
    case NAVIGATION_CONTEXTS.TRENDING_FINDS:
      return '/';
    case NAVIGATION_CONTEXTS.NEW_ARRIVALS:
      return '/';
    case NAVIGATION_CONTEXTS.BROWSE:
      return '/browse';
    case NAVIGATION_CONTEXTS.SEARCH:
      return '/search';
    case NAVIGATION_CONTEXTS.CATEGORY:
      return '/category';
    case NAVIGATION_CONTEXTS.WISHLIST:
      return '/wishlist';
    default:
      return '/';
  }
};

/**
 * Track navigation from one page to another
 * @param {string} fromPath - Source path
 * @param {string} toPath - Destination path
 */
export const trackNavigation = (fromPath, toPath) => {
  // Only track internal navigation, not external or special pages
  if (fromPath &&
      !fromPath.includes('/login') &&
      !fromPath.includes('/register') &&
      !fromPath.includes('/admin') &&
      !fromPath.includes('/seller') &&
      fromPath !== toPath) {
    setReferrer(fromPath);
  }
};
