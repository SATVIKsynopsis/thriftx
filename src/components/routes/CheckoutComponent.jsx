"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { CreditCard, MapPin, User, CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { addDoc, collection, doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { db } from "@/firebase/config";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import Script from "next/script";
import { formatPrice } from "@/utils/formatters";
import toast from "react-hot-toast";

const CheckoutComponent = () => {
  const [loading, setLoading] = useState(false);
  const { currentUser } = useAuth();
  const { cartItems, getCartTotal, clearCart, appliedCoupon, setAppliedCoupon, fallbackUsed, setFallbackUsed } = useCart();
  const router = useRouter();
  const { register, handleSubmit, formState: { errors } } = useForm();

  const subtotal = getCartTotal();
  let couponDiscount = 0;
  if (appliedCoupon && typeof appliedCoupon.discountValue === "number" && subtotal > 0) {
    if (appliedCoupon.discountType === "percent") {
      couponDiscount = Math.floor(subtotal * (appliedCoupon.discountValue / 100));
    } else {
      couponDiscount = Math.min(subtotal, Math.floor(appliedCoupon.discountValue));
    }
  }

  let fallbackDiscount = 0;
  if (!fallbackUsed) fallbackDiscount = Math.floor(subtotal * 0.2);

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
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_YourKeyHere",
      amount: Math.round(orderData.total * 100),
      currency: "INR",
      name: "ThriftX",
      description: `Order ${orderData.orderNumber}`,
      handler: async (response) => await onSuccess(response),
      prefill: {
        name: orderData.user.name,
        email: orderData.user.email,
        contact: orderData.user.phone,
      },
      theme: { color: "#6366f1" },
    };
    new window.Razorpay(options).open();
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
        const u = userDoc.data();
        userData = { name: u.name || userData.name, email: u.email || userData.email, phone: u.phone || userData.phone };
      }

      const now = new Date();
      const orderNumber = `ORD-${now.getFullYear().toString().slice(-2)}${(now.getMonth() + 1)
        .toString()
        .padStart(2, "0")}${now.getDate().toString().padStart(2, "0")}-${Math.random()
        .toString(36)
        .substring(2, 6)
        .toUpperCase()}`;

      const orderData = {
        orderNumber,
        buyerId: currentUser.uid,
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
        items: cartItems,
        subtotal,
        shipping,
        tax,
        total,
        status: "pending",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        appliedCoupon: appliedCoupon ? appliedCoupon.code : null,
        fallbackUsed: !appliedCoupon && !fallbackUsed ? true : false,
      };

      await new Promise((resolve) => {
        handleRazorpayPayment(orderData, async () => {
          try {
            await addDoc(collection(db, "orders"), orderData);
            if (appliedCoupon) {
              await setDoc(doc(db, "coupon_usages", `${currentUser.uid}_${appliedCoupon.code}`), {
                userId: currentUser.uid,
                couponCode: appliedCoupon.code,
                usedAt: new Date().toISOString(),
              });
              setAppliedCoupon(null);
            } else if (!appliedCoupon && !fallbackUsed) {
              await setDoc(doc(db, "coupon_usages", `${currentUser.uid}_FALLBACK20`), {
                userId: currentUser.uid,
                couponCode: "FALLBACK20",
                usedAt: new Date().toISOString(),
              });
              setFallbackUsed(true);
            }
            await clearCart();
            toast.success("Order placed successfully!");
            router.push("/orders");
            resolve();
          } catch (e) {
            toast.error("Order placed, but failed to update coupon usage.");
            resolve();
          }
        });
      });
    } catch (e) {
      toast.error("Failed to place order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (cartItems.length === 0)
    return (
      <div className="min-h-screen flex items-center justify-center text-center">
        <Card className="p-10">
          <CardTitle>Your cart is empty 🛒</CardTitle>
          <p className="text-gray-500 mt-2">Add items to proceed with checkout.</p>
        </Card>
      </div>
    );

  return (
    <main className="bg-gray-50 dark:bg-black py-10 px-4 sm:px-8 min-h-screen">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="afterInteractive" />
      <div className="max-w-6xl mx-auto grid lg:grid-cols-[2fr_1fr] gap-8">
        {/* Checkout Form */}
        <Card className="p-6 md:p-8 shadow-md border-gray-300 dark:border-gray-700 dark:bg-[#0f0f0f]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <User className="text-indigo-500" /> Contact Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Name */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>First Name</Label>
                  <Input {...register("firstName", { required: true })} />
                  {errors.firstName && <p className="text-red-500 text-sm">Required</p>}
                </div>
                <div>
                  <Label>Last Name</Label>
                  <Input {...register("lastName", { required: true })} />
                  {errors.lastName && <p className="text-red-500 text-sm">Required</p>}
                </div>
              </div>

              <div>
                <Label>Email</Label>
                <Input type="email" defaultValue={currentUser?.email} {...register("email", { required: true })} />
                {errors.email && <p className="text-red-500 text-sm">Required</p>}
              </div>

              <div>
                <Label>Phone</Label>
                <Input {...register("phone", { required: true })} />
                {errors.phone && <p className="text-red-500 text-sm">Required</p>}
              </div>

              <Separator className="my-6" />

              <CardTitle className="flex items-center gap-2 text-xl mb-4">
                <MapPin className="text-indigo-500" /> Shipping Address
              </CardTitle>

              <div>
                <Label>Address</Label>
                <Input {...register("address", { required: true })} />
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <Label>City</Label>
                  <Input {...register("city", { required: true })} />
                </div>
                <div>
                  <Label>State</Label>
                  <Input {...register("state", { required: true })} />
                </div>
                <div>
                  <Label>ZIP</Label>
                  <Input {...register("zipCode", { required: true })} />
                </div>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Order Summary */}
        <Card className="p-6 md:p-8 h-fit sticky top-8 shadow-md dark:bg-[#0f0f0f] border-gray-300 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <CreditCard className="text-indigo-500" /> Order Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            {cartItems.map((item) => (
              <div key={item.id} className="flex justify-between items-center py-3 border-b border-gray-200">
                <div>
                  <p className="font-semibold">{item.productName}</p>
                  <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                </div>
                <p className="font-semibold text-green-600">{formatPrice(item.price * item.quantity)}</p>
              </div>
            ))}

            <div className="space-y-2 mt-4 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              {fallbackDiscount > 0 && (
                <div className="flex justify-between">
                  <span>Signup Discount (-20%)</span>
                  <span className="text-red-500">- {formatPrice(fallbackDiscount)}</span>
                </div>
              )}
              {appliedCoupon && couponDiscount > 0 && (
                <div className="flex justify-between">
                  <span>Coupon ({appliedCoupon.code})</span>
                  <span className="text-red-500">- {formatPrice(couponDiscount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Delivery Fee</span>
                <span>{shipping === 0 ? "FREE" : formatPrice(shipping)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax</span>
                <span>{formatPrice(tax)}</span>
              </div>
            </div>

            <Separator className="my-4" />

            <div className="flex justify-between text-lg font-bold">
              <span>Total</span>
              <span>{formatPrice(total)}</span>
            </div>

            <Button
              onClick={handleSubmit(onSubmit)}
              disabled={loading}
              className="w-full mt-6 flex items-center justify-center gap-2 text-white dark:bg-lime-500 dark:text-black"
            >
              {loading ? "Processing..." : <>
                <CheckCircle size={18} /> Place Order
              </>}
            </Button>
          </CardContent>
        </Card>
      </div>
    </main>
  );
};

export default CheckoutComponent;
