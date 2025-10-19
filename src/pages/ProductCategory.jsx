'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { SlidersHorizontal } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import FilterPage from './FilterPage';
import { useProductFiltering } from '@/hooks/useProductFiltering';
import { getSortedProducts } from '@/utils/productUtils';
import { PRODUCTS_PER_PAGE, SORT_OPTIONS } from '@/utils/filterConstants';
import ProductGrid from '@/components/products/ProductGrid';
import ActiveFilters from '@/components/products/ActiveFilters';
import Pagination from '@/components/common/Pagination';

const ProductsPage = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState('Most Popular');
  const [favorites, setFavorites] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Use the custom hook for product filtering
  const {
    filteredProducts,
    loading,
    filters,
    appliedFilters,
    activeFilterCount,
    updateFilters,
    applyFilters,
    clearFilters,
    PRICE_RANGE
  } = useProductFiltering();

  // Detect screen size
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (!mobile) {
        setShowFilters(true);
      } else {
        setShowFilters(false);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Apply current page reset when filters change
  const handleApplyFilters = () => {
    applyFilters();
    setCurrentPage(1);
    if (isMobile) {
      setShowFilters(false);
    }
  };

  // Apply current page reset when clearing filters
  const handleClearFilters = () => {
    clearFilters();
    setCurrentPage(1);
  };

  const sortedProducts = useMemo(() => {
    return getSortedProducts(filteredProducts, sortBy);
  }, [filteredProducts, sortBy]);

  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * PRODUCTS_PER_PAGE;
    return sortedProducts.slice(startIndex, startIndex + PRODUCTS_PER_PAGE);
  }, [sortedProducts, currentPage]);

  const paginationInfo = useMemo(() => {
    const totalProducts = sortedProducts.length;
    const totalPages = Math.ceil(totalProducts / PRODUCTS_PER_PAGE);
    const startProduct = totalProducts === 0 ? 0 : (currentPage - 1) * PRODUCTS_PER_PAGE + 1;
    const endProduct = Math.min(currentPage * PRODUCTS_PER_PAGE, totalProducts);

    return {
      totalProducts,
      totalPages,
      startProduct,
      endProduct,
      currentPage
    };
  }, [sortedProducts.length, currentPage]);

  const toggleFavorite = (id) => {
    setFavorites(prev =>
      prev.includes(id)
        ? prev.filter(fav => fav !== id)
        : [...prev, id]
    );
  };

  const renderStars = (rating) => {
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

  return (
    <div className="flex min-h-screen bg-black text-white">
      {/* Filter Sidebar - Desktop */}
      {showFilters && !isMobile && (
        <div className="w-80 border-r border-gray-800 overflow-y-auto">
          <FilterPage
            filters={filters}
            appliedFilters={appliedFilters}
            updateFilters={updateFilters}
            applyFilters={handleApplyFilters}
            clearFilters={handleClearFilters}
          />
        </div>
      )}

      {/* Mobile Filter Overlay */}
      <AnimatePresence>
        {showFilters && isMobile && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-75 z-40"
              onClick={() => setShowFilters(false)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed right-0 top-0 h-full w-80 bg-black border-l border-gray-800 z-50 overflow-y-auto"
            >
              <FilterPage
                isMobile={isMobile}
                onClose={() => setShowFilters(false)}
                filters={filters}
                appliedFilters={appliedFilters}
                updateFilters={updateFilters}
                applyFilters={handleApplyFilters}
                clearFilters={handleClearFilters}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 lg:p-6 border-b border-gray-800">
          <h1 className="text-xl lg:text-2xl font-bold">Casual</h1>
          
          <div className="flex items-center gap-2 lg:gap-4">
            <span className="text-xs lg:text-sm text-gray-400 hidden sm:inline">
              Showing {paginationInfo.startProduct}-{paginationInfo.endProduct} of {paginationInfo.totalProducts} Products
            </span>
            <div className="flex items-center gap-2">
              <span className="text-xs lg:text-sm text-gray-400 hidden md:inline">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-black text-white border border-gray-700 rounded px-2 lg:px-3 py-1 text-xs lg:text-sm focus:outline-none focus:border-gray-500"
              >
                {SORT_OPTIONS.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>
            
            {!showFilters && (
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="relative p-2 hover:bg-gray-900 rounded-lg transition-colors"
                aria-label="Open filters"
              >
                <SlidersHorizontal className="w-5 h-5" />
                {activeFilterCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#bdf800] text-black text-xs font-bold rounded-full flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Products Grid Container */}
        <div className="flex-1 p-4 lg:p-6">
          <ActiveFilters
            appliedFilters={appliedFilters}
            onClearAll={clearFilters}
            PRICE_RANGE={PRICE_RANGE}
          />

          <ProductGrid
            products={paginatedProducts}
            loading={loading}
            favorites={favorites}
            onToggleFavorite={toggleFavorite}
            renderStars={renderStars}
            onClearFilters={clearFilters}
          />
        </div>

        {/* Pagination */}
        <Pagination
          paginationInfo={paginationInfo}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  );
};

export default ProductsPage;
