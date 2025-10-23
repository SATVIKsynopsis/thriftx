import React from 'react';

/**
 * Reusable product image gallery component
 */
const ProductImageGallery = ({
  images = [],
  selectedImage,
  onImageSelect,
  className = ""
}) => {
  if (!images || images.length === 0) {
    return (
      <div
        className={`flex items-center justify-center text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 ${className}`}
      >
        No Image Available
      </div>
    );
  }

  return (
    <div className={`w-full ${className}`}>
      {/* Mobile: Horizontal scroll for thumbnails */}
      <div className="flex lg:hidden gap-2 mb-4 overflow-x-auto pb-2">
        {images.map((img, idx) => (
          <button
            key={idx}
            onClick={() => onImageSelect(idx)}
            className={`flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden border-2 transition-colors duration-200 ${
              selectedImage === idx
                ? 'border-indigo-500 dark:border-indigo-400'
                : 'border-gray-300 dark:border-gray-700'
            }`}
          >
            <img
              src={img}
              alt={`Thumbnail ${idx + 1}`}
              className="w-full h-full object-cover"
            />
          </button>
        ))}
      </div>

      {/* Desktop: Vertical thumbnails */}
      <div className="hidden lg:flex gap-4">
        <div className="flex flex-col gap-4">
          {images.map((img, idx) => (
            <button
              key={idx}
              onClick={() => onImageSelect(idx)}
              className={`w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors duration-200 ${
                selectedImage === idx
                  ? 'border-indigo-500 dark:border-indigo-400'
                  : 'border-gray-300 dark:border-gray-700'
              }`}
            >
              <img
                src={img}
                alt={`Thumbnail ${idx + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>

        <div className="flex-1 rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-800 min-h-[400px]">
          <img
            src={images[selectedImage]}
            alt="Product"
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextElementSibling.style.display = 'flex';
            }}
          />
        </div>
      </div>

      {/* Mobile: Main image */}
      <div className="lg:hidden rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-800">
        <img
          src={images[selectedImage]}
          alt="Product"
          className="w-full aspect-square object-cover"
          onError={(e) => {
            e.target.style.display = 'none';
            e.target.nextElementSibling.style.display = 'flex';
          }}
        />
      </div>
    </div>
  );
};

export default ProductImageGallery;
