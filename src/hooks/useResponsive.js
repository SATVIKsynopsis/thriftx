import { useState, useEffect } from 'react';
import { RESPONSIVE_BREAKPOINTS } from '../utils/productDetailConstants';

/**
 * Custom hook for responsive design utilities
 */
export const useResponsive = () => {
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1024,
    height: typeof window !== 'undefined' ? window.innerHeight : 768,
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = windowSize.width < RESPONSIVE_BREAKPOINTS.mobile;
  const isTablet = windowSize.width >= RESPONSIVE_BREAKPOINTS.mobile && windowSize.width < RESPONSIVE_BREAKPOINTS.desktop;
  const isDesktop = windowSize.width >= RESPONSIVE_BREAKPOINTS.desktop;

  const getVisibleProducts = () => {
    if (isDesktop) return 4;
    if (isTablet) return 3;
    if (windowSize.width >= RESPONSIVE_BREAKPOINTS.mobile) return 2;
    return 1;
  };

  const getVisibleReviews = () => {
    if (isDesktop) return 3;
    if (isTablet) return 2;
    return 1;
  };

  return {
    windowSize,
    isMobile,
    isTablet,
    isDesktop,
    getVisibleProducts,
    getVisibleReviews,
  };
};
