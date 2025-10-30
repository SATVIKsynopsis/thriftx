"use client";

import React, { useEffect, useState } from "react";
import CartItem from "./cart-item";
import OrderSummary from "./order-summary";
import dynamic from 'next/dynamic';
import { useAuth } from "@/contexts/AuthContext";
import {
  subscribeToCart,
  updateCartQuantity,
  removeCartItem,
} from "../../../lib/cartService";
import { Anton } from "next/font/google";
import { Sansation } from "next/font/google";
import { ShoppingBag } from "lucide-react";

const anton = Anton({
  weight: "400",
  subsets: ["latin"],
});

const sansation = Sansation({
  weight: ["400", "700"],
  subsets: ["latin"],
});

const CartCouponInput = dynamic(() => import('./CartCouponInput'), { ssr: false });

export default function CartPage() {
  const { currentUser } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [appliedCoupon, setAppliedCoupon] = useState(null);

  useEffect(() => {
    if (!currentUser) return;

    const unsubscribe = subscribeToCart(currentUser.uid, (cartItems) => {
      setItems(cartItems);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser]);

  const handleQuantityChange = async (id, quantity) => {
    if (!currentUser) return;
    if (quantity <= 0) {
      await removeCartItem(currentUser.uid, id);
    } else {
      await updateCartQuantity(currentUser.uid, id, Number(quantity));
    }
  };

  const handleRemove = async (id) => {
    if (!currentUser) return;
    await removeCartItem(currentUser.uid, id);
  };

  const subtotal = items.reduce(
    (sum, item) => sum + Number(item.price) * Number(item.quantity),
    0
  );

  // Coupon discount logic
  let couponDiscount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.discountType === 'percent') {
      couponDiscount = Math.floor(subtotal * (appliedCoupon.value / 100));
    } else if (appliedCoupon.discountType === 'amount') {
      couponDiscount = Math.min(subtotal, Math.floor(appliedCoupon.value));
    }
  }

  // Fallback: 20% discount if no coupon (legacy logic)
  const discount = appliedCoupon ? couponDiscount : Math.floor(subtotal * 0.2);
  const deliveryFee = items.length > 0 ? 15 : 0;
  const total = subtotal - discount + deliveryFee;

  return (
    <main className="flex-1 bg-gray-50 dark:bg-black px-4 sm:px-8 py-12 min-h-screen transition-colors">
      <div className="max-w-6xl mx-auto">
        <h1 className={`text-4xl font-bold text-gray-900 dark:text-white mb-8 ${anton.className}`}>
          Your Cart
        </h1>

        {loading ? (
          <p className="text-gray-500 dark:text-gray-400">Loading your cart...</p>
        ) : items.length === 0 ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <ShoppingBag className="mx-auto mb-4 w-12 h-12 text-gray-400 dark:text-gray-500" />
            <p>Your cart is empty</p>
          </div>
        ) : (
          <div className="grid lg:grid-cols-[2fr_1fr] gap-8">
            {/* Cart Items Container */}
            <div className="bg-white dark:bg-[#0f0f0f] border-2 border-gray-300 dark:border-gray-700 rounded-3xl p-6 md:p-8 space-y-6 shadow-lg transition-colors">
              {items.map((item) => (
                <CartItem
                  key={item.id}
                  item={item}
                  onUpdateQuantity={(qty) => handleQuantityChange(item.id, qty)}
                  onRemove={() => handleRemove(item.id)}
                />
              ))}
            </div>

            {/* Order Summary Container */}
            <div className="bg-white dark:bg-[#0f0f0f] border-2 border-gray-200 dark:border-gray-700 rounded-3xl p-6 md:p-8 shadow-lg self-start transition-colors">
              <CartCouponInput onApply={setAppliedCoupon} />
              <OrderSummary
                subtotal={subtotal}
                discount={discount}
                deliveryFee={deliveryFee}
                total={total}
                appliedCoupon={appliedCoupon}
              />
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
