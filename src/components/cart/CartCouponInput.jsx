import React, { useState, useEffect } from 'react';
import { db } from '@/firebase/config';
import { collection, query, where, getDocs } from 'firebase/firestore';
import toast from 'react-hot-toast';

const CartCouponInput = ({ onApply }) => {
  const [code, setCode] = useState('');
  const [applied, setApplied] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleApply = async () => {
    setLoading(true);
    const q = query(collection(db, 'coupons'), where('code', '==', code.trim().toUpperCase()), where('status', '==', 'live'));
    const snap = await getDocs(q);
    if (snap.empty) {
      toast.error('Invalid or inactive coupon');
      setApplied(null);
      onApply(null);
    } else {
      const coupon = { id: snap.docs[0].id, ...snap.docs[0].data() };
      setApplied(coupon);
      onApply(coupon);
      toast.success('Coupon applied!');
    }
    setLoading(false);
  };

  return (
    <div className="p-4 bg-white rounded shadow mb-4">
      <h3 className="font-bold mb-2">Apply Coupon</h3>
      <div className="flex gap-2">
        <input
          className="border p-2 rounded flex-1"
          placeholder="Enter coupon code"
          value={code}
          onChange={e => setCode(e.target.value)}
          disabled={loading}
        />
        <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={handleApply} disabled={loading || !code}>
          {loading ? 'Checking...' : 'Apply'}
        </button>
      </div>
      {applied && (
        <div className="mt-2 text-green-600 font-medium">Applied: {applied.code} ({applied.discountType === 'percent' ? `${applied.value}%` : `₹${applied.value}`})</div>
      )}
    </div>
  );
};

export default CartCouponInput;
