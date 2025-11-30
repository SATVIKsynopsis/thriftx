"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import * as SeparatorPrimitive from "@radix-ui/react-separator";
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
  setDoc,
} from "firebase/firestore";
import { db } from "@/firebase/config";
import Script from "next/script";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { formatPrice } from "@/utils/formatters";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";

// Separator Component
function Separator({
  className,
  orientation = "horizontal",
  decorative = true,
  ...props
}) {
  return (
    <SeparatorPrimitive.Root
      data-slot="separator"
      decorative={decorative}
      orientation={orientation}
      className={cn(
        "bg-border shrink-0 data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-px",
        className
      )}
      {...props}
    />
  );
}

const CheckoutComponent = () => {
  const [loading, setLoading] = useState(false);
  const { currentUser, userProfile } = useAuth();
  const { 
    cartItems, 
    getCartTotal, 
    clearCart, 
    appliedCoupons, 
    setAppliedCoupons,
    fallbackUsed, 
    setFallbackUsed, 
    useFallback, 
    setUseFallback 
  } = useCart();
  const router = useRouter();

  const { register, handleSubmit, formState: { errors } } = useForm();

  // Calculate subtotal
  const subtotal = getCartTotal();
  
  // Calculate fallback (signup) discount first
  let fallbackDiscount = 0;
  const hasSignupCoupon = appliedCoupons.some(coupon => 
    coupon && typeof coupon.code === 'string' && 
    ['SIGNUP', 'FALLBACK20'].includes(coupon.code.toUpperCase())
  );

  // Apply fallback discount if eligible
  if (!fallbackUsed && !hasSignupCoupon) {
    fallbackDiscount = Math.floor(subtotal * 0.2);
  }

  // Calculate cumulative coupon discounts on remaining amount after fallback
  let remainingAmount = Math.max(0, subtotal - fallbackDiscount);
  let totalCouponDiscount = 0;
  const couponBreakdown = [];

  appliedCoupons.forEach(coupon => {
    if (coupon && typeof coupon.discountValue === 'number' && remainingAmount > 0) {
      let couponDiscount = 0;
      
      if (coupon.discountType === 'percent') {
        couponDiscount = Math.floor(remainingAmount * (coupon.discountValue / 100));
      } else if (coupon.discountType === 'flat' || coupon.discountType === 'amount') {
        couponDiscount = Math.min(remainingAmount, Math.floor(coupon.discountValue));
      }
      
      if (couponDiscount > 0) {
        couponBreakdown.push({
          code: coupon.code,
          type: coupon.discountType,
          value: coupon.discountValue,
          discount: couponDiscount
        });
      }
      
      totalCouponDiscount += couponDiscount;
      remainingAmount = Math.max(0, remainingAmount - couponDiscount);
    }
  });

  const discount = (fallbackDiscount || 0) + (totalCouponDiscount || 0);
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

  // 1️⃣ Ask backend to create Razorpay order
  const res = await fetch("/api/razorpay/create-order", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      amount: orderData.total,
      receipt: orderData.orderNumber,
      notes: { buyerId: orderData.buyerId },
    }),
  });

  const json = await res.json();
  if (!res.ok || !json.success) {
    console.error("Razorpay create order failed:", json);
    toast.error("Failed to start payment. Try again.");
    return;
  }

  const { order } = json;

  // 2️⃣ Open Razorpay Checkout with server-created order_id
  const options = {
    key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    order_id: order.id,
    amount: order.amount,
    currency: order.currency,
    name: "ThriftX",
    description: `Order ${orderData.orderNumber}`,
    handler: async function (response) {
      // 3️⃣ On success, forward to callback with both response + order
      await onSuccess(response, order);
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
    const userRef = doc(db, "users", currentUser.uid);
    const userDoc = await getDoc(userRef);

    let userData = {
      name: `${data.firstName} ${data.lastName}`,
      email: data.email || currentUser.email,
      phone: data.phone || "",
    };

    if (userDoc.exists()) {
      const userInfo = userDoc.data();
      userData = {
        name:
          userInfo.name ||
          userInfo.displayName ||
          `${data.firstName} ${data.lastName}`,
        email: userInfo.email || currentUser.email,
        phone: data.phone || userInfo.phone || "",
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
    const month = (now.getMonth() + 1).toString().padStart(2, "0");
    const day = now.getDate().toString().padStart(2, "0");
    const randomId = Math.random().toString(36).substring(2, 6).toUpperCase();
    const orderNumber = `ORD-${year}${month}${day}-${randomId}`;

    // ⚠️ createdAt / updatedAt should now be set on backend (admin),
    // not with client-side serverTimestamp()
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
        zipCode: data.zipCode,
      },
      sellerId,
      items: enrichedItems,
      subtotal,
      shipping,
      tax,
      total,
      status: "pending",
      appliedCoupons: appliedCoupons.map((c) => c.code),
      fallbackUsed: fallbackDiscount > 0 ? true : false,
    };

    // 🔥 Secure flow: let backend verify payment + create order + call Shiprocket
    await new Promise((resolve) => {
      handleRazorpayPayment(
        orderData,
        async (razorpayResponse, razorpayOrder) => {
          try {
           const verifyRes = await fetch("/api/razorpay/verify-payment", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    razorpay_order_id: razorpayResponse.razorpay_order_id,
    razorpay_payment_id: razorpayResponse.razorpay_payment_id,
    razorpay_signature: razorpayResponse.razorpay_signature,
    orderData,
  }),
});


            const verifyJson = await verifyRes.json();

            if (!verifyRes.ok || !verifyJson.success) {
              console.error("Payment verification failed:", verifyJson);
              toast.error(
                "Payment verification failed. If money is deducted, contact support."
              );
              resolve();
              return;
            }

            // ✅ Here the backend has:
            // - verified Razorpay signature
            // - created Firestore order (admin)
            // - (optionally) created Shiprocket order
            // - (optionally) marked coupons as used

            // Clear cart & local coupon state
            setAppliedCoupons([]);
            setUseFallback(false);
            await clearCart();

            toast.success("Order placed and payment successful!");
            router.push("/orders");
            resolve();
          } catch (err) {
            console.error("Error verifying payment:", err);
            toast.error(
              "Payment succeeded but order setup failed. Contact support."
            );
            resolve();
          }
        }
      );
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
      <div className="min-h-screen bg-gray-50 dark:bg-black flex items-center justify-center text-center p-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
            Your cart is empty
          </h2>
          <p className="text-gray-500 dark:text-gray-400">Add items to proceed with checkout.</p>
        </div>
      </div>
    );
  }

  return (
    <main className="flex-1 bg-gray-50 dark:bg-black px-4 sm:px-8 py-12 min-h-screen transition-colors">
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
            <section>
              <h2 className="text-xl font-semibold flex items-center gap-2 text-gray-900 dark:text-white mb-4">
                <User size={20} /> Contact Information
              </h2>

              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="font-medium text-gray-900 dark:text-white">First Name</label>
                  <input
                    {...register("firstName", { required: "Required" })}
                    className={`w-full border-2 rounded-lg p-3 mt-1 bg-white dark:bg-gray-800 text-gray-900 dark:text-white ${
                      errors.firstName ? "border-red-500" : "border-gray-200 dark:border-gray-700"
                    }`}
                  />
                </div>
                <div>
                  <label className="font-medium text-gray-900 dark:text-white">Last Name</label>
                  <input
                    {...register("lastName", { required: "Required" })}
                    className={`w-full border-2 rounded-lg p-3 mt-1 bg-white dark:bg-gray-800 text-gray-900 dark:text-white ${
                      errors.lastName ? "border-red-500" : "border-gray-200 dark:border-gray-700"
                    }`}
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="font-medium text-gray-900 dark:text-white">Email</label>
                <input
                  type="email"
                  defaultValue={currentUser?.email}
                  {...register("email", { required: "Required" })}
                  className={`w-full border-2 rounded-lg p-3 mt-1 bg-white dark:bg-gray-800 text-gray-900 dark:text-white ${
                    errors.email ? "border-red-500" : "border-gray-200 dark:border-gray-700"
                  }`}
                />
              </div>

              <div className="mb-4">
                <label className="font-medium text-gray-900 dark:text-white">Phone</label>
                <input
                  {...register("phone", { required: "Required" })}
                  className={`w-full border-2 rounded-lg p-3 mt-1 bg-white dark:bg-gray-800 text-gray-900 dark:text-white ${
                    errors.phone ? "border-red-500" : "border-gray-200 dark:border-gray-700"
                  }`}
                />
              </div>
            </section>

            <Separator className="bg-gray-200 dark:bg-gray-700" />

            {/* Address */}
            <section>
              <h2 className="text-xl font-semibold flex items-center gap-2 text-gray-900 dark:text-white mb-4">
                <MapPin size={20} /> Shipping Address
              </h2>

              <div className="mb-4">
                <label className="font-medium text-gray-900 dark:text-white">Address</label>
                <input
                  {...register("address", { required: "Required" })}
                  className={`w-full border-2 rounded-lg p-3 mt-1 bg-white dark:bg-gray-800 text-gray-900 dark:text-white ${
                    errors.address ? "border-red-500" : "border-gray-200 dark:border-gray-700"
                  }`}
                />
              </div>

              <div className="grid md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="font-medium text-gray-900 dark:text-white">City</label>
                  <input
                    {...register("city", { required: "Required" })}
                    className={`w-full border-2 rounded-lg p-3 mt-1 bg-white dark:bg-gray-800 text-gray-900 dark:text-white ${
                      errors.city ? "border-red-500" : "border-gray-200 dark:border-gray-700"
                    }`}
                  />
                </div>

                <div>
                  <label className="font-medium text-gray-900 dark:text-white">State</label>
                  <input
                    {...register("state", { required: "Required" })}
                    placeholder="State"
                    className={`w-full border-2 rounded-lg p-3 mt-1 bg-white dark:bg-gray-800 text-gray-900 dark:text-white ${
                      errors.state ? "border-red-500" : "border-gray-200 dark:border-gray-700"
                    }`}
                  />
                </div>

                <div>
                  <label className="font-medium text-gray-900 dark:text-white">ZIP</label>
                  <input
                    {...register("zipCode", { required: "Required" })}
                    className={`w-full border-2 rounded-lg p-3 mt-1 bg-white dark:bg-gray-800 text-gray-900 dark:text-white ${
                      errors.zipCode ? "border-red-500" : "border-gray-200 dark:border-gray-700"
                    }`}
                  />
                </div>
              </div>
            </section>
          </form>

          {/* Order Summary */}
          <div className="bg-white dark:bg-[#0f0f0f] border-2 border-gray-300 dark:border-gray-700 rounded-3xl p-6 md:p-8 h-fit sticky top-8 shadow-lg transition-colors">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Order Summary
            </h2>

            <div className="space-y-3 mb-4">
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between items-center pb-3 border-b border-gray-200 dark:border-gray-700"
                >
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-white text-sm">
                      {item.productName}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Qty: {item.quantity}
                    </div>
                  </div>
                  <div className="font-semibold text-green-600 dark:text-green-400 text-sm">
                    {formatPrice(item.price * item.quantity)}
                  </div>
                </div>
              ))}
            </div>

            <Separator className="bg-gray-300 dark:bg-gray-600 my-4" />

            <div className="flex flex-col gap-3">
              <div className="flex justify-between text-gray-600 dark:text-gray-300 text-sm">
                <span>Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>

              {/* Fallback/Signup Discount */}
              {fallbackDiscount > 0 && (
                <div className="flex justify-between text-green-600 dark:text-green-400 text-sm">
                  <span>Signup Discount (-20%)</span>
                  <span className="font-semibold">-{formatPrice(fallbackDiscount)}</span>
                </div>
              )}

              {/* Individual Coupon Discounts */}
              {couponBreakdown.map((item) => (
                <div key={item.code} className="flex justify-between text-green-600 dark:text-green-400 text-sm">
                  <span>
                    {item.code}
                    {item.type === 'percent' ? ` (-${item.value}%)` : ` (-₹${item.value})`}
                  </span>
                  <span className="font-semibold">-{formatPrice(item.discount)}</span>
                </div>
              ))}

              <div className="flex justify-between text-gray-600 dark:text-gray-300 text-sm">
                <span>Delivery Fee</span>
                <span>{shipping === 0 ? "FREE" : formatPrice(shipping)}</span>
              </div>

              <div className="flex justify-between text-gray-600 dark:text-gray-300 text-sm">
                <span>Tax (8%)</span>
                <span>{formatPrice(tax)}</span>
              </div>

              {/* Total Savings */}
              {discount > 0 && (
                <>
                  <Separator className="bg-gray-200 dark:bg-gray-700" />
                  <div className="flex justify-between text-green-600 dark:text-green-400 font-semibold text-sm">
                    <span>Total Savings</span>
                    <span>-{formatPrice(discount)}</span>
                  </div>
                </>
              )}
            </div>

            <Separator className="bg-gray-300 dark:bg-gray-600 my-4" />

            <div className="flex justify-between text-lg font-bold text-gray-900 dark:text-white">
              <span>Total</span>
              <span>{formatPrice(total)}</span>
            </div>

            {appliedCoupons.length > 0 && (
              <>
                <Separator className="bg-gray-200 dark:bg-gray-700 my-4" />
                <div className="p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-sm text-green-800 dark:text-green-200">
                  <span className="font-semibold">Applied Coupons: </span>
                  <span>{appliedCoupons.map(c => c.code).join(", ")}</span>
                </div>
              </>
            )}

            <button
              onClick={handleSubmit(onSubmit)}
              disabled={loading}
              className={`w-full mt-6 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
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
