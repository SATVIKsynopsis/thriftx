"use client";
import React from "react";

const CouponCard = ({ coupon }) => {
  const { code, description, discountType, discountValue, minOrderValue, expiryDate } = coupon;

  return (
    <div className="bg-white shadow-md rounded-2xl p-4 border hover:shadow-lg transition-all duration-200">
      <h3 className="text-xl font-bold text-blue-600">{code}</h3>
      <p className="text-gray-700 text-sm mt-1">{description}</p>
      <div className="mt-3 text-sm text-gray-600 space-y-1">
        <p>
          <span className="font-semibold">Discount:</span>{" "}
          {discountType === "percent" ? `${discountValue}%` : `₹${discountValue}`}
        </p>
        <p>
          <span className="font-semibold">Min Order:</span> ₹{minOrderValue}
        </p>
        <p>
          <span className="font-semibold">Expires:</span> {expiryDate}
        </p>
      </div>
    </div>
  );
};

export default CouponCard;
