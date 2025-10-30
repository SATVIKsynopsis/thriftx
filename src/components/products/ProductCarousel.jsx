import React from 'react';
import Link from 'next/link';
import { Heart, ChevronRight, ChevronLeft } from 'lucide-react';
import { formatPrice } from '../../utils/formatters';

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
  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating || 0);
    const hasHalfStar = (rating || 0) % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<span key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400">★</span>);
    }
    if (hasHalfStar) {
      stars.push(<span key="half" className="w-4 h-4 fill-yellow-400 text-yellow-400">★</span>);
    }
    return stars;
  };

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
              <div className="bg-gray-200 dark:bg-gray-900 rounded-xl sm:rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 transition-all duration-200 h-full">
                <div className="relative">
                  <span className="absolute top-2 left-2 sm:top-4 sm:left-4 bg-pink-500 text-white text-xs px-2 sm:px-3 py-1 rounded font-medium z-10">
                    CATEGORY
                  </span>
                  <button className="absolute top-2 right-2 sm:top-4 sm:right-4 w-8 h-8 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors z-10">
                    <Heart className="w-4 h-4 text-black dark:text-white" />
                  </button>
                  <div className="bg-gray-200 dark:bg-gray-700 h-40 sm:h-48 flex items-center justify-center">
                    {product.images && product.images.length > 0 ? (
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <span className="text-gray-500 text-sm">Product image</span>
                    )}
                  </div>
                </div>
                <div className="p-3 sm:p-4">
                  <span className="bg-lime-400 text-black text-xs px-2 py-1 rounded font-bold">
                    BRAND
                  </span>
                  <h3 className="text-sm sm:text-base mt-2 mb-1 font-semibold line-clamp-2 dark:text-white text-gray-900">
                    {product.name}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                    Size M - Excellent condition
                  </p>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-lime-600 dark:text-lime-400 font-bold text-sm sm:text-base">
                      {formatPrice(product.price)}
                    </span>
                    {product.originalPrice && product.originalPrice > product.price && (
                      <span className="text-gray-400 dark:text-gray-500 line-through text-xs sm:text-sm">
                        {formatPrice(product.originalPrice)}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    {renderStars(product.rating || 0)}
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      ({product.reviewCount || 0})
                    </span>
                  </div>
                </div>
              </div>
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
