"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import ProductCard from './ProductCard';
import { NAVIGATION_CONTEXTS } from '@/utils/navigationContextUtils';

const ProductCarousel = ({ products = [], title = "ALSO TRY", viewAllLink = "/browse" }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visibleProducts, setVisibleProducts] = useState(4);
  const [maxIndex, setMaxIndex] = useState(0);

  const getVisibleProducts = () => {
    if (typeof window !== "undefined") {
      if (window.innerWidth >= 1024) return 4;
      if (window.innerWidth >= 768) return 3;
      if (window.innerWidth >= 640) return 2;
      return 2;
    }
    return 4;
  };

  useEffect(() => {
    const updateVisible = () => {
      const visible = getVisibleProducts();
      setVisibleProducts(visible);
      const max = Math.max(products.length - visible, 0);
      setMaxIndex(max);
      setCurrentIndex(prev => Math.min(prev, max));
    };
    updateVisible();
    window.addEventListener("resize", updateVisible);
    return () => window.removeEventListener("resize", updateVisible);
  }, [products]);

  const handlePrev = () => setCurrentIndex(prev => Math.max(0, prev - 1));
  const handleNext = () => setCurrentIndex(prev => Math.min(maxIndex, prev + 1));

  // Swipe support
  const [touchStartX, setTouchStartX] = useState(0);
  const [touchEndX, setTouchEndX] = useState(0);

  const handleTouchStart = (e) => {
    setTouchEndX(0);
    setTouchStartX(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => setTouchEndX(e.targetTouches[0].clientX);

  const handleTouchEnd = () => {
    if (!touchStartX || !touchEndX) return;
    const distance = touchStartX - touchEndX;
    if (distance > 50 && currentIndex < maxIndex) handleNext();
    if (distance < -50 && currentIndex > 0) handlePrev();
  };

  if (!products || products.length === 0) return null;

  const shouldShowControls = products.length > visibleProducts;

  return (
    <div className="relative">
      {/* Title and arrows at top */}
      <div className="flex justify-between items-center mb-6 sm:mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold dark:text-white text-gray-900">
          {title}
        </h2>

        {shouldShowControls && (
          <div className="flex gap-2">
            <button
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className={`p-3 rounded-full transition-colors ${
                currentIndex === 0
                  ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
                  : 'text-gray-900 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-800'
              }`}
              aria-label="Previous products"
            >
              <ChevronLeft size={24} />
            </button>
            <button
              onClick={handleNext}
              disabled={currentIndex >= maxIndex}
              className={`p-3 rounded-full transition-colors ${
                currentIndex >= maxIndex
                  ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
                  : 'text-gray-900 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-800'
              }`}
              aria-label="Next products"
            >
              <ChevronRight size={24} />
            </button>
          </div>
        )}
      </div>

      {/* Carousel */}
      <div className="relative overflow-hidden">
        <div
          className="flex transition-transform duration-500 ease-in-out select-none"
          style={{
            transform: `translateX(-${currentIndex * (100 / visibleProducts)}%)`,
            touchAction: "pan-y",
          }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {products.map((product) => (
            <div
              key={product.id}
              className="flex-shrink-0 px-2 py-3 sm:px-3 "
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

      {/* Mobile dots */}
      {shouldShowControls && (
        <div className="flex justify-center mt-6 sm:hidden">
          {Array.from({ length: Math.ceil(products.length / visibleProducts) }).map((_, idx) => {
            const slideValue = idx * visibleProducts;
            return (
              <button
                key={idx}
                onClick={() => setCurrentIndex(slideValue >= maxIndex ? maxIndex : slideValue)}
                className={`w-2 h-2 rounded-full transition-colors mx-1 ${
                  idx === Math.floor(currentIndex / visibleProducts)
                    ? "bg-gray-900 dark:bg-white"
                    : "bg-gray-400 dark:bg-gray-600"
                }`}
                aria-label={`Go to product set ${idx + 1}`}
              />
            );
          })}
        </div>
      )}

      {/* View All */}
      <div className="text-center mt-6">
        <Link
          href={viewAllLink}
          className="border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white px-4 sm:px-8 py-2 sm:py-3 rounded-full hover:bg-gray-200 dark:hover:bg-gray-900 transition text-sm"
        >
          View All Products
        </Link>
      </div>
    </div>
  );
};

export default ProductCarousel;
