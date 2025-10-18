"use client";

import React, { useEffect, useState } from "react";
import CartItem from "./cart-item";
import OrderSummary from "./order-summary";
import { useAuth } from "@/contexts/AuthContext";
import {
  subscribeToCart,
  updateCartQuantity,
  removeCartItem,
} from "../../../lib/cartService";
import { Anton } from "next/font/google";
import { Sansation } from "next/font/google";



const anton = Anton({
  weight: "400",
  subsets: ["latin"],
});

const sansation = Sansation({
  weight: ["400", "700"],   // adjust weights you need
  subsets: ["latin"],
});

export default function CartPage() {
  const { currentUser } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

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
  const discount = Math.floor(subtotal * 0.2);
  const deliveryFee = items.length > 0 ? 15 : 0;
  const total = subtotal - discount + deliveryFee;

  return (
    <main className="flex-1 bg-black px-4 sm:px-8 py-12 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <h1 className={`text-4xl font-bold text-white mb-8 ${anton.className}`}>Your Cart</h1>

        {loading ? (
          <p className="text-gray-400">Loading your cart...</p>
        ) : items.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p>Your cart is empty</p>
          </div>
        ) : (
          <div className="grid lg:grid-cols-[2fr_1fr] gap-8">
            {/* Cart Items Container */}
            <div className="bg-[#0f0f0f] border-2 border-gray-300 rounded-3xl p-6 md:p-8 space-y-6 shadow-lg">
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
            <div className="bg-[#0f0f0f] border-2 border-gray-200 rounded-3xl p-6 md:p-8 shadow-lg self-start">
              <OrderSummary
                subtotal={subtotal}
                discount={discount}
                deliveryFee={deliveryFee}
                total={total}
              />
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
