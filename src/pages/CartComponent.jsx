"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { formatPrice } from "@/utils/formatters";

const CartComponent = () => {
  const { cartItems, removeFromCart, updateQuantity, getCartTotal, getItemCount } = useCart();
  const { currentUser } = useAuth();
  const router = useRouter();

  const subtotal = getCartTotal();
  const shipping = subtotal > 50 ? 0 : 9.99;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-xl shadow p-10 text-center">
            <div className="w-20 h-20 mx-auto mb-6 flex items-center justify-center rounded-full bg-gray-100 text-gray-400">
              <ShoppingBag size={40} />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Please Login</h2>
            <p className="text-gray-500 mb-6">You need to be logged in to view your cart</p>
            <Link
              href="/login"
              className="inline-flex items-center bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <Link
            href="/search"
            className="inline-flex items-center gap-2 text-gray-500 hover:text-blue-600 mb-8 transition"
          >
            <ArrowLeft size={20} /> Continue Shopping
          </Link>

          <div className="bg-white rounded-xl shadow p-10 text-center">
            <div className="w-20 h-20 mx-auto mb-6 flex items-center justify-center rounded-full bg-gray-100 text-gray-400">
              <ShoppingBag size={40} />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Your cart is empty</h2>
            <p className="text-gray-500 mb-6">Add some products to get started</p>
            <Link
              href="/search"
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              <ShoppingBag size={20} /> Start Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <Link
          href="/search"
          className="inline-flex items-center gap-2 text-gray-500 hover:text-blue-600 mb-6 transition"
        >
          <ArrowLeft size={20} /> Continue Shopping
        </Link>

        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-1">Shopping Cart</h1>
          <p className="text-lg text-gray-500">{getItemCount()} items in your cart</p>
        </div>

        <div className="grid lg:grid-cols-[1fr_400px] gap-8">
          {/* Cart Items */}
          <div className="bg-white rounded-xl shadow p-6">
            {cartItems.map((item) => (
              <div
                key={item.id}
                className="grid md:grid-cols-[120px_1fr_auto] gap-6 py-6 border-b border-gray-200 last:border-none"
              >
                {item.productImage ? (
                  <Image
                    src={item.productImage || item.image || "/placeholder.jpg"}
                    alt={item.productName || item.name || "Product image"}
                    width={120}
                    height={120}
                    className="rounded-lg object-cover w-28 h-28"
                    onError={(e) => (e.target.style.display = "none")}
                  />
                ) : (
                  <div className="w-28 h-28 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 text-xs">
                    No Image
                  </div>
                )}

                <div className="flex flex-col justify-between">
                  <div>
                    <Link
                      href={`/product/${item.productId}`}
                      className="text-lg font-semibold text-gray-800 hover:text-blue-600 transition"
                    >
                      {item.productName}
                    </Link>
                    <p className="text-sm text-gray-500">Sold by seller</p>
                  </div>
                  <div className="text-xl font-bold text-green-600">
                    {formatPrice(item.price)}
                  </div>
                </div>

                <div className="flex flex-col items-end justify-between md:gap-0 gap-4 md:mt-0 mt-4">
                  <button
                    onClick={() => removeFromCart(item.id)}
                    title="Remove item"
                    className="text-red-500 p-2 rounded-lg hover:bg-red-50 transition"
                  >
                    <Trash2 size={20} />
                  </button>

                  <div className="flex items-center border-2 border-gray-200 rounded-lg overflow-hidden">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                      className="px-3 py-2 bg-gray-50 hover:bg-gray-100 disabled:opacity-50"
                    >
                      <Minus size={16} />
                    </button>
                    <span className="px-4 py-2 font-semibold bg-white min-w-[3rem] text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="px-3 py-2 bg-gray-50 hover:bg-gray-100"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="bg-white rounded-xl shadow p-6 h-fit sticky top-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Order Summary</h2>

            <div className="flex justify-between mb-4">
              <span className="text-gray-500">
                Subtotal ({getItemCount()} items)
              </span>
              <span className="font-semibold text-gray-800">{formatPrice(subtotal)}</span>
            </div>

            <div className="flex justify-between mb-4">
              <span className="text-gray-500">Shipping</span>
              <span className="font-semibold text-gray-800">
                {shipping === 0 ? "FREE" : formatPrice(shipping)}
              </span>
            </div>

            <div className="flex justify-between mb-4">
              <span className="text-gray-500">Tax</span>
              <span className="font-semibold text-gray-800">{formatPrice(tax)}</span>
            </div>

            <div className="flex justify-between border-t border-gray-200 pt-4 text-lg font-bold text-gray-800">
              <span>Total</span>
              <span>{formatPrice(total)}</span>
            </div>

            <Link
              href="/checkout"
              className="block w-full mt-6 bg-blue-600 text-white text-center py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              Proceed to Checkout
            </Link>

            {subtotal < 50 && (
              <p className="text-sm text-gray-500 text-center mt-3">
                Add {formatPrice(50 - subtotal)} more for free shipping
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartComponent;
