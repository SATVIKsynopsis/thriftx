import React, { useEffect, useState } from 'react';
import { db } from '@/firebase/config';
import { collection, query, getDocs, doc, updateDoc } from 'firebase/firestore';
import toast from 'react-hot-toast';

const CouponReviewList = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCoupons = async () => {
      setLoading(true);
      const q = query(collection(db, 'coupons'));
      const snap = await getDocs(q);
      setCoupons(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    };
    fetchCoupons();
  }, []);

  const handleFinalize = async (id, finalStatus) => {
    try {
      await updateDoc(doc(db, 'coupons', id), { status: finalStatus });
      toast.success(`Coupon ${finalStatus === 'live' ? 'is now live!' : 'rejected.'}`);
      setCoupons(coupons.map(c => c.id === id ? { ...c, status: finalStatus } : c));
    } catch {
      toast.error('Failed to update coupon');
    }
  };

  if (loading) return <div>Loading coupons...</div>;
  if (coupons.length === 0) return <div>No coupons found.</div>;

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold mb-2">All Coupons</h2>
      {coupons.map(coupon => (
        <div key={coupon.id} className="p-4 bg-white rounded shadow flex flex-col gap-2">
          <div><b>Code:</b> {coupon.code}</div>
          <div><b>Type:</b> {coupon.discountType} {coupon.value}</div>
          <div><b>Status:</b> {coupon.status}</div>
          <div><b>Seller Suggestion:</b> {coupon.suggestion || '—'}</div>
          {coupon.status === 'approved' || coupon.status === 'rejected' ? (
            <div className="flex gap-2">
              <button className="bg-green-600 text-white px-3 py-1 rounded" onClick={() => handleFinalize(coupon.id, 'live')}>Make Live</button>
              <button className="bg-red-600 text-white px-3 py-1 rounded" onClick={() => handleFinalize(coupon.id, 'rejected')}>Reject</button>
            </div>
          ) : null}
        </div>
      ))}
    </div>
  );
};

export default CouponReviewList;
