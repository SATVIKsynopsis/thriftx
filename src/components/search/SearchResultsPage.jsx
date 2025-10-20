"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import useWishlistStore from '@/stores/wishlistStore';
import ProductGrid from '@/components/products/ProductGrid';
import Pagination from '@/components/common/Pagination';
import { PRODUCTS_PER_PAGE, SORT_OPTIONS } from '@/utils/filterConstants';
import { getSortedProducts } from '@/utils/productUtils';
import { getSmartBackPath, trackNavigation } from '@/utils/navigationUtils';
import { getCategoryDisplayName } from '@/utils/categoryUtils';
import { NAVIGATION_CONTEXTS } from '@/utils/navigationContextUtils';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { useProductSearch } from '@/hooks/useProductSearch';

const SearchResultsPage = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const searchQuery = searchParams.get('q') || '';
  const categoryQuery = searchParams.get('category') || '';

  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState('Most Popular');

  const getDisplayTitle = () => {
    if (categoryQuery) {
      return getCategoryDisplayName(categoryQuery);
    }
    if (searchQuery) {
      return `"${searchQuery}"`;
    }
    return 'Products';
  };

  // Use the existing product search hook
  const { products: searchResults, loading } = useProductSearch({
    searchQuery: searchQuery.trim() || undefined,
    category: categoryQuery || undefined,
    sortBy: sortBy.toLowerCase().replace(' ', '-')
  });

  const { currentUser } = useAuth();
  const { getWishlistItems, setCurrentUser, clearCurrentUser } = useWishlistStore();

  // Get smart back navigation path
  const getBackNavigation = () => {
    // Check if user came from home page trending finds
    const fromHome = typeof window !== 'undefined' && sessionStorage.getItem('search_from_home');
    const searchContext = typeof window !== 'undefined' && sessionStorage.getItem('search_context');

    if (fromHome === 'true') {
      // Clear the context after using it
      sessionStorage.removeItem('search_from_home');
      sessionStorage.removeItem('search_context');
      return '/';
    }

    // Use smart navigation utility for other cases
    return getSmartBackPath('/search');
  };

  const handleBackNavigation = () => {
    const backPath = getBackNavigation();
    router.push(backPath);
  };

  // Handle auth state changes for wishlist
  useEffect(() => {
    if (currentUser) {
      setCurrentUser(currentUser.uid);
    } else {
      clearCurrentUser();
    }
  }, [currentUser, setCurrentUser, clearCurrentUser]);

  // Reset to first page when search parameters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, categoryQuery]);

  // Get wishlist items for current user
  const wishlistItems = useMemo(() => {
    if (!currentUser) return [];
    return getWishlistItems(currentUser);
  }, [currentUser, getWishlistItems]);

  // Convert wishlist items to favorite IDs for backward compatibility
  const favorites = useMemo(() => {
    return wishlistItems.map(item => item.id);
  }, [wishlistItems]);

  // Sort and paginate products
  const sortedProducts = useMemo(() => {
    return getSortedProducts(searchResults, sortBy);
  }, [searchResults, sortBy]);

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

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white">
        <div className="max-w-7xl mx-auto p-8">
          <LoadingSpinner>
            <div className="loading-spinner" />
            Searching products...
          </LoadingSpinner>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-7xl mx-auto p-4 md:p-8">
        {/* Search Header */}
        <div className="mb-8">
          {/* Back Navigation */}
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={handleBackNavigation}
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
              aria-label="Go back"
            >
              <ArrowLeft size={20} />
              <span className="text-sm">Back</span>
            </button>
          </div>

          <h1 className="text-3xl font-bold mb-2">
            {getDisplayTitle()}
          </h1>
          <p className="text-gray-400">
            {paginationInfo.totalProducts > 0
              ? `Found ${paginationInfo.totalProducts} product${paginationInfo.totalProducts !== 1 ? 's' : ''}`
              : 'No products found'
            }
          </p>
        </div>

        {/* Controls */}
        {searchResults.length > 0 && (
          <div className="flex items-center justify-between mb-6 p-4 bg-gray-900 rounded-xl">
            <span className="text-sm text-gray-400">
              Showing {paginationInfo.startProduct}-{paginationInfo.endProduct} of {paginationInfo.totalProducts} products
            </span>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-400">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-black text-white border border-gray-700 rounded px-3 py-1 text-sm focus:outline-none focus:border-gray-500"
              >
                {SORT_OPTIONS.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Search Results */}
        {searchResults.length > 0 ? (
          <>
            <ProductGrid
              products={paginatedProducts}
              loading={loading}
              favorites={favorites}
              renderStars={renderStars}
              onClearFilters={() => {}} // Not needed for search results
              sectionContext={categoryQuery ? NAVIGATION_CONTEXTS.CATEGORY : NAVIGATION_CONTEXTS.SEARCH}
            />

            {/* Pagination */}
            {paginationInfo.totalPages > 1 && (
              <div className="mt-8">
                <Pagination
                  paginationInfo={paginationInfo}
                  onPageChange={setCurrentPage}
                />
              </div>
            )}
          </>
        ) : (
          /* No Results */
          <div className="text-center py-16">
            <div className="mb-6">
              <svg className="mx-auto h-24 w-24 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-medium text-gray-300 mb-2">No products found</h3>
            <p className="text-gray-500 mb-6">
              We couldn't find any products matching "{searchQuery}". Try different keywords or browse our categories.
            </p>
            <div className="space-y-3">
              <p className="text-sm text-gray-400">Suggestions:</p>
              <ul className="text-sm text-gray-500 space-y-1">
                <li>• Check your spelling</li>
                <li>• Try different keywords</li>
                <li>• Browse by category instead</li>
              </ul>
            </div>
            <div className="mt-8">
              <button
                onClick={handleBackNavigation}
                className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
              >
                <ArrowLeft size={16} />
                Go Back
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchResultsPage;
