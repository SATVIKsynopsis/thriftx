"use client";

import React, { useState } from 'react';
import { ChevronDown, SlidersHorizontal } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { PRICE_RANGE } from '@/utils/filterConstants';
import { getCategoryDisplayName } from '@/utils/categoryUtils';
import { SearchableMultiSelect } from '@/components/ui/searchable-multi-select';

const FilterPage = ({
  isMobile = false,
  onClose = () => { },
  filters = { categories: [], colors: [], sizes: [], brands: [], priceRange: [0, 0] },
  updateFilters = () => { },
  clearFilters = () => { },
  availableCategories = [],
  availableBrands = [],
  availableSizes = [],
  availableColors = []
}) => {
  const [expandedSections, setExpandedSections] = useState({
    price: true,
    colors: true,
    size: true,
    brand: true
  });

  const categories = availableCategories;
  const sizes = availableSizes;
  const brands = availableBrands;

  // Create color objects with classes for dynamic colors
  const colors = availableColors.map(colorName => {
    // For now, use a simple color mapping. In a real app, you'd want a more comprehensive color system
    const colorMap = {
      'red': 'bg-red-500',
      'blue': 'bg-blue-500',
      'green': 'bg-green-500',
      'yellow': 'bg-yellow-400',
      'orange': 'bg-orange-500',
      'purple': 'bg-purple-500',
      'pink': 'bg-pink-500',
      'black': 'bg-black',
      'white': 'bg-white border-2 border-gray-300',
      'gray': 'bg-gray-500',
      'brown': 'bg-amber-800',
      'cyan': 'bg-cyan-400'
    };

    return {
      name: colorName,
      class: colorMap[colorName.toLowerCase()] || 'bg-gray-400' // Default fallback color
    };
  });

  const toggleColor = (color) => {
    const newColors = filters.colors.includes(color)
      ? filters.colors.filter(c => c !== color)
      : [...filters.colors, color];
    updateFilters('colors', newColors);
  };

  const toggleSize = (size) => {
    const newSizes = filters.sizes.includes(size)
      ? filters.sizes.filter(s => s !== size)
      : [...filters.sizes, size];
    updateFilters('sizes', newSizes);
  };

  const updatePriceRange = (newRange) => {
    updateFilters('priceRange', newRange);
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  return (
    <div className="p-6 bg-gray-200 dark:bg-neutral-950 text-gray-800 dark:text-gray-100">
      <div className="flex items-center justify-between border-2 border-b-neutral-600 mb-6">
        <h2 className="text-xl font-bold">Filters</h2>
        {isMobile ? (
          <button
            onClick={onClose}
            className="text-gray-800 dark:text-gray-100 hover:text-gray-500 dark:hover:text-gray-300 p-1"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        ) : (
          <SlidersHorizontal className="w-5 h-5 text-gray-800 dark:text-gray-100" />
        )}
      </div>

      {/* Categories */}
      <div className="mb-6">
        <h3 className="text-base font-semibold mb-3 text-gray-800 dark:text-gray-100">Categories</h3>
        <SearchableMultiSelect
          options={categories}
          value={filters.categories}
          onChange={(selectedCategories) => updateFilters('categories', selectedCategories)}
          placeholder="Select categories..."
          searchPlaceholder="Search categories..."
          emptyMessage="No categories found."
          maxDisplay={3}
        />
      </div>

      {/* Price */}
      <div className="mb-6">
        <button
          className="flex items-center justify-between w-full border-2 border-t-neutral-600 mb-4 text-gray-800 dark:text-gray-100 hover:text-black dark:hover:text-white transition-colors"
          onClick={() => toggleSection('price')}
        >
          <h3 className="text-base font-semibold">Price</h3>
          <motion.div animate={{ rotate: expandedSections.price ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronDown className="w-5 h-5" />
          </motion.div>
        </button>

        <AnimatePresence>
          {expandedSections.price && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="px-2 pt-2">
                <div className="relative h-1 bg-gray-400 dark:bg-gray-700 rounded-full mb-4">
                  <div
                    className="absolute h-full bg-gray-800 dark:bg-white rounded-full"
                    style={{
                      left: `${(filters.priceRange[0] / PRICE_RANGE[1]) * 100}%`,
                      right: `${100 - (filters.priceRange[1] / PRICE_RANGE[1]) * 100}%`
                    }}
                  />
                  <input
                    type="range"
                    min="0"
                    max={PRICE_RANGE[1]}
                    value={filters.priceRange[0]}
                    onChange={(e) => updatePriceRange([Math.min(parseInt(e.target.value), filters.priceRange[1]), filters.priceRange[1]])}
                    className="absolute w-full h-1 bg-transparent appearance-none pointer-events-auto cursor-pointer"
                  />
                  <input
                    type="range"
                    min="0"
                    max={PRICE_RANGE[1]}
                    value={filters.priceRange[1]}
                    onChange={(e) => updatePriceRange([filters.priceRange[0], Math.max(parseInt(e.target.value), filters.priceRange[0])])}
                    className="absolute w-full h-1 bg-transparent appearance-none pointer-events-auto cursor-pointer"
                  />
                </div>
                <div className="flex justify-between text-sm text-gray-800 dark:text-gray-100">
                  <span>₹{filters.priceRange[0].toLocaleString()}</span>
                  <span>₹{filters.priceRange[1].toLocaleString()}</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Colors */}
      <div className="mb-6">
        <button
          className="flex items-center justify-between w-full mb-4 border-2 border-t-neutral-600 text-gray-800 dark:text-gray-100 hover:text-black dark:hover:text-white transition-colors"
          onClick={() => toggleSection('colors')}
        >
          <h3 className="text-base font-semibold">Colors</h3>
          <motion.div animate={{ rotate: expandedSections.colors ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronDown className="w-5 h-5" />
          </motion.div>
        </button>
        <AnimatePresence>
          {expandedSections.colors && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="grid grid-cols-5 gap-3 p-2">
                {colors.map((color) => (
                  <motion.button
                    key={color.name}
                    onClick={() => toggleColor(color.name)}
                    className={`w-10 h-10 rounded-full relative border-2 border-white ${color.class} ${filters.colors.includes(color.name) ? 'ring-2 ring-offset-2 ring-offset-gray-200 dark:ring-offset-gray-900' : ''}`}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {filters.colors.includes(color.name) && (
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute inset-0 flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" viewBox="0 0 24 24" stroke="currentColor">
                          <path d="M5 13l4 4L19 7"></path>
                        </svg>
                      </motion.div>
                    )}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Size */}
      <div className="mb-6">
        <button
          className="flex items-center justify-between w-full mb-3 border-2 border-t-neutral-600 text-gray-800 dark:text-gray-100 hover:text-black dark:hover:text-white transition-colors"
          onClick={() => toggleSection('size')}
        >
          <h3 className="text-base font-semibold">Size</h3>
          <motion.div animate={{ rotate: expandedSections.size ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronDown className="w-5 h-5" />
          </motion.div>
        </button>
        <AnimatePresence>
          {expandedSections.size && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="flex flex-wrap gap-2">
                {sizes.map((size) => (
                  <motion.button
                    key={size}
                    onClick={() => toggleSize(size)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${filters.sizes.includes(size)
                      ? 'bg-[#bdf800] text-black'
                      : 'bg-gray-300 dark:bg-gray-800 text-black dark:text-white hover:bg-gray-400 dark:hover:bg-gray-700'
                      }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {size}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Brand */}
      <div className="mb-6">
        <h3 className="text-base font-semibold mb-3 text-gray-800 dark:text-gray-100">Brand</h3>
        <SearchableMultiSelect
          options={brands}
          value={filters.brands}
          onChange={(selectedBrands) => updateFilters('brands', selectedBrands)}
          placeholder="Select brands..."
          searchPlaceholder="Search brands..."
          emptyMessage="No brands found."
          maxDisplay={3}
        />
      </div>



      {/* Range Input Styles */}
      <style jsx>{`
  input[type="range"] {
    -webkit-appearance: none;
    appearance: none;
  }
  input[type="range"]::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: white;
    cursor: pointer;
    position: relative;
    z-index: 2;
  }
  input[type="range"]::-moz-range-thumb {
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: white;
    cursor: pointer;
    border: none;
  }
`}</style>

    </div>
  );
};
export default FilterPage;
