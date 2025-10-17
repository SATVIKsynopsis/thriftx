"use client";

import React, { useState, useEffect } from "react";
import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
} from "firebase/firestore";
import {
  Package,
  Calendar,
} from "lucide-react";
import { db } from "@/firebase/config";
import { useAuth } from "@/contexts/AuthContext";
import { formatPrice } from "@/utils/formatters";
import LoadingSpinner from "@/components/common/LoadingSpinner";

const statusOptions = [
  { key: "all", label: "All Orders" },
  { key: "pending", label: "Pending" },
  { key: "processing", label: "Processing" },
  { key: "shipped", label: "Shipped" },
  { key: "delivered", label: "Delivered" },
  { key: "cancelled", label: "Cancelled" },
];

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("all");
  const { currentUser } = useAuth();

  useEffect(() => {
    const fetchOrders = async () => {
      if (!currentUser) return;

      setLoading(true);
      try {
        const buyerQuery = query(
          collection(db, "orders"),
          where("buyerId", "==", currentUser.uid),
          orderBy("createdAt", "desc")
        );
        const sellerQuery = query(
          collection(db, "orders"),
          where("sellerId", "==", currentUser.uid),
          orderBy("createdAt", "desc")
        );

        const [buyerSnap, sellerSnap] = await Promise.all([
          getDocs(buyerQuery),
          getDocs(sellerQuery),
        ]);

        const buyerOrders = buyerSnap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
          type: "purchase",
        }));
        const sellerOrders = sellerSnap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
          type: "sale",
        }));

        const allOrders = [...buyerOrders, ...sellerOrders].sort((a, b) => {
          const dateA = a.createdAt?.toDate?.() || 0;
          const dateB = b.createdAt?.toDate?.() || 0;
          return dateB - dateA;
        });

        setOrders(allOrders);
        setFilteredOrders(allOrders);
      } catch (err) {
        console.error("Error fetching orders:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [currentUser]);

  useEffect(() => {
    if (activeFilter === "all") setFilteredOrders(orders);
    else setFilteredOrders(orders.filter((o) => o.status === activeFilter));
  }, [activeFilter, orders]);

  const formatDate = (timestamp) => {
    if (!timestamp) return "N/A";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">My Orders</h1>
          <p className="text-gray-500">Track and manage your orders</p>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 overflow-x-auto bg-white p-3 rounded-xl shadow mb-6">
          {statusOptions.map((opt) => (
            <button
              key={opt.key}
              onClick={() => setActiveFilter(opt.key)}
              className={`px-4 py-2 rounded-lg font-semibold transition whitespace-nowrap ${
                activeFilter === opt.key
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Orders List */}
        {filteredOrders.length > 0 ? (
          <div className="flex flex-col gap-6">
            {filteredOrders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-xl shadow border border-gray-200 p-6"
              >
                {/* Header */}
                <div className="flex justify-between flex-wrap gap-3 mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800">
                      {order.type === "sale" ? "Sale" : "Order"} #
                      {order.id.slice(-8)}
                    </h3>
                    <div className="flex flex-wrap items-center gap-3 text-gray-500 text-sm mt-1">
                      <div className="flex items-center gap-1">
                        <Calendar size={16} />
                        {formatDate(order.createdAt)}
                      </div>
                      <div className="flex items-center gap-1">
                        <Package size={16} />
                        {order.items?.length || 0} items
                      </div>
                    </div>
                    <span
                      className={`inline-block mt-2 px-3 py-1 rounded-full text-sm font-semibold ${
                        order.status === "pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : order.status === "processing"
                          ? "bg-blue-100 text-blue-800"
                          : order.status === "shipped"
                          ? "bg-indigo-100 text-indigo-800"
                          : order.status === "delivered"
                          ? "bg-green-100 text-green-800"
                          : order.status === "cancelled"
                          ? "bg-red-100 text-red-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {order.status || "Pending"}
                    </span>
                  </div>

                  <div className="text-2xl font-bold text-green-600">
                    {formatPrice(order.total || 0)}
                  </div>
                </div>

                {/* Order Items */}
                {order.items && order.items.length > 0 && (
                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex flex-col gap-3">
                      {order.items.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg"
                        >
                          {item.productImage ? (
                            <img
                              src={item.productImage}
                              alt={item.productName}
                              className="w-16 h-16 object-cover rounded-md"
                              onError={(e) => {
                                e.target.style.display = "none";
                                e.target.nextElementSibling.style.display =
                                  "flex";
                              }}
                            />
                          ) : null}
                          <div
                            className={`w-16 h-16 bg-gray-200 text-gray-400 rounded-md flex items-center justify-center text-xs ${
                              item.productImage ? "hidden" : "flex"
                            }`}
                          >
                            No Image
                          </div>

                          <div className="flex-1">
                            <div className="font-semibold text-gray-800">
                              {item.productName}
                            </div>
                            <div className="text-gray-500 text-sm">
                              {formatPrice(item.price)}
                            </div>
                          </div>

                          <div className="text-gray-600 font-semibold">
                            Qty: {item.quantity}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          // Empty State
          <div className="text-center bg-white p-10 rounded-xl shadow max-w-2xl mx-auto">
            <div className="flex justify-center mb-4">
              <div className="w-20 h-20 bg-gray-100 text-gray-400 flex items-center justify-center rounded-full">
                <Package size={40} />
              </div>
            </div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">
              {activeFilter === "all"
                ? "No orders yet"
                : `No ${activeFilter} orders`}
            </h2>
            <p className="text-gray-500">
              {activeFilter === "all"
                ? "When you make a purchase, your orders will appear here."
                : `You don't have any ${activeFilter} orders right now.`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersPage;
