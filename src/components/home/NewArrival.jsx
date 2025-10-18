"use client";

import { TrendingUp, ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import ProductCard from '../products/ProductCard';
import Link from 'next/link';

const NewArrival = ({ loading, newProducts }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visibleProducts, setVisibleProducts] = useState(4);
  const [maxIndex, setMaxIndex] = useState(0);

  // Responsive calculation
  const getVisibleProducts = () => {
    if (typeof window !== 'undefined') {
      if (window.innerWidth >= 1024) return 4; // lg
      if (window.innerWidth >= 768) return 3;  // md
      if (window.innerWidth >= 640) return 2;  // sm
      return 1; // mobile
    }
    return 4;
  };

  useEffect(() => {
    const updateVisible = () => {
      const visible = getVisibleProducts();
      setVisibleProducts(visible);
      setMaxIndex(Math.max(newProducts.length - visible, 0));
      setCurrentIndex(prev => Math.min(prev, Math.max(newProducts.length - visible, 0)));
    };

    updateVisible();
    window.addEventListener('resize', updateVisible);
    return () => window.removeEventListener('resize', updateVisible);
  }, [newProducts]);

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
    <section className="py-16 bg-black">
      <div className="max-w-[1100px] mx-auto px-4 md:px-2">
        {/* Header with arrows */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-12 gap-4 sm:gap-0">
          <div className="text-center sm:text-left">
            <h2 className="text-5xl md:text-7xl font-bold flex fontAnton items-center gap-2 text-white mb-2 justify-center sm:justify-start">
              NEW <span className='text-lime-400 tracking-wider'>ARRIVALS</span>
            </h2>
          </div>

          {/* Navigation Arrows */}
          <div className="flex gap-3">
            <button
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className={`p-3 rounded-full transition-colors ${currentIndex === 0 ? 'text-gray-400 cursor-not-allowed' : 'text-gray-900 hover:bg-gray-200'}`}
              aria-label="Previous products"
            >
              <ChevronLeft size={24} />
            </button>
            <button
              onClick={handleNext}
              disabled={currentIndex >= maxIndex}
              className={`p-3 rounded-full transition-colors ${currentIndex >= maxIndex ? 'text-gray-400 cursor-not-allowed' : 'text-gray-900 hover:bg-gray-200'}`}
              aria-label="Next products"
            >
              <ChevronRight size={24} />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 mb-12">
            {[...Array(8)].map((_, index) => (
              <div key={index} className="bg-gray-200 rounded-xl h-72 animate-pulse" />
            ))}
          </div>
        ) : (
          <>
            {/* Scrollable Products */}
            <div className="relative overflow-hidden">
              <div
                className="flex transition-transform duration-500 ease-in-out"
                style={{ transform: `translateX(-${currentIndex * (100 / visibleProducts)}%)` }}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                {newProducts.map(product => (
                  <div
                    key={product.id}
                    className="flex-shrink-0 w-full p-2 sm:w-1/2 md:w-1/3 lg:w-1/4"
                  >
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>
            </div>

            {/* Mobile dots */}
            <div className="flex justify-center mt-6 sm:hidden">
              {Array.from({ length: Math.ceil(newProducts.length / visibleProducts) }).map((_, idx) => {
                const slideValue = idx * visibleProducts;
                const actualIndex = slideValue >= maxIndex ? maxIndex : slideValue;
                return (
                  <button
                    key={idx}
                    onClick={() => setCurrentIndex(actualIndex)}
                    className={`w-2 h-2 rounded-full mx-1 transition-colors ${idx === Math.floor(currentIndex / visibleProducts) ? 'bg-gray-900' : 'bg-gray-400'}`}
                  />
                );
              })}
            </div>

            {/* View All Button */}
            {newProducts.length > 0 && (
              <div className="text-center mt-8">
                <Link
                  href="/search"
                  className="inline-flex items-center gap-2 border rounded-full text-white px-8 py-4 font-semibold hover:bg-gray-800 transition-transform transform hover:-translate-y-1"
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

export default NewArrival;
