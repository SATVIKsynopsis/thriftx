import React from 'react';

const ActiveFilters = ({ appliedFilters, onClearAll, PRICE_RANGE }) => {
  const hasActiveFilters = appliedFilters.categories.length > 0 ||
    appliedFilters.colors.length > 0 ||
    appliedFilters.sizes.length > 0 ||
    appliedFilters.brands.length > 0 ||
    (appliedFilters.priceRange[0] > 0 || appliedFilters.priceRange[1] < PRICE_RANGE[1]);

  if (!hasActiveFilters) {
    return null;
  }

  return (
    <div className="mb-4 p-3 bg-gray-200 dark:bg-gray-900 rounded-lg">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-800 dark:text-gray-300">Active Filters:</span>
        <button
          onClick={onClearAll}
          className="text-xs text-[#bdf800] hover:text-white transition-colors"
        >
          Clear All
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {appliedFilters.categories.map(category => (
          <span key={category} className="px-2 py-1 bg-[#bdf800] text-black text-xs rounded-full">
            {category}
          </span>
        ))}
        {appliedFilters.colors.map(color => (
          <span key={color} className="px-2 py-1 bg-green-600 text-white text-xs rounded-full">
            {color}
          </span>
        ))}
        {appliedFilters.sizes.map(size => (
          <span key={size} className="px-2 py-1 bg-orange-600 text-white text-xs rounded-full">
            {size}
          </span>
        ))}
        {appliedFilters.brands.map(brand => (
          <span key={brand} className="px-2 py-1 bg-blue-600 text-white text-xs rounded-full">
            {brand}
          </span>
        ))}
        {(appliedFilters.priceRange[0] > 0 || appliedFilters.priceRange[1] < PRICE_RANGE[1]) && (
          <span className="px-2 py-1 bg-purple-600 text-white text-xs rounded-full">
            ₹{appliedFilters.priceRange[0]} - ₹{appliedFilters.priceRange[1]}
          </span>
        )}
      </div>
    </div>
  );
};

export default ActiveFilters;
