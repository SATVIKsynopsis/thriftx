import React from 'react';
import ProductCard from './ProductCard';

const ProductGrid = ({
  products,
  loading,
  favorites,
  renderStars,
  onClearFilters,
  sectionContext
}) => {
  if (loading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
        {[...Array(9)].map((_, index) => (
          <div key={index} className="bg-gray-900 rounded-2xl h-80 animate-pulse">
            <div className="bg-gray-800 h-64 rounded-t-2xl mb-4"></div>
            <div className="p-4">
              <div className="bg-gray-800 h-4 rounded mb-2"></div>
              <div className="bg-gray-800 h-3 rounded mb-2 w-2/3"></div>
              <div className="flex justify-between items-center">
                <div className="bg-gray-800 h-5 rounded w-1/3"></div>
                <div className="bg-gray-800 h-4 rounded w-1/4"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400 text-lg mb-4">No products found matching your filters.</p>
        <button
          onClick={onClearFilters}
          className="px-6 py-2 bg-[#bdf800] text-black font-semibold rounded-lg hover:bg-[#a8e600] transition-colors"
        >
          Clear All Filters
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-4 lg:gap-6">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          isFavorite={favorites.includes(product.id)}
          renderStars={renderStars}
          sectionContext={sectionContext}
        />
      ))}
    </div>
  );
};

export default ProductGrid;
