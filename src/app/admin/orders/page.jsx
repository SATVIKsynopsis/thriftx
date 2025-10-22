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
  Filter,
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
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    loadOrders();
  }, []);

  useEffect(() => {
    filterOrders();
  }, [orders, searchTerm, statusFilter]);

  const loadOrders = async () => {
    try {
      setIsRefreshing(true);
      const orderData = await adminAPI.getAllOrders();
      
      // Sort by date (newest first)
      const sortedOrders = orderData.sort((a, b) => {
        const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
        const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt);
        return dateB - dateA;
      });
      
      console.log(`✅ Loaded ${sortedOrders.length} orders`);
      setOrders(sortedOrders);
    } catch (error) {
      console.error('Error loading orders:', error);
      toast.error('Failed to load orders. Please try again.');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  const filterOrders = () => {
    let filtered = orders;

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (order) =>
          order.orderNumber?.toLowerCase().includes(searchLower) ||
          order.user?.name?.toLowerCase().includes(searchLower) ||
          order.user?.email?.toLowerCase().includes(searchLower) ||
          order.id?.toLowerCase().includes(searchLower)
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter((order) => order.status === statusFilter);
    }

    setFilteredOrders(filtered);
  };

  const getStatusIcon = (status) => {
    const iconClass = "w-4 h-4";
    switch (status) {
      case 'delivered':
        return <CheckCircle className={iconClass} />;
      case 'shipped':
        return <Truck className={iconClass} />;
      case 'processing':
        return <Package className={iconClass} />;
      default:
        return <Clock className={iconClass} />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'shipped':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'processing':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'pending':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (date) => {
    if (!date) return 'Not available';
    
    try {
      const dateObj = date.toDate ? date.toDate() : new Date(date);
      return dateObj.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch (error) {
      return 'Invalid date';
    }
  };

  const handleRefresh = async () => {
    await loadOrders();
    toast.success('Orders refreshed successfully');
  };

  const handleViewOrder = (order) => {
    toast.success(`Viewing order ${order.orderNumber}`);
    // TODO: Navigate to order details page or open modal
    console.log('Order details:', order);
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
      <div className="flex flex-col gap-6">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Orders Overview</h1>
            <p className="text-gray-600 mt-1">Monitor and manage all marketplace orders</p>
          </div>
          
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>

        {/* Filter Bar */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
            {/* Search */}
            <div className="relative flex-1 min-w-[300px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by order number, customer name, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>

            {/* Status Filters */}
            <div className="flex flex-wrap gap-2">
              {[
                { value: 'all', label: 'All Orders' },
                { value: 'pending', label: 'Pending' },
                { value: 'processing', label: 'Processing' },
                { value: 'shipped', label: 'Shipped' },
                { value: 'delivered', label: 'Delivered' },
                { value: 'cancelled', label: 'Cancelled' }
              ].map((status) => (
                <button
                  key={status.value}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition ${
                    statusFilter === status.value
                      ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400'
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

        {/* Orders Table */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {/* Desktop Table Header */}
          <div className="hidden lg:grid grid-cols-12 gap-4 p-4 bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-700 uppercase tracking-wider">
            <div className="col-span-3">Order Details</div>
            <div className="col-span-2">Customer</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-2">Amount</div>
            <div className="col-span-2">Date</div>
            <div className="col-span-1 text-center">Actions</div>
          </div>

          {/* Orders List */}
          {filteredOrders.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                No orders found
              </h3>
              <p className="text-gray-500 max-w-md mx-auto">
                {searchTerm || statusFilter !== 'all' 
                  ? "No orders match your current filters. Try adjusting your search or filters."
                  : "No orders have been placed yet."}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredOrders.map((order) => (
                <div
                  key={order.id}
                  className="grid grid-cols-1 lg:grid-cols-12 gap-4 p-4 hover:bg-gray-50 transition duration-200"
                >
                  {/* Order Details */}
                  <div className="lg:col-span-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900 text-sm">
                          {order.orderNumber}
                        </div>
                        <div className="flex items-center gap-2 mt-1 text-xs text-gray-600">
                          <Package className="w-3 h-3" />
                          {order.items?.length || 0} item{order.items?.length !== 1 ? 's' : ''}
                        </div>
                      </div>
                      {/* Mobile only status badge */}
                      <div className="lg:hidden">
                        <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs border ${getStatusColor(order.status)}`}>
                          {getStatusIcon(order.status)}
                          <span className="capitalize">{order.status}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Customer Info */}
                  <div className="lg:col-span-2">
                    <div className="flex items-center gap-2 text-sm">
                      <User className="w-4 h-4 text-gray-400" />
                      <div>
                        <div className="font-medium text-gray-900">
                          {order.user?.name || 'Unknown Customer'}
                        </div>
                        <div className="text-xs text-gray-500 truncate max-w-[200px]">
                          {order.user?.email || 'No email'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Status - Desktop */}
                  <div className="hidden lg:block lg:col-span-2">
                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm border w-fit ${getStatusColor(order.status)}`}>
                      {getStatusIcon(order.status)}
                      <span className="capitalize font-medium">{order.status}</span>
                    </div>
                  </div>

                  {/* Amount */}
                  <div className="lg:col-span-2">
                    <div className="flex items-center gap-1 text-sm font-semibold text-gray-900">
                      <IndianRupee className="w-4 h-4" />
                      {formatPrice(order.total)}
                    </div>
                  </div>

                  {/* Date */}
                  <div className="lg:col-span-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4" />
                      {formatDate(order.createdAt)}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="lg:col-span-1 flex justify-end lg:justify-center">
                    <button
                      onClick={() => handleViewOrder(order)}
                      className="flex items-center justify-center w-8 h-8 rounded-lg border border-gray-300 hover:bg-gray-100 hover:border-gray-400 transition text-gray-600 hover:text-gray-800"
                      title="View order details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Summary Stats */}
        {filteredOrders.length > 0 && (
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div className="flex flex-wrap gap-6 text-sm text-gray-600">
              <div>
                <span className="font-medium text-gray-900">{filteredOrders.length}</span> order(s) found
              </div>
              <div>
                Total value: <span className="font-medium text-gray-900">
                  ₹{formatPrice(filteredOrders.reduce((sum, order) => sum + (order.total || 0), 0))}
                </span>
              </div>
              <div>
                Pending: <span className="font-medium text-orange-600">
                  {filteredOrders.filter(o => o.status === 'pending').length}
                </span>
              </div>
              <div>
                Processing: <span className="font-medium text-yellow-600">
                  {filteredOrders.filter(o => o.status === 'processing').length}
                </span>
              </div>
              <div>
                Delivered: <span className="font-medium text-green-600">
                  {filteredOrders.filter(o => o.status === 'delivered').length}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default OrdersOverview;