import React from 'react';
import Link from 'next/link';
import { Star, User, Package, Minus, Plus } from 'lucide-react';
import { formatPrice } from '../../utils/formatters';
import { PRODUCT_COLORS, PRODUCT_SIZES } from '../../utils/productDetailConstants';

/**
 * Reusable product information component
 */
const ProductInfo = ({
  product,
  quantity,
  selectedColor,
  selectedSize,
  discount,
  isOwnProduct,
  onQuantityChange,
  onColorSelect,
  onSizeSelect,
  onAddToCart,
  cartLoading,
  className = ""
}) => {
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

  if (!product) return null;

  return (
    <div className={`w-full space-y-4 lg:space-y-6 ${className}`}>
      {/* Seller Info */}
      <div className="flex items-center gap-2 mb-3 sm:mb-4 text-gray-400 text-sm">
        <User size={16} />
        <span>Sold by {product.sellerName || 'Unknown Seller'}</span>
      </div>

      {/* Product Name */}
      <h1 className="text-2xl sm:text-3xl font-bold mb-2 leading-tight">
        {product.name}
      </h1>

      {/* Rating */}
      {product.rating && (
        <div className="flex items-center gap-2 mb-3 sm:mb-4">
          <div className="flex">
            {renderStars(product.rating)}
          </div>
          <span className="text-sm text-gray-400">({product.reviewCount || 0})</span>
        </div>
      )}

      {/* Price */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-4">
        <span className="text-2xl sm:text-3xl font-bold text-green-400">
          {formatPrice(product.price)}
        </span>
        {product.originalPrice && product.originalPrice > product.price && (
          <div className="flex items-center gap-2">
            <span className="text-lg sm:text-2xl text-gray-500 line-through">
              {formatPrice(product.originalPrice)}
            </span>
            <span className="bg-red-600 text-white px-2 py-1 rounded text-sm font-medium">
              -{discount}%
            </span>
          </div>
        )}
      </div>

      {/* Description */}
      <p className="text-gray-400 mb-4 sm:mb-6 text-sm sm:text-base leading-relaxed">
        {product.description || 'This product offers superior quality and style.'}
      </p>

      {/* Color Selection */}
      <div className="mb-6">
        <p className="text-sm text-gray-400 mb-3">Select Colors</p>
        <div className="flex gap-3">
          {PRODUCT_COLORS.map((color, idx) => (
            <button
              key={idx}
              onClick={() => onColorSelect(idx)}
              className={`w-10 h-10 rounded-full border-2 ${
                selectedColor === idx ? 'border-white' : 'border-transparent'
              }`}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
      </div>

      {/* Size Selection */}
      <div className="mb-6">
        <p className="text-sm text-gray-400 mb-3">Choose Size</p>
        <div className="flex gap-3">
          {PRODUCT_SIZES.map((size) => (
            <button
              key={size}
              onClick={() => onSizeSelect(size)}
              className={`px-6 py-2 rounded-full border ${
                selectedSize === size
                  ? 'bg-white text-black border-white'
                  : 'bg-transparent text-white border-gray-600'
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      {/* Stock Status */}
      <div className={`text-sm font-semibold mb-4 ${product.stock > 0 ? 'text-green-400' : 'text-red-400'}`}>
        {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
      </div>

      {/* Brand */}
      <div className="mb-6 pb-6 border-b border-gray-800">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-400">Brand</span>
          <span className="text-2xl font-bold">{product.brand || 'ZARA'}</span>
        </div>
      </div>

      {/* Quantity and Add to Cart */}
      {!isOwnProduct && product.stock > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-xl">
            <span className="text-sm font-medium text-gray-300">Quantity</span>
            <div className="flex items-center bg-gray-800 rounded-full">
              <button
                onClick={() => onQuantityChange(-1)}
                className="p-3 hover:bg-gray-700 rounded-l-full transition-colors disabled:opacity-50"
                disabled={quantity <= 1}
                aria-label="Decrease quantity"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="px-4 py-3 min-w-[3rem] text-center font-medium">
                {quantity}
              </span>
              <button
                onClick={() => onQuantityChange(1)}
                className="p-3 hover:bg-gray-700 rounded-r-full transition-colors disabled:opacity-50"
                disabled={quantity >= product.stock}
                aria-label="Increase quantity"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
          <button
            className="w-full bg-lime-400 text-black font-semibold py-4 px-6 rounded-xl hover:bg-lime-500 transition-all duration-200 text-lg"
            onClick={onAddToCart}
            disabled={cartLoading}
          >
            {cartLoading ? 'Adding...' : 'Add to Cart'}
          </button>
        </div>
      )}

      {/* Edit Product Button (for sellers) */}
      {isOwnProduct && (
        <div className="flex gap-4 mb-8">
          <Link
            href={`/seller/products/edit/${product.id}`}
            className="flex-1 bg-blue-600 text-white rounded-xl py-4 px-6 text-lg font-semibold cursor-pointer transition duration-200 hover:bg-blue-700 flex items-center justify-center gap-2"
          >
            <Package size={20} />
            Edit Product
          </Link>
        </div>
      )}
    </div>
  );
};

export default ProductInfo;
