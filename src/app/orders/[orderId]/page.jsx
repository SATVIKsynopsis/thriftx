"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebase/config";
import { Calendar, Package, Truck } from "lucide-react";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { formatPrice } from "@/utils/formatters";

export default function OrderDetailsPage() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOrder = async () => {
      try {
        const snap = await getDoc(doc(db, "orders", orderId));
        if (snap.exists()) setOrder(snap.data());
      } catch (err) {
        console.error("Error loading order:", err);
      }
      setLoading(false);
    };
    loadOrder();
  }, [orderId]);

  const formatDate = (timestamp) => {
    if (!timestamp) return "N/A";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  if (loading) return <LoadingSpinner text="Loading order..." />;

  if (!order)
    return (
      <p className="text-center mt-20 text-gray-600 dark:text-gray-300">
        Order not found.
      </p>
    );

  const hasShipping = order.awb_code || order.tracking_url || order.courier_name;

  return (
    <div className="min-h-screen bg-white dark:bg-black py-10 transition-colors">
      <div className="max-w-4xl mx-auto px-4">
        
        {/* Heading */}
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Order Details
        </h1>
        <p className="text-gray-700 dark:text-gray-300 mb-8">
          Order <span className="font-medium">#{orderId.slice(-8)}</span>
        </p>

        <div className="bg-gray-100 dark:bg-[#0f0f0f] border border-gray-300 dark:border-[#1f1f1f] rounded-xl shadow p-6 space-y-6 transition-colors">

          {/* Details Row */}
          <div className="flex items-center gap-6 text-gray-700 dark:text-gray-300">
            <div className="flex items-center gap-2">
              <Calendar size={18} />
              <span>{formatDate(order.createdAt)}</span>
            </div>

            <div className="flex items-center gap-2">
              <Package size={18} />
              <span>{order.items?.length} items</span>
            </div>

            <span
              className={`
                px-3 py-1 rounded-full text-sm font-medium
                ${
                  order.status === "paid"
                    ? "bg-green-200 text-green-900 dark:bg-green-700 dark:text-white"
                    : "bg-gray-200 text-gray-900 dark:bg-gray-600 dark:text-white"
                }
              `}
            >
              {order.status}
            </span>
          </div>

          {/* Shipping Block */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-3">
              <Truck size={20} /> Shipping Information
            </h2>

            {!hasShipping ? (
              <div className="bg-gray-200 dark:bg-[#1a1a1a] text-gray-700 dark:text-gray-300 p-4 rounded-lg">
                Shipping details will appear once the seller ships your order.
              </div>
            ) : (
              <div className="bg-black/5 dark:bg-[#1a1a1a] p-4 rounded-lg border border-gray-300 dark:border-[#2e2e2e] space-y-2">
                {order.courier_name && (
                  <p className="text-gray-700 dark:text-gray-300">
                    <strong>Courier:</strong> {order.courier_name}
                  </p>
                )}
                {order.awb_code && (
                  <p className="text-gray-700 dark:text-gray-300">
                    <strong>AWB:</strong> {order.awb_code}
                  </p>
                )}
                {order.tracking_url && (
                  <a
                    href={order.tracking_url}
                    target="_blank"
                    className="inline-block px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Track Shipment
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Items */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Items
            </h2>

            <div className="space-y-4">
              {order.items?.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-4 p-4 rounded-lg bg-gray-100 dark:bg-[#1a1a1a] border border-gray-300 dark:border-[#2e2e2e]"
                >
                  <img
                    src={item.productImage}
                    alt={item.productName}
                    className="w-20 h-20 rounded-lg object-cover border border-gray-300 dark:border-[#2e2e2e]"
                  />

                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {item.productName}
                    </p>
                    <p className="text-gray-600 dark:text-gray-400">
                      {formatPrice(item.price)}
                    </p>
                  </div>

                  <p className="text-gray-900 dark:text-gray-300 font-medium">
                    Qty: {item.quantity}
                  </p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
