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
      setLoading(true);
      const productData = await adminAPI.getAllProducts();
      setProducts(productData);
    } catch (error) {
      toast.error("Failed to load products");
      console.error("Error loading products:", error);
    } finally {
      setLoading(false);
    }
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
    return new Date(date.toDate ? date.toDate() : date).toLocaleDateString(
      "en-IN"
    );
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
      <div className="flex flex-col gap-8">

        {/* Filter Bar */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm flex flex-wrap gap-4 items-center">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[300px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>

          {/* Filters */}
          {["all", "active", "removed"].map((status) => (
            <button
              key={status}
              className={`flex items-center gap-2 px-4 py-3 rounded-lg border text-sm transition ${
                statusFilter === status
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
              }`}
              onClick={() => setStatusFilter(status)}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}

          {/* Refresh Button */}
          <button
            onClick={loadProducts}
            className="flex items-center gap-2 px-4 py-3 rounded-lg border text-sm bg-white text-gray-700 hover:bg-gray-50 transition"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              No products found
            </h3>
            <p>No products match your current filters.</p>
          </div>
        ) : (
          <div className="grid gap-8 grid-cols-[repeat(auto-fill,minmax(350px,1fr))] max-md:grid-cols-1">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden transition hover:shadow-xl hover:-translate-y-1"
              >
                {/* Product Image */}
                <div
                  className="w-full h-52 bg-gray-100 bg-cover bg-center relative flex items-center justify-center"
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
                    className={`absolute top-4 right-4 px-3 py-1 text-xs font-medium rounded-full ${
                      product.status === "active"
                        ? "bg-green-100 text-green-700"
                        : product.status === "removed"
                        ? "bg-red-100 text-red-700"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {product.status?.charAt(0).toUpperCase() +
                      product.status?.slice(1)}
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {product.title || "Untitled Product"}
                    </h3>
                    <div className="flex items-center text-gray-600 text-sm">
                      <Tag className="w-4 h-4 mr-2" />
                      {product.category || "Uncategorized"}
                    </div>
                  </div>

                  {/* Price */}
                  <div className="flex items-center text-green-700 font-bold text-xl mb-4">
                    <IndianRupee className="w-5 h-5 mr-1" />
                    {formatPrice(product.price || 0)}
                  </div>

                  {/* Details */}
                  <div className="flex flex-col gap-1 text-sm text-gray-600 mb-6">
                    <div className="flex items-center">
                      <User className="w-4 h-4 mr-2" />
                      {product.seller?.name || "Unknown Seller"}
                    </div>
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-2" />
                      Listed: {formatDate(product.createdAt)}
                    </div>
                    {product.condition && (
                      <div className="flex items-center">
                        <Star className="w-4 h-4 mr-2" />
                        Condition: {product.condition}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 flex-wrap">
                    <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 hover:bg-gray-200 transition">
                      <Eye className="w-4 h-4" />
                      View
                    </button>

                    {product.status !== "removed" && (
                      <button
                        onClick={() => handleRemoveProduct(product.id)}
                        className="bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 hover:bg-red-700 transition"
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
      </div>
    </AdminLayout>
  );
};

export default ProductCatalog;
