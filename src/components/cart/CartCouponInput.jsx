import React, { useState } from 'react';
import { db } from '@/firebase/config';
import { collection, query, where, getDocs } from 'firebase/firestore';
import toast from 'react-hot-toast';
import { Gift } from 'lucide-react';

const CartCouponInput = ({ onApply }) => {
  const [code, setCode] = useState('');
  const [applied, setApplied] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleApply = async () => {
    setLoading(true);
    const q = query(collection(db, 'coupons'), where('code', '==', code.trim().toUpperCase()), where('status', 'in', ['active', 'live']));
    const snap = await getDocs(q);
    if (snap.empty) {
      toast.error('Invalid or inactive coupon');
      setApplied(null);
      onApply(null);
      setLoading(false);
      return;
    }
    const docData = snap.docs[0].data();
    // Defensive: ensure discountValue is a number
    const coupon = {
      id: snap.docs[0].id,
      code: docData.code,
      discountType: docData.discountType,
      discountValue: Number(docData.discountValue),
      ...docData
    };
    setApplied(coupon);
    onApply(coupon);
    toast.success('Coupon applied!');
    setLoading(false);
  };

  return (
    <div className="mb-6">
      <div className="flex items-center bg-[#181818] border border-gray-700 rounded-full px-3 py-2 mb-2">
        <Gift className="w-5 h-5 text-gray-400 mr-2" />
        <input
          className="bg-transparent flex-1 outline-none text-white placeholder-gray-400 px-2"
          placeholder="Add promo code"
          value={code}
          onChange={e => setCode(e.target.value)}
          disabled={loading}
        />
        <button
          className="ml-2 bg-white text-black px-4 py-1.5 rounded-full font-semibold hover:bg-gray-200 transition disabled:opacity-60"
          onClick={handleApply}
          disabled={loading || !code}
        >
          {loading ? '...' : 'Apply'}
        </button>
      </div>
      {applied && (
        <div className="text-green-500 text-sm font-medium ml-2">
          Applied: {applied.code} ({applied.discountType === 'percent' ? `${applied.discountValue}%` : `₹${applied.discountValue}`})
        </div>
      )}
    </div>
  );
};

export default CartCouponInput;
