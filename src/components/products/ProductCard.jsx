"use client";

import React from 'react';
import Link from 'next/link';
import { Heart, Star, ShoppingCart } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { formatPrice } from '@/utils/formatters';

const ProductCard = ({ product }) => {
  const { currentUser } = useAuth();
  const { addToCart, loading } = useCart();

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
  };

  const isOwnProduct = currentUser && product.sellerId === currentUser.uid;

  return (
    <div className="bg-white rounded-xl overflow-hidden border border-gray-200 shadow-sm transition-transform hover:-translate-y-1 hover:shadow-lg">
      <div className="relative w-full h-48 overflow-hidden">
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
          className={`absolute inset-0 flex items-center justify-center text-gray-400 text-sm bg-gradient-to-br from-gray-200 to-gray-300 ${product.images && product.images.length > 0 ? 'hidden' : 'flex'
            }`}
        >
          No Image Available
        </div>
        <button className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full bg-white/90 hover:bg-white hover:scale-110 transition-transform">
          <Heart size={18} />
        </button>
      </div>

      <div className="p-6">
        <p className="text-xs text-gray-500 mb-1">
          Sold by {product.sellerName || 'Unknown Seller'}
        </p>

        {isOwnProduct ? (
          <Link
            href={`/seller/products/edit/${product.id}`}
            className="block text-lg font-semibold text-gray-900 mb-2 hover:text-blue-600"
          >
            {product.name}
          </Link>
        ) : (
          <Link
            href={`/product/${product.id}`}
            className="block text-lg font-semibold text-gray-900 mb-2 hover:text-blue-600"
          >
            {product.name}
          </Link>
        )}

        <p className="text-gray-500 text-sm mb-4 line-clamp-2">
          {product.description}
        </p>

        <div className="flex items-center justify-between mb-4">
          <div className="text-green-600 font-bold text-xl">
            {formatPrice(product.price)}
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-gray-400 text-base line-through ml-2">
                {formatPrice(product.originalPrice)}
              </span>
            )}
          </div>

          {product.rating && (
            <div className="flex items-center gap-1 text-yellow-400">
              <Star size={16} fill="currentColor" />
              <span className="text-gray-600 text-sm">{product.rating.toFixed(1)}</span>
              <span className="text-gray-500 text-sm">({product.reviewCount || 0})</span>
            </div>
          )}
        </div>

        <div className="flex gap-2">
          {!isOwnProduct && currentUser && (
            <button
              onClick={handleAddToCart}
              disabled={loading || product.stock === 0}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-semibold transition-colors ${product.stock === 0 || loading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
            >
              <ShoppingCart size={18} />
              {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
            </button>
          )}

          {!currentUser && (
            <Link
              href="/login"
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-semibold bg-blue-600 hover:bg-blue-700 text-white"
            >
              <ShoppingCart size={18} />
              Login to Buy
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
