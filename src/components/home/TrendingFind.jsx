"use client";

import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import ProductCard from '../products/ProductCard';
import Link from 'next/link';
import { setNavigationContext, NAVIGATION_CONTEXTS } from '@/utils/navigationContextUtils';

const TrendingFind = ({ loading, featuredProducts }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visibleProducts, setVisibleProducts] = useState(4);
  const [maxIndex, setMaxIndex] = useState(0);

  // Calculate visible products based on screen size
  const getVisibleProducts = () => {
    if (typeof window !== "undefined") {
      if (window.innerWidth >= 1024) return 4;
      if (window.innerWidth >= 768) return 3;
      if (window.innerWidth >= 640) return 2;
      // *** MODIFICATION HERE ***
      // This line now returns 2 for screens smaller than 640px (e.g., mobile)
      return 2;
    }
    return 4;
  };

  useEffect(() => {
    const updateVisible = () => {
      const visible = getVisibleProducts();
      setVisibleProducts(visible);
      setMaxIndex(Math.max(featuredProducts.length - visible, 0));
      setCurrentIndex(prev => Math.min(prev, Math.max(featuredProducts.length - visible, 0)));
    };

    updateVisible();
    window.addEventListener('resize', updateVisible);
    return () => window.removeEventListener('resize', updateVisible);
  }, [featuredProducts]);

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

  return (
    <section className="pt-10 bg-white dark:bg-black">
      <div className="max-w-[1100px] mx-auto px-2 md:px-2">
        <p className='border-t-2 border-gray-200 dark:border-neutral-700 mb-4 sm:mb-10' />

        <div className="flex sm:flex-row justify-between items-center mb-5 md:mb-12  gap-4 sm:gap-0">
          <h2 className="text-2xl sm:text-4xl text-gray-900 dark:text-white md:text-7xl font-bold fontAnton flex items-center gap-2">
            TRENDING <span className="text-lime-400 tracking-wider">FINDS</span>
          </h2>

          <div className="flex gap-3">
            <button
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className={`p-3 rounded-full transition-colors ${currentIndex === 0
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
              className={`p-3 rounded-full transition-colors ${currentIndex >= maxIndex
                  ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
                  : 'text-gray-900 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-800'
                }`}
              aria-label="Next products"
            >
              <ChevronRight size={24} />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 mb-12">
            {/* The placeholder will now show the correct number of visible items */}
            {[...Array(getVisibleProducts())].map((_, index) => (
              <div key={index} className="bg-gray-200 rounded-xl h-72 animate-pulse" />
            ))}
          </div>
        ) : (
          <>
            <div
              className="relative overflow-hidden"
            >
              <div
                className="flex transition-transform duration-500 ease-in-out"
                style={{ transform: `translateX(-${currentIndex * (100 / visibleProducts)}%)` }}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                {featuredProducts.map((product) => (
                  <div
                    key={product.id}
                    className="flex-shrink-0 p-2"
                    style={{ width: `${100 / visibleProducts}%` }}
                  >
                    <ProductCard
                      product={product}
                      sectionContext={NAVIGATION_CONTEXTS.TRENDING_FINDS}
                    />
                  </div>
                ))}
              </div>
            </div>


            <div className="flex justify-center mt-6 sm:hidden">
              {Array.from({ length: Math.ceil(featuredProducts.length / visibleProducts) }).map((_, idx) => {
                const slideValue = idx * visibleProducts;
                const actualIndex = slideValue >= maxIndex ? maxIndex : slideValue;
                return (
                  <button
                    key={idx}
                    onClick={() => setCurrentIndex(actualIndex)}
                    className={`w-2 h-2 rounded-full transition-colors mx-1 ${idx === Math.floor(currentIndex / visibleProducts)
                        ? 'bg-gray-900 dark:bg-white'
                        : 'bg-gray-400 dark:bg-gray-600'
                      }`}
                    aria-label={`Go to product set ${idx + 1}`}
                  />
                );
              })}
            </div>

            {featuredProducts.length > 0 && (
              <div className="text-center mt-8">
                <Link
                  href="/browse"
                  onClick={() => setNavigationContext(NAVIGATION_CONTEXTS.TRENDING_FINDS)}
                  className="inline-flex items-center gap-2 border rounded-full text-gray-900 border-gray-900 px-8 py-4 font-semibold hover:bg-gray-100 transition-transform transform hover:-translate-y-1 dark:text-white dark:border dark:hover:bg-gray-800"
                >
                  View All Products <ArrowRight size={20} />
                </Link>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
};

export default TrendingFind;