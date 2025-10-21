"use client";

import React, { useState, useEffect } from 'react';
import {
  Package,
  Truck,
  CheckCircle,
  Clock,
  User,
  Calendar,
  IndianRupee,
  Search,
  RefreshCw,
  Eye,
} from 'lucide-react';

import { adminAPI } from '../../../../lib/adminService';
import AdminLayout from '../../../pages/admin/AdminLayout';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { formatPrice } from '@/utils/formatters';
import toast from 'react-hot-toast';

const OrdersOverview = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    loadOrders();
  }, []);

  useEffect(() => {
    filterOrders();
  }, [orders, searchTerm, statusFilter]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const orderData = await adminAPI.getAllOrders();
      setOrders(orderData);
    } catch (error) {
      toast.error('Failed to load orders');
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterOrders = () => {
    let filtered = orders;

    if (searchTerm) {
      filtered = filtered.filter(
        (order) =>
          order.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.user?.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter((order) => order.status === statusFilter);
    }

    setFilteredOrders(filtered);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle />;
      case 'shipped':
        return <Truck />;
      case 'processing':
        return <Package />;
      default:
        return <Clock />;
    }
  };

  const formatDate = (date) => {
    if (!date) return 'Not available';
    return new Date(date.toDate ? date.toDate() : date).toLocaleDateString(
      'en-IN'
    );
  };

  if (loading) {
    return (
      <AdminLayout
        title="Orders Overview"
        description="Monitor all marketplace orders"
        breadcrumb="Orders"
      >
        <div className="flex justify-center items-center min-h-[400px]">
          <LoadingSpinner />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title="Orders Overview"
      description="Monitor all marketplace orders"
      breadcrumb="Orders"
    >
      <div className="flex flex-col gap-8">

        {/* Filter Bar */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm flex flex-wrap gap-4 items-center">
          {/* Search */}
          <div className="relative flex-1 min-w-[300px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
            <input
              type="text"
              placeholder="Search orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>

          {/* Filters */}
          {['all', 'pending', 'processing', 'shipped', 'delivered'].map(
            (status) => (
              <button
                key={status}
                className={`flex items-center gap-2 px-4 py-3 rounded-lg border text-sm transition ${
                  statusFilter === status
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
                onClick={() => setStatusFilter(status)}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            )
          )}

          {/* Refresh Button */}
          <button
            onClick={loadOrders}
            className="flex items-center gap-2 px-4 py-3 rounded-lg border text-sm bg-white text-gray-700 hover:bg-gray-50 transition"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>

        {/* Orders Table */}
        {filteredOrders.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              No orders found
            </h3>
            <p>No orders match your current filters.</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            {/* Desktop Table Header */}
            <div className="hidden md:grid grid-cols-[1fr_150px_150px_120px_120px_120px_100px] gap-4 p-6 bg-gray-50 border-b font-semibold text-gray-700 text-sm">
              <div>Order Details</div>
              <div>Customer</div>
              <div>Status</div>
              <div>Amount</div>
              <div>Date</div>
              <div>Items</div>
              <div>Actions</div>
            </div>

            {/* Rows */}
            {filteredOrders.map((order) => (
              <div
                key={order.id}
                className="grid md:grid-cols-[1fr_150px_150px_120px_120px_120px_100px] gap-4 p-6 border-b last:border-0 hover:bg-gray-50 transition md:items-center"
              >
                {/* Order Info */}
                <div>
                  <div className="font-semibold text-gray-900">
                    #{order.id?.substring(0, 8) || 'Unknown'}
                  </div>
                  <div className="text-sm text-gray-600 flex items-center gap-2">
                    <User className="w-4 h-4" />
                    {order.user?.name || 'Unknown Customer'}
                  </div>
                </div>

                {/* Customer Email */}
                <div className="hidden md:block">
                  {order.user?.email || 'No email'}
                </div>

                {/* Status Badge */}
                <div className="flex items-center">
                  <div
                    className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
                      order.status === 'delivered'
                        ? 'bg-green-100 text-green-700'
                        : order.status === 'shipped'
                        ? 'bg-blue-100 text-blue-700'
                        : order.status === 'processing'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {getStatusIcon(order.status)}
                    {order.status?.charAt(0).toUpperCase() +
                      order.status?.slice(1)}
                  </div>
                </div>

                {/* Amount */}
                <div className="flex items-center font-semibold text-gray-900">
                  <IndianRupee className="w-4 h-4" />
                  {formatPrice(order.total || 0)}
                </div>

                {/* Date */}
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="w-4 h-4" />
                  {formatDate(order.createdAt)}
                </div>

                {/* Items */}
                <div className="flex items-center text-sm text-gray-600">
                  <Package className="w-4 h-4" />
                  {order.items?.length || 0} items
                </div>

                {/* Actions */}
                <button className="flex items-center justify-center px-3 py-2 border rounded-lg hover:bg-gray-100 transition">
                  <Eye className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default OrdersOverview;
