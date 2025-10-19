import React from 'react';
import { Heart } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import useWishlistStore from '@/stores/wishlistStore';
import { useRouter, usePathname } from 'next/navigation';
import toast from 'react-hot-toast';
import { setReferrer, trackNavigation } from '@/utils/navigationUtils';
import { setNavigationContext, NAVIGATION_CONTEXTS } from '@/utils/navigationContextUtils';

const ProductCard = ({ product, isFavorite, renderStars, sectionContext }) => {
  const { currentUser } = useAuth();
  const { addToCart } = useCart();
  const router = useRouter();
  const { toggleWishlist, isInWishlist } = useWishlistStore();

  const isInWishlistCheck = currentUser ? isInWishlist(product.id, currentUser) : false;

  const handleAddToCart = async (e) => {
    e.stopPropagation();
    if (!currentUser) {
      toast.error('Please login to add items to cart');
      router.push('/login');
      return;
    }

    try {
      await addToCart(product, 1);
    } catch (error) {
      toast.error('Failed to add item to cart');
    }
  };

  const handleWishlistToggle = (e) => {
    e.stopPropagation();
    if (!currentUser) {
      toast.error('Please login to manage wishlist');
      router.push('/login');
      return;
    }

    toggleWishlist(product, currentUser);
  };

  const handleViewProduct = (e) => {
    e.stopPropagation();

    const currentPath = window.location.pathname;
    let contextType = sectionContext || NAVIGATION_CONTEXTS.HOME; // Use prop or default

    // If no section context provided, determine based on current path
    if (!sectionContext) {
      if (currentPath === '/' || currentPath.includes('trending') || currentPath.includes('home')) {
        contextType = NAVIGATION_CONTEXTS.TRENDING_FINDS;
      } else if (currentPath === '/browse') {
        contextType = NAVIGATION_CONTEXTS.BROWSE;
      } else if (currentPath === '/search') {
        contextType = NAVIGATION_CONTEXTS.SEARCH;
      } else if (currentPath === '/category') {
        contextType = NAVIGATION_CONTEXTS.CATEGORY;
      } else if (currentPath === '/wishlist') {
        contextType = NAVIGATION_CONTEXTS.WISHLIST;
      }
    }

    // Set navigation context using the new utility
    setNavigationContext(contextType);

    // Track navigation for smart back functionality
    trackNavigation(currentPath, `/product/${product.id}`);

    // Set referrer for fallback compatibility
    setReferrer(currentPath);

    router.push(`/product/${product.id}`);
  };

  const defaultRenderStars = (rating) => {
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

  const starsFunction = renderStars || defaultRenderStars;
  return (
    <div
      className="bg-gray-900 rounded-2xl overflow-hidden hover:transform hover:scale-105 transition-transform duration-200 cursor-pointer"
      onClick={handleViewProduct}
    >
      <div className="relative w-full h-64 overflow-hidden">
        {product.images && product.images.length > 0 ? (
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextElementSibling.style.display = 'flex';
            }}
          />
        ) : null}
        <div
          className={`absolute inset-0 flex items-center justify-center text-white text-sm bg-gradient-to-br from-slate-600 to-slate-700 ${
            product.images && product.images.length > 0 ? 'hidden' : 'flex'
          }`}
        >
          No Image Available
        </div>

        <div className="absolute top-3 left-3">
          <span className="bg-pink-600 text-white text-xs font-semibold px-3 py-1 rounded">
            {product.category}
          </span>
        </div>

        <button
          onClick={handleWishlistToggle}
          aria-label={`${isInWishlistCheck ? 'Remove from' : 'Add to'} wishlist`}
          className="absolute top-3 right-3 w-9 h-9 bg-white rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
        >
          <Heart
            className={`w-5 h-5 ${isInWishlistCheck ? 'fill-red-500 text-red-500' : 'text-black'}`}
          />
        </button>

        <div className="absolute bottom-3 left-3">
          <span className="bg-lime-400 text-black text-xs font-bold px-3 py-1 rounded">
            {product.brand}
          </span>
        </div>
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-base mb-1">{product.name}</h3>
        <p className="text-gray-400 text-xs mb-3">{product.condition}</p>

        <div className="flex items-center justify-between mb-2">
          <span className="text-lime-400 text-xl font-bold">{product.price}</span>
          <span className="text-gray-500 text-sm line-through">{product.originalPrice}</span>
        </div>

        <div className="flex items-center gap-2">
          {starsFunction(product.rating)}
          <span className="text-gray-400 text-xs">({product.reviews})</span>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
