import React from 'react';
import Link from 'next/link';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import ProductCard from './ProductCard';
import { NAVIGATION_CONTEXTS } from '@/utils/navigationContextUtils';

/**
 * Reusable product carousel component
 */
const ProductCarousel = ({
  products = [],
  currentIndex,
  visibleProducts,
  onPrev,
  onNext,
  onTouchStart,
  onTouchMove,
  onTouchEnd,
  canGoPrev,
  canGoNext,
  className = ""
}) => {

  if (!products || products.length === 0) {
    return null;
  }

  return (
    <div className={`relative ${className}`}>
      <h2 className="text-2xl sm:text-3xl font-bold text-center mb-6 sm:mb-8 dark:text-white text-gray-900">
        ALSO TRY
      </h2>

      {/* Products Carousel */}
      <div className="relative overflow-hidden">
        <div
          className="flex transition-transform duration-500 ease-in-out select-none"
          style={{
            transform: `translateX(-${currentIndex * (100 / visibleProducts)}%)`,
            touchAction: 'pan-y'
          }}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          {products.map((product, idx) => (
            <div
              key={product.id}
              className="flex-shrink-0 px-2 sm:px-3"
              style={{ width: `${100 / visibleProducts}%` }}
            >
              <ProductCard
                product={product}
                sectionContext={NAVIGATION_CONTEXTS.RELATED_PRODUCTS}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="flex items-center justify-between mt-6">
        {/* Mobile: Dots navigation */}
        <div className="flex sm:hidden justify-center">
          <div className="flex gap-2">
            {Array.from({ length: Math.ceil(products.length / visibleProducts) }).map((_, idx) => {
              const slideValue = idx * visibleProducts;
              return (
                <button
                  key={idx}
                  onClick={() => {
                    if (typeof window !== 'undefined' && window.carouselGoToIndex) {
                      window.carouselGoToIndex(slideValue);
                    }
                  }}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    idx === Math.floor(currentIndex / visibleProducts)
                      ? 'bg-gray-900 dark:bg-white'
                      : 'bg-gray-400 dark:bg-gray-600'
                  }`}
                  aria-label={`Go to product set ${idx + 1}`}
                />
              );
            })}
          </div>
        </div>

        {/* Desktop: Arrow navigation */}
        <div className="hidden sm:flex items-center gap-3">
          <button
            onClick={onPrev}
            disabled={!canGoPrev}
            className={`p-2 sm:p-3 rounded-full transition-colors ${
              !canGoPrev
                ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
                : 'text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-800'
            }`}
            aria-label="Previous products"
          >
            <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          <button
            onClick={onNext}
            disabled={!canGoNext}
            className={`p-2 sm:p-3 rounded-full transition-colors ${
              !canGoNext
                ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
                : 'text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-800'
            }`}
            aria-label="Next products"
          >
            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* View All Button */}
        <Link
          href="/browse"
          className="border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white px-4 sm:px-8 py-2 sm:py-3 rounded-full hover:bg-gray-200 dark:hover:bg-gray-900 transition text-sm"
        >
          View All Products
        </Link>
      </div>
    </div>
  );
};

export default ProductCarousel;
