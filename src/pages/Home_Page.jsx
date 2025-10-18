"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { collection, getDocs, orderBy, limit, query } from 'firebase/firestore';
import { Sparkles, TrendingUp, ArrowRight } from 'lucide-react';
import { db } from '@/firebase/config';
import ProductCard from '@/components/products/ProductCard';
import Hero from '@/components/home/Hero';
import CategoryGrid from '@/components/home/CategoryGrid';
import Header from '@/components/common/Header'; 
import Brand from '@/components/home/Brand';
import CustomerReviews from './CustomerReviews';

const Home_Page = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [newProducts, setNewProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const featuredQuery = query(
          collection(db, 'products'),
          orderBy('createdAt', 'desc'),
          limit(8)
        );
        const featuredSnapshot = await getDocs(featuredQuery);
        const featured = featuredSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));

        const newQuery = query(
          collection(db, 'products'),
          orderBy('createdAt', 'desc'),
          limit(8)
        );
        const newSnapshot = await getDocs(newQuery);
        const newest = newSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));

        setFeaturedProducts(featured);
        setNewProducts(newest);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <div className="min-h-screen">
      {/* Add Header component here */}      
      <Hero />
      <Brand />
      <section className="py-16">
        <div className="max-w-[1200px] mx-auto px-4 md:px-2">
          <CategoryGrid />
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16">
        <div className="max-w-[1200px] mx-auto px-4 md:px-2">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-3xl font-bold flex items-center justify-center gap-2 text-gray-900 mb-2">
              <Sparkles size={32} /> Featured Products
            </h2>
            <p className="text-gray-500 text-lg max-w-xl mx-auto">
              Discover amazing products handpicked by our community
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 mb-12">
              {[...Array(8)].map((_, index) => (
                <div
                  key={index}
                  className="bg-gray-200 rounded-xl h-72 animate-pulse"
                />
              ))}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 mb-8">
                {featuredProducts.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
              {featuredProducts.length > 0 && (
                <div className="text-center">
                  <Link
                    href="/search"
                    className="inline-flex items-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-blue-700 transition-transform transform hover:-translate-y-1"
                  >
                    View All Products <ArrowRight size={20} />
                  </Link>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* New Arrivals */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-[1200px] mx-auto px-4 md:px-2">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-3xl font-bold flex items-center justify-center gap-2 text-gray-900 mb-2">
              <TrendingUp size={32} /> New Arrivals
            </h2>
            <p className="text-gray-500 text-lg max-w-xl mx-auto">
              Fresh products just added to our marketplace
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 mb-12">
              {[...Array(8)].map((_, index) => (
                <div
                  key={index}
                  className="bg-gray-200 rounded-xl h-72 animate-pulse"
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
              {newProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>
      <CustomerReviews />
    </div>
  );
};

export default Home_Page;