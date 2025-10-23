"use client";

import { Trash2, Plus, Minus } from "lucide-react";
import { Sansation } from "next/font/google";

const sansation = Sansation({
  weight: ["400", "700"],
  subsets: ["latin"],
});

export default function CartItem({ item, onUpdateQuantity, onRemove }) {
  return (
    <div className="flex items-center gap-6 pb-6 border-b border-gray-300 dark:border-gray-500 last:border-none">
      {/* Product Image */}
      <img
        src={item.productImage || "/placeholder.jpg"}
        alt={item.productName || "Product image"}
        className="w-24 h-24 rounded-2xl object-cover border border-gray-300 dark:border-gray-500"
      />

      {/* Product Details */}
      <div
        className={`flex flex-col justify-between flex-1 h-24 ${sansation.className}`}
      >
        <div>
          <h3 className="text-gray-900 dark:text-white font-semibold text-base">
            {item.productName}
          </h3>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 space-y-[2px]">
            <p>Size: {item.productSize || "—"}</p>
            <p>Color: {item.color || "—"}</p>
          </div>
        </div>

        {/* Price with subtle margin from color */}
        <span className="text-gray-900 dark:text-white font-bold text-lg mt-1">
          ₹{item.price}
        </span>
      </div>

      {/* Quantity & Delete */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3 bg-gray-200 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-full px-3 py-1">
          <button onClick={() => onUpdateQuantity(item.quantity - 1)}>
            <Minus className="w-4 h-4 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition" />
          </button>
          <span className="text-gray-900 dark:text-white text-sm font-medium">
            {item.quantity}
          </span>
          <button onClick={() => onUpdateQuantity(item.quantity + 1)}>
            <Plus className="w-4 h-4 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition" />
          </button>
        </div>

        <button
          onClick={() => onRemove(item.id)}
          className="text-red-600 dark:text-red-500 hover:text-red-500 dark:hover:text-red-400 transition"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
