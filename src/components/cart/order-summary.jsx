"use client";

import { ArrowRight } from "lucide-react";
import { Sansation } from "next/font/google";

const sansation = Sansation({
  weight: ["400", "700"],
  subsets: ["latin"],
});

export default function OrderSummary({ subtotal, discount, deliveryFee, total, appliedCoupon }) {
  return (
    <div className={`text-white ${sansation.className}`}>
      <h2 className="text-xl font-semibold mb-6">Order Summary</h2>

      <div className="space-y-4 mb-6">
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Subtotal</span>
          <span>₹{subtotal}</span>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-gray-400">
            {appliedCoupon
              ? `Coupon (${appliedCoupon.code})${appliedCoupon.discountType === 'percent' ? ` (-${appliedCoupon.value}%)` : ''}`
              : 'Discount (-20%)'}
          </span>
          <span className="text-red-500 font-semibold">-₹{discount}</span>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Delivery Fee</span>
          <span>₹{deliveryFee}</span>
        </div>

        <div className="border-t border-gray-600 my-4"></div>

        <div className="flex justify-between items-center">
          <span className="font-semibold text-base">Total</span>
          <span className="font-bold text-xl">₹{total}</span>
        </div>
      </div>

      <button className="w-full border border-gray-600 text-white py-3 rounded-full hover:border-gray-500 transition font-medium flex items-center justify-center gap-2 group">
        Go to Checkout
        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
      </button>
    </div>
  );
}
