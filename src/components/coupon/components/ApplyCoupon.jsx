"use client";


import React, { useState } from "react";
import CouponSuccessModal from "./CouponSuccessModel";
import { db } from "@/firebase/config";
import { collection, query, where, getDocs, doc, getDoc, setDoc } from "firebase/firestore";
import { useAuth } from "@/contexts/AuthContext";

const ApplyCoupon = () => {
  const [code, setCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const { currentUser } = useAuth();

  const handleApply = async () => {
    if (!currentUser) {
      alert("You must be logged in to use a coupon.");
      return;
    }
    setLoading(true);
    try {
      // 1. Find coupon by code
      const q = query(collection(db, "coupons"), where("code", "==", code.trim()));
      const snap = await getDocs(q);
      if (snap.empty) {
        alert("Invalid coupon code!");
        setLoading(false);
        return;
      }
      const couponDoc = snap.docs[0];
      const coupon = { ...couponDoc.data(), id: couponDoc.id };

      // 2. Check if user has already used this coupon
      const usageRef = doc(db, "coupon_usages", `${currentUser.uid}_${coupon.code}`);
      const usageSnap = await getDoc(usageRef);
      if (usageSnap.exists()) {
        alert("You have already used this coupon.");
        setLoading(false);
        return;
      }

      // 3. Mark coupon as used for this user
      await setDoc(usageRef, {
        userId: currentUser.uid,
        couponCode: coupon.code,
        usedAt: new Date().toISOString(),
      });

      setAppliedCoupon(coupon);
      setShowModal(true);
    } catch (err) {
      alert("Failed to apply coupon. Please try again.");
    }
    setLoading(false);
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
          disabled={loading}
        />
        <button
          onClick={handleApply}
          className="bg-green-600 text-white px-4 rounded-md hover:bg-green-700 transition"
          disabled={loading}
        >
          {loading ? "Applying..." : "Apply"}
        </button>
      </div>

      {showModal && (
        <CouponSuccessModal coupon={appliedCoupon} onClose={() => setShowModal(false)} />
      )}
    </div>
  );
};

export default ApplyCoupon;
