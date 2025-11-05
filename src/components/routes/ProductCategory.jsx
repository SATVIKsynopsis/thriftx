'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { SlidersHorizontal, Check, ChevronsUpDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import FilterPage from './FilterPage';
import { useProductFiltering } from '@/hooks/useProductFiltering';
import { getSortedProducts } from '@/utils/productUtils';
import { PRODUCTS_PER_PAGE, SORT_OPTIONS } from '@/utils/filterConstants';
import ProductGrid from '@/components/products/ProductGrid';
import ActiveFilters from '@/components/products/ActiveFilters';
import Pagination from '@/components/common/Pagination';
import { useAuth } from '@/contexts/AuthContext';
import useWishlistStore from '@/stores/wishlistStore';
import { NAVIGATION_CONTEXTS } from '@/utils/navigationContextUtils';

//  for select drop-down
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const ProductsPage = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState('Most Popular');
  const [showFilters, setShowFilters] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [sortPopoverOpen, setSortPopoverOpen] = useState(false);

  const { currentUser } = useAuth();
  const { getWishlistItems, setCurrentUser, clearCurrentUser } = useWishlistStore();

  const {
    filteredProducts,
    loading,
    filters,
    activeFilterCount,
    availableCategories,
    availableBrands,
    availableSizes,
    availableColors,
    updateFilters,
    clearFilters,
    PRICE_RANGE
  } = useProductFiltering();

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (!mobile) setShowFilters(true);
      else setShowFilters(false);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (currentUser) setCurrentUser(currentUser.uid);
    else clearCurrentUser();
  }, [currentUser, setCurrentUser, clearCurrentUser]);



  const handleClearFilters = () => {
    clearFilters();
    setCurrentPage(1);
  };

  const sortedProducts = useMemo(() => getSortedProducts(filteredProducts, sortBy), [filteredProducts, sortBy]);
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * PRODUCTS_PER_PAGE;
    return sortedProducts.slice(startIndex, startIndex + PRODUCTS_PER_PAGE);
  }, [sortedProducts, currentPage]);

  const paginationInfo = useMemo(() => {
    const totalProducts = sortedProducts.length;
    const totalPages = Math.ceil(totalProducts / PRODUCTS_PER_PAGE);
    const startProduct = totalProducts === 0 ? 0 : (currentPage - 1) * PRODUCTS_PER_PAGE + 1;
    const endProduct = Math.min(currentPage * PRODUCTS_PER_PAGE, totalProducts);

    return { totalProducts, totalPages, startProduct, endProduct, currentPage };
  }, [sortedProducts.length, currentPage]);

  const wishlistItems = useMemo(() => (!currentUser ? [] : getWishlistItems(currentUser)), [currentUser, getWishlistItems]);
  const favorites = useMemo(() => wishlistItems.map(item => item.id), [wishlistItems]);

  const renderStars = (rating) => (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(star => (
        <svg
          key={star}
          className={`w-3 h-3 ${star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600 fill-gray-600 dark:text-gray-400 dark:fill-gray-400'}`}
          viewBox="0 0 20 20"
        >
          <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
        </svg>
      ))}
    </div>
  );

  return (
    <div className="flex min-h-screen bg-white text-black dark:bg-black dark:text-white">
      {/* Filter Sidebar - Desktop */}
      {showFilters && !isMobile && (
        <div className="w-80 border-r border-gray-200 dark:border-gray-800 overflow-y-auto max-h-screen">
          <FilterPage
            filters={filters}
            updateFilters={updateFilters}
            clearFilters={handleClearFilters}
            availableCategories={availableCategories}
            availableBrands={availableBrands}
            availableSizes={availableSizes}
            availableColors={availableColors}
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
              className="fixed inset-0 bg-black/25 dark:bg-neutral-950/25 backdrop-blur-md z-40"
              onClick={() => setShowFilters(false)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed right-0 top-20 h-[calc(100vh-5rem)] w-80 bg-white dark:bg-black border-l border-gray-200 dark:border-gray-800 z-50 overflow-y-auto"
            >
              <FilterPage
                isMobile={isMobile}
                onClose={() => setShowFilters(false)}
                filters={filters}
                updateFilters={updateFilters}
                clearFilters={handleClearFilters}
                availableCategories={availableCategories}
                availableBrands={availableBrands}
                availableSizes={availableSizes}
                availableColors={availableColors}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className={`flex-1 flex flex-col ${showFilters && isMobile ? 'blur-sm' : ''}`}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 lg:p-6 border-b border-gray-200 dark:border-gray-800">
          <h1 className="text-xl lg:text-2xl font-bold">Category</h1>

          <div className="flex items-center gap-2 lg:gap-4">
            <span className="text-xs lg:text-sm text-gray-500 dark:text-gray-400 hidden sm:inline">
              Showing {paginationInfo.startProduct}-{paginationInfo.endProduct} of {paginationInfo.totalProducts} Products
            </span>
            <div className="flex items-center gap-2">
              <span className="text-xs lg:text-sm text-gray-500 dark:text-gray-400 hidden md:inline">Sort by:</span>

              <Popover open={sortPopoverOpen} onOpenChange={setSortPopoverOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={sortPopoverOpen}
                    className="w-[160px] lg:w-[200px] justify-between text-xs lg:text-sm"
                  >
                    {sortBy || "Sort by..."}
                    <ChevronsUpDown className="ml-2 opacity-50 w-4 h-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[160px] lg:w-[200px] p-0">
                  <Command>
                    <CommandInput placeholder="Search options..." className="h-9" />
                    <CommandList>
                      <CommandEmpty>No options found.</CommandEmpty>
                      <CommandGroup>
                        {SORT_OPTIONS.map(option => (
                          <CommandItem
                            key={option}
                            value={option}
                            onSelect={(currentValue) => {
                              setSortBy(currentValue);
                              setSortPopoverOpen(false); // close after select
                            }}
                          >
                            {option}
                            <Check
                              className={cn(
                                "ml-auto",
                                sortBy === option ? "opacity-100" : "opacity-0"
                              )}
                            />
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>

            </div>

            {!showFilters && (
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="relative p-2 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-lg transition-colors"
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
            appliedFilters={filters}
            onClearAll={clearFilters}
            PRICE_RANGE={PRICE_RANGE}
          />

          <ProductGrid
            products={paginatedProducts}
            loading={loading}
            favorites={favorites}
            renderStars={renderStars}
            onClearFilters={clearFilters}
            sectionContext={NAVIGATION_CONTEXTS.CATEGORY}
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
