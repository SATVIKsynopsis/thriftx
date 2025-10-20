import { useState, useEffect } from 'react';
import { doc, getDoc, collection, query, limit, getDocs, setDoc, serverTimestamp } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { db } from '../firebase/config';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import toast from 'react-hot-toast';

/**
 * Custom hook for product details management
 */
export const useProductDetails = (productId) => {
  const router = useRouter();
  const { currentUser } = useAuth();
  const { addToCart, loading: cartLoading } = useCart();

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState(0);
  const [selectedSize, setSelectedSize] = useState('Medium');
  const [userRating, setUserRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!productId) {
      setLoading(false);
      return;
    }

    const fetchProduct = async () => {
      try {
        const productDoc = await getDoc(doc(db, 'products', productId));

        if (productDoc.exists()) {
          const productData = { id: productDoc.id, ...productDoc.data() };
          setProduct(productData);

          // Fetch related products
          const generalQuery = query(collection(db, 'products'), limit(5));
          const generalSnapshot = await getDocs(generalQuery);
          const generalProducts = generalSnapshot.docs
            .map(doc => ({ id: doc.id, ...doc.data() }))
            .filter(p => p.id !== productId)
            .slice(0, 4);

          setRelatedProducts(generalProducts);
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
  }, [productId, router]);

  const handleAddToCart = () => {
    if (!currentUser) {
      toast.error('Please login to add items to cart');
      router.push('/login');
      return;
    }

    if (!product) return;

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

  const submitRating = async (rating) => {
    if (!currentUser || !product) return;

    try {
      setSubmitting(true);
      const ratingRef = doc(db, 'products', product.id, 'ratings', currentUser.uid);
      await setDoc(ratingRef, {
        userId: currentUser.uid,
        rating,
        createdAt: serverTimestamp(),
      });
      setUserRating(rating);
      toast.success('Rating submitted');
    } catch (error) {
      console.error('Error submitting rating:', error);
      toast.error('Failed to submit rating');
    } finally {
      setSubmitting(false);
    }
  };

  const isOwnProduct = currentUser && product?.sellerId === currentUser.uid;

  return {
    // State
    product,
    relatedProducts,
    loading,
    quantity,
    selectedImage,
    selectedColor,
    selectedSize,
    userRating,
    hoverRating,
    submitting,
    cartLoading,
    isOwnProduct,

    // Computed values
    discount: calculateDiscount(),

    // Actions
    setQuantity,
    setSelectedImage,
    setSelectedColor,
    setSelectedSize,
    setHoverRating,
    handleAddToCart,
    handleQuantityChange,
    submitRating,
  };
};
