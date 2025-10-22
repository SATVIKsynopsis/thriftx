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
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { formatPrice } from "@/utils/formatters";
import toast from "react-hot-toast";

const CheckoutComponent = () => {
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("card");
  const { currentUser, userProfile } = useAuth();
  const { cartItems, getCartTotal, clearCart } = useCart();
  const router = useRouter();

  const { register, handleSubmit, formState: { errors } } = useForm();

  const subtotal = getCartTotal();
  const shipping = subtotal > 50 ? 0 : 9.99;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  const sellerId = cartItems.length > 0 ? cartItems[0].sellerId : null;

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

      // ✅ Generate readable order number
      const now = new Date();
      const year = now.getFullYear().toString().slice(-2);
      const month = (now.getMonth() + 1).toString().padStart(2, '0');
      const day = now.getDate().toString().padStart(2, '0');
      const randomId = Math.random().toString(36).substring(2, 6).toUpperCase();
      const orderNumber = `ORD-${year}${month}${day}-${randomId}`;

      const orderData = {
        // ✅ Order identification
        orderNumber: orderNumber,
        
        // ✅ User references
        buyerId: currentUser.uid,
        userId: currentUser.uid, // Also add userId for compatibility
        
        // ✅ EMBEDDED user data for quick access (THIS IS KEY!)
        user: userData,
        
        // Detailed buyer info (shipping address)
        buyerInfo: data,
        
        // Shipping address in standard format
        shippingAddress: {
          fullName: `${data.firstName} ${data.lastName}`,
          email: data.email,
          phone: data.phone,
          address: data.address,
          city: data.city,
          state: data.state,
          zipCode: data.zipCode
        },
        
        // Seller information
        sellerId,
        
        // Order items
        items: enrichedItems,
        
        // Pricing
        subtotal,
        shipping,
        tax,
        total,
        
        // Payment
        paymentMethod,
        
        // Status
        status: "pending",
        
        // Timestamps
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      const orderRef = await addDoc(collection(db, "orders"), orderData);
      console.log("✅ Order created:", orderRef.id);
      
      await clearCart();

      toast.success("Order placed successfully!");
      router.push("/orders");
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
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-4xl font-bold text-gray-900 text-center mb-10">
          Checkout
        </h1>

        <div className="grid lg:grid-cols-[1fr_400px] gap-8">
          {/* Checkout Form */}
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="bg-white rounded-xl shadow p-6"
          >
            {/* Contact Info */}
            <section className="mb-8">
              <h2 className="text-xl font-semibold flex items-center gap-2 text-gray-800 mb-4">
                <User size={20} /> Contact Information
              </h2>

              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="font-medium text-gray-700">First Name</label>
                  <input
                    {...register("firstName", { required: "Required" })}
                    className={`w-full border-2 rounded-lg p-3 mt-1 ${
                      errors.firstName ? "border-red-500" : "border-gray-200"
                    }`}
                  />
                </div>
                <div>
                  <label className="font-medium text-gray-700">Last Name</label>
                  <input
                    {...register("lastName", { required: "Required" })}
                    className={`w-full border-2 rounded-lg p-3 mt-1 ${
                      errors.lastName ? "border-red-500" : "border-gray-200"
                    }`}
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="font-medium text-gray-700">Email</label>
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
                <label className="font-medium text-gray-700">Phone</label>
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
              <h2 className="text-xl font-semibold flex items-center gap-2 text-gray-800 mb-4">
                <MapPin size={20} /> Shipping Address
              </h2>

              <div className="mb-4">
                <label className="font-medium text-gray-700">Address</label>
                <input
                  {...register("address", { required: "Required" })}
                  className={`w-full border-2 rounded-lg p-3 mt-1 ${
                    errors.address ? "border-red-500" : "border-gray-200"
                  }`}
                />
              </div>

              <div className="grid md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="font-medium text-gray-700">City</label>
                  <input
                    {...register("city", { required: "Required" })}
                    className={`w-full border-2 rounded-lg p-3 mt-1 ${
                      errors.city ? "border-red-500" : "border-gray-200"
                    }`}
                  />
                </div>

                <div>
                  <label className="font-medium text-gray-700">State</label>
                  <select
                    {...register("state", { required: "Required" })}
                    className={`w-full border-2 rounded-lg p-3 mt-1 ${
                      errors.state ? "border-red-500" : "border-gray-200"
                    }`}
                  >
                    <option value="">Select</option>
                    <option value="CA">California</option>
                    <option value="NY">New York</option>
                    <option value="TX">Texas</option>
                  </select>
                </div>

                <div>
                  <label className="font-medium text-gray-700">ZIP</label>
                  <input
                    {...register("zipCode", { required: "Required" })}
                    className={`w-full border-2 rounded-lg p-3 mt-1 ${
                      errors.zipCode ? "border-red-500" : "border-gray-200"
                    }`}
                  />
                </div>
              </div>
            </section>

            {/* Payment */}
            <section className="mb-8">
              <h2 className="text-xl font-semibold flex items-center gap-2 text-gray-800 mb-4">
                <CreditCard size={20} /> Payment Method
              </h2>

              <div className="grid grid-cols-2 gap-4">
                <div
                  onClick={() => setPaymentMethod("card")}
                  className={`p-4 rounded-lg border-2 cursor-pointer text-center ${
                    paymentMethod === "card"
                      ? "border-blue-600"
                      : "border-gray-200 hover:border-blue-400"
                  }`}
                >
                  Credit Card
                </div>
                <div
                  onClick={() => setPaymentMethod("paypal")}
                  className={`p-4 rounded-lg border-2 cursor-pointer text-center ${
                    paymentMethod === "paypal"
                      ? "border-blue-600"
                      : "border-gray-200 hover:border-blue-400"
                  }`}
                >
                  PayPal
                </div>
              </div>

              {paymentMethod === "card" && (
                <div className="mt-4 grid md:grid-cols-3 gap-4">
                  <input
                    placeholder="Card Number"
                    {...register("cardNumber", { required: "Required" })}
                    className={`w-full border-2 rounded-lg p-3 ${
                      errors.cardNumber ? "border-red-500" : "border-gray-200"
                    }`}
                  />
                  <input
                    placeholder="MM/YY"
                    {...register("expiry", { required: "Required" })}
                    className={`w-full border-2 rounded-lg p-3 ${
                      errors.expiry ? "border-red-500" : "border-gray-200"
                    }`}
                  />
                  <input
                    placeholder="CVV"
                    {...register("cvv", { required: "Required" })}
                    className={`w-full border-2 rounded-lg p-3 ${
                      errors.cvv ? "border-red-500" : "border-gray-200"
                    }`}
                  />
                </div>
              )}
            </section>
          </form>

          {/* Order Summary */}
          <div className="bg-white rounded-xl shadow p-6 h-fit sticky top-8">
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

            <div className="flex justify-between mt-4 text-gray-600">
              <span>Subtotal</span>
              <span>{formatPrice(subtotal)}</span>
            </div>

            <div className="flex justify-between text-gray-600">
              <span>Shipping</span>
              <span>{shipping === 0 ? "FREE" : formatPrice(shipping)}</span>
            </div>

            <div className="flex justify-between text-gray-600 mb-2">
              <span>Tax</span>
              <span>{formatPrice(tax)}</span>
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
    </div>
  );
};

export default CheckoutComponent;