"use client";
import React from "react";

const CouponSuccessModal = ({ coupon, onClose }) => {
  return (
    <div className="fixed inset-0 flex justify-center items-center bg-black/50">
      <div className="bg-white rounded-xl shadow-lg p-6 text-center max-w-sm w-full">
        <h3 className="text-xl font-semibold text-green-600">Coupon Applied!</h3>
        <p className="mt-2 text-gray-700">
          You got{" "}
          {coupon.discountType === "percent"
            ? `${coupon.discountValue}%`
            : `₹${coupon.discountValue}`}{" "}
          off using <b>{coupon.code}</b>.
        </p>
        <button
          onClick={onClose}
          className="mt-4 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition"
        >
          Okay
        </button>
      </div>
    </div>
  );
};

export default CouponSuccessModal;
