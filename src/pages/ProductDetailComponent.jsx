"use client"; // Ensure this is a client component

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useProductDetails } from '../hooks/useProductDetails';
import { useResponsive } from '../hooks/useResponsive';
import { useCarousel } from '../hooks/useCarousel';
import { getSmartBackPath, trackNavigation, getCurrentPath } from '../utils/navigationUtils';
import { getNavigationContext, getSmartBackPath as getContextualBackPath } from '../utils/navigationContextUtils';
import ProductImageGallery from '../components/products/ProductImageGallery';
import ProductInfo from '../components/products/ProductInfo';
import RatingSection from '../components/products/RatingSection';
import ProductCarousel from '../components/products/ProductCarousel';

const ProductDetailComponent = () => {
  const params = useParams();
  const id = params.id;

  // Use custom hooks
  const productDetails = useProductDetails(id);
  const { getVisibleProducts } = useResponsive();
  const carousel = useCarousel(
    productDetails.relatedProducts.length,
    getVisibleProducts()
  );

  const [activeTab, setActiveTab] = useState('reviews');

  // Track navigation for smart back button
  useEffect(() => {
    trackNavigation(getCurrentPath(), `/product/${id}`);
  }, [id]);

  // Make goToIndex available globally for the carousel dots
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.carouselGoToIndex = carousel.goToIndex;
    }
    return () => {
      if (typeof window !== 'undefined') {
        delete window.carouselGoToIndex;
      }
    };
  }, [carousel.goToIndex]);

  // Loading state
  if (productDetails.loading) {
    return (
      <div className="max-w-7xl mx-auto p-8 md:p-12">
        <LoadingSpinner>
          <div className="loading-spinner" />
          Loading product details...
        </LoadingSpinner>
      </div>
    );
  }

  // Product not found
  if (!productDetails.product) {
    return (
      <div className="max-w-7xl mx-auto p-8 md:p-12">
        <div className="text-center py-16">
          <h2 className="text-2xl font-bold">Product not found</h2>
          <p className="mt-2 text-gray-600">The product you're looking for doesn't exist or has been removed.</p>
          <Link href="/" className="text-blue-600 underline mt-4 inline-block hover:text-blue-800">
            Go back to homepage
          </Link>
        </div>
      </div>
    );
  }

  // Get contextual back navigation data
  const getBackNavigationData = () => {
    const context = getNavigationContext();
    const backPath = getContextualBackPath(`/product/${id}`, '/');

    if (context) {
      return {
        path: backPath,
        label: `Back to ${context.displayName}`,
        showContext: true
      };
    }

    return {
      path: backPath,
      label: 'Back',
      showContext: false
    };
  };

  const backNav = getBackNavigationData();

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 sm:py-8">
        {/* Back Button */}
        <Link
          href={backNav.path}
          className="inline-flex items-center gap-2 text-gray-400 no-underline mb-6 sm:mb-8 transition duration-200 hover:text-white"
        >
          <ArrowLeft size={20} />
          <span className="text-sm sm:text-base">{backNav.label}</span>
        </Link>

        {/* Product Section */}
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 mb-8 lg:mb-12">
          {/* Image Gallery */}
          <ProductImageGallery
            images={productDetails.product?.images}
            selectedImage={productDetails.selectedImage}
            onImageSelect={productDetails.setSelectedImage}
            className="w-full lg:w-1/2"
          />

          {/* Product Info */}
          <ProductInfo
            product={productDetails.product}
            quantity={productDetails.quantity}
            selectedColor={productDetails.selectedColor}
            selectedSize={productDetails.selectedSize}
            discount={productDetails.discount}
            isOwnProduct={productDetails.isOwnProduct}
            onQuantityChange={productDetails.handleQuantityChange}
            onColorSelect={productDetails.setSelectedColor}
            onSizeSelect={productDetails.setSelectedSize}
            onAddToCart={productDetails.handleAddToCart}
            cartLoading={productDetails.cartLoading}
            className="w-full lg:w-1/2"
          />
        </div>

        {/* Rating Section with Tabs */}
        <RatingSection
          product={productDetails.product}
          activeTab={activeTab}
          userRating={productDetails.userRating}
          hoverRating={productDetails.hoverRating}
          submitting={productDetails.submitting}
          onTabChange={setActiveTab}
          onRatingSubmit={productDetails.submitRating}
          onHoverRatingChange={productDetails.setHoverRating}
        />

        {/* Related Products Carousel */}
        {productDetails.relatedProducts.length > 0 && (
          <ProductCarousel
            products={productDetails.relatedProducts}
            currentIndex={carousel.currentIndex}
            visibleProducts={getVisibleProducts()}
            onPrev={carousel.goToPrev}
            onNext={carousel.goToNext}
            onTouchStart={carousel.handleTouchStart}
            onTouchMove={carousel.handleTouchMove}
            onTouchEnd={carousel.handleTouchEnd}
            canGoPrev={carousel.canGoPrev}
            canGoNext={carousel.canGoNext}
          />
        )}
      </div>
    </div>
  );
};

export default ProductDetailComponent;
