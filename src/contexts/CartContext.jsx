"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  collection, 
  addDoc, 
  deleteDoc, 
  doc, 
  onSnapshot, 
  updateDoc,
  query,
  where 
} from 'firebase/firestore';
import { db } from '@/firebase/config';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

// Define the safe default value object
const defaultCartContextValue = {
  cartItems: [],
  loading: false,
  addToCart: () => Promise.resolve(),
  removeFromCart: () => Promise.resolve(),
  updateQuantity: () => Promise.resolve(),
  clearCart: () => Promise.resolve(),
  getCartTotal: () => 0,
  getItemCount: () => 0,
  appliedCoupon: null,
  setAppliedCoupon: () => {},
  fallbackUsed: false,
  setFallbackUsed: () => {},
};

const CartContext = createContext(defaultCartContextValue);

export const useCart = () => {
  return useContext(CartContext);
};


export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [fallbackUsed, setFallbackUsed] = useState(false);
  const { currentUser } = useAuth();

  useEffect(() => {
    if (!currentUser) {
      setCartItems([]);
      return;
    }

    const cartRef = collection(db, 'carts', currentUser.uid, 'items');
    const unsubscribe = onSnapshot(cartRef, (snapshot) => {
      const items = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setCartItems(items);
    });

    return unsubscribe;
  }, [currentUser]);

  // Accepts: product, quantity, color, productSize
  const addToCart = async (product, quantity = 1, color = null, productSize = null) => {
    if (!currentUser) {
      toast.error('Please login to add items to cart');
      return;
    }

    setLoading(true);
    try {
      // Check if item already exists in cart (match by productId, color, size)
      const existingItem = cartItems.find(item =>
        item.productId === product.id &&
        (color == null || item.color === color) &&
        (productSize == null || item.productSize === productSize)
      );

      if (existingItem) {
        // Update quantity
        await updateDoc(doc(db, 'carts', currentUser.uid, 'items', existingItem.id), {
          quantity: existingItem.quantity + quantity
        });
      } else {
        // Add new item with color and size
        await addDoc(collection(db, 'carts', currentUser.uid, 'items'), {
          productId: product.id,
          productName: product.name,
          productImage: product.images[0],
          price: product.price,
          sellerId: product.sellerId,
          quantity: quantity,
          color: color,
          productSize: productSize,
          addedAt: new Date()
        });
      }

      toast.success('Item added to cart');
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Failed to add item to cart');
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (itemId) => {
    setLoading(true);
    try {
      await deleteDoc(doc(db, 'carts', currentUser.uid, 'items', itemId));
      toast.success('Item removed from cart');
    } catch (error) {
      console.error('Error removing from cart:', error);
      toast.error('Failed to remove item from cart');
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (itemId, newQuantity) => {
    if (newQuantity <= 0) {
      await removeFromCart(itemId);
      return;
    }

    setLoading(true);
    try {
      await updateDoc(doc(db, 'carts', currentUser.uid, 'items', itemId), {
        quantity: newQuantity
      });
    } catch (error) {
      console.error('Error updating quantity:', error);
      toast.error('Failed to update quantity');
    } finally {
      setLoading(false);
    }
  };

  const clearCart = async () => {
    setLoading(true);
    try {
      const deletePromises = cartItems.map(item => 
        deleteDoc(doc(db, 'carts', currentUser.uid, 'items', item.id))
      );
      await Promise.all(deletePromises);
    } catch (error) {
      console.error('Error clearing cart:', error);
      toast.error('Failed to clear cart');
    } finally {
      setLoading(false);
    }
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getItemCount = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const value = {
    cartItems,
    loading,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    getItemCount,
    appliedCoupon,
    setAppliedCoupon,
    fallbackUsed,
    setFallbackUsed,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};
