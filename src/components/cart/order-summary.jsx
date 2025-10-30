"use client";



import { ArrowRight } from "lucide-react";
import { Sansation } from "next/font/google";
import dynamic from 'next/dynamic';
import { useRouter } from "next/navigation";

const CartCouponInput = dynamic(() => import('./CartCouponInput'), { ssr: false });

const sansation = Sansation({
  weight: ["400", "700"],
  subsets: ["latin"],
});

export default function OrderSummary({ subtotal, discount, deliveryFee, total, appliedCoupon, onApplyCoupon }) {
  const router = useRouter();
  const handleCheckout = () => {
    router.push("/checkout");
  };

  // Calculate both discounts for first-time users
  let couponDiscount = 0;
  if (appliedCoupon && typeof appliedCoupon.discountValue === 'number' && subtotal > 0) {
    if (appliedCoupon.discountType === 'percent') {
      couponDiscount = Math.floor(subtotal * (appliedCoupon.discountValue / 100));
    } else if (appliedCoupon.discountType === 'flat' || appliedCoupon.discountType === 'amount') {
      couponDiscount = Math.min(subtotal, Math.floor(appliedCoupon.discountValue));
    }
  }
  let fallbackDiscount = 0;
  if (typeof window !== 'undefined') {
    try {
      const ctx = require('@/contexts/CartContext');
      const useCart = ctx.useCart;
      if (useCart) {
        const { fallbackUsed } = useCart();
        if (!fallbackUsed) fallbackDiscount = Math.floor(subtotal * 0.2);
      }
    } catch {}
  }
  // If context not available, fallback to prop logic
  if (fallbackDiscount === 0 && !appliedCoupon) {
    fallbackDiscount = Math.floor(subtotal * 0.2);
  }
  const totalAmount = subtotal - fallbackDiscount - couponDiscount;

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
            <span className="text-gray-400">Discount (-20%)</span>
            <span className="text-red-500 font-semibold">-₹{fallbackDiscount}</span>
          </div>
        )}

        {/* Show coupon discount if applied */}
        {appliedCoupon && couponDiscount > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">
              Coupon ({appliedCoupon.code})
              {appliedCoupon.discountType === 'percent'
                ? ` (-${appliedCoupon.discountValue}%)`
                : appliedCoupon.discountType === 'flat'
                ? ` (-₹${appliedCoupon.discountValue})`
                : ''}
            </span>
            <span className="text-red-500 font-semibold">-₹{couponDiscount}</span>
          </div>
        )}

        <div className="border-t border-gray-600 my-4"></div>

        <div className="flex justify-between items-center">
          <span className="font-semibold text-base">Total</span>
          <span className="font-bold text-xl">₹{totalAmount}</span>
        </div>
      </div>


      {/* Info section for first time buyers */}
      <div className="mb-4 p-3 rounded-lg bg-blue-900/40 border border-blue-700 text-blue-200 text-sm font-medium">
        <span>Use coupon <span className="font-bold text-white">SIGNUP</span> for first time buyers</span>
      </div>

      {/* Coupon input below total, as in screenshot */}
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
