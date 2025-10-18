"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { collection, getDocs, orderBy, limit, query } from 'firebase/firestore';
import { Sparkles, TrendingUp, ArrowRight } from 'lucide-react';
import { db } from '@/firebase/config';
import ProductCard from '@/components/products/ProductCard';
import Hero from '@/components/home/Hero';
import CategoryGrid from '@/components/home/CategoryGrid';
import Brand from '@/components/home/Brand';
import CustomerReviews from './CustomerReviews';
import TrendingFind from '@/components/home/TrendingFind';
import NewArrival from '@/components/home/NewArrival';

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
      <section className="py-16 bg-black">
        <div className="max-w-6xl mx-auto px-4 md:px-2">
          <CategoryGrid />
        </div>
      </section>

      {/* Featured Products */}
      <TrendingFind loading={loading} featuredProducts={featuredProducts} />

      {/* New Arrivals */}
      <NewArrival loading={loading} newProducts={newProducts} />

     {/* customer review */}
      <CustomerReviews  />
    </div>
  );
};

export default Home_Page;