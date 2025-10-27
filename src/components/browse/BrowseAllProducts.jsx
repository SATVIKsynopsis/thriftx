"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { collection, query, getDocs, limit, orderBy } from 'firebase/firestore';
import { ArrowLeft, Check, ChevronsUpDown, Filter } from 'lucide-react';
import { db } from '@/firebase/config';
import { useAuth } from '@/contexts/AuthContext';
import useWishlistStore from '@/stores/wishlistStore';
import ProductGrid from '@/components/products/ProductGrid';
import Pagination from '@/components/common/Pagination';
import { PRODUCTS_PER_PAGE, SORT_OPTIONS } from '@/utils/filterConstants';
import { getSortedProducts } from '@/utils/productUtils';
import { getSmartBackPath } from '@/utils/navigationUtils';
import { NAVIGATION_CONTEXTS } from '@/utils/navigationContextUtils';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '../ui/command';
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Button } from '../ui/button';


const BrowseAllProducts = () => {
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState('Most Popular');
  const [sortPopoverOpen, setSortPopoverOpen] = useState(false);

  const { currentUser } = useAuth();
  const { getWishlistItems, setCurrentUser, clearCurrentUser } = useWishlistStore();

  // Handle auth state changes for wishlist
  useEffect(() => {
    if (currentUser) {
      setCurrentUser(currentUser.uid);
    } else {
      clearCurrentUser();
    }
  }, [currentUser, setCurrentUser, clearCurrentUser]);

  // Fetch all products
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const productsRef = collection(db, 'products');
        const q = query(productsRef, orderBy('createdAt', 'desc'), limit(500));
        const querySnapshot = await getDocs(q);

        const allProducts = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          const product = {
            id: doc.id,
            name: data.name || '',
            description: data.description || '',
            price: data.price || 0,
            category: data.category || 'Other',
            images: data.images || [],
            imageUrl: data.imageUrl || data.images?.[0] || '',
            brand: data.brand,
            condition: data.condition,
            sellerId: data.sellerId || data.userId || '',
            stock: data.stock,
            rating: data.rating || 0,
            reviews: data.reviewCount || 0,
            createdAt: data.createdAt
          };
          allProducts.push(product);
        });

        setProducts(allProducts);
      } catch (error) {
        console.error('Error fetching products:', error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
    setCurrentPage(1);
  }, []);

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
    return getSortedProducts(products, sortBy);
  }, [products, sortBy]);

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

  const handleBackNavigation = () => {
    // Check if user came from home page trending finds
    const fromHome = typeof window !== 'undefined' && sessionStorage.getItem('browse_from_home');
    const browseContext = typeof window !== 'undefined' && sessionStorage.getItem('browse_context');

    if (fromHome === 'true') {
      // Clear the context after using it
      sessionStorage.removeItem('browse_from_home');
      sessionStorage.removeItem('browse_context');
      router.push('/');
    } else {
      // Use smart navigation utility for other cases
      const backPath = getSmartBackPath('/browse');
      router.push(backPath);
    }
  };

  const renderStars = (rating) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            className={`w-3 h-3 ${star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-neutral-600 fill-neutral-600'}`}
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
            Loading all products...
          </LoadingSpinner>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-7xl mx-auto p-4 md:p-8">
        {/* Header */}
        <div className="mb-8">
          {/* Back Navigation */}
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={handleBackNavigation}
              className="flex items-center gap-2 text-neutral-400 hover:text-white transition-colors"
              aria-label="Go back"
            >
              <ArrowLeft size={20} />
              <span className="text-sm">Back</span>
            </button>
          </div>

          <h1 className="text-3xl font-bold mb-2">
            All Products
          </h1>
          <p className="text-neutral-400">
            Discover all available products
          </p>
        </div>

        {/* Controls */}
        {products.length > 0 && (
          <div className="flex items-center justify-between mb-6 p-4 bg-neutral-900 rounded-xl">
            <span className="text-sm text-neutral-400">
              Showing {paginationInfo.startProduct}-{paginationInfo.endProduct} of {paginationInfo.totalProducts} products
            </span>
            <div className="flex items-center gap-2">
              <span className="text-sm text-neutral-400">Sort by:</span>
              <Popover open={sortPopoverOpen} onOpenChange={setSortPopoverOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={sortPopoverOpen}
                    className="w-40 lg:w-[200px] justify-between text-xs lg:text-sm"
                  >
                    {sortBy || "Sort by..."}
                    <ChevronsUpDown className="ml-2 opacity-50 w-4 h-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-40 lg:w-[200px] p-0">
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
          </div>
        )}

        {/* Products Grid */}
        {products.length > 0 ? (
          <>
            <ProductGrid
              products={paginatedProducts}
              loading={loading}
              favorites={favorites}
              renderStars={renderStars}
              onClearFilters={() => { }} // Not needed for browse all
              sectionContext={NAVIGATION_CONTEXTS.BROWSE}
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
          /* No Products */
          <div className="text-center py-16">
            <div className="mb-6">
              <svg className="mx-auto h-24 w-24 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <h3 className="text-xl font-medium text-neutral-300 mb-2">No products available</h3>
            <p className="text-neutral-500 mb-6">
              There are currently no products to display. Please check back later.
            </p>
            <div className="mt-8">
              <button
                onClick={handleBackNavigation}
                className="inline-flex items-center gap-2 text-neutral-400 hover:text-white transition-colors"
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

export default BrowseAllProducts;
