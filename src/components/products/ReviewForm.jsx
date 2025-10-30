import React, { useState } from 'react';
import { Star } from 'lucide-react';

const ReviewForm = ({ onSubmit, onCancel, submitting }) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [text, setText] = useState('');
  const [error, setError] = useState('');

  const handleStarClick = (rate) => {
    setRating(rate);
    if (error) setError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (rating === 0) {
      setError('Please select a star rating.');
      return;
    }
    if (text.trim().length < 10) {
      setError('Review must be at least 10 characters long.');
      return;
    }
    onSubmit({ rating, text });
  };

  return (
    
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-md transform transition-all">
      <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Write a Review</h3>
      <form onSubmit={handleSubmit}>
        
        <div className="flex items-center gap-2 mb-4">
          <span className="text-gray-700 dark:text-gray-300">Your Rating:</span>
          <div className="flex">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                size={28}
                className="cursor-pointer transition-colors"
                fill={(hoverRating || rating) >= star ? '#fbbf24' : 'none'}
                stroke={(hoverRating || rating) >= star ? '#fbbf24' : '#9ca3af'}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => handleStarClick(star)}
              />
            ))}
          </div>
        </div>

        
        <textarea
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            if (error) setError('');
          }}
          placeholder="Share your thoughts about the product..."
          className="w-full h-32 p-3 bg-gray-100 dark:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-indigo-500 outline-none transition"
          required
        />
        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

        
        <div className="flex justify-end gap-4 mt-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 disabled:bg-indigo-300 disabled:cursor-not-allowed transition"
          >
            {submitting ? 'Submitting...' : 'Submit Review'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ReviewForm;