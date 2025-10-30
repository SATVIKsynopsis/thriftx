"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import {
  CreditCard,
  MapPin,
  User,
  CheckCircle,
} from "lucide-react";
import {
  collection,
  addDoc,
  serverTimestamp,
  doc,
  getDoc,
} from "firebase/firestore";
import { db } from "@/firebase/config";
import Script from "next/script";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { formatPrice } from "@/utils/formatters";
import toast from "react-hot-toast";

const CheckoutComponent = () => {
  const [loading, setLoading] = useState(false);
  const { currentUser, userProfile } = useAuth();
  const { cartItems, getCartTotal, clearCart, appliedCoupon, setAppliedCoupon, fallbackUsed, setFallbackUsed } = useCart();
  const router = useRouter();

  const { register, handleSubmit, formState: { errors } } = useForm();


  // Calculate subtotal
  const subtotal = getCartTotal();
  // Coupon discount logic
        let couponDiscount = 0;
        if (appliedCoupon && typeof appliedCoupon.discountValue === 'number' && subtotal > 0) {
          if (appliedCoupon.discountType === 'percent') {
            couponDiscount = Math.floor(subtotal * (appliedCoupon.discountValue / 100));
          } else if (appliedCoupon.discountType === 'flat' || appliedCoupon.discountType === 'amount') {
            couponDiscount = Math.min(subtotal, Math.floor(appliedCoupon.discountValue));
          }
        }
        // Always show fallback (signup) discount for eligible new users
        let fallbackDiscount = 0;
        if (!fallbackUsed) {
          fallbackDiscount = Math.floor(subtotal * 0.2);
        }
          const discount = couponDiscount + fallbackDiscount;
    const shipping = subtotal > 50 ? 0 : 15; 
    const preTaxTotal = subtotal - discount + shipping;
    const tax = Math.round(preTaxTotal * 0.08); 
    const total = preTaxTotal + tax;

  const sellerId = cartItems.length > 0 ? cartItems[0].sellerId : null;

  const handleRazorpayPayment = async (orderData, onSuccess) => {
    if (!window.Razorpay) {
      toast.error("Razorpay SDK not loaded");
      return;
    }
    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_YourKeyHere", // Use env variable for Razorpay key
      amount: Math.round(orderData.total * 100), // in paise
      currency: "INR",
      name: "ThriftX",
      description: `Order ${orderData.orderNumber}`,
      handler: async function (response) {
        // Payment success
        await onSuccess(response);
      },
      prefill: {
        name: orderData.user.name,
        email: orderData.user.email,
        contact: orderData.user.phone,
      },
      theme: { color: "#6366f1" },
    };
    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  const onSubmit = async (data) => {
    setLoading(true);
    if (!sellerId) {
      toast.error("Seller information is missing.");
      setLoading(false);
      return;
    }

    try {
      // ✅ Fetch complete user data from Firestore
      const userRef = doc(db, "users", currentUser.uid);
      const userDoc = await getDoc(userRef);
      
      let userData = {
        name: `${data.firstName} ${data.lastName}`,
        email: data.email || currentUser.email,
        phone: data.phone || ''
      };
      
      // If user profile exists in Firestore, use that data
      if (userDoc.exists()) {
        const userInfo = userDoc.data();
        userData = {
          name: userInfo.name || userInfo.displayName || `${data.firstName} ${data.lastName}`,
          email: userInfo.email || currentUser.email,
          phone: data.phone || userInfo.phone || ''
        };
      }

      const enrichedItems = await Promise.all(
        cartItems.map(async (item) => {
          const productRef = doc(db, "products", item.productId);
          const productSnap = await getDoc(productRef);
          if (productSnap.exists()) {
            return {
              ...item,
              category: productSnap.data().category || "Uncategorized",
            };
          }
          return { ...item, category: "Uncategorized" };
        })
      );

      const now = new Date();
      const year = now.getFullYear().toString().slice(-2);
      const month = (now.getMonth() + 1).toString().padStart(2, '0');
      const day = now.getDate().toString().padStart(2, '0');
      const randomId = Math.random().toString(36).substring(2, 6).toUpperCase();
      const orderNumber = `ORD-${year}${month}${day}-${randomId}`;

      const orderData = {
        orderNumber,
        buyerId: currentUser.uid,
        userId: currentUser.uid,
        user: userData,
        buyerInfo: data,
        shippingAddress: {
          fullName: `${data.firstName} ${data.lastName}`,
          email: data.email,
          phone: data.phone,
          address: data.address,
          city: data.city,
          state: data.state,
          zipCode: data.zipCode
        },
        sellerId,
        items: enrichedItems,
        subtotal,
        shipping,
        tax,
        total,
  // paymentMethod removed
        status: "pending",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        appliedCoupon: appliedCoupon ? appliedCoupon.code : null,
        fallbackUsed: !appliedCoupon && !fallbackUsed ? true : false,
      };

      // Razorpay payment
      await new Promise((resolve, reject) => {
        handleRazorpayPayment(orderData, async (razorpayResponse) => {
          try {
            // 1. Add order to Firestore
            const orderRef = await addDoc(collection(db, "orders"), orderData);
            // 2. Mark coupon/fallback as used in Firestore
            if (appliedCoupon) {
              // Mark coupon as used
              const usageRef = doc(db, "coupon_usages", `${currentUser.uid}_${appliedCoupon.code}`);
              await setDoc(usageRef, {
                userId: currentUser.uid,
                couponCode: appliedCoupon.code,
                usedAt: new Date().toISOString(),
              }, { merge: true });
              setAppliedCoupon(null);
            } else if (!appliedCoupon && !fallbackUsed) {
              // Mark fallback as used
              const usageRef = doc(db, "coupon_usages", `${currentUser.uid}_FALLBACK20`);
              await setDoc(usageRef, {
                userId: currentUser.uid,
                couponCode: "FALLBACK20",
                usedAt: new Date().toISOString(),
              }, { merge: true });
              setFallbackUsed(true);
            }
            await clearCart();
            toast.success("Order placed and payment successful!");
            router.push("/orders");
            resolve();
          } catch (err) {
            toast.error("Order placed but failed to update coupon usage.");
            resolve();
          }
        });
      });
    } catch (error) {
      console.error("Error placing order:", error);
      toast.error("Failed to place order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center text-center p-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">
            Your cart is empty
          </h2>
          <p className="text-gray-500">Add items to proceed with checkout.</p>
        </div>
      </div>
    );
  }

  return (
  <main className="flex-1 bg-gray-50 dark:bg-black px-4 sm:px-8 py-12 min-h-screen transition-colors">
      {/* Razorpay script */}
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="afterInteractive" />
  <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">
          Checkout
        </h1>

  <div className="grid lg:grid-cols-[2fr_1fr] gap-8">
          {/* Checkout Form */}
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="bg-white dark:bg-[#0f0f0f] border-2 border-gray-300 dark:border-gray-700 rounded-3xl p-6 md:p-8 space-y-6 shadow-lg transition-colors"
          >
            {/* Contact Info */}
            <section className="mb-8">
              <h2 className="text-xl font-semibold flex items-center gap-2 text-gray-100 dark:text-white mb-4">
                <User size={20} /> Contact Information
              </h2>

              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="font-medium text-gray-100 dark:text-white">First Name</label>
                  <input
                    {...register("firstName", { required: "Required" })}
                    className={`w-full border-2 rounded-lg p-3 mt-1 ${
                      errors.firstName ? "border-red-500" : "border-gray-200"
                    }`}
                  />
                </div>
                <div>
                  <label className="font-medium text-gray-100 dark:text-white">Last Name</label>
                  <input
                    {...register("lastName", { required: "Required" })}
                    className={`w-full border-2 rounded-lg p-3 mt-1 ${
                      errors.lastName ? "border-red-500" : "border-gray-200"
                    }`}
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="font-medium text-gray-100 dark:text-white">Email</label>
                <input
                  type="email"
                  defaultValue={currentUser?.email}
                  {...register("email", { required: "Required" })}
                  className={`w-full border-2 rounded-lg p-3 mt-1 ${
                    errors.email ? "border-red-500" : "border-gray-200"
                  }`}
                />
              </div>

              <div className="mb-4">
                <label className="font-medium text-gray-100 dark:text-white">Phone</label>
                <input
                  {...register("phone", { required: "Required" })}
                  className={`w-full border-2 rounded-lg p-3 mt-1 ${
                    errors.phone ? "border-red-500" : "border-gray-200"
                  }`}
                />
              </div>
            </section>

            {/* Address */}
            <section className="mb-8">
              <h2 className="text-xl font-semibold flex items-center gap-2 text-gray-100 dark:text-white mb-4">
                <MapPin size={20} /> Shipping Address
              </h2>

              <div className="mb-4">
                <label className="font-medium text-gray-100 dark:text-white">Address</label>
                <input
                  {...register("address", { required: "Required" })}
                  className={`w-full border-2 rounded-lg p-3 mt-1 ${
                    errors.address ? "border-red-500" : "border-gray-200"
                  }`}
                />
              </div>

              <div className="grid md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="font-medium text-gray-100 dark:text-white">City</label>
                  <input
                    {...register("city", { required: "Required" })}
                    className={`w-full border-2 rounded-lg p-3 mt-1 ${
                      errors.city ? "border-red-500" : "border-gray-200"
                    }`}
                  />
                </div>

                <div>
                  <label className="font-medium text-gray-100 dark:text-white">State</label>
                  <input
                    {...register("state", { required: "Required" })}
                    placeholder="State"
                    className={`w-full border-2 rounded-lg p-3 mt-1 ${
                      errors.state ? "border-red-500" : "border-gray-200"
                    }`}
                  />
                </div>

                <div>
                  <label className="font-medium text-gray-100 dark:text-white">ZIP</label>
                  <input
                    {...register("zipCode", { required: "Required" })}
                    className={`w-full border-2 rounded-lg p-3 mt-1 ${
                      errors.zipCode ? "border-red-500" : "border-gray-200"
                    }`}
                  />
                </div>
              </div>
            </section>

            {/* Payment method selection removed as per requirements */}
          </form>

          {/* Order Summary */}
          <div className="bg-white dark:bg-[#0f0f0f] border-2 border-gray-300 dark:border-gray-700 rounded-3xl p-6 md:p-8 h-fit sticky top-8 shadow-lg transition-colors">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              Order Summary
            </h2>

            {cartItems.map((item) => (
              <div
                key={item.id}
                className="flex justify-between items-center border-b border-gray-200 py-3"
              >
                <div>
                  <div className="font-semibold text-gray-800">
                    {item.productName}
                  </div>
                  <div className="text-sm text-gray-500">
                    Qty: {item.quantity}
                  </div>
                </div>
                <div className="font-semibold text-green-600">
                  {formatPrice(item.price * item.quantity)}
                </div>
              </div>
            ))}

            <div className="flex flex-col gap-2 mt-4">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              {fallbackDiscount > 0 && (
                <div className="flex justify-between text-gray-600">
                  <span>Signup Discount (-20%)</span>
                  <span className="text-red-500 font-semibold">- {formatPrice(fallbackDiscount)}</span>
                </div>
              )}
              {appliedCoupon && couponDiscount > 0 && (
                <div className="flex justify-between text-gray-600">
                  <span>Coupon ({appliedCoupon.code})
                    {appliedCoupon.discountType === 'percent'
                      ? ` (-${appliedCoupon.discountValue}%)`
                      : appliedCoupon.discountType === 'flat'
                      ? ` (-${formatPrice(appliedCoupon.discountValue)})`
                      : ''}
                  </span>
                  <span className="text-red-500 font-semibold">- {formatPrice(couponDiscount)}</span>
                </div>
              )}
              <div className="flex justify-between text-gray-600">
                <span>Delivery Fee</span>
                <span>{shipping === 0 ? "FREE" : formatPrice(shipping)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Pre-Tax Total</span>
                <span>{formatPrice(preTaxTotal)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Tax</span>
                <span>{formatPrice(tax)}</span>
              </div>
            </div>

            <div className="flex justify-between border-t border-gray-200 pt-4 text-lg font-bold text-gray-800">
              <span>Total</span>
              <span>{formatPrice(total)}</span>
            </div>

            <button
              onClick={handleSubmit(onSubmit)}
              disabled={loading}
              className={`w-full mt-6 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              } text-white transition`}
            >
              {loading ? (
                "Processing..."
              ) : (
                <>
                  <CheckCircle size={20} /> Place Order
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
};

export default CheckoutComponent;