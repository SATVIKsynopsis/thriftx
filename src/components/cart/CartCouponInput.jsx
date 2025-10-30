import React, { useState } from 'react';
import { db } from '@/firebase/config';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import toast from 'react-hot-toast';
import { Gift } from 'lucide-react';

const CartCouponInput = ({ onApply }) => {
  const { currentUser } = useAuth();
  const { getCartTotal } = useCart();
  const [code, setCode] = useState('');
  const [applied, setApplied] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleApply = async () => {
    if (!currentUser) {
      toast.error('Please login to apply coupons');
      return;
    }

    if (!code.trim()) {
      toast.error('Please enter a coupon code');
      return;
    }

    setLoading(true);

    try {
      const couponCode = code.trim().toUpperCase();

      // 1. Check if coupon exists and is active
      const couponsQuery = query(
        collection(db, 'coupons'), 
        where('code', '==', couponCode)
      );
      const couponSnap = await getDocs(couponsQuery);

      if (couponSnap.empty) {
        toast.error('Invalid coupon code');
        setApplied(null);
        onApply(null);
        setLoading(false);
        return;
      }

      const docData = couponSnap.docs[0].data();

      // Check if coupon is active (reject pending or inactive coupons)
      const isActive = docData.isActive === true || 
                      docData.status === 'active' || 
                      docData.status === 'Active';

      if (!isActive || docData.status === 'pending' || docData.status === 'Pending') {
        toast.error('This coupon is not active yet');
        setApplied(null);
        onApply(null);
        setLoading(false);
        return;
      }

      // 2. Check if coupon has expired
      if (docData.expiryDate) {
        let expiryDate;
        
        // Handle different date formats
        if (typeof docData.expiryDate === 'string') {
          // String date like "2025-11-07"
          expiryDate = new Date(docData.expiryDate);
        } else if (docData.expiryDate.toDate && typeof docData.expiryDate.toDate === 'function') {
          // Firestore Timestamp
          expiryDate = docData.expiryDate.toDate();
        } else if (docData.expiryDate instanceof Date) {
          // Already a Date object
          expiryDate = docData.expiryDate;
        }
        
        if (expiryDate && expiryDate < new Date()) {
          toast.error('This coupon has expired');
          setApplied(null);
          onApply(null);
          setLoading(false);
          return;
        }
      }

      // 3. Check minimum order value
      if (docData.minOrderValue) {
        const cartTotal = getCartTotal();
        const minValue = Number(docData.minOrderValue);
        
        if (cartTotal < minValue) {
          toast.error(`Minimum order value of ₹${minValue} required for this coupon`);
          setApplied(null);
          onApply(null);
          setLoading(false);
          return;
        }
      }

      // 4. Check if coupon has reached its usage limit
      if (docData.usageLimit && docData.usedCount >= docData.usageLimit) {
        toast.error('This coupon has reached its usage limit');
        setApplied(null);
        onApply(null);
        setLoading(false);
        return;
      }

      // 5. ✅ CHECK IF USER HAS ALREADY USED THIS COUPON
      const usageQuery = query(
        collection(db, 'coupon_usages'),
        where('userId', '==', currentUser.uid),
        where('couponCode', '==', couponCode)
      );
      const usageSnap = await getDocs(usageQuery);

      if (!usageSnap.empty) {
        toast.error('You have already used this coupon in a previous order');
        setApplied(null);
        onApply(null);
        setLoading(false);
        return;
      }

      // 6. Apply the coupon
      const coupon = {
        id: couponSnap.docs[0].id,
        code: docData.code,
        discountType: docData.discountType,
        discountValue: Number(docData.discountValue),
        minOrderValue: docData.minOrderValue || 0,
        ...docData
      };

      setApplied(coupon);
      onApply(coupon);
      toast.success(`Coupon ${coupon.code} applied!`);
      setCode(''); // Clear input after successful apply

    } catch (error) {
      console.error('Error applying coupon:', error);
      toast.error('Failed to apply coupon. Please try again.');
      setApplied(null);
      onApply(null);
    } finally {
      setLoading(false);
    }
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
          onKeyPress={(e) => e.key === 'Enter' && handleApply()}
          disabled={loading}
        />
        <button
          className="ml-2 bg-white text-black px-4 py-1.5 rounded-full font-semibold hover:bg-gray-200 transition disabled:opacity-60"
          onClick={handleApply}
          disabled={loading || !code.trim()}
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