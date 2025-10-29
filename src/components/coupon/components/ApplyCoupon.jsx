"use client";

import React, { useState } from "react";
import CouponSuccessModal from "./CouponSuccessModel";

const dummyCoupons = [
  { code: "WELCOME10", discountType: "percent", discountValue: 10 },
  { code: "FLAT50", discountType: "flat", discountValue: 50 },
];

const ApplyCoupon = () => {
  const [code, setCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const handleApply = () => {
    const found = dummyCoupons.find(
      (coupon) => coupon.code.toLowerCase() === code.toLowerCase()
    );
    if (found) {
      setAppliedCoupon(found);
      setShowModal(true);
    } else {
      alert("Invalid coupon code!");
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white shadow-md rounded-2xl p-6 mt-10">
      <h2 className="text-xl font-semibold text-gray-800 mb-3">Apply Coupon</h2>
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Enter coupon code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="flex-1 p-2 border rounded-md"
        />
        <button
          onClick={handleApply}
          className="bg-green-600 text-white px-4 rounded-md hover:bg-green-700 transition"
        >
          Apply
        </button>
      </div>

      {showModal && (
        <CouponSuccessModal coupon={appliedCoupon} onClose={() => setShowModal(false)} />
      )}
    </div>
  );
};

export default ApplyCoupon;
