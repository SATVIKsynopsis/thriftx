"use client";

import React, { useEffect, useState } from "react";
import { db } from "@/firebase/config";
import { doc, getDoc } from "firebase/firestore";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import CartItem from "./cart-item";
import OrderSummary from "./order-summary";
import { ShoppingBag } from "lucide-react";
import {
  subscribeToCart,
  updateCartQuantity,
  removeCartItem,
} from "../../../lib/cartService";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

export default function CartPage() {
  const { currentUser } = useAuth();
  const { 
    appliedCoupons, 
    addCoupon, 
    removeCoupon, 
    fallbackUsed, 
    setFallbackUsed, 
    useFallback, 
    setUseFallback 
  } = useCart();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Check fallback discount usage on mount
  useEffect(() => {
    if (!currentUser) return;

    const checkFallback = async () => {
      const usageRef = doc(db, "coupon_usages", `${currentUser.uid}_FALLBACK20`);
      const usageSnap = await getDoc(usageRef);
      setFallbackUsed(usageSnap.exists());
    };
    checkFallback();

    const unsubscribe = subscribeToCart(currentUser.uid, (cartItems) => {
      setItems(cartItems);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser, setFallbackUsed]);

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

  // Calculate fallback (signup) discount first
  let fallbackDiscount = 0;
  const hasSignupCoupon = appliedCoupons.some(coupon => 
    coupon && typeof coupon.code === 'string' && 
    ['SIGNUP', 'FALLBACK20'].includes(coupon.code.toUpperCase())
  );

  // Apply fallback discount if eligible
  if (!fallbackUsed && !hasSignupCoupon) {
    fallbackDiscount = Math.floor(subtotal * 0.2);
  }

  // Calculate cumulative coupon discounts on remaining amount after fallback
  let remainingAmount = Math.max(0, subtotal - fallbackDiscount);
  let totalCouponDiscount = 0;

  appliedCoupons.forEach(coupon => {
    if (coupon && typeof coupon.discountValue === 'number' && remainingAmount > 0) {
      let couponDiscount = 0;
      
      if (coupon.discountType === 'percent') {
        couponDiscount = Math.floor(remainingAmount * (coupon.discountValue / 100));
      } else if (coupon.discountType === 'flat' || coupon.discountType === 'amount') {
        couponDiscount = Math.min(remainingAmount, Math.floor(coupon.discountValue));
      }
      
      totalCouponDiscount += couponDiscount;
      remainingAmount = Math.max(0, remainingAmount - couponDiscount);
    }
  });

  // Total discount is fallback + all coupon discounts
  const discount = (fallbackDiscount || 0) + (totalCouponDiscount || 0);
  const deliveryFee = 0; // No delivery fee in cart, only at checkout
  const total = Math.max(0, subtotal - discount);

  return (
    <main className="flex-1 bg-gray-50 dark:bg-background px-4 sm:px-8 py-12 min-h-screen transition-colors">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-4xl font-bold text-foreground">Your Cart</h1>
          {items.length > 0 && (
            <Badge variant="secondary" className="text-sm">
              {items.length} item{items.length > 1 && "s"}
            </Badge>
          )}
        </div>

        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-40 w-full rounded-xl" />
          </div>
        ) : items.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent className="flex flex-col items-center gap-4">
              <ShoppingBag className="w-12 h-12 text-gray-400" />
              <h3 className="text-xl font-semibold">Your cart is empty</h3>
              <p className="text-gray-500">Add items to start shopping.</p>
              <Button
                className="mt-4"
                onClick={() => (window.location.href = "/search")}
              >
                Go Shopping
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid lg:grid-cols-[2fr_1fr] gap-8">
            {/* Left: Cart Items */}
            <Card className="border-gray-200 dark:border-gray-800 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">
                  Items in your Cart
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {items.map((item, index) => (
                  <React.Fragment key={item.id}>
                    <CartItem
                      item={item}
                      onUpdateQuantity={(qty) => handleQuantityChange(item.id, qty)}
                      onRemove={() => handleRemove(item.id)}
                    />
                    {index < items.length - 1 && (
                      <Separator className="bg-gray-200 dark:bg-gray-700" />
                    )}
                  </React.Fragment>
                ))}
              </CardContent>
            </Card>

            {/* Right: Order Summary */}
            <Card className="border-gray-200 dark:border-gray-800 shadow-sm h-fit sticky top-8">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">
                  Order Summary
                </CardTitle>
              </CardHeader>
              <Separator className="bg-gray-200 dark:bg-gray-700" />
              <CardContent className="pt-6">
                <OrderSummary
                  subtotal={subtotal}
                  discount={discount}
                  deliveryFee={deliveryFee}
                  total={total}
                  appliedCoupons={appliedCoupons}
                  onApplyCoupon={addCoupon}
                  onRemoveCoupon={removeCoupon}
                  fallbackDiscount={fallbackDiscount}
                  couponDiscount={totalCouponDiscount}
                  fallbackUsed={fallbackUsed}
                />
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </main>
  );
}