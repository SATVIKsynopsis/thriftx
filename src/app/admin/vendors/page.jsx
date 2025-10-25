"use client";

import React, { useState, useEffect } from "react";
import {
  CheckCircle,
  XCircle,
  Clock,
  Mail,
  Phone,
  Calendar,
  Search,
  RefreshCw,
  Plus,
  X,
  User,
  MapPin,
  Heart,
} from "lucide-react";
import { adminAPI } from "../../../../lib/adminService";
import AdminLayout from '../../../components/admin/AdminLayout';
import LoadingSpinner from "@/components/common/LoadingSpinner";
import toast from "react-hot-toast";

const VendorManagement = () => {
  const [vendors, setVendors] = useState([]);
  const [filteredVendors, setFilteredVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Add Vendor Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [addLoading, setAddLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    location: "",
    favoriteStyles: "",
    sustainabilityGoals: "",
    status: "approved", // Default to approved since admin is creating
  });
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    loadVendors();
  }, []);

  useEffect(() => {
    filterVendors();
  }, [vendors, searchTerm, statusFilter]);

  const loadVendors = async () => {
    try {
      setLoading(true);
      const vendorData = await adminAPI.getVendors();
      setVendors(vendorData);
    } catch (error) {
      toast.error("Failed to load vendors");
      console.error("Error loading vendors:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterVendors = () => {
    let filtered = vendors;

    if (searchTerm) {
      filtered = filtered.filter(
        (vendor) =>
          vendor.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          vendor.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((vendor) => vendor.status === statusFilter);
    }

    setFilteredVendors(filtered);
  };

  const handleApproveVendor = async (vendorId) => {
    try {
      await adminAPI.approveVendor(vendorId);
      toast.success("Vendor approved successfully");
      loadVendors();
    } catch (error) {
      toast.error("Failed to approve vendor");
      console.error("Error approving vendor:", error);
    }
  };

  const handleBanVendor = async (vendorId) => {
    if (window.confirm("Are you sure you want to ban this vendor?")) {
      try {
        await adminAPI.banVendor(vendorId);
        toast.success("Vendor banned successfully");
        loadVendors();
      } catch (error) {
        toast.error("Failed to ban vendor");
        console.error("Error banning vendor:", error);
      }
    }
  };

  // Modal form helpers
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (formErrors[name]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.name.trim()) {
      errors.name = "Name is required";
    }

    if (!formData.email.trim()) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Email is invalid";
    }

    if (!formData.password.trim()) {
      errors.password = "Password is required";
    } else if (formData.password.length < 6) {
      errors.password = "Password must be at least 6 characters";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddVendor = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setAddLoading(true);
    try {
      const result = await adminAPI.createVendor({
        ...formData,
        role: "vendor",
        createdAt: new Date(),
        approvedAt: formData.status === "approved" ? new Date() : null,
      });

      // If service returns a mock vendor, add immediately for responsiveness
      if (result?.mockVendor) {
        setVendors((prev) => [result.mockVendor, ...prev]);
      }

      toast.success("Vendor created successfully!");
      setShowAddModal(false);
      resetForm();

      // Reload to ensure fresh data
      loadVendors();
    } catch (error) {
      if (error.message?.includes("Email already in use")) {
        toast.error("Email already in use. Please use a different email.");
        setFormErrors({ email: "Email already in use" });
      } else {
        toast.error(`Failed to create vendor: ${error.message}`);
      }
      console.error("Error creating vendor:", error);
    } finally {
      setAddLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      password: "",
      location: "",
      favoriteStyles: "",
      sustainabilityGoals: "",
      status: "approved",
    });
    setFormErrors({});
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    resetForm();
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="w-4 h-4" />;
      case "banned":
        return <XCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
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
        title="Vendor Management"
        description="Manage and monitor all vendors"
        breadcrumb="Vendors"
      >
        <div className="flex items-center justify-center min-h-[400px]">
          <LoadingSpinner />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title="Vendor Management"
      description="Manage and monitor all vendors"
      breadcrumb="Vendors"
    >
      <div className="flex flex-col gap-8">
        

        {/* Filter Bar */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm flex flex-wrap gap-4 items-center">
          {/* Search */}
          <div className="relative flex-1 min-w-[300px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
            <input
              type="text"
              placeholder="Search vendors..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>

          {/* Filter Buttons */}
          {["all", "pending", "approved", "banned"].map((status) => (
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
            onClick={loadVendors}
            className="flex items-center gap-2 px-4 py-3 rounded-lg border text-sm bg-white text-gray-700 hover:bg-gray-50 transition"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>

          {/* Add Vendor Button */}
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-indigo-500 to-purple-600 shadow-md hover:from-indigo-600 hover:to-purple-700 transition"
          >
            <Plus className="w-4 h-4" />
            Add Vendor
          </button>
        </div>

        {/* Vendor Grid */}
        {filteredVendors.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              No vendors found
            </h3>
            <p>No vendors match your current filters.</p>
          </div>
        ) : (
          <div className="grid gap-8 grid-cols-[repeat(auto-fill,minmax(400px,1fr))] max-md:grid-cols-1">
            {filteredVendors.map((vendor) => (
              <div
                key={vendor.id}
                className="bg-white rounded-xl p-8 border border-gray-200 shadow-sm hover:-translate-y-1 hover:shadow-xl transition"
              >
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {vendor.name || "Unknown Vendor"}
                    </h3>
                    <div className="flex items-center text-gray-600 text-sm mb-1">
                      <Mail className="w-4 h-4 mr-2" />
                      {vendor.email}
                    </div>
                    {vendor.phone && (
                      <div className="flex items-center text-gray-600 text-sm">
                        <Phone className="w-4 h-4 mr-2" />
                        {vendor.phone}
                      </div>
                    )}
                  </div>

                  <div
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${
                      vendor.status === "approved"
                        ? "bg-green-100 text-green-700"
                        : vendor.status === "banned"
                        ? "bg-red-100 text-red-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {getStatusIcon(vendor.status)}
                    {vendor.status?.charAt(0).toUpperCase() +
                      vendor.status?.slice(1)}
                  </div>
                </div>

                <div className="flex flex-col gap-3 text-sm text-gray-600 mb-6">
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-2" />
                    Joined: {formatDate(vendor.createdAt)}
                  </div>
                </div>

                <div className="flex gap-3 flex-wrap">
                  {vendor.status === "pending" && (
                    <button
                      onClick={() => handleApproveVendor(vendor.id)}
                      className="bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700 transition"
                    >
                      Approve
                    </button>
                  )}

                  {vendor.status !== "banned" && (
                    <button
                      onClick={() => handleBanVendor(vendor.id)}
                      className="bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-700 transition"
                    >
                      Ban
                    </button>
                  )}

                  <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-200 transition">
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Vendor Modal */}
      {showAddModal && (
        <div
          className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50 p-8"
          onClick={(e) => e.target === e.currentTarget && handleCloseModal()}
        >
          <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-8 shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900 m-0">
                Add New Vendor
              </h3>
              <button
                onClick={handleCloseModal}
                className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Dev notice */}
            <div className="flex items-start gap-3 mb-4 rounded-xl border border-sky-500 bg-gradient-to-br from-sky-100 to-sky-50 p-4 text-sky-800 text-sm">
              <span className="text-lg leading-none">ℹ️</span>
              <p className="m-0">
                In development mode, vendors are stored locally. In production,
                this will create actual user accounts.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleAddVendor} className="flex flex-col gap-6">
              {/* Name */}
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="name"
                  className="text-sm font-semibold text-gray-800"
                >
                  Full Name *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                  <input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="Enter vendor's full name"
                    value={formData.name}
                    onChange={handleFormChange}
                    className={`w-full pl-10 pr-4 py-3 rounded-lg border-2 text-base transition focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                      formErrors.name
                        ? "border-red-500"
                        : "border-gray-200 focus:border-indigo-500"
                    }`}
                  />
                </div>
                {formErrors.name && (
                  <span className="text-xs text-red-500 mt-0.5">
                    {formErrors.name}
                  </span>
                )}
              </div>

              {/* Email */}
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="email"
                  className="text-sm font-semibold text-gray-800"
                >
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Enter vendor's email"
                    value={formData.email}
                    onChange={handleFormChange}
                    className={`w-full pl-10 pr-4 py-3 rounded-lg border-2 text-base transition focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                      formErrors.email
                        ? "border-red-500"
                        : "border-gray-200 focus:border-indigo-500"
                    }`}
                  />
                </div>
                {formErrors.email && (
                  <span className="text-xs text-red-500 mt-0.5">
                    {formErrors.email}
                  </span>
                )}
              </div>

              {/* Password */}
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="password"
                  className="text-sm font-semibold text-gray-800"
                >
                  Password *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                  <input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Create a password for the vendor"
                    value={formData.password}
                    onChange={handleFormChange}
                    className={`w-full pl-10 pr-4 py-3 rounded-lg border-2 text-base transition focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                      formErrors.password
                        ? "border-red-500"
                        : "border-gray-200 focus:border-indigo-500"
                    }`}
                  />
                </div>
                {formErrors.password && (
                  <span className="text-xs text-red-500 mt-0.5">
                    {formErrors.password}
                  </span>
                )}
              </div>

              {/* Status */}
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="status"
                  className="text-sm font-semibold text-gray-800"
                >
                  Initial Status
                </label>
                <div className="relative">
                  <CheckCircle className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleFormChange}
                    className="w-full pl-10 pr-4 py-3 rounded-lg border-2 border-gray-200 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                  >
                    <option value="approved">Approved (Active)</option>
                    <option value="pending">Pending Approval</option>
                  </select>
                </div>
              </div>

              {/* Location */}
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="location"
                  className="text-sm font-semibold text-gray-800"
                >
                  Location
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                  <input
                    id="location"
                    name="location"
                    type="text"
                    placeholder="e.g., Mumbai, Maharashtra"
                    value={formData.location}
                    onChange={handleFormChange}
                    className="w-full pl-10 pr-4 py-3 rounded-lg border-2 border-gray-200 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Favorite Styles */}
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="favoriteStyles"
                  className="text-sm font-semibold text-gray-800"
                >
                  Favorite Fashion Styles
                </label>
                <div className="relative">
                  <Heart className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                  <input
                    id="favoriteStyles"
                    name="favoriteStyles"
                    type="text"
                    placeholder="e.g., Traditional, Vintage, Modern"
                    value={formData.favoriteStyles}
                    onChange={handleFormChange}
                    className="w-full pl-10 pr-4 py-3 rounded-lg border-2 border-gray-200 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Sustainability Goals */}
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="sustainabilityGoals"
                  className="text-sm font-semibold text-gray-800"
                >
                  Sustainability Goals
                </label>
                <div className="relative">
                  <Heart className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                  <input
                    id="sustainabilityGoals"
                    name="sustainabilityGoals"
                    type="text"
                    placeholder="e.g., Promote eco-friendly fashion"
                    value={formData.sustainabilityGoals}
                    onChange={handleFormChange}
                    className="w-full pl-10 pr-4 py-3 rounded-lg border-2 border-gray-200 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 rounded-lg border-2 border-gray-200 text-gray-800 hover:bg-gray-50 transition text-sm font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addLoading}
                  className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold shadow-md hover:from-indigo-600 hover:to-purple-700 disabled:opacity-50 transition text-sm"
                >
                  {addLoading ? "Creating..." : "Create Vendor"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default VendorManagement;
