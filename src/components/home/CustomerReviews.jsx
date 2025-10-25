"use client";

import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Star, CheckCircle } from 'lucide-react';

const CustomerReviews = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStartX, setTouchStartX] = useState(0);
  const [touchEndX, setTouchEndX] = useState(0);

  const reviews = [
    {
      name: "Sarah M.",
      verified: true,
      rating: 5,
      text: "I'm blown away by the quality and style of the clothes I received from ThriftX. From casual wear to elegant dresses, every piece I've bought has exceeded my expectations."
    },
    {
      name: "Alex K.",
      verified: true,
      rating: 5,
      text: "Finding clothes that align with my personal style used to be a challenge until I discovered ThriftX. The range of options they offer is truly remarkable, catering to a variety of tastes and occasions."
    },
    {
      name: "James L.",
      verified: true,
      rating: 5,
      text: "As someone who's always on the lookout for unique fashion pieces, I'm thrilled to have stumbled upon ThriftX. The selection of clothes is not only diverse but also on-point with the latest trends."
    },
    {
      name: "Emily R.",
      verified: true,
      rating: 5,
      text: "ThriftX has completely transformed my wardrobe. The quality is outstanding and the prices are unbeatable. I've recommended it to all my friends!"
    },
    {
      name: "Michael T.",
      verified: true,
      rating: 5,
      text: "Exceptional service and amazing products. Every purchase from ThriftX has been a win. The attention to detail in their clothing selection is remarkable."
    }
  ];

  const getVisibleReviews = () => {
    if (typeof window !== 'undefined') {
      if (window.innerWidth >= 1024) return 3;
      if (window.innerWidth >= 640) return 2;
      return 1;
    }
    return 3;
  };

  const [visibleReviews, setVisibleReviews] = useState(3);
  const [maxIndex, setMaxIndex] = useState(reviews.length - 3);

  useEffect(() => {
    const updateVisibleReviews = () => {
      const visible = getVisibleReviews();
      setVisibleReviews(visible);
      setMaxIndex(reviews.length - visible);
      setCurrentIndex(prev => Math.min(prev, reviews.length - visible));
    };

    updateVisibleReviews();
    window.addEventListener('resize', updateVisibleReviews);
    return () => window.removeEventListener('resize', updateVisibleReviews);
  }, [reviews.length]);

  const handlePrev = () => setCurrentIndex(prev => Math.max(0, prev - 1));
  const handleNext = () => setCurrentIndex(prev => Math.min(maxIndex, prev + 1));

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
    <div className="bg-white dark:bg-black py-5 sm:py-12 lg:pt-16 sm:pb-32 lg:pb-20 px-2 sm:px-4 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <p className="border-t-2 border-gray-300 dark:border-neutral-600 pb-10" />
        
        <div className="flex flex-row justify-between items-center mb-5 sm:mb-12 gap-4 sm:gap-0">
          <h2 className=" text-gray-900 dark:text-neutral-200 text-xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold fontAnton uppercase tracking-normal sm:text-left">
            OUR HAPPY <span className='text-lime-500 dark:text-lime-400'>CUSTOMERS</span>
          </h2>
          <div className="flex sm:gap-3">
            <button
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className={`p-3 rounded-full transition-colors ${currentIndex === 0
                  ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
                  : 'text-gray-900 hover:bg-gray-100 active:bg-gray-200 dark:text-white dark:hover:bg-gray-800 dark:active:bg-gray-700'
                }`}
              aria-label="Previous reviews"
            >
              <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
            <button
              onClick={handleNext}
              disabled={currentIndex >= maxIndex}
              className={`p-3 rounded-full transition-colors ${currentIndex >= maxIndex
                  ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
                  : 'text-gray-900 hover:bg-gray-100 active:bg-gray-200 dark:text-white dark:hover:bg-gray-800 dark:active:bg-gray-700'
                }`}
              aria-label="Next reviews"
            >
              <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>
        </div>
        <div className="relative overflow-hidden">
          <div
            className="flex transition-transform duration-500 ease-in-out"
            style={{ transform: `translateX(-${currentIndex * (100 / visibleReviews)}%)` }}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {reviews.map((review, idx) => (
              <div key={idx} className="w-full sm:w-1/2 lg:w-1/3 flex-shrink-0 px-2 sm:px-3">
                <div className="bg-neutral-200 dark:bg-neutral-900 rounded-[15px] sm:rounded-[20px] p-4 sm:p-6 lg:p-7 h-auto sm:h-[180px] border border-gray-200 dark:border-neutral-800">
                  <div className="flex gap-1 mb-3 sm:mb-4">
                    {[...Array(review.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 sm:w-4 sm:h-4 lg:w-5 lg:h-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <div className="flex items-center gap-2 mb-3 sm:mb-4">
                    <h3 className="text-gray-900 dark:text-white font-semibold text-base sm:text-lg">{review.name}</h3>
                    {review.verified && (
                      <div className="w-4 h-4 sm:w-5 sm:h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <CheckCircle className="w-2 h-2 sm:w-2.5 sm:h-2.5 text-white" />
                      </div>
                    )}
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-sm leading-relaxed">"{review.text}"</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="flex justify-center mt-6 sm:hidden">
          <div className="flex gap-2">
            {Array.from({ length: Math.ceil(reviews.length / visibleReviews) }).map((_, idx) => {
              const slideValue = idx * visibleReviews;
              const actualIndex = slideValue >= maxIndex ? maxIndex : slideValue;
              return (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(actualIndex)}
                  className={`w-2 h-2 rounded-full transition-colors ${idx === Math.floor(currentIndex / visibleReviews)
                    ? 'bg-gray-900 dark:bg-white'
                    : 'bg-gray-400 dark:bg-gray-600'
                  }`}
                  aria-label={`Go to review set ${idx + 1}`}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerReviews;
