import React, { useState } from 'react';
import { db } from '@/firebase/config';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';

const CouponCreateForm = ({ sellers }) => {
  const { currentUser } = useAuth();
  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState('percent');
  const [value, setValue] = useState('');
  const [sellerId, setSellerId] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!code || !value || !sellerId) {
      toast.error('All fields are required');
      return;
    }
    setLoading(true);
    try {
      await addDoc(collection(db, 'coupons'), {
        code: code.trim().toUpperCase(),
        discountType,
        value: parseFloat(value),
        status: 'pending',
        createdBy: currentUser?.uid,
        sellerId,
        createdAt: Timestamp.now(),
        suggestion: '',
      });
      toast.success('Coupon created and sent to seller!');
      setCode('');
      setValue('');
      setSellerId('');
    } catch (err) {
      toast.error('Failed to create coupon');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 bg-white rounded-xl shadow">
      <h2 className="text-xl font-bold mb-2">Create Coupon</h2>
      <div>
        <label className="block mb-1 font-medium">Code</label>
        <input value={code} onChange={e => setCode(e.target.value)} className="w-full border p-2 rounded" required />
      </div>
      <div>
        <label className="block mb-1 font-medium">Discount Type</label>
        <select value={discountType} onChange={e => setDiscountType(e.target.value)} className="w-full border p-2 rounded">
          <option value="percent">Percent (%)</option>
          <option value="amount">Amount (₹)</option>
        </select>
      </div>
      <div>
        <label className="block mb-1 font-medium">Value</label>
        <input type="number" value={value} onChange={e => setValue(e.target.value)} className="w-full border p-2 rounded" required min="1" />
      </div>
      <div>
        <label className="block mb-1 font-medium">Assign to Seller</label>
        <select value={sellerId} onChange={e => setSellerId(e.target.value)} className="w-full border p-2 rounded" required>
          <option value="">Select Seller</option>
          {sellers.map(s => (
            <option key={s.uid} value={s.uid}>
              {s.name || s.email || s.uid}
            </option>
          ))}
        </select>
      </div>
      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded" disabled={loading}>{loading ? 'Creating...' : 'Create Coupon'}</button>
    </form>
  );
};

export default CouponCreateForm;
