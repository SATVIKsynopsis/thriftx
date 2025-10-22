import { useState, useEffect, useMemo } from 'react';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { productMatchesCategory } from '@/utils/categoryUtils';
import { searchProducts } from '@/utils/fuzzySearch';

export const useProductSearch = (filters = {}) => {
    const [allProducts, setAllProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const {
        searchQuery = '',
        category = '',
        condition = '',
        minPrice = '',
        maxPrice = '',
        sortBy = 'relevance'
    } = filters;

    useEffect(() => {
        const fetchAllProducts = async () => {
            setLoading(true);
            setError(null);
            try {
                const q = query(
                    collection(db, 'products'),
                    orderBy('createdAt', 'desc')
                );
                const snapshot = await getDocs(q);
                const products = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setAllProducts(products);
            } catch (err) {
                console.error('Error fetching products:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchAllProducts();
    }, []);

    // Filter and sort products
    const filteredProducts = useMemo(() => {
        let results = [...allProducts];

        // Apply fuzzy search
        if (searchQuery.trim()) {
            results = searchProducts(results, searchQuery);
        }

        // Apply category filter
        if (category) {
            results = results.filter(p => productMatchesCategory(p, category));
        }

        // Apply condition filter
        if (condition) {
            results = results.filter(p => p.condition === condition);
        }

        // Apply price filters
        if (minPrice) {
            results = results.filter(p => p.price >= parseFloat(minPrice));
        }
        if (maxPrice) {
            results = results.filter(p => p.price <= parseFloat(maxPrice));
        }

        // Apply sorting
        switch (sortBy) {
            case 'relevance':
                if (!searchQuery.trim()) {
                    results.sort((a, b) => {
                        const dateA = a.createdAt?.seconds || 0;
                        const dateB = b.createdAt?.seconds || 0;
                        return dateB - dateA;
                    });
                }
                break;
            case 'price-low':
                results.sort((a, b) => a.price - b.price);
                break;
            case 'price-high':
                results.sort((a, b) => b.price - a.price);
                break;
            case 'name':
                results.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
                break;
            case 'newest':
                results.sort((a, b) => {
                    const dateA = a.createdAt?.seconds || 0;
                    const dateB = b.createdAt?.seconds || 0;
                    return dateB - dateA;
                });
                break;
            default:
                break;
        }

        return results;
    }, [allProducts, searchQuery, category, condition, minPrice, maxPrice, sortBy]);

    return {
        products: filteredProducts,
        loading,
        error,
        totalProducts: allProducts.length,
        resultCount: filteredProducts.length
    };
};

export default useProductSearch;
