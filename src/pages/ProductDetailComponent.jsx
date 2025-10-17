"use client"; // Ensure this is a client component

import React, { useState, useEffect } from 'react';
// CORRECT IMPORTS FOR NEXT.JS
import { useParams, useRouter } from 'next/navigation'; 
import Link from 'next/link'
import { doc, getDoc, collection, query, where, limit, getDocs, setDoc, serverTimestamp } from 'firebase/firestore';
import {
  Star,
  ShoppingCart,
  Heart,
  Share2,
  ArrowLeft,
  Truck,
  Shield,
  RotateCcw,
  User,
  Clock,
  Package
} from 'lucide-react';
import { db } from '../firebase/config';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import ProductCard from '../components/products/ProductCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { formatPrice } from '../utils/formatters';
import toast from 'react-hot-toast';

const ProductDetailComponent = () => {
  const router = useRouter(); 
  const params = useParams();
  const id = params.id; 

  const { currentUser } = useAuth();
  const { addToCart, loading: cartLoading } = useCart();

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [userRating, setUserRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    const fetchProduct = async () => {
      try {
        const productDoc = await getDoc(doc(db, 'products', id));

        if (productDoc.exists()) {
          const productData = { id: productDoc.id, ...productDoc.data() };
          setProduct(productData);

          if (productData.category) {
            const relatedQuery = query(
              collection(db, 'products'),
              where('category', '==', productData.category),
              limit(4)
            );
            const relatedSnapshot = await getDocs(relatedQuery);
            const related = relatedSnapshot.docs
              .map(doc => ({ id: doc.id, ...doc.data() }))
              .filter(p => p.id !== id);

            setRelatedProducts(related);
          }
        } else {
          toast.error('Product not found');
          router.push('/');
        }
      } catch (error) {
        console.error('Error fetching product:', error);
        toast.error('Failed to load product');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id, router]);

  const handleAddToCart = () => {
    if (!currentUser) {
      toast.error('Please login to add items to cart');
      router.push('/login');
      return;
    }

    addToCart(product, quantity);
  };

  const handleQuantityChange = (delta) => {
    const newQuantity = quantity + delta;
    if (newQuantity >= 1 && newQuantity <= (product?.stock || 1)) {
      setQuantity(newQuantity);
    }
  };

  const calculateDiscount = () => {
    if (product?.originalPrice && product?.price < product?.originalPrice) {
      return Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
    }
    return 0;
  };

  const submitRating = async (star) => {
    try {
      setSubmitting(true);
      if (!currentUser) return;
      const ratingRef = doc(db, 'products', product.id, 'ratings', currentUser.uid);
      await setDoc(ratingRef, {
        userId: currentUser.uid,
        rating: star,
        createdAt: serverTimestamp(),
      });
      setUserRating(star);
      toast.success('Rating submitted');
    } catch (error) {
      console.error('Error submitting rating:', error);
      toast.error('Failed to submit rating');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-8 md:p-12">
        <LoadingSpinner>
          <div className="loading-spinner" />
          Loading product details...
        </LoadingSpinner>
      </div>
    );
  }

  if (!product) {
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

  const isOwnProduct = currentUser && product.sellerId === currentUser.uid;
  const discount = calculateDiscount();

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 lg:p-12">
      <Link 
        href="/search"
        className="inline-flex items-center gap-2 text-gray-600 no-underline mb-8 transition duration-200 hover:text-blue-600"
      >
        <ArrowLeft size={20} />
        Back to search
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 mb-16">
        <div className="relative">
          {product.images && product.images.length > 0 ? (
            <>
              <img
                className="w-full h-[400px] object-cover rounded-xl mb-4"
                src={product.images[selectedImage]}
                alt={product.name}
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextElementSibling.style.display = 'flex';
                }}
              />
              <div className="w-full h-[400px] bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl items-center justify-center text-gray-400 text-lg mb-4 hidden">
                No Image Available
              </div>
              {product.images.length > 1 && (
                <div className="grid grid-cols-4 sm:grid-cols-5 lg:grid-cols-6 gap-2">
                  {product.images.map((image, index) => (
                    <img
                      key={index}
                      className={`w-full h-20 object-cover rounded-md cursor-pointer transition-all duration-200 
                      border-2 ${selectedImage === index ? 'border-blue-600' : 'border-transparent hover:border-blue-600'}`}
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      onClick={() => setSelectedImage(index)}
                    />
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="w-full h-[400px] bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center text-gray-400 text-lg mb-4">
              No Image Available
            </div>
          )}
        </div>

        <div>
          <div className="flex items-center gap-2 mb-4 text-gray-500 text-sm">
            <User size={16} />
            Sold by {product.sellerName || 'Unknown Seller'}
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-4 leading-tight md:text-4xl">
            {product.name}
          </h1>

          {product.rating && (
            <div className="flex items-center gap-2 mb-6">
              <div className="flex text-yellow-400">
                {[...Array(5)].map((_, index) => (
                  <Star
                    key={index}
                    size={16}
                    fill={index < product.rating ? 'currentColor' : 'none'}
                    strokeWidth={product.rating > 0 ? 0 : 2}
                  />
                ))}
              </div>
              <span className="text-gray-900 font-semibold">{product.rating.toFixed(1)}</span>
              <span className="text-gray-500 text-sm">({product.reviewCount || 0} reviews)</span>
            </div>
          )}

          <div className="mb-8">
            <div className="text-4xl font-bold text-green-600 md:text-5xl">
              {formatPrice(product.price)}
            </div>
            {product.originalPrice && product.originalPrice > product.price && (
              <>
                <div className="text-xl text-gray-400 line-through mt-1">
                  {formatPrice(product.originalPrice)}
                </div>
                <div className="inline-block bg-red-600 text-white px-3 py-1 rounded-lg text-sm font-semibold mt-2">
                  {discount}% OFF
                </div>
              </>
            )}
          </div>

          <div className={`text-sm font-semibold mb-4 ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
            {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 p-6 bg-gray-50 rounded-xl">
            <div className="flex items-center gap-3 text-gray-700 text-sm">
              <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 bg-blue-600 text-white rounded-full">
                <Truck size={16} />
              </div>
              <span>Free shipping on orders over $50</span>
            </div>
            <div className="flex items-center gap-3 text-gray-700 text-sm">
              <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 bg-blue-600 text-white rounded-full">
                <Shield size={16} />
              </div>
              <span>Secure payment</span>
            </div>
            <div className="flex items-center gap-3 text-gray-700 text-sm">
              <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 bg-blue-600 text-white rounded-full">
                <RotateCcw size={16} />
              </div>
              <span>30-day return policy</span>
            </div>
            <div className="flex items-center gap-3 text-gray-700 text-sm">
              <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 bg-blue-600 text-white rounded-full">
                <Clock size={16} />
              </div>
              <span>Fast delivery</span>
            </div>
          </div>

          {!isOwnProduct && product.stock > 0 && (
            <div className="flex gap-4 mb-8 flex-wrap md:flex-nowrap">
              <div className="flex items-center border-2 border-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                <button
                  className="px-4 py-3 bg-gray-50 border-none cursor-pointer transition duration-200 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => handleQuantityChange(-1)}
                  disabled={quantity <= 1}
                >
                  -
                </button>
                <input
                  className="w-16 p-3 border-none text-center font-semibold focus:outline-none"
                  type="number"
                  value={quantity}
                  onChange={(e) => {
                    const value = parseInt(e.target.value) || 1;
                    if (value >= 1 && value <= product.stock) {
                      setQuantity(value);
                    }
                  }}
                  min="1"
                  max={product.stock}
                />
                <button
                  className="px-4 py-3 bg-gray-50 border-none cursor-pointer transition duration-200 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => handleQuantityChange(1)}
                  disabled={quantity >= product.stock}
                >
                  +
                </button>
              </div>

              <button
                className="flex-1 bg-blue-600 text-white rounded-xl py-4 px-6 text-lg font-semibold cursor-pointer transition duration-200 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 min-w-[150px]"
                onClick={handleAddToCart}
                disabled={cartLoading}
              >
                <ShoppingCart size={20} />
                {cartLoading ? 'Adding...' : 'Add to Cart'}
              </button>

              <button className="p-4 bg-white border-2 border-gray-200 rounded-xl cursor-pointer transition duration-200 hover:border-blue-600 hover:text-blue-600 flex items-center justify-center flex-shrink-0">
                <Heart size={20} />
              </button>

              <button className="p-4 bg-white border-2 border-gray-200 rounded-xl cursor-pointer transition duration-200 hover:border-blue-600 hover:text-blue-600 flex items-center justify-center flex-shrink-0">
                <Share2 size={20} />
              </button>
            </div>
          )}

          {isOwnProduct && (
            <div className="flex gap-4 mb-8">
              <Link
                href={`/seller/products/edit/${product.id}`}
                className="flex-1 bg-blue-600 text-white rounded-xl py-4 px-6 text-lg font-semibold cursor-pointer transition duration-200 hover:bg-blue-700 flex items-center justify-center gap-2"
              >
                <Package size={20} />
                Edit Product
              </Link>
            </div>
          )}

          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-4 text-gray-900">Description</h3>
            <p className="text-gray-600 leading-relaxed mb-4">{product.description}</p>

            <h3 className="text-xl font-semibold mb-4 text-gray-900">
              Rate this product
            </h3>
            {currentUser ? (
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size={28}
                    className="cursor-pointer transition duration-100"
                    fill={(hoverRating || userRating) >= star ? '#fbbf24' : 'none'}
                    stroke={(hoverRating || userRating) >= star ? 'none' : '#d1d5db'}
                    strokeWidth={2}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => submitRating(star)}
                  />
                ))}
                {submitting && (
                  <div className="loading-spinner w-5 h-5 border-2 border-t-2"></div>
                )}
              </div>
            ) : (
              <p className="text-gray-600">
                Please <Link href="/login" className="text-blue-600 hover:underline">login</Link> to rate this product.
              </p>
            )}
          </div>
        </div>
      </div>

      {relatedProducts.length > 0 && (
        <section className="mt-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Related Products</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {relatedProducts.map(relatedProduct => (
              <ProductCard key={relatedProduct.id} product={relatedProduct} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default ProductDetailComponent;
