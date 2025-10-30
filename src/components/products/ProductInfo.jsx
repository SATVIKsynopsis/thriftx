"use client";

import React from "react";
import Link from "next/link";
import { Star, User, Package, Minus, Plus } from "lucide-react";
import { formatPrice } from "../../utils/formatters";

//safe color validation
const isValidColor = (color) => {
  const s = new Option().style;
  s.color = color;
  return s.color !== "";
};



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
  className = "",
}) => {
  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating || 0);
    const hasHalfStar = (rating || 0) % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
      );
    }
    if (hasHalfStar) {
      stars.push(
        <Star key="half" className="w-4 h-4 fill-yellow-400 text-yellow-400" />
      );
    }
    return stars;
  };

  if (!product) return null;

  return (
    <div
      className={`w-full space-y-4 lg:space-y-6 transition-colors duration-300 ${className}`}
    >
      {/* Seller Info */}
      <div className="flex items-center gap-2 mb-3 sm:mb-4 text-gray-600 dark:text-gray-400 text-sm">
        <User size={16} />
        <span>Sold by {product.sellerName || "Unknown Seller"}</span>
      </div>

      {/* Product Name */}
      <h1 className="text-2xl sm:text-3xl font-bold mb-2 leading-tight text-gray-900 dark:text-white">
        {product.name}
      </h1>

      {/* Rating */}
      {product.rating && (
        <div className="flex items-center gap-2 mb-3 sm:mb-4">
          <div className="flex">{renderStars(product.rating)}</div>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            ({product.reviewCount || 0})
          </span>
        </div>
      )}

      {/* Price */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-4">
        <span className="text-2xl sm:text-3xl font-bold text-green-600 dark:text-green-400">
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
      <p className="text-gray-700 dark:text-gray-400 mb-4 sm:mb-6 text-sm sm:text-base leading-relaxed">
        {product.description ||
          "This product offers superior quality and modern style."}
      </p>

      {/* Color Selection */}
     <div className="mb-6">
  <p className="text-sm text-gray-700 dark:text-gray-400 mb-3">
    Select Color
  </p>
  <div className="flex flex-wrap gap-3">
    {Array.isArray(product.colors) && product.colors.length > 0 ? (
      product.colors.map((color, idx) => {
        // Fallback if invalid color name — switch to hex
        const displayColor = isValidColor(color) ? color : '#ccc';
        return (
          <button
            key={idx}
            onClick={() => onColorSelect(color)}
            className={`w-10 h-10 rounded-full border-2 transition-all duration-200 hover:scale-105 ${
              selectedColor === color
                ? "border-gray-900 dark:border-white"
                : "border-gray-300 dark:border-gray-600"
            }`}
            style={{ backgroundColor: displayColor }}
            title={color}
          />
        );
      })
    ) : typeof product.colors === "string" && product.colors.trim() ? (
      // If colors come as a comma-separated string like "red, blue"
      product.colors.split(',').map((color, idx) => {
        const trimmed = color.trim();
        const displayColor = isValidColor(trimmed) ? trimmed : '#ccc';
        return (
          <button
            key={idx}
            onClick={() => onColorSelect(trimmed)}
            className={`w-10 h-10 rounded-full border-2 transition-all duration-200 hover:scale-105 ${
              selectedColor === trimmed
                ? "border-gray-900 dark:border-white"
                : "border-gray-300 dark:border-gray-600"
            }`}
            style={{ backgroundColor: displayColor }}
            title={trimmed}
          />
        );
      })
    ) : (
      <p className="text-gray-500 text-sm italic">
        No color options provided.
      </p>
    )}
  </div>
</div>


      {/* Size Selection */}
      <div className="mb-6">
        <p className="text-sm text-gray-700 dark:text-gray-400 mb-3">
          Choose Size
        </p>
        <div className="flex flex-wrap gap-3">
          {product.sizes && product.sizes.length > 0 ? (
            product.sizes.map((size) => (
            <button
            key={size}
            onClick={() => onSizeSelect(size)}
            className={`px-6 py-2 rounded-full border transition-all duration-200 text-sm sm:text-base ${
            selectedSize === size
            ? "bg-gray-900 text-white dark:bg-white dark:text-black"
            : "bg-transparent text-gray-800 dark:text-white border-gray-400 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800"
        }`}
        >
          {size}
           </button>
           ))
          ) : (
          <p className="text-gray-500 text-sm italic">No size options provided.</p>
          )}

        </div>
      </div>

      {/* Stock Status */}
      <div
        className={`text-sm font-semibold mb-4 ${product.stock > 0
          ? "text-green-600 dark:text-green-400"
          : "text-red-600 dark:text-red-400"
          }`}
      >
        {product.stock > 0
          ? `${product.stock} in stock`
          : "Out of stock"}
      </div>

      {/* Brand */}
      <div className="mb-6 pb-6 border-b border-gray-300 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-700 dark:text-gray-400">
            Brand
          </span>
          <span className="text-2xl font-bold text-gray-900 dark:text-white">
            {product.brand || "ZARA"}
          </span>
        </div>
      </div>

      {/* Quantity and Add to Cart */}
      {!isOwnProduct && product.stock > 0 && (
        <div className="space-y-4">

          <div className="flex items-center justify-between p-3 bg-gray-200 dark:bg-gray-800 rounded-xl">
            <span className="text-md font-medium text-gray-700 dark:text-gray-300">
              Quantity
            </span>
            <div className="flex items-center rounded-full overflow-hidden">
              {/* Decrement Button */}
              <button
                onClick={() => onQuantityChange(-1)}
                className="px-4 py-4 bg-lime-500 hover:bg-lime-600 dark:bg-lime-700 dark:hover:bg-lime-600 transition-colors rounded-l-full disabled:opacity-50"
                disabled={quantity <= 1}
                aria-label="Decrease quantity"
              >
                <Minus className="w-5 h-5 text-black dark:text-white" />
              </button>

              {/* Quantity Number */}
              <span className="py-3 px-4 min-w-2 text-center font-bold bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-white">
                {quantity}
              </span>

              {/* Increment Button */}
              <button
                onClick={() => onQuantityChange(1)}
                className="px-4 py-4 bg-lime-500 hover:bg-lime-600 dark:bg-lime-700 dark:hover:bg-lime-600 transition-colors rounded-r-full disabled:opacity-50"
                disabled={quantity >= product.stock}
                aria-label="Increase quantity"
              >
                <Plus className="w-5 h-5 text-black dark:text-white" />
              </button>
            </div>
          </div>

          <button
            className="w-full bg-lime-500 hover:bg-lime-600 dark:bg-lime-400 dark:hover:bg-lime-500 text-black font-semibold py-4 px-6 rounded-xl transition-all duration-200 text-lg"
            onClick={onAddToCart}
            disabled={cartLoading}
          >
            {cartLoading ? "Adding..." : "Add to Cart"}
          </button>
        </div>
      )}

      {/* Edit Product Button (for sellers) */}
      {isOwnProduct && (
        <div className="flex gap-4 mb-8">
          <Link
            href={`/seller/products/edit/${product.id}`}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-4 px-6 text-lg font-semibold flex items-center justify-center gap-2 transition-all duration-200"
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
