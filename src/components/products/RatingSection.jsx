import React from 'react';
import Link from 'next/link';
import { Star, MoreVertical } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

/**
 * Reusable rating and reviews component
 */
const RatingSection = ({
  product,
  activeTab,
  userRating,
  hoverRating,
  submitting,
  onTabChange,
  onRatingSubmit,
  onHoverRatingChange,
  className = ""
}) => {
  const { currentUser } = useAuth();

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating || 0);
    const hasHalfStar = (rating || 0) % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />);
    }
    if (hasHalfStar) {
      stars.push(<Star key="half" className="w-4 h-4 fill-yellow-400 text-yellow-400" />);
    }
    return stars;
  };

  // Mock reviews data
  const mockReviews = [
    {
      name: 'Samantha D.',
      rating: 4.5,
      date: 'August 14, 2023',
      text: 'I absolutely love this t-shirt! The design is unique and the fabric feels so comfortable. As a fellow designer, I appreciate the attention to detail. It\'s become my favorite go-to shirt.',
      verified: true
    },
    {
      name: 'Alex M.',
      rating: 4,
      date: 'August 15, 2023',
      text: 'The t-shirt exceeded my expectations! The colors are vibrant and the print is top-notch. Being a UI/UX designer myself, I\'m quite picky about aesthetics, and this t-shirt definitely gets a thumbs up from me.',
      verified: true
    }
  ];

  if (!product) return null;

  return (
    <div className={className}>
      {/* Tab Navigation */}
      <div className="border-b border-gray-300 dark:border-gray-800 mb-6 lg:mb-8 transition-colors">
        <div className="flex gap-4 sm:gap-8 overflow-x-auto">
          {[
            { id: 'details', label: 'Product Details' },
            { id: 'reviews', label: 'Rating & Reviews' },
            { id: 'faqs', label: 'FAQs' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`pb-3 sm:pb-4 px-1 whitespace-nowrap text-sm sm:text-base font-medium transition-all ${
                activeTab === tab.id
                  ? 'border-b-2 border-indigo-500 dark:border-white text-gray-900 dark:text-white'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Reviews Tab */}
      {activeTab === 'reviews' && (
        <div className="mb-12">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Seller Reviews ({product.reviewCount || 0})
            </h2>

            {/* Desktop Controls */}
            <div className="hidden sm:flex items-center gap-4">
              <select className="bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-white px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 text-sm transition-colors">
                <option>Latest</option>
                <option>Highest Rated</option>
                <option>Lowest Rated</option>
              </select>
              <button className="bg-indigo-600 dark:bg-lime-500 dark:font-bold dark:text-black text-white px-6 py-2 rounded-lg border border-indigo-600 dark:border-gray-700 text-sm hover:bg-indigo-700 dark:hover:bg-gray-700 transition">
                Write a Review
              </button>
            </div>

            {/* Mobile Controls */}
            <div className="flex sm:hidden items-center gap-2">
              <button className="bg-indigo-600 dark:bg-gray-800 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-700 dark:hover:bg-gray-700 transition">
                Write Review
              </button>
            </div>
          </div>

          {/* Reviews Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {mockReviews.map((review, idx) => (
              <div
                key={idx}
                className="bg-gray-100 dark:bg-gray-900 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-gray-300 dark:border-gray-800 transition-colors"
              >
                <div className="flex items-start justify-between mb-3 sm:mb-4">
                  <div className="flex">{renderStars(review.rating)}</div>
                  <button className="text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white transition-colors">
                    <MoreVertical className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                </div>
                <div className="flex items-center gap-2 mb-3 sm:mb-4">
                  <span className="font-semibold text-sm sm:text-base text-gray-900 dark:text-white">
                    {review.name}
                  </span>
                  {review.verified && (
                    <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-xs text-white">✓</span>
                    </div>
                  )}
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm mb-3 sm:mb-4 leading-relaxed">
                  "{review.text}"
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  Posted on {review.date}
                </p>
              </div>
            ))}
          </div>

          {/* Load More */}
          <div className="flex justify-center mt-6 sm:mt-8">
            <button className="border border-gray-400 dark:border-gray-700 text-gray-800 dark:text-white px-6 sm:px-8 py-2 sm:py-3 rounded-full hover:bg-gray-200 dark:hover:bg-gray-900 transition text-sm">
              Load More Reviews
            </button>
          </div>
        </div>
      )}

      {/* Rating (when not in reviews tab) */}
      {activeTab !== 'reviews' && (
        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
            Rate this product
          </h3>
          {currentUser ? (
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size={28}
                  className="cursor-pointer transition duration-100"
                  fill={(hoverRating || userRating) >= star ? '#fbbf24' : 'none'}
                  stroke={(hoverRating || userRating) >= star ? 'none' : '#d1d5db'}
                  strokeWidth={2}
                  onMouseEnter={() => onHoverRatingChange(star)}
                  onMouseLeave={() => onHoverRatingChange(0)}
                  onClick={() => onRatingSubmit(star)}
                />
              ))}
              {submitting && (
                <div className="loading-spinner w-5 h-5 border-2 border-t-2"></div>
              )}
            </div>
          ) : (
            <p className="text-gray-600 dark:text-gray-400">
              Please{' '}
              <Link
                href="/login"
                className="text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                login
              </Link>{' '}
              to rate this product.
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default RatingSection;
