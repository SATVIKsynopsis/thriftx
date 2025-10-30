"use client"

import React, { useEffect, useState } from 'react';
import { db } from '@/firebase/config';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';

const CouponApprovalList = () => {
  const { currentUser } = useAuth();
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [suggestions, setSuggestions] = useState({});

  useEffect(() => {
    if (!currentUser) return;
    const fetchCoupons = async () => {
      setLoading(true);
      const q = query(collection(db, 'coupons'), where('sellerId', '==', currentUser.uid), where('status', '==', 'pending'));
      const snap = await getDocs(q);
      setCoupons(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    };
    fetchCoupons();
  }, [currentUser]);

  const handleAction = async (id, action) => {
    const suggestion = suggestions[id] || '';
    try {
      await updateDoc(doc(db, 'coupons', id), {
        status: action,
        suggestion,
      });
      toast.success(`Coupon ${action === 'approved' ? 'approved' : 'rejected'}!`);
      setCoupons(coupons.filter(c => c.id !== id));
    } catch {
      toast.error('Failed to update coupon');
    }
  };

  if (loading) return <div>Loading coupons...</div>;
  if (coupons.length === 0) return <div>No coupons to review.</div>;

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold mb-2">Coupon Requests</h2>
      {coupons.map(coupon => (
        <div key={coupon.id} className="p-4 bg-white rounded shadow flex flex-col gap-2">
          <div><b>Code:</b> {coupon.code}</div>
          <div><b>Type:</b> {coupon.discountType} {coupon.value}</div>
          <div>
            <textarea
              placeholder="Suggestion (optional)"
              value={suggestions[coupon.id] || ''}
              onChange={e => setSuggestions(s => ({ ...s, [coupon.id]: e.target.value }))}
              className="w-full border p-2 rounded"
            />
          </div>
          <div className="flex gap-2">
            <button className="bg-green-600 text-white px-3 py-1 rounded" onClick={() => handleAction(coupon.id, 'approved')}>Approve</button>
            <button className="bg-red-600 text-white px-3 py-1 rounded" onClick={() => handleAction(coupon.id, 'rejected')}>Reject</button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CouponApprovalList;
