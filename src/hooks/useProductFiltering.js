import { useState, useEffect, useMemo } from 'react';
import { collection, query, getDocs } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { PRICE_RANGE } from '@/utils/filterConstants';
import { filterProducts, hasActiveFilters, getActiveFilterCount } from '@/utils/productUtils';

export const useProductFiltering = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [filters, setFilters] = useState({
    categories: [],
    colors: [],
    sizes: [],
    brands: [],
    priceRange: PRICE_RANGE
  });

  // Fetch products from Firebase
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        const productsQuery = query(collection(db, 'products'));
        const snapshot = await getDocs(productsQuery);
        const fetchedProducts = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setProducts(fetchedProducts);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError(err.message);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Filter products based on current filters (automatic filtering)
  const filteredProducts = useMemo(() => {
    const hasFiltersActive = hasActiveFilters(filters, filters.priceRange, PRICE_RANGE);

    if (!hasFiltersActive) {
      return products;
    }

    return filterProducts(products, filters, filters.priceRange);
  }, [products, filters]);

  // Filter management functions
  const updateFilters = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const clearFilters = () => {
    const resetState = {
      categories: [],
      colors: [],
      sizes: [],
      brands: [],
      priceRange: PRICE_RANGE
    };
    setFilters(resetState);
  };

  // Active filter count for UI
  const activeFilterCount = useMemo(() => {
    return getActiveFilterCount(filters, filters.priceRange, PRICE_RANGE);
  }, [filters]);

  return {
    // Data
    products,
    filteredProducts,
    loading,
    error,

    // Filter state
    filters,
    activeFilterCount,

    // Filter actions
    updateFilters,
    clearFilters,

    // Constants
    PRICE_RANGE
  };
};

export default useProductFiltering;
