"use client";

import { ArrowRight, X } from "lucide-react";
import { Sansation } from "next/font/google";
import dynamic from 'next/dynamic';
import { useRouter } from "next/navigation";
import { useCart } from '@/contexts/CartContext';

const CartCouponInput = dynamic(() => import('./CartCouponInput'), { ssr: false });

const sansation = Sansation({
  weight: ["400", "700"],
  subsets: ["latin"],
});

export default function OrderSummary({ 
  subtotal, 
  discount, 
  deliveryFee, 
  total, 
  appliedCoupons = [], 
  onApplyCoupon,
  onRemoveCoupon,
  fallbackDiscount = 0,
  couponDiscount = 0,
  fallbackUsed = false
}) {
  const router = useRouter();
  const handleCheckout = () => {
    router.push("/checkout");
  };

  const { useFallback } = useCart();

  return (
    <div className={`text-white ${sansation.className}`}>
      <h2 className="text-xl font-semibold mb-6">Order Summary</h2>

      <div className="space-y-4 mb-6">
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Subtotal</span>
          <span>₹{subtotal}</span>
        </div>

        {/* Show signup discount if eligible */}
        {fallbackDiscount > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Signup Discount (-20%)</span>
            <span className="text-green-500 font-semibold">-₹{fallbackDiscount}</span>
          </div>
        )}

        {/* Show each applied coupon */}
        {appliedCoupons.length > 0 && appliedCoupons.map((coupon) => {
          const discountText = coupon.discountType === 'percent'
            ? `${coupon.discountValue}%`
            : `₹${coupon.discountValue}`;
          
          return (
            <div key={coupon.code} className="flex justify-between items-center text-sm">
              <span className="text-gray-400">
                {coupon.code} (-{discountText})
              </span>
              <div className="flex items-center gap-2">
                <span className="text-green-500 font-semibold">Applied</span>
                <button
                  onClick={() => onRemoveCoupon(coupon.code)}
                  className="text-red-400 hover:text-red-300 transition"
                  title="Remove coupon"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}

        {/* Total coupon discount summary */}
        {couponDiscount > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Total Coupon Savings</span>
            <span className="text-green-500 font-semibold">-₹{couponDiscount}</span>
          </div>
        )}

        <div className="border-t border-gray-600 my-4"></div>

        {/* Total Discount */}
        {discount > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Total Savings</span>
            <span className="text-green-500 font-bold">-₹{discount}</span>
          </div>
        )}

        <div className="flex justify-between items-center">
          <span className="font-semibold text-base">Total</span>
          <span className="font-bold text-xl">₹{total}</span>
        </div>
      </div>

      {/* Info section for first time buyers */}
      {!fallbackUsed && fallbackDiscount === 0 && (
        <div className="mb-4 p-3 rounded-lg bg-blue-900/40 border border-blue-700 text-blue-200 text-sm font-medium">
          <span>Use coupon <span className="font-bold text-white">SIGNUP</span> for first time buyers</span>
        </div>
      )}

      {/* Show applied coupons list */}
      {appliedCoupons.length > 0 && (
        <div className="mb-4 p-3 rounded-lg bg-green-900/20 border border-green-700 text-green-200 text-sm">
          <span className="font-semibold">Applied Coupons: </span>
          <span>{appliedCoupons.map(c => c.code).join(", ")}</span>
        </div>
      )}

      {/* Coupon input below total */}
      <CartCouponInput onApply={onApplyCoupon} />

      <button
        className="w-full border border-gray-600 text-white py-3 rounded-full hover:border-gray-500 transition font-medium flex items-center justify-center gap-2 group mt-4"
        onClick={handleCheckout}
      >
        Go to Checkout
        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
      </button>
    </div>
  );
}