"use client";

import React, { useState, useEffect } from "react";
import {
  Package,
  User,
  Calendar,
  IndianRupee,
  Search,
  RefreshCw,
  Eye,
  Trash2,
  Star,
  Tag,
  Image as ImageIcon,
  Filter,
} from "lucide-react";

import { adminAPI } from "../../../../lib/adminService";
import AdminLayout from "../../../pages/admin/AdminLayout";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { formatPrice } from "@/utils/formatters";
import toast from "react-hot-toast";

const ProductCatalog = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [products, searchTerm, statusFilter]);

  const loadProducts = async () => {
    try {
      setIsRefreshing(true);
      const productData = await adminAPI.getAllProducts();
      setProducts(productData);
    } catch (error) {
      toast.error("Failed to load products");
      console.error("Error loading products:", error);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    await loadProducts();
    toast.success("Products refreshed successfully");
  };

  const filterProducts = () => {
    let filtered = products;

    if (searchTerm) {
      filtered = filtered.filter(
        (product) =>
          product.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.seller?.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((product) =>
        statusFilter === "active"
          ? product.status !== "removed"
          : product.status === statusFilter
      );
    }

    setFilteredProducts(filtered);
  };

  const handleRemoveProduct = async (productId) => {
    if (window.confirm("Are you sure you want to remove this product?")) {
      try {
        await adminAPI.removeProduct(productId);
        toast.success("Product removed successfully");
        loadProducts();
      } catch (error) {
        toast.error("Failed to remove product");
        console.error("Error removing product:", error);
      }
    }
  };

  const formatDate = (date) => {
    if (!date) return "Not available";
    
    try {
      const dateObj = date.toDate ? date.toDate() : new Date(date);
      return dateObj.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    } catch (error) {
      return "Invalid date";
    }
  };

  const getStatusDisplay = (status) => {
    if (!status) return "Unknown";
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  if (loading) {
    return (
      <AdminLayout
        title="Product Catalog"
        description="Manage all marketplace products"
        breadcrumb="Products"
      >
        <div className="flex justify-center items-center min-h-[400px]">
          <LoadingSpinner />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title="Product Catalog"
      description="Manage all marketplace products"
      breadcrumb="Products"
    >
      <div className="flex flex-col gap-6">
        {/* Header Section - Matching Orders */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Product Catalog</h1>
            <p className="text-gray-600 mt-1">Manage and monitor all marketplace products</p>
          </div>

          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
            {isRefreshing ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        {/* Filter Bar - Matching Orders */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
            {/* Search */}
            <div className="relative flex-1 min-w-[300px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by product name, category, or seller..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>

            {/* Status Filters */}
            <div className="flex flex-wrap gap-2">
              {[
                { value: "all", label: "All Products" },
                { value: "active", label: "Active" },
                { value: "removed", label: "Removed" },
              ].map((status) => (
                <button
                  key={status.value}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition ${
                    statusFilter === status.value
                      ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400"
                  }`}
                  onClick={() => setStatusFilter(status.value)}
                >
                  <Filter className="w-3 h-3" />
                  {status.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              No products found
            </h3>
            <p className="text-gray-500 max-w-md mx-auto">
              {searchTerm || statusFilter !== "all"
                ? "No products match your current filters. Try adjusting your search or filters."
                : "No products have been listed yet."}
            </p>
          </div>
        ) : (
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition duration-200"
              >
                {/* Product Image */}
                <div
                  className="w-full h-48 bg-gray-100 bg-cover bg-center relative flex items-center justify-center"
                  style={{
                    backgroundImage: product.images?.[0]
                      ? `url(${product.images[0]})`
                      : "none",
                  }}
                >
                  {!product.images?.[0] && (
                    <ImageIcon className="w-12 h-12 text-gray-400" />
                  )}
                  <div
                    className={`absolute top-3 right-3 px-2.5 py-1 text-xs font-medium rounded-full ${
                      product.status === "active" || !product.status
                        ? "bg-green-100 text-green-700"
                        : product.status === "removed"
                        ? "bg-red-100 text-red-700"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {getStatusDisplay(product.status || "active")}
                  </div>
                </div>

                {/* Content */}
                <div className="p-5">
                  <div className="mb-3">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-1">
                      {product.title || "Untitled Product"}
                    </h3>
                    <div className="flex items-center text-gray-600 text-sm">
                      <Tag className="w-3.5 h-3.5 mr-1.5" />
                      {product.category || "Uncategorized"}
                    </div>
                  </div>

                  {/* Price */}
                  <div className="flex items-center text-green-700 font-bold text-xl mb-4">
                    <IndianRupee className="w-5 h-5 mr-0.5" />
                    {formatPrice(product.price || 0)}
                  </div>

                  {/* Details */}
                  <div className="flex flex-col gap-1.5 text-sm text-gray-600 mb-4 pb-4 border-b border-gray-200">
                    <div className="flex items-center">
                      <User className="w-3.5 h-3.5 mr-1.5 flex-shrink-0" />
                      <span className="truncate">{product.seller?.name || "Unknown Seller"}</span>
                    </div>
                    <div className="flex items-center">
                      <Calendar className="w-3.5 h-3.5 mr-1.5 flex-shrink-0" />
                      Listed: {formatDate(product.createdAt)}
                    </div>
                    {product.condition && (
                      <div className="flex items-center">
                        <Star className="w-3.5 h-3.5 mr-1.5 flex-shrink-0" />
                        Condition: {product.condition}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button className="flex-1 flex items-center justify-center gap-1.5 bg-gray-100 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition">
                      <Eye className="w-4 h-4" />
                      View
                    </button>

                    {product.status !== "removed" && (
                      <button
                        onClick={() => handleRemoveProduct(product.id)}
                        className="flex-1 flex items-center justify-center gap-1.5 bg-red-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Summary Stats - Matching Orders */}
        {filteredProducts.length > 0 && (
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div className="flex flex-wrap gap-6 text-sm text-gray-600">
              <div>
                <span className="font-medium text-gray-900">{filteredProducts.length}</span> product(s) found
              </div>
              <div>
                Total value: <span className="font-medium text-gray-900">
                  ₹{formatPrice(filteredProducts.reduce((sum, product) => sum + (product.price || 0), 0))}
                </span>
              </div>
              <div>
                Active: <span className="font-medium text-green-600">
                  {filteredProducts.filter(p => p.status !== 'removed').length}
                </span>
              </div>
              <div>
                Removed: <span className="font-medium text-red-600">
                  {filteredProducts.filter(p => p.status === 'removed').length}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default ProductCatalog;