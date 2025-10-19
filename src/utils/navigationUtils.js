/**
 * Navigation utilities for tracking page referrers and smart back navigation
 */

// Store referrer information in sessionStorage
export const setReferrer = (path) => {
  try {
    sessionStorage.setItem('app_referrer', path);
  } catch (error) {
    console.warn('Failed to set referrer:', error);
  }
};

// Get referrer information from sessionStorage
export const getReferrer = () => {
  try {
    return sessionStorage.getItem('app_referrer');
  } catch (error) {
    console.warn('Failed to get referrer:', error);
    return null;
  }
};

// Clear referrer information
export const clearReferrer = () => {
  try {
    sessionStorage.removeItem('app_referrer');
  } catch (error) {
    console.warn('Failed to clear referrer:', error);
  }
};

// Get smart back path based on current context
export const getSmartBackPath = (currentPath, fallbackPath = '/') => {
  const referrer = getReferrer();

  // If no referrer stored, use fallback
  if (!referrer) {
    return fallbackPath;
  }

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

  return referrer || fallbackPath;
};

// Enhanced referrer tracking with better path detection
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

// Get current page path for navigation tracking
export const getCurrentPath = () => {
  if (typeof window !== 'undefined') {
    return window.location.pathname;
  }
  return '/';
};
