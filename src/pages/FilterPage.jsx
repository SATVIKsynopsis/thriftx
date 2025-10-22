"use client";

import React, { useState } from 'react';
import { ChevronDown, ChevronRight, SlidersHorizontal } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { CATEGORIES, COLORS, SIZES, BRANDS, PRICE_RANGE } from '@/utils/filterConstants';

const FilterPage = ({
  isMobile = false,
  onClose = () => { },
  filters = { categories: [], colors: [], sizes: [], brands: [], priceRange: [0, 0] },
  appliedFilters = { categories: [], colors: [], sizes: [], brands: [], priceRange: [0, 0] },
  updateFilters = () => { },
  applyFilters = () => { },
  clearFilters = () => { }
}) => {
  const [expandedSections, setExpandedSections] = useState({
    price: true,
    colors: true,
    size: true,
    brand: true
  });

  // Use constants from imported file
  const categories = CATEGORIES;
  const colors = COLORS;
  const sizes = SIZES;
  const brands = BRANDS;

  const toggleCategory = (category) => {
    const newCategories = filters.categories.includes(category)
      ? filters.categories.filter(c => c !== category)
      : [...filters.categories, category];
    updateFilters('categories', newCategories);
  };

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

  const toggleBrand = (brand) => {
    const newBrands = filters.brands.includes(brand)
      ? filters.brands.filter(b => b !== brand)
      : [...filters.brands, brand];
    updateFilters('brands', newBrands);
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
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold">Filters</h2>
        {isMobile ? (
          <button
            onClick={onClose}
            className="text-white hover:text-gray-300 p-1"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        ) : (
          <SlidersHorizontal className="w-5 h-5" />
        )}
      </div>

      {/* Categories */}
      <div className="mb-6">
        <div className="space-y-2">
          {categories.map((category) => (
            <div
              key={category}
              className="flex items-center justify-between py-2 cursor-pointer hover:text-white transition-colors"
              onClick={() => toggleCategory(category)}
            >
              <span className={`text-sm ${filters.categories.includes(category) ? 'text-white font-semibold' : 'text-gray-400'}`}>
                {category} {filters.categories.includes(category) && '✓'}
              </span>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </div>
          ))}
        </div>
      </div>

      {/* Price */}
      <div className="mb-6">
        <button
          className="flex items-center justify-between w-full mb-4 text-white hover:text-gray-300 transition-colors"
          onClick={() => toggleSection('price')}
        >
          <h3 className="text-base font-semibold">Price</h3>
          <motion.div
            animate={{ rotate: expandedSections.price ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
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
                <div className="relative h-1 bg-gray-700 rounded-full mb-4">
                  <div
                    className="absolute h-full bg-white rounded-full"
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
                    style={{ background: 'transparent' }}
                  />
                  <input
                    type="range"
                    min="0"
                    max={PRICE_RANGE[1]}
                    value={filters.priceRange[1]}
                    onChange={(e) => updatePriceRange([filters.priceRange[0], Math.max(parseInt(e.target.value), filters.priceRange[0])])}
                    className="absolute w-full h-1 bg-transparent appearance-none pointer-events-auto cursor-pointer"
                    style={{ background: 'transparent' }}
                  />
                </div>
                <div className="flex justify-between text-sm">
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
          className="flex items-center justify-between w-full mb-4 text-white hover:text-gray-300 transition-colors"
          onClick={() => toggleSection('colors')}
        >
          <h3 className="text-base font-semibold">Colors</h3>
          <motion.div
            animate={{ rotate: expandedSections.colors ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
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
                    className={`w-10 h-10 rounded-full relative border-2 border-white ${color.class} ${filters.colors.includes(color.name) ? 'ring-2 ring-white ring-offset-2 ring-offset-black' : ''}`}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {filters.colors.includes(color.name) && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute inset-0 flex items-center justify-center"
                      >
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
          className="flex items-center justify-between w-full mb-3 text-white hover:text-gray-300 transition-colors"
          onClick={() => toggleSection('size')}
        >
          <h3 className="text-base font-semibold">Size</h3>
          <motion.div
            animate={{ rotate: expandedSections.size ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
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
                        : 'bg-gray-800 text-white hover:bg-gray-700'
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
        <button
          className="flex items-center justify-between w-full mb-3 text-white hover:text-gray-300 transition-colors"
          onClick={() => toggleSection('brand')}
        >
          <h3 className="text-base font-semibold">Brand</h3>
          <motion.div
            animate={{ rotate: expandedSections.brand ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="w-5 h-5" />
          </motion.div>
        </button>
        <AnimatePresence>
          {expandedSections.brand && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="space-y-3">
                {brands.map((brand) => (
                  <label key={brand} className="flex items-center space-x-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={filters.brands.includes(brand)}
                      onChange={() => toggleBrand(brand)}
                      className="w-4 h-4 rounded border-gray-600 bg-gray-800 text-[#bdf800] focus:ring-[#bdf800] focus:ring-offset-0 cursor-pointer"
                    />
                    <span className={`text-sm group-hover:text-white transition-colors ${filters.brands.includes(brand) ? 'text-white font-semibold' : 'text-gray-300'}`}>
                      {brand}
                    </span>
                  </label>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <motion.button
        onClick={applyFilters}
        className="w-full bg-black text-white font-medium py-3 rounded-full border border-white hover:bg-white hover:text-black transition-colors duration-300"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        Apply Filter
      </motion.button>


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
