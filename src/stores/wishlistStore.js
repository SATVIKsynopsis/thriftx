import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import toast from 'react-hot-toast';

const useWishlistStore = create(
  persist(
    (set, get) => ({
      wishlistItems: [],

      // Set current user ID for filtering
      setCurrentUser: (userId) => {
        set((state) => ({
          ...state,
          currentUserId: userId
        }));
      },

      // Clear current user (for logout)
      clearCurrentUser: () => {
        set((state) => ({
          ...state,
          currentUserId: null
        }));
      },

      // Add item to wishlist
      addToWishlist: (product, currentUser) => {
        if (!currentUser) {
          toast.error('Please login to add items to wishlist');
          return false;
        }

        set((state) => {
          const existingItem = state.wishlistItems.find(item => item.id === product.id && item.userId === currentUser.uid);

          if (existingItem) {
            toast.info('Item already in wishlist');
            return state;
          }

          const newItem = {
            id: product.id,
            name: product.name,
            price: product.price,
            originalPrice: product.originalPrice,
            images: product.images,
            category: product.category,
            brand: product.brand,
            condition: product.condition,
            rating: product.rating,
            reviews: product.reviews,
            addedAt: new Date().toISOString(),
            userId: currentUser.uid
          };

          toast.success('Item added to wishlist');
          return {
            wishlistItems: [...state.wishlistItems, newItem],
            currentUserId: currentUser.uid
          };
        });

        return true;
      },

      // Remove item from wishlist
      removeFromWishlist: (productId, currentUser) => {
        if (!currentUser) {
          toast.error('Please login to manage wishlist');
          return false;
        }

        set((state) => {
          const filteredItems = state.wishlistItems.filter(item => !(item.id === productId && item.userId === currentUser.uid));

          if (filteredItems.length === state.wishlistItems.length) {
            toast.error('Item not found in wishlist');
            return state;
          }

          toast.success('Item removed from wishlist');
          return {
            wishlistItems: filteredItems
          };
        });

        return true;
      },

      // Toggle wishlist item
      toggleWishlist: (product, currentUser) => {
        if (!currentUser) {
          toast.error('Please login to manage wishlist');
          return false;
        }

        const state = get();
        const existingItem = state.wishlistItems.find(item => item.id === product.id && item.userId === currentUser.uid);

        if (existingItem) {
          return get().removeFromWishlist(product.id, currentUser);
        } else {
          return get().addToWishlist(product, currentUser);
        }
      },

      // Check if item is in wishlist for current user
      isInWishlist: (productId, currentUser) => {
        if (!currentUser) return false;
        const state = get();
        return state.wishlistItems.some(item => item.id === productId && item.userId === currentUser.uid);
      },

      // Get wishlist items for current user
      getWishlistItems: (currentUser) => {
        if (!currentUser) {
          return [];
        }

        const state = get();
        return state.wishlistItems.filter(item => item.userId === currentUser.uid);
      },

      // Clear wishlist for current user
      clearWishlist: (currentUser) => {
        if (!currentUser) {
          toast.error('Please login to manage wishlist');
          return false;
        }

        set((state) => ({
          wishlistItems: state.wishlistItems.filter(item => item.userId !== currentUser.uid)
        }));

        toast.success('Wishlist cleared');
        return true;
      },

      // Get wishlist count for current user
      getWishlistCount: (currentUser) => {
        return get().getWishlistItems(currentUser).length;
      }
    }),
    {
      name: 'wishlist-storage',
      // Custom serialization to handle user-specific data
      partialize: (state) => ({
        wishlistItems: state.wishlistItems
      }),
      // Custom deserialization to filter by current user
      onRehydrateStorage: () => (state) => {
        if (state && state.currentUserId) {
          // Filter items to only show current user's items
          state.wishlistItems = state.wishlistItems.filter(item => item.userId === state.currentUserId);
        }
      }
    }
  )
);

export default useWishlistStore;
