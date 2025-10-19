import React from 'react';
import { Heart } from 'lucide-react';

const ProductCard = ({ product, isFavorite, onToggleFavorite, renderStars }) => {
  const defaultRenderStars = (rating) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            className={`w-3 h-3 ${star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600 fill-gray-600'}`}
            viewBox="0 0 20 20"
          >
            <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
          </svg>
        ))}
      </div>
    );
  };

  const starsFunction = renderStars || defaultRenderStars;
  return (
    <div className="bg-gray-900 rounded-2xl overflow-hidden hover:transform hover:scale-105 transition-transform duration-200">
      <div className="relative w-full h-64 overflow-hidden">
        {product.images && product.images.length > 0 ? (
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextElementSibling.style.display = 'flex';
            }}
          />
        ) : null}
        <div
          className={`absolute inset-0 flex items-center justify-center text-white text-sm bg-gradient-to-br from-slate-600 to-slate-700 ${
            product.images && product.images.length > 0 ? 'hidden' : 'flex'
          }`}
        >
          No Image Available
        </div>

        <div className="absolute top-3 left-3">
          <span className="bg-pink-600 text-white text-xs font-semibold px-3 py-1 rounded">
            {product.category}
          </span>
        </div>

        <button
          onClick={() => onToggleFavorite(product.id)}
          aria-label={`${isFavorite ? 'Remove from' : 'Add to'} favorites`}
          className="absolute top-3 right-3 w-9 h-9 bg-white rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
        >
          <Heart
            className={`w-5 h-5 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-black'}`}
          />
        </button>

        <div className="absolute bottom-3 left-3">
          <span className="bg-lime-400 text-black text-xs font-bold px-3 py-1 rounded">
            {product.brand}
          </span>
        </div>
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-base mb-1">{product.name}</h3>
        <p className="text-gray-400 text-xs mb-3">{product.condition}</p>

        <div className="flex items-center justify-between mb-2">
          <span className="text-lime-400 text-xl font-bold">{product.price}</span>
          <span className="text-gray-500 text-sm line-through">{product.originalPrice}</span>
        </div>

        <div className="flex items-center gap-2">
          {starsFunction(product.rating)}
          <span className="text-gray-400 text-xs">({product.reviews})</span>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
