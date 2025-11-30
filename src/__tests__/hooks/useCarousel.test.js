import { renderHook, act } from '@testing-library/react';
import { useCarousel } from '../../hooks/useCarousel';
import { CAROUSEL_SETTINGS } from '../../utils/productDetailConstants';

// Mock the constants
jest.mock('../../utils/productDetailConstants', () => ({
  CAROUSEL_SETTINGS: {
    minSwipeDistance: 50
  }
}));

describe('useCarousel', () => {
  const totalItems = 10;
  const visibleItems = 5;

  it('initializes with correct state', () => {
    const { result } = renderHook(() => useCarousel(totalItems, visibleItems));

    expect(result.current.currentIndex).toBe(0);
    expect(result.current.maxIndex).toBe(5); // totalItems - visibleItems
    expect(result.current.canGoPrev).toBe(false);
    expect(result.current.canGoNext).toBe(true);
  });

  it('calculates maxIndex correctly', () => {
    const { result } = renderHook(() => useCarousel(8, 3));
    expect(result.current.maxIndex).toBe(5); // 8 - 3
  });

  it('handles case where totalItems <= visibleItems', () => {
    const { result } = renderHook(() => useCarousel(3, 5));
    expect(result.current.maxIndex).toBe(0);
    expect(result.current.canGoNext).toBe(false);
  });

  describe('goToPrev', () => {
    it('decreases currentIndex by 1', () => {
      const { result } = renderHook(() => useCarousel(totalItems, visibleItems));

      act(() => {
        result.current.goToIndex(3);
      });

      expect(result.current.currentIndex).toBe(3);

      act(() => {
        result.current.goToPrev();
      });

      expect(result.current.currentIndex).toBe(2);
    });

    it('does not go below 0', () => {
      const { result } = renderHook(() => useCarousel(totalItems, visibleItems));

      act(() => {
        result.current.goToIndex(0);
      });

      act(() => {
        result.current.goToPrev();
      });

      expect(result.current.currentIndex).toBe(0);
    });
  });

  describe('goToNext', () => {
    it('increases currentIndex by 1', () => {
      const { result } = renderHook(() => useCarousel(totalItems, visibleItems));

      expect(result.current.currentIndex).toBe(0);

      act(() => {
        result.current.goToNext();
      });

      expect(result.current.currentIndex).toBe(1);
    });

    it('does not exceed maxIndex', () => {
      const { result } = renderHook(() => useCarousel(totalItems, visibleItems));

      act(() => {
        result.current.goToIndex(result.current.maxIndex);
      });

      act(() => {
        result.current.goToNext();
      });

      expect(result.current.currentIndex).toBe(result.current.maxIndex);
    });
  });

  describe('goToIndex', () => {
    it('sets currentIndex to valid index', () => {
      const { result } = renderHook(() => useCarousel(totalItems, visibleItems));

      act(() => {
        result.current.goToIndex(3);
      });

      expect(result.current.currentIndex).toBe(3);
    });

    it('clamps to valid range (min)', () => {
      const { result } = renderHook(() => useCarousel(totalItems, visibleItems));

      act(() => {
        result.current.goToIndex(-5);
      });

      expect(result.current.currentIndex).toBe(0);
    });

    it('clamps to valid range (max)', () => {
      const { result } = renderHook(() => useCarousel(totalItems, visibleItems));

      act(() => {
        result.current.goToIndex(10);
      });

      expect(result.current.currentIndex).toBe(result.current.maxIndex);
    });
  });

  describe('canGoPrev and canGoNext', () => {
    it('correctly indicates navigation availability at start', () => {
      const { result } = renderHook(() => useCarousel(totalItems, visibleItems));

      expect(result.current.canGoPrev).toBe(false);
      expect(result.current.canGoNext).toBe(true);
    });

    it('correctly indicates navigation availability in middle', () => {
      const { result } = renderHook(() => useCarousel(totalItems, visibleItems));

      act(() => {
        result.current.goToIndex(2);
      });

      expect(result.current.canGoPrev).toBe(true);
      expect(result.current.canGoNext).toBe(true);
    });

    it('correctly indicates navigation availability at end', () => {
      const { result } = renderHook(() => useCarousel(totalItems, visibleItems));

      act(() => {
        result.current.goToIndex(result.current.maxIndex);
      });

      expect(result.current.canGoPrev).toBe(true);
      expect(result.current.canGoNext).toBe(false);
    });
  });

  describe('getTotalPages', () => {
    it('calculates total pages correctly', () => {
      const { result } = renderHook(() => useCarousel(12, 3));
      expect(result.current.getTotalPages()).toBe(4); // ceil(12/3)

      const { result: result2 } = renderHook(() => useCarousel(10, 3));
      expect(result2.current.getTotalPages()).toBe(4); // ceil(10/3)

      const { result: result3 } = renderHook(() => useCarousel(9, 3));
      expect(result3.current.getTotalPages()).toBe(3); // ceil(9/3)
    });
  });

  describe('getCurrentPage', () => {
    it('calculates current page correctly', () => {
      const { result } = renderHook(() => useCarousel(12, 3));

      // Page 1: indices 0-2
      expect(result.current.getCurrentPage()).toBe(1);

      // Page 2: indices 3-5
      act(() => result.current.goToIndex(3));
      expect(result.current.getCurrentPage()).toBe(2);

      // Page 3: indices 6-8
      act(() => result.current.goToIndex(6));
      expect(result.current.getCurrentPage()).toBe(3);

      // Page 4: indices 9-11
      act(() => result.current.goToIndex(9));
      expect(result.current.getCurrentPage()).toBe(4);
    });
  });

  describe('touch gesture handling', () => {
    let mockEvent;

    beforeEach(() => {
      mockEvent = { preventDefault: jest.fn() };
    });

    it('handles touch start with preventDefault', () => {
      const { result } = renderHook(() => useCarousel(totalItems, visibleItems));

      const touchStartEvent = {
        ...mockEvent,
        targetTouches: [{ clientX: 100 }]
      };

      act(() => {
        result.current.handleTouchStart(touchStartEvent);
      });

      expect(mockEvent.preventDefault).toHaveBeenCalled();
    });

    it('does not change index for small swipes', () => {
      const { result } = renderHook(() => useCarousel(totalItems, visibleItems));

      const touchStartEvent = {
        ...mockEvent,
        targetTouches: [{ clientX: 100 }]
      };

      const touchEndEvent = {
        ...mockEvent,
        targetTouches: [{ clientX: 120 }] // Small swipe (< 50px)
      };

      act(() => {
        result.current.handleTouchStart(touchStartEvent);
      });

      act(() => {
        result.current.handleTouchEnd(touchEndEvent);
      });

      expect(result.current.currentIndex).toBe(0);
    });

    // Note: Additional touch gesture tests would require more complex mocking
    // to properly test the swipe direction logic. For now, basic functionality
    // of touch event handling is verified.
  });

  it('adjusts currentIndex when totalItems changes', () => {
    const { result, rerender } = renderHook(
      ({ total, visible }) => useCarousel(total, visible),
      {
        initialProps: { total: 10, visible: 5 }
      }
    );

    act(() => result.current.goToIndex(4));

    rerender({ total: 8, visible: 5 });

    expect(result.current.maxIndex).toBe(3); // 8 - 5 = 3
    expect(result.current.currentIndex).toBe(3); // Clamped to new maxIndex
  });
});
