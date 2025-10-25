"use client";

import { useState, useEffect, useRef, useDeferredValue } from "react";
import { Cross2Icon, MagnifyingGlassIcon } from "@radix-ui/react-icons";
import { motion, AnimatePresence } from 'motion/react';
import { collection, query, getDocs, limit, orderBy } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { useRouter } from 'next/navigation';
import {SearchResultItem} from '@/components/products/SearchResult';

export const SearchComponent = () => {
  const navigate = useRouter();
  const [input, setInput] = useState("");
  const [searchResults, setSearchResults] = useState({
    products: [],
    byCategory: {}
  });
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isFocused, setIsFocused] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState('all');

  const searchContainerRef = useRef(null);
  const inputRef = useRef(null);
  const deferredInput = useDeferredValue(input);

  const searchProducts = async (searchQuery) => {
    if (!searchQuery.trim()) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const productsRef = collection(db, 'products');
      const q = query(productsRef, orderBy('createdAt', 'desc'), limit(100));
      const querySnapshot = await getDocs(q);

      const allProducts = [];
      const categorizedProducts = {};
      const searchLower = searchQuery.toLowerCase().trim();

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
          createdAt: data.createdAt
        };

        const nameLower = product.name.toLowerCase();
        const descLower = product.description.toLowerCase();
        const categoryLower = product.category.toLowerCase();
        const brandLower = (product.brand || '').toLowerCase();

        const directMatch =
          nameLower.includes(searchLower) ||
          descLower.includes(searchLower) ||
          categoryLower.includes(searchLower) ||
          brandLower.includes(searchLower);

        const searchWords = searchLower.split(/\s+/).filter(word => word.length > 0);
        const fuzzyMatch = searchWords.length > 0 && searchWords.every(word =>
          nameLower.includes(word) ||
          descLower.includes(word) ||
          categoryLower.includes(word) ||
          brandLower.includes(word)
        );

        if (directMatch || fuzzyMatch) {
          allProducts.push(product);

          const categoryKey = product.category || 'Other';
          if (!categorizedProducts[categoryKey]) {
            categorizedProducts[categoryKey] = [];
          }
          categorizedProducts[categoryKey].push(product);
        }
      });

      setSearchResults({
        products: allProducts,
        byCategory: categorizedProducts
      });
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults({
        products: [],
        byCategory: {}
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (deferredInput.length > 0) {
      setShowResults(true);
      setSelectedIndex(-1);
      searchProducts(deferredInput);
    } else {
      setSearchResults({
        products: [],
        byCategory: {}
      });
      setShowResults(false);
      setSelectedIndex(-1);
    }
    setActiveCategory('all');
  }, [deferredInput]);

  const getCurrentProducts = () => {
    if (activeCategory === 'all') {
      return searchResults.products;
    }
    return searchResults.byCategory[activeCategory] || [];
  };

  useEffect(() => {
    const handleKeyPress = (event) => {
      if (!showResults) return;

      const currentResults = getCurrentProducts();

      switch (event.code) {
        case "ArrowDown":
          event.preventDefault();
          setSelectedIndex((prevIndex) =>
            prevIndex < currentResults.length - 1 ? prevIndex + 1 : 0
          );
          break;
        case "ArrowUp":
          event.preventDefault();
          setSelectedIndex((prevIndex) =>
            prevIndex > 0 ? prevIndex - 1 : currentResults.length - 1
          );
          break;
        case "Enter":
          event.preventDefault();
          if (selectedIndex !== -1 && currentResults[selectedIndex]) {
            handleProductClick(currentResults[selectedIndex]); 
          } else if (input.trim()) {
            navigateToSearchPage(); 
          }
          break;
        case "Escape":
          setShowResults(false);
          setIsFocused(false);
          inputRef.current?.blur();
          break;
        default:
          break;
      }
    };

    if (isFocused && showResults) {
      window.addEventListener("keydown", handleKeyPress);
    }

    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [showResults, selectedIndex, isFocused, activeCategory, input, getCurrentProducts]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setShowResults(false);
        setIsFocused(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleFocus = () => {
    setIsFocused(true);
    if (input.length > 0) {
      setShowResults(true);
    }
  };

  const handleInputChange = (e) => {
    setInput(e.target.value);
  };

  const clearSearch = () => {
    setInput("");
    setSearchResults({
      products: [],
      byCategory: {}
    });
    setShowResults(false);
    setSelectedIndex(-1);
    setActiveCategory('all');
    inputRef.current?.focus();
  };

  const handleProductClick = (product) => {
    navigate.push(`/product/${product.id}`);
    setShowResults(false);
    setInput("");
  };

  const navigateToSearchPage = () => {
    if (input.trim()) {
      navigate.push(`/search?q=${encodeURIComponent(input.trim())}`);
      setShowResults(false);
      setInput("");
    }
  };

  const handleViewAllResults = () => {
    navigateToSearchPage();
  };

  const categories = ['all', ...Object.keys(searchResults.byCategory)];
  const totalResults = searchResults.products.length;

  return (
    <div ref={searchContainerRef} className="relative w-full">
      <div className="relative">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none z-10" />
        <input
          ref={inputRef}
          type="text"
          placeholder="Search for products..."
          value={input}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && selectedIndex === -1 && input.trim()) {
              e.preventDefault();
              navigateToSearchPage();
            }
          }}
          className="w-full pl-10 pr-10 py-2 border-2 border-gray-200 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all rounded-full bg-white dark:bg-zinc-900 dark:border-gray-700 dark:text-white"
        />
        {input && (
          <button
            onClick={clearSearch}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors z-10"
          >
            <Cross2Icon className="h-4 w-4 text-gray-400" />
          </button>
        )}
      </div>

      <AnimatePresence>
        {showResults && (totalResults > 0 || isLoading) && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-zinc-900 rounded-xl shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden z-50"
          >
            {totalResults > 0 && (
              <div className="flex overflow-x-auto border-b border-gray-100 dark:border-gray-800 p-2 gap-2">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => {
                      setActiveCategory(category);
                      setSelectedIndex(-1);
                    }}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${activeCategory === category
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200'
                        : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
                      }`}
                  >
                    {category === 'all' ? 'All' : category} (
                    {category === 'all'
                      ? searchResults.products.length
                      : (searchResults.byCategory[category]?.length || 0)
                    })
                  </button>
                ))}
              </div>
            )}

            <div className="overflow-y-auto max-h-80">
              {isLoading && (
                <div className="p-8 text-center text-gray-500">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-3"></div>
                  <p className="text-sm">Searching products...</p>
                </div>
              )}

              {!isLoading && getCurrentProducts().length > 0 && (
                <AnimatePresence initial={false}>
                  <div className="p-2 space-y-1">
                    {getCurrentProducts().slice(0, 8).map((product, index) => (
                      <SearchResultItem 
                        key={product.id}
                        product={product}
                        onClick={handleProductClick} 
                        isSelected={index === selectedIndex}
                      />
                    ))}
                  </div>
                </AnimatePresence>
              )}

              {!isLoading && totalResults === 0 && input.length > 0 && (
                <div className="p-8 text-center text-gray-500">
                  <MagnifyingGlassIcon className="mx-auto h-12 w-12 text-gray-300 dark:text-gray-600 mb-3" />
                  <p className="font-medium">No products found for "{input}"</p>
                  <p className="text-sm mt-1">Try different keywords or browse categories</p>
                </div>
              )}
            </div>

            {!isLoading && totalResults > 0 && (
              <div className="border-t border-gray-100 dark:border-gray-800 p-3">
                <button
                  onClick={handleViewAllResults}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors text-sm"
                >
                  View All {totalResults} Results
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SearchComponent;