import { useState, useEffect } from 'react';
import { CAROUSEL_SETTINGS } from '../utils/productDetailConstants';

/**
 * Custom hook for carousel functionality with touch support
 */
export const useCarousel = (totalItems, visibleItems) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStartX, setTouchStartX] = useState(0);
  const [touchEndX, setTouchEndX] = useState(0);
  const [isSwipeInProgress, setIsSwipeInProgress] = useState(false);

  const maxIndex = Math.max(totalItems - visibleItems, 0);

  useEffect(() => {
    setCurrentIndex(prev => Math.min(prev, maxIndex));
  }, [maxIndex]);

  const goToPrev = () => {
    setCurrentIndex(prev => Math.max(0, prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex(prev => Math.min(maxIndex, prev + 1));
  };

  const goToIndex = (index) => {
    const targetIndex = Math.max(0, Math.min(maxIndex, index));
    setCurrentIndex(targetIndex);
  };

  const handleTouchStart = (e) => {
    e.preventDefault();
    setTouchEndX(0);
    setTouchStartX(e.targetTouches[0].clientX);
    setIsSwipeInProgress(true);
  };

  const handleTouchMove = (e) => {
    if (!isSwipeInProgress) return;
    e.preventDefault();
    setTouchEndX(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = (e) => {
    if (!isSwipeInProgress) return;
    e.preventDefault();

    if (!touchStartX || !touchEndX) {
      setIsSwipeInProgress(false);
      return;
    }

    const distance = touchStartX - touchEndX;
    const absDistance = Math.abs(distance);

    if (absDistance > CAROUSEL_SETTINGS.minSwipeDistance) {
      const isLeftSwipe = distance > 0;
      const isRightSwipe = distance < 0;

      if (isLeftSwipe && currentIndex < maxIndex) {
        goToNext();
      } else if (isRightSwipe && currentIndex > 0) {
        goToPrev();
      }
    }

    setTouchStartX(0);
    setTouchEndX(0);
    setIsSwipeInProgress(false);
  };

  const getTotalPages = () => {
    return Math.ceil(totalItems / visibleItems);
  };

  const getCurrentPage = () => {
    return Math.floor(currentIndex / visibleItems) + 1;
  };

  return {
    currentIndex,
    maxIndex,
    goToPrev,
    goToNext,
    goToIndex,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    getTotalPages,
    getCurrentPage,
    canGoPrev: currentIndex > 0,
    canGoNext: currentIndex < maxIndex,
  };
};
