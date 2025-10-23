"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { collection, query, getDocs, limit, orderBy } from 'firebase/firestore';
import { ArrowLeft, Heart, Trash2, ShoppingCart , ChevronsUpDown , Check} from 'lucide-react';
import { db } from '@/firebase/config';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import useWishlistStore from '@/stores/wishlistStore';
import ProductGrid from '@/components/products/ProductGrid';
import { getSmartBackPath } from '@/utils/navigationUtils';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import toast from 'react-hot-toast';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Button } from '../ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '../ui/command';
import { cn } from "@/lib/utils";

const SORT_OPTIONS = ['Date Added', 'Price: Low to High', 'Price: High to Low', 'Name'];

const WishlistPage = () => {
  const router = useRouter();
  const { currentUser } = useAuth();
  const { addToCart } = useCart();
  const { getWishlistItems, removeFromWishlist, getWishlistCount, setCurrentUser, clearCurrentUser } = useWishlistStore();

  const [wishlistProducts, setWishlistProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('Date Added');
  const [sortPopoverOpen, setSortPopoverOpen] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setCurrentUser(currentUser.uid);
    } else {
      clearCurrentUser();
    }
  }, [currentUser, setCurrentUser, clearCurrentUser]);

  useEffect(() => {
    const fetchWishlistProducts = async () => {
      if (!currentUser) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const wishlistItems = getWishlistItems(currentUser);

        if (wishlistItems.length === 0) {
          setWishlistProducts([]);
          setLoading(false);
          return;
        }

        const productsRef = collection(db, 'products');
        const q = query(productsRef, orderBy('createdAt', 'desc'), limit(200));
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

        const wishlistProductIds = wishlistItems.map(item => item.id);
        const filteredProducts = allProducts.filter(product =>
          wishlistProductIds.includes(product.id)
        );

        const sortedProducts = filteredProducts.sort((a, b) => {
          const aWishlistItem = wishlistItems.find(item => item.id === a.id);
          const bWishlistItem = wishlistItems.find(item => item.id === b.id);
          return new Date(bWishlistItem?.addedAt || 0) - new Date(aWishlistItem?.addedAt || 0);
        });

        setWishlistProducts(sortedProducts);
      } catch (error) {
        console.error('Error fetching wishlist products:', error);
        setWishlistProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchWishlistProducts();
  }, [currentUser, getWishlistItems]);

  const handleBackNavigation = () => {
    const backPath = getSmartBackPath('/wishlist');
    router.push(backPath);
  };

  const handleRemoveFromWishlist = (productId) => {
    if (removeFromWishlist(productId, currentUser)) {
      setWishlistProducts(prev => prev.filter(product => product.id !== productId));
    }
  };

  const handleAddToCart = async (product) => {
    if (!currentUser) {
      toast.error('Please login to add items to cart');
      router.push('/login');
      return;
    }

    try {
      await addToCart(product, 1);
      toast.success('Item added to cart');
    } catch (error) {
      toast.error('Failed to add item to cart');
    }
  };

  const handleViewProduct = (productId) => {
    router.push(`/product/${productId}`);
  };

  const renderStars = (rating) => (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`w-3 h-3 ${star <= rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-400 fill-gray-400 dark:text-gray-600 dark:fill-gray-600'}`}
          viewBox="0 0 20 20"
        >
          <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
        </svg>
      ))}
    </div>
  );

  const WishlistProductCard = ({ product }) => (
    <div className="bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-lg dark:shadow-none hover:transform hover:scale-105 transition-transform duration-200 border border-gray-100 dark:border-gray-800">
      <div className="relative w-full h-64 overflow-hidden cursor-pointer" onClick={() => handleViewProduct(product.id)}>
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
        <div className={`absolute inset-0 flex items-center justify-center text-gray-700 dark:text-white text-sm bg-gray-200 dark:bg-gradient-to-br dark:from-slate-600 dark:to-slate-700 ${product.images && product.images.length > 0 ? 'hidden' : 'flex'}`}>
          No Image Available
        </div>

        <div className="absolute top-3 left-3">
          <span className="bg-pink-600 text-white text-xs font-semibold px-3 py-1 rounded">{product.category}</span>
        </div>

        <button
          onClick={(e) => { e.stopPropagation(); handleRemoveFromWishlist(product.id); }}
          className="absolute top-3 right-3 w-9 h-9 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center transition-colors"
          aria-label="Remove from wishlist"
        >
          <Trash2 className="w-5 h-5 text-white" />
        </button>

      </div>

      <div className="p-4">
        <h3 className="font-semibold text-base mb-1 cursor-pointer text-gray-900 dark:text-white hover:text-lime-500 dark:hover:text-lime-400" onClick={() => handleViewProduct(product.id)}>
          {product.name}
        </h3>
        <p className="text-gray-500 dark:text-gray-400 text-xs mb-3">{product.condition}</p>

        <div className="flex items-center justify-between mb-3">
          <span className="text-lime-600 dark:text-lime-400 text-xl font-bold">{product.price}</span>
          <span className="text-gray-400 dark:text-gray-500 text-sm line-through">{product.originalPrice}</span>
        </div>

        <div className="flex items-center gap-2 mb-3">
          {renderStars(product.rating)}
          <span className="text-gray-500 dark:text-gray-400 text-xs">({product.reviews})</span>
        </div>

        <button
          onClick={(e) => { e.stopPropagation(); handleAddToCart(product); }}
          className="w-full bg-lime-500 hover:bg-lime-600 text-gray-900 dark:text-black font-semibold py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          <ShoppingCart size={16} />
          Add to Cart
        </button>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-black text-gray-800 dark:text-white transition-colors">
        <div className="max-w-7xl mx-auto p-8">
          <LoadingSpinner>
            <div className="loading-spinner" />
            Loading wishlist...
          </LoadingSpinner>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black text-gray-900 dark:text-white transition-colors">
      <div className="max-w-7xl mx-auto p-4 md:p-8">
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <button onClick={handleBackNavigation} className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
              <ArrowLeft size={20} />
              <span className="text-sm">Back</span>
            </button>
          </div>

          <div className="flex items-center gap-3 mb-2">
            <Heart className="text-red-500" size={32} />
            <h1 className="text-3xl font-bold">My Wishlist</h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            {wishlistProducts.length > 0 ? `${wishlistProducts.length} item${wishlistProducts.length !== 1 ? 's' : ''} in your wishlist` : 'Your wishlist is empty'}
          </p>
        </div>

        {wishlistProducts.length > 0 && (
          <div className="flex items-center justify-between mb-6 p-4 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-none">
            <span className="text-sm text-gray-500 dark:text-gray-400">{wishlistProducts.length} item{wishlistProducts.length !== 1 ? 's' : ''} in wishlist</span>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500 dark:text-gray-400">Sort by:</span>

              {/* Popover implementation */}
              <Popover open={sortPopoverOpen} onOpenChange={setSortPopoverOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={sortPopoverOpen}
                    className="w-[160px] lg:w-[200px] justify-between text-xs lg:text-sm"
                  >
                    {sortBy || "Sort by..."}
                    <ChevronsUpDown className="ml-2 opacity-50 w-4 h-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[160px] lg:w-[200px] p-0">
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

        {wishlistProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {wishlistProducts.map((product) => (
              <WishlistProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="mb-6">
              <Heart className="mx-auto h-24 w-24 text-gray-400" />
            </div>
            <h3 className="text-xl font-medium text-gray-700 dark:text-gray-300 mb-2">Your wishlist is empty</h3>
            <p className="text-gray-500 mb-6">Start adding items to your wishlist by clicking the heart icon on products you love.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default WishlistPage;
























// "use client";

// import React, { useState, useEffect, useMemo } from 'react';
// import { useRouter } from 'next/navigation';
// import { collection, query, getDocs, limit, orderBy } from 'firebase/firestore';
// import { ArrowLeft, Heart, Trash2, ShoppingCart } from 'lucide-react';
// import { db } from '@/firebase/config';
// import { useAuth } from '@/contexts/AuthContext';
// import { useCart } from '@/contexts/CartContext';
// import useWishlistStore from '@/stores/wishlistStore';
// import ProductGrid from '@/components/products/ProductGrid';
// import { getSmartBackPath } from '@/utils/navigationUtils';
// import LoadingSpinner from '@/components/common/LoadingSpinner';
// import toast from 'react-hot-toast';

// const WishlistPage = () => {
//   const router = useRouter();
//   const { currentUser } = useAuth();
//   const { addToCart } = useCart();
//   const { getWishlistItems, removeFromWishlist, getWishlistCount, setCurrentUser, clearCurrentUser } = useWishlistStore();

//   const [wishlistProducts, setWishlistProducts] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [sortBy, setSortBy] = useState('Date Added');

//   useEffect(() => {
//     if (currentUser) {
//       setCurrentUser(currentUser.uid);
//     } else {
//       clearCurrentUser();
//     }
//   }, [currentUser, setCurrentUser, clearCurrentUser]);

//   useEffect(() => {
//     const fetchWishlistProducts = async () => {
//       if (!currentUser) {
//         setLoading(false);
//         return;
//       }

//       setLoading(true);
//       try {
//         const wishlistItems = getWishlistItems(currentUser);

//         if (wishlistItems.length === 0) {
//           setWishlistProducts([]);
//           setLoading(false);
//           return;
//         }

//         const productsRef = collection(db, 'products');
//         const q = query(productsRef, orderBy('createdAt', 'desc'), limit(200));
//         const querySnapshot = await getDocs(q);

//         const allProducts = [];
//         querySnapshot.forEach((doc) => {
//           const data = doc.data();
//           const product = {
//             id: doc.id,
//             name: data.name || '',
//             description: data.description || '',
//             price: data.price || 0,
//             category: data.category || 'Other',
//             images: data.images || [],
//             imageUrl: data.imageUrl || data.images?.[0] || '',
//             brand: data.brand,
//             condition: data.condition,
//             sellerId: data.sellerId || data.userId || '',
//             stock: data.stock,
//             rating: data.rating || 0,
//             reviews: data.reviewCount || 0,
//             createdAt: data.createdAt
//           };
//           allProducts.push(product);
//         });

//         const wishlistProductIds = wishlistItems.map(item => item.id);
//         const filteredProducts = allProducts.filter(product =>
//           wishlistProductIds.includes(product.id)
//         );

//         const sortedProducts = filteredProducts.sort((a, b) => {
//           const aWishlistItem = wishlistItems.find(item => item.id === a.id);
//           const bWishlistItem = wishlistItems.find(item => item.id === b.id);
//           return new Date(bWishlistItem?.addedAt || 0) - new Date(aWishlistItem?.addedAt || 0);
//         });

//         setWishlistProducts(sortedProducts);
//       } catch (error) {
//         console.error('Error fetching wishlist products:', error);
//         setWishlistProducts([]);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchWishlistProducts();
//   }, [currentUser, getWishlistItems]);

//   const handleBackNavigation = () => {
//     const backPath = getSmartBackPath('/wishlist');
//     router.push(backPath);
//   };

//   const handleRemoveFromWishlist = (productId) => {
//     if (removeFromWishlist(productId, currentUser)) {
//       setWishlistProducts(prev => prev.filter(product => product.id !== productId));
//     }
//   };

//   const handleAddToCart = async (product) => {
//     if (!currentUser) {
//       toast.error('Please login to add items to cart');
//       router.push('/login');
//       return;
//     }

//     try {
//       await addToCart(product, 1);
//       toast.success('Item added to cart');
//     } catch (error) {
//       toast.error('Failed to add item to cart');
//     }
//   };

//   const handleViewProduct = (productId) => {
//     router.push(`/product/${productId}`);
//   };

//   const renderStars = (rating) => (
//     <div className="flex items-center gap-0.5">
//       {[1, 2, 3, 4, 5].map((star) => (
//         <svg
//           key={star}
//           className={`w-3 h-3 ${star <= rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-400 fill-gray-400 dark:text-gray-600 dark:fill-gray-600'}`}
//           viewBox="0 0 20 20"
//         >
//           <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
//         </svg>
//       ))}
//     </div>
//   );

//   const WishlistProductCard = ({ product }) => (
//     <div className="bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-lg dark:shadow-none hover:transform hover:scale-105 transition-transform duration-200 border border-gray-100 dark:border-gray-800">
//       <div className="relative w-full h-64 overflow-hidden cursor-pointer" onClick={() => handleViewProduct(product.id)}>
//         {product.images && product.images.length > 0 ? (
//           <img
//             src={product.images[0]}
//             alt={product.name}
//             className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
//             onError={(e) => {
//               e.target.style.display = 'none';
//               e.target.nextElementSibling.style.display = 'flex';
//             }}
//           />
//         ) : null}
//         <div className={`absolute inset-0 flex items-center justify-center text-gray-700 dark:text-white text-sm bg-gray-200 dark:bg-gradient-to-br dark:from-slate-600 dark:to-slate-700 ${product.images && product.images.length > 0 ? 'hidden' : 'flex'}`}>
//           No Image Available
//         </div>

//         <div className="absolute top-3 left-3">
//           <span className="bg-pink-600 text-white text-xs font-semibold px-3 py-1 rounded">{product.category}</span>
//         </div>

//         <button
//           onClick={(e) => { e.stopPropagation(); handleRemoveFromWishlist(product.id); }}
//           className="absolute top-3 right-3 w-9 h-9 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center transition-colors"
//           aria-label="Remove from wishlist"
//         >
//           <Trash2 className="w-5 h-5 text-white" />
//         </button>

//       </div>

//       <div className="p-4">
//         <h3 className="font-semibold text-base mb-1 cursor-pointer text-gray-900 dark:text-white hover:text-lime-500 dark:hover:text-lime-400" onClick={() => handleViewProduct(product.id)}>
//           {product.name}
//         </h3>
//         <p className="text-gray-500 dark:text-gray-400 text-xs mb-3">{product.condition}</p>

//         <div className="flex items-center justify-between mb-3">
//           <span className="text-lime-600 dark:text-lime-400 text-xl font-bold">{product.price}</span>
//           <span className="text-gray-400 dark:text-gray-500 text-sm line-through">{product.originalPrice}</span>
//         </div>

//         <div className="flex items-center gap-2 mb-3">
//           {renderStars(product.rating)}
//           <span className="text-gray-500 dark:text-gray-400 text-xs">({product.reviews})</span>
//         </div>

//         <button
//           onClick={(e) => { e.stopPropagation(); handleAddToCart(product); }}
//           className="w-full bg-lime-500 hover:bg-lime-600 text-gray-900 dark:text-black font-semibold py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
//         >
//           <ShoppingCart size={16} />
//           Add to Cart
//         </button>
//       </div>
//     </div>
//   );

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gray-50 dark:bg-black text-gray-800 dark:text-white transition-colors">
//         <div className="max-w-7xl mx-auto p-8">
//           <LoadingSpinner>
//             <div className="loading-spinner" />
//             Loading wishlist...
//           </LoadingSpinner>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-50 dark:bg-black text-gray-900 dark:text-white transition-colors">
//       <div className="max-w-7xl mx-auto p-4 md:p-8">
//         <div className="mb-8">
//           <div className="flex items-center gap-4 mb-4">
//             <button onClick={handleBackNavigation} className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors" aria-label="Go back">
//               <ArrowLeft size={20} />
//               <span className="text-sm">Back</span>
//             </button>
//           </div>

//           <div className="flex items-center gap-3 mb-2">
//             <Heart className="text-red-500" size={32} />
//             <h1 className="text-3xl font-bold">My Wishlist</h1>
//           </div>
//           <p className="text-gray-600 dark:text-gray-400">
//             {wishlistProducts.length > 0 ? `${wishlistProducts.length} item${wishlistProducts.length !== 1 ? 's' : ''} in your wishlist` : 'Your wishlist is empty'}
//           </p>
//         </div>

//         {wishlistProducts.length > 0 && (
//           <div className="flex items-center justify-between mb-6 p-4 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-none">
//             <span className="text-sm text-gray-500 dark:text-gray-400">{wishlistProducts.length} item{wishlistProducts.length !== 1 ? 's' : ''} in wishlist</span>
//             <div className="flex items-center gap-2">
//               <span className="text-sm text-gray-500 dark:text-gray-400">Sort by:</span>
//               <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="bg-white dark:bg-black text-gray-900 dark:text-white border border-gray-400 dark:border-gray-700 rounded px-3 py-1 text-sm focus:outline-none focus:border-lime-500 dark:focus:border-lime-400">
//                 <option value="Date Added">Date Added</option>
//                 <option value="Price: Low to High">Price: Low to High</option>
//                 <option value="Price: High to Low">Price: High to Low</option>
//                 <option value="Name">Name</option>
//               </select>
//             </div>
//           </div>
//         )}

//         {wishlistProducts.length > 0 ? (
//           <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
//             {wishlistProducts.map((product) => (
//               <WishlistProductCard key={product.id} product={product} />
//             ))}
//           </div>
//         ) : (
//           <div className="text-center py-16">
//             <div className="mb-6">
//               <Heart className="mx-auto h-24 w-24 text-gray-400" />
//             </div>
//             <h3 className="text-xl font-medium text-gray-700 dark:text-gray-300 mb-2">Your wishlist is empty</h3>
//             <p className="text-gray-500 mb-6">Start adding items to your wishlist by clicking the heart icon on products you love.</p>
//             <div className="space-y-3">
//               <p className="text-sm text-gray-600 dark:text-gray-400">Suggestions:</p>
//               <ul className="text-sm text-gray-500 space-y-1">
//                 <li>• Browse our products and click the heart icon to save items</li>
//                 <li>• Your wishlist helps you keep track of items you're interested in</li>
//                 <li>• Easily add saved items to your cart when you're ready to purchase</li>
//               </ul>
//             </div>
//             <div className="mt-8">
//               <button onClick={handleBackNavigation} className="inline-flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
//                 <ArrowLeft size={16} />
//                 Continue Shopping
//               </button>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default WishlistPage;
