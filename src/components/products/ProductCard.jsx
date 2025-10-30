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
    let contextType = sectionContext || NAVIGATION_CONTEXTS.HOME;

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

    setNavigationContext(contextType);
    trackNavigation(currentPath, `/product/${product.id}`);
    setReferrer(currentPath);
    router.push(`/product/${product.id}`);
  };

  const defaultRenderStars = (rating) => (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`w-3 h-3 ${star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-neutral-400 fill-neutral-400 dark:text-neutral-600 dark:fill-neutral-600'}`}
          viewBox="0 0 20 20"
        >
          <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
        </svg>
      ))}
    </div>
  );

  const starsFunction = renderStars || defaultRenderStars;

  return (
    <div
      className="bg-neutral-100 w-full dark:bg-neutral-900 rounded-2xl sm:w-60 md:w-72 lg:w-80 xl:w-80 max-w-full overflow-hidden hover:transform hover:scale-105 transition-transform duration-200 cursor-pointer shadow-sm dark:shadow-md"
      onClick={handleViewProduct}
    >
      <div className="relative w-full h-48 sm:h-64 overflow-hidden">
        {product.images && product.images.length > 0 ? (
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-contain transition-transform duration-300 hover:scale-105"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextElementSibling.style.display = 'flex';
            }}
          />
        ) : null}
        <div
          className={`absolute inset-0 flex items-center justify-center text-white text-sm bg-gradient-to-br from-neutral-300 to-neutral-400 dark:from-slate-600 dark:to-slate-700 ${
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
          className="absolute top-3 right-3 w-9 h-9 bg-white dark:bg-neutral-700 rounded-full flex items-center justify-center hover:bg-neutral-100 dark:hover:bg-neutral-600 transition-colors shadow-md"
        >
          <Heart
            className={`w-5 h-5 ${isInWishlistCheck ? 'fill-red-500 text-red-500' : 'text-neutral-800 dark:text-neutral-400'}`}
          />
        </button>
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-base mb-1 text-neutral-900 dark:text-white">{product.name}</h3>
        <p className="text-neutral-500 dark:text-neutral-400 text-xs mb-3">{product.condition}</p>

        <div className="flex items-center justify-between mb-2">
          <span className="text-lime-600 dark:text-lime-400 text-xl font-bold">{product.price}</span>
          <span className="text-neutral-400 dark:text-neutral-600 text-sm line-through">{product.originalPrice}</span>
        </div>

        <div className="flex items-center gap-2">
          {starsFunction(product.rating)}
          {(product.reviews && product.reviews > 0) ? (
            <span className="text-neutral-500 dark:text-neutral-400 text-xs">({product.reviews})</span>
          ) : (
            <span className="text-neutral-500 dark:text-neutral-400 text-xs">No reviews yet</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
