'use client';

import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  IndianRupee,
  ShoppingBag,
  Package,
  Users,
  RefreshCw,
  Download,
  BarChart3,
  PieChart,
  TrendingDown,
  AlertCircle,
  Eye,
  EyeOff,
  Filter,
  Calendar,
  Star,
  ShoppingCart,
  User,
  Building,
  DollarSign,
  CreditCard
} from 'lucide-react';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  orderBy, 
  limit,
  Timestamp,
  startAt,
  endAt
} from 'firebase/firestore';
import { db } from '@/firebase/config';
import { useAuth } from '@/contexts/AuthContext';
import AdminLayout from '../../pages/admin/AdminLayout';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import toast from 'react-hot-toast';
import { formatPrice } from '@/utils/formatters';

const categoryColors = [
  'bg-blue-500',
  'bg-emerald-500',
  'bg-amber-500',
  'bg-rose-500',
  'bg-purple-500',
  'bg-cyan-500',
  'bg-indigo-500',
  'bg-pink-500',
  'bg-orange-500',
  'bg-teal-500'
];

const statusColors = {
  'pending': 'bg-yellow-100 text-yellow-800',
  'processing': 'bg-blue-100 text-blue-800',
  'shipped': 'bg-indigo-100 text-indigo-800',
  'delivered': 'bg-green-100 text-green-800',
  'completed': 'bg-emerald-100 text-emerald-800',
  'cancelled': 'bg-red-100 text-red-800',
  'refunded': 'bg-rose-100 text-rose-800'
};


function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}

// Enhanced Firebase Service Functions
const reportsAPI = {
  // For individual sellers
  getSellerReports: async (period = 'monthly', userId) => {
    try {
      const now = new Date();
      let startDate = new Date();

      // Calculate date range based on period
      switch (period) {
        case 'weekly':
          startDate.setDate(now.getDate() - 7);
          break;
        case 'monthly':
          startDate.setMonth(now.getMonth() - 1);
          break;
        case 'quarterly':
          startDate.setMonth(now.getMonth() - 3);
          break;
        case 'yearly':
          startDate.setFullYear(now.getFullYear() - 1);
          break;
        default:
          startDate.setMonth(now.getMonth() - 1);
      }

      // Fetch sales data
      const salesQuery = query(
        collection(db, 'orders'),
        where('sellerId', '==', userId),
        where('createdAt', '>=', Timestamp.fromDate(startDate)),
        orderBy('createdAt', 'desc')
      );

      const salesSnapshot = await getDocs(salesQuery);
      const salesOrders = salesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Fetch all products for this seller
      const productsQuery = query(
        collection(db, 'products'),
        where('sellerId', '==', userId)
      );
      const productsSnapshot = await getDocs(productsQuery);
      const products = productsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Fetch previous period data for growth calculation
      const previousStartDate = new Date(startDate.getTime() - (now.getTime() - startDate.getTime()));
      const previousSalesQuery = query(
        collection(db, 'orders'),
        where('sellerId', '==', userId),
        where('createdAt', '>=', Timestamp.fromDate(previousStartDate)),
        where('createdAt', '<', Timestamp.fromDate(startDate))
      );
      
      const previousSalesSnapshot = await getDocs(previousSalesQuery);
      const previousSalesCount = previousSalesSnapshot.size;
      
      // Calculate metrics
      const totalGMV = salesOrders.reduce((sum, order) => sum + (order.total || 0), 0);
      const totalSales = salesOrders.length;
      const completedSales = salesOrders.filter(order => 
        order.status === 'delivered' || order.status === 'completed'
      ).length;

      // Calculate growth percentage
      const monthlyGrowth = previousSalesCount > 0 
        ? ((totalSales - previousSalesCount) / previousSalesCount * 100)
        : totalSales > 0 ? 100 : 0;

      const averageOrderValue = totalSales > 0 ? totalGMV / totalSales : 0;

      // Count active products
      const activeProducts = products.filter(product => (product.stock || 0) > 0).length;
      const totalProducts = products.length;

      // Calculate refunds and cancellations
      const refundCount = salesOrders.filter(order => 
        order.status === 'cancelled' || order.status === 'refunded'
      ).length;

      const successRate = totalSales > 0 ? (completedSales / totalSales) * 100 : 0;

      // Get category distribution
      const categoryCount = {};
      products.forEach(product => {
        if (product.category) {
          categoryCount[product.category] = (categoryCount[product.category] || 0) + 1;
        }
      });

      const totalProductsWithCategory = Object.values(categoryCount).reduce((a, b) => a + b, 0);
      const topCategories = Object.entries(categoryCount)
        .map(([name, count]) => ({
          name: formatCategoryName(name),
          value: totalProductsWithCategory > 0 ? Math.round((count / totalProductsWithCategory) * 100) : 0
        }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 6);

      // Get order status distribution
      const statusDistribution = {};
      salesOrders.forEach(order => {
        const status = order.status || 'pending';
        statusDistribution[status] = (statusDistribution[status] || 0) + 1;
      });

      const orderStatusData = Object.entries(statusDistribution)
        .map(([status, count]) => ({
          status: formatStatusName(status),
          count,
          percentage: totalSales > 0 ? Math.round((count / totalSales) * 100) : 0
        }))
        .sort((a, b) => b.count - a.count);

      // Get monthly revenue trend (last 6 months)
      const monthlyRevenue = await calculateMonthlyRevenue(userId, 6);

      // Get recent activity
      const recentActivity = salesOrders.slice(0, 5).map(order => ({
        type: 'order',
        description: `Order #${order.id.slice(-8)} - ${formatPrice(order.total || 0)}`,
        time: formatFirebaseTimestamp(order.createdAt),
        status: order.status || 'pending'
      }));

      // Calculate average rating
      const totalRating = products.reduce((sum, product) => 
        sum + (parseFloat(product.rating) || 0), 0
      );
      const averageRating = products.length > 0 ? totalRating / products.length : 0;

      return {
        gmv: totalGMV,
        monthlyGrowth: parseFloat(monthlyGrowth.toFixed(1)),
        totalSales: totalSales,
        completedSales: completedSales,
        averageOrderValue: averageOrderValue,
        totalProducts: totalProducts,
        activeProducts: activeProducts,
        refundCount: refundCount,
        successRate: parseFloat(successRate.toFixed(1)),
        averageRating: parseFloat(averageRating.toFixed(1)),
        topCategories: topCategories,
        orderStatusData: orderStatusData,
        monthlyRevenue: monthlyRevenue,
        recentActivity: recentActivity,
        totalRevenue: totalGMV
      };

    } catch (error) {
      console.error('Error fetching seller reports:', error);
      throw new Error('Failed to load reports data');
    }
  },

  // For admin - get all sellers data
  getAdminReports: async (period = 'monthly', selectedSellerId = null) => {
    try {
      // Get all sellers (users with seller role)
      const usersQuery = query(
        collection(db, 'users'),
        where('role', '==', 'seller')
      );
      const usersSnapshot = await getDocs(usersQuery);
      const sellers = usersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      let reports = [];

      // If specific seller selected, get only their data
      if (selectedSellerId) {
        const sellerReport = await reportsAPI.getSellerReports(period, selectedSellerId);
        const seller = sellers.find(s => s.id === selectedSellerId);
        reports.push({
          ...sellerReport,
          sellerName: seller?.name || 'Unknown Seller',
          sellerId: selectedSellerId
        });
      } else {
        // Get reports for all sellers
        for (const seller of sellers) {
          try {
            const sellerReport = await reportsAPI.getSellerReports(period, seller.id);
            reports.push({
              ...sellerReport,
              sellerName: seller.name || 'Unknown Seller',
              sellerId: seller.id
            });
          } catch (error) {
            console.error(`Error fetching report for seller ${seller.id}:`, error);
          }
        }
      }

      // Calculate platform-wide metrics
      const platformGMV = reports.reduce((sum, report) => sum + report.gmv, 0);
      const platformSales = reports.reduce((sum, report) => sum + report.totalSales, 0);
      const platformProducts = reports.reduce((sum, report) => sum + report.totalProducts, 0);

      // Get top performing sellers
      const topSellers = reports
        .sort((a, b) => b.gmv - a.gmv)
        .slice(0, 5)
        .map(seller => ({
          name: seller.sellerName,
          revenue: seller.gmv,
          orders: seller.totalSales,
          products: seller.totalProducts
        }));

      return {
        individualReports: reports,
        platformMetrics: {
          totalGMV: platformGMV,
          totalSales: platformSales,
          totalProducts: platformProducts,
          totalSellers: sellers.length,
          topSellers: topSellers
        },
        sellers: sellers.map(seller => ({
          id: seller.id,
          name: seller.name,
          email: seller.email
        }))
      };

    } catch (error) {
      console.error('Error fetching admin reports:', error);
      throw new Error('Failed to load admin reports');
    }
  }
};

// Helper function to calculate monthly revenue
const calculateMonthlyRevenue = async (sellerId, months = 6) => {
  const monthlyData = [];
  const now = new Date();
  
  for (let i = months - 1; i >= 0; i--) {
    const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
    
    const monthlyQuery = query(
      collection(db, 'orders'),
      where('sellerId', '==', sellerId),
      where('createdAt', '>=', Timestamp.fromDate(monthStart)),
      where('createdAt', '<=', Timestamp.fromDate(monthEnd))
    );
    
    const monthlySnapshot = await getDocs(monthlyQuery);
    const monthlyRevenue = monthlySnapshot.docs.reduce((sum, doc) => 
      sum + (doc.data().total || 0), 0
    );
    
    monthlyData.push({
      month: monthStart.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      revenue: monthlyRevenue
    });
  }
  
  return monthlyData;
};

// Helper function to format Firebase timestamp
const formatFirebaseTimestamp = (timestamp) => {
  if (!timestamp) return 'Just now';
  
  try {
    const date = timestamp.toDate();
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} mins ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    return date.toLocaleDateString();
  } catch (error) {
    return 'Recently';
  }
};

// Helper function to format category names
const formatCategoryName = (category) => {
  return category.split('_').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');
};

// Helper function to format status names
const formatStatusName = (status) => {
  return status.charAt(0).toUpperCase() + status.slice(1);
};

// Chart Components
const RevenueTrendChart = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-gray-500">
        No revenue data available
      </div>
    );
  }

  const maxRevenue = Math.max(...data.map(item => item.revenue));
  
  return (
    <div className="h-48 flex items-end justify-between gap-2 px-4">
      {data.map((item, index) => (
        <div key={index} className="flex flex-col items-center flex-1">
          <div className="text-xs text-gray-500 mb-1">{item.month}</div>
          <div
            className="w-full bg-gradient-to-t from-blue-500 to-blue-600 rounded-t-lg transition-all hover:from-blue-600 hover:to-blue-700"
            style={{ 
              height: maxRevenue > 0 ? `${(item.revenue / maxRevenue) * 80}%` : '0%',
              minHeight: '4px'
            }}
          />
          <div className="text-xs text-gray-600 mt-1">
            {formatPrice(item.revenue)}
          </div>
        </div>
      ))}
    </div>
  );
};

const StatusDistributionChart = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-gray-500">
        No status data available
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {data.map((item, index) => (
        <div key={index} className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1">
            <div 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: categoryColors[index % categoryColors.length] }}
            />
            <span className="text-sm font-medium text-gray-700">
              {item.status}
            </span>
          </div>
          <div className="flex items-center gap-3 w-32">
            <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
              <div 
                className="h-2 rounded-full transition-all duration-500"
                style={{ 
                  width: `${item.percentage}%`,
                  backgroundColor: categoryColors[index % categoryColors.length]
                }}
              />
            </div>
            <span className="text-sm font-semibold text-gray-600 min-w-[35px] text-right">
              {item.count}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

const TopSellersChart = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-gray-500">
        No seller data available
      </div>
    );
  }

  const maxRevenue = Math.max(...data.map(seller => seller.revenue));

  return (
    <div className="space-y-3">
      {data.map((seller, index) => (
        <div key={index} className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-sm font-bold">
              {index + 1}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-medium text-gray-900 truncate">
                {seller.name}
              </div>
              <div className="text-xs text-gray-500">
                {seller.orders} orders • {seller.products} products
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm font-semibold text-gray-900">
              {formatPrice(seller.revenue)}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

const Reports = () => {
  const [reports, setReports] = useState(null);
  const [adminReports, setAdminReports] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('monthly');
  const [showDetailedView, setShowDetailedView] = useState(false);
  const [viewMode, setViewMode] = useState('seller'); // 'seller' or 'admin'
  const [selectedSeller, setSelectedSeller] = useState(null);

  const { currentUser, userProfile } = useAuth();

  useEffect(() => {
    if (currentUser) {
      loadReports();
    }
  }, [selectedPeriod, currentUser, viewMode, selectedSeller]);

const loadReports = async () => {
  if (!currentUser) {
    setError('Please login to view reports');
    setLoading(false);
    return;
  }

  try {
    setRefreshing(true);
    setError(null);

    // ✅ Check if user is admin or superadmin
    const isUserAdmin = ['admin', 'superadmin'].includes(userProfile?.role);

    if (viewMode === 'admin' && isUserAdmin) {
      // Admin View
      if (selectedSeller) {
        // ✅ Fetch data for ONE selected seller only
        console.log(`📊 Fetching reports for seller: ${selectedSeller}`);
        const data = await reportsAPI.getSellerReports(selectedPeriod, selectedSeller);
        
        // Get seller name
        const sellerDoc = await getDoc(doc(db, 'users', selectedSeller));
        const sellerName = sellerDoc.exists() ? sellerDoc.data().name : 'Unknown Seller';
        
        setReports({
          ...data,
          sellerName: sellerName,
          sellerId: selectedSeller
        });
        setAdminReports(null);
        
        console.log(`✅ Loaded reports for: ${sellerName}`);
      } else {
        // ✅ Fetch ONLY platform-wide aggregated data (no individual sellers)
        console.log('📊 Fetching platform-wide metrics...');
        
        // Get all orders for platform metrics
        const ordersQuery = query(
          collection(db, 'orders'),
          orderBy('createdAt', 'desc'),
          limit(1000)
        );
        const ordersSnapshot = await getDocs(ordersQuery);
        const allOrders = ordersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        // Get all sellers
        const sellersQuery = query(
          collection(db, 'users'),
          where('role', 'in', ['vendor', 'seller'])
        );
        const sellersSnapshot = await getDocs(sellersQuery);
        const sellers = sellersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        // Get all products
        const productsQuery = query(collection(db, 'products'));
        const productsSnapshot = await getDocs(productsQuery);
        
        // Calculate platform metrics
        const platformGMV = allOrders.reduce((sum, order) => sum + (order.total || 0), 0);
        const platformSales = allOrders.length;
        const platformProducts = productsSnapshot.size;
        
        // Calculate top sellers (from orders)
        const sellerRevenue = {};
        const sellerOrderCount = {};
        
        allOrders.forEach(order => {
          const sellerId = order.sellerId;
          if (sellerId) {
            sellerRevenue[sellerId] = (sellerRevenue[sellerId] || 0) + (order.total || 0);
            sellerOrderCount[sellerId] = (sellerOrderCount[sellerId] || 0) + 1;
          }
        });
        
        const topSellers = Object.entries(sellerRevenue)
          .map(([sellerId, revenue]) => {
            const seller = sellers.find(s => s.id === sellerId);
            return {
              name: seller?.name || 'Unknown Seller',
              revenue: revenue,
              orders: sellerOrderCount[sellerId] || 0,
              products: 0 // Will be calculated if needed
            };
          })
          .sort((a, b) => b.revenue - a.revenue)
          .slice(0, 5);
        
        setAdminReports({
          platformMetrics: {
            totalGMV: platformGMV,
            totalSales: platformSales,
            totalProducts: platformProducts,
            totalSellers: sellers.length,
            topSellers: topSellers
          },
          sellers: sellers.map(seller => ({
            id: seller.id,
            name: seller.name || 'Unknown',
            email: seller.email
          }))
        });
        setReports(null);
        
        console.log('✅ Loaded platform metrics');
      }
    } else {
      //  Regular seller view - fetch their own data
      console.log(`📊 Fetching reports for current user: ${currentUser.uid}`);
      const data = await reportsAPI.getSellerReports(selectedPeriod, currentUser.uid);
      setReports(data);
      setAdminReports(null);
      
      console.log('✅ Loaded seller reports');
    }

    toast.success('Reports updated successfully');
  } catch (err) {
    console.error('Reports error:', err);
    setError(err.message);
    toast.error('Failed to load reports');
  } finally {
    setLoading(false);
    setRefreshing(false);
  }
};

  const handleExportData = async () => {
    try {
      toast.success('Exporting report data...');
      setTimeout(() => {
        toast.success('Report exported successfully!');
      }, 1500);
    } catch (error) {
      toast.error('Export failed');
    }
  };

const isAdmin = ['admin', 'superadmin'].includes(userProfile?.role);

  const periodOptions = [
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'quarterly', label: 'Quarterly' },
    { value: 'yearly', label: 'Yearly' }
  ];

  if (loading) {
    return (
      <AdminLayout 
        title="Reports & Analytics"
        description="Marketplace performance insights"
        breadcrumb="Reports"
      >
        <div className="flex items-center justify-center min-h-[400px]">
          <LoadingSpinner />
        </div>
      </AdminLayout>
    );
  }

  if (!currentUser) {
    return (
      <AdminLayout 
        title="Reports & Analytics"
        description="Marketplace performance insights"
        breadcrumb="Reports"
      >
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">Authentication Required</h2>
            <p className="text-gray-600">Please login to view your reports</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title="Reports & Analytics"
      description="Marketplace performance insights"
      breadcrumb="Reports"
    >
      <div className="flex flex-col gap-6">

        {error && (
          <div className="flex items-center justify-between rounded-lg border border-red-200 bg-red-50 p-4 text-red-600">
            <div className="flex items-center">
              <AlertCircle className="mr-3 h-5 w-5" />
              {error}
            </div>
            <button 
              onClick={loadReports}
              className="text-sm font-medium hover:text-red-700 px-3 py-1 rounded border border-red-200 hover:bg-red-100"
            >
              Retry
            </button>
          </div>
        )}

        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {isAdmin && viewMode === 'admin' ? 'Platform Analytics' : 'Seller Analytics'}
            </h1>
            <p className="text-gray-600">
              {isAdmin && viewMode === 'admin' 
                ? 'Track platform performance and individual seller metrics' 
                : 'Track your sales performance and business growth'
              }
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Admin/Seller Toggle */}
            {isAdmin && (
              <div className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2">
                <Building className="h-4 w-4 text-gray-500" />
                <select 
                  value={viewMode}
                  onChange={(e) => setViewMode(e.target.value)}
                  className="bg-transparent text-sm font-medium text-gray-700 focus:outline-none cursor-pointer"
                >
                  <option value="seller">My Store</option>
                  <option value="admin">Platform View</option>
                </select>
              </div>
            )}

            {/* Seller Selector (Admin Mode) */}
            {isAdmin && viewMode === 'admin' && adminReports?.sellers && (
              <div className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2">
                <User className="h-4 w-4 text-gray-500" />
                <select 
                  value={selectedSeller || ''}
                  onChange={(e) => setSelectedSeller(e.target.value || null)}
                  className="bg-transparent text-sm font-medium text-gray-700 focus:outline-none cursor-pointer min-w-32"
                >
                  <option value="">All Sellers</option>
                  {adminReports.sellers.map(seller => (
                    <option key={seller.id} value={seller.id}>
                      {seller.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Period Selector */}
            <div className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <select 
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="bg-transparent text-sm font-medium text-gray-700 focus:outline-none cursor-pointer"
              >
                {periodOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* View Toggle */}
            <button
              onClick={() => setShowDetailedView(!showDetailedView)}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-all hover:bg-gray-50 hover:border-gray-400"
            >
              {showDetailedView ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              {showDetailedView ? 'Simple View' : 'Detailed View'}
            </button>

            <button
              onClick={loadReports}
              disabled={refreshing}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-all hover:bg-gray-50 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </button>
            
            <button
              onClick={handleExportData}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-blue-700 hover:shadow-md"
            >
              <Download className="h-4 w-4" />
              Export Data
            </button>
          </div>
        </div>

        {/* Platform Metrics (Admin View) */}
        {isAdmin && viewMode === 'admin' && adminReports && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="rounded-lg bg-blue-100 p-3">
                  <DollarSign className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    {formatPrice(adminReports.platformMetrics.totalGMV)}
                  </div>
                  <div className="text-sm text-gray-600">Platform Revenue</div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="rounded-lg bg-emerald-100 p-3">
                  <ShoppingBag className="h-6 w-6 text-emerald-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    {adminReports.platformMetrics.totalSales.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600">Total Orders</div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="rounded-lg bg-amber-100 p-3">
                  <Package className="h-6 w-6 text-amber-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    {adminReports.platformMetrics.totalProducts.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600">Total Products</div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="rounded-lg bg-purple-100 p-3">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    {adminReports.platformMetrics.totalSellers}
                  </div>
                  <div className="text-sm text-gray-600">Active Sellers</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Individual Seller/Selected Seller Metrics */}
        {reports && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Revenue Card */}
              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="rounded-lg bg-amber-100 p-3">
                    <IndianRupee className="h-6 w-6 text-amber-600" />
                  </div>
                  <div className="text-right">
                    <div className={`text-xs font-medium px-2 py-1 rounded-full ${
                      reports.monthlyGrowth >= 0 
                        ? 'text-emerald-600 bg-emerald-50' 
                        : 'text-rose-600 bg-rose-50'
                    }`}>
                      {reports.monthlyGrowth >= 0 ? '+' : ''}{reports.monthlyGrowth}%
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-2xl font-bold text-gray-900">{formatPrice(reports.gmv)}</div>
                  <div className="text-sm text-gray-600">Total Revenue</div>
                  <div className="flex items-center gap-1 text-xs text-emerald-600">
                    <TrendingUp className="h-3 w-3" />
                    <span>This {selectedPeriod}</span>
                  </div>
                </div>
              </div>

              {/* Orders Card */}
              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="rounded-lg bg-emerald-100 p-3">
                    <ShoppingBag className="h-6 w-6 text-emerald-600" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-2xl font-bold text-gray-900">{reports.totalSales.toLocaleString()}</div>
                  <div className="text-sm text-gray-600">Total Orders</div>
                  <div className="text-xs text-emerald-600">
                    {reports.completedSales} completed
                  </div>
                </div>
              </div>

              {/* Products Card */}
              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="rounded-lg bg-blue-100 p-3">
                    <Package className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-2xl font-bold text-gray-900">{reports.totalProducts.toLocaleString()}</div>
                  <div className="text-sm text-gray-600">Total Products</div>
                  <div className="text-xs text-emerald-600">
                    {reports.activeProducts} active
                  </div>
                </div>
              </div>

              {/* Performance Card */}
              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="rounded-lg bg-purple-100 p-3">
                    <Star className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-medium text-rose-600 bg-rose-50 px-2 py-1 rounded-full">
                      {reports.refundCount} issues
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-2xl font-bold text-gray-900">{reports.successRate}%</div>
                  <div className="text-sm text-gray-600">Success Rate</div>
                  <div className="flex items-center gap-1 text-xs text-rose-600">
                    <TrendingDown className="h-3 w-3" />
                    <span>{reports.refundCount} refunds</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Enhanced Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {/* Revenue Trend Chart */}
              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm lg:col-span-2 xl:col-span-1">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                    <TrendingUp className="h-5 w-5 text-gray-500" />
                    Revenue Trend
                  </h3>
                </div>
                <RevenueTrendChart data={reports.monthlyRevenue} />
              </div>

              {/* Category Distribution */}
              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                    <PieChart className="h-5 w-5 text-gray-500" />
                    Product Categories
                  </h3>
                  <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                    <Filter className="h-4 w-4 text-gray-500" />
                  </button>
                </div>
                <div className="space-y-4">
                  {reports.topCategories?.length > 0 ? (
                    reports.topCategories.map((category, index) => (
                      <div key={index} className="flex items-center justify-between group">
                        <div className="flex items-center gap-3 flex-1">
                          <div 
                            className={cn(
                              'w-3 h-3 rounded-full transition-transform group-hover:scale-125',
                              categoryColors[index % categoryColors.length]
                            )}
                          />
                          <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                            {category.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 w-32">
                          <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                            <div 
                              className={cn('h-2 rounded-full transition-all duration-500', categoryColors[index % categoryColors.length])}
                              style={{ width: `${category.value}%` }}
                            />
                          </div>
                          <span className="text-sm font-semibold text-gray-600 min-w-[35px] text-right">
                            {category.value}%
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      No categories data available
                    </div>
                  )}
                </div>
              </div>

              {/* Order Status Distribution */}
              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                    <BarChart3 className="h-5 w-5 text-gray-500" />
                    Order Status
                  </h3>
                </div>
                <StatusDistributionChart data={reports.orderStatusData} />
              </div>

              {/* Top Sellers (Admin View) */}
              {isAdmin && viewMode === 'admin' && adminReports?.platformMetrics?.topSellers && (
                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm lg:col-span-2 xl:col-span-1">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                      <Star className="h-5 w-5 text-gray-500" />
                      Top Sellers
                    </h3>
                  </div>
                  <TopSellersChart data={adminReports.platformMetrics.topSellers} />
                </div>
              )}

              {/* Recent Activity */}
              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm lg:col-span-2 xl:col-span-1">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                    <ShoppingCart className="h-5 w-5 text-gray-500" />
                    Recent Orders
                  </h3>
                  <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full border border-green-200">
                    Live
                  </span>
                </div>
                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {reports.recentActivity?.length > 0 ? (
                    reports.recentActivity.map((activity, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-3 p-3 rounded-lg border border-gray-100 hover:border-gray-200 hover:bg-gray-50 transition-colors group"
                      >
                        <div className={cn(
                          'rounded-lg p-2 mt-1 transition-transform group-hover:scale-110',
                          'bg-blue-100 text-blue-600'
                        )}>
                          <ShoppingCart className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {activity.description}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-gray-500">{activity.time}</span>
                            <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                            <span className={cn(
                              'text-xs capitalize px-2 py-1 rounded-full',
                              statusColors[activity.status] || 'bg-gray-100 text-gray-800'
                            )}>
                              {activity.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      No recent orders
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}

        {/* Additional Insights Section */}
        {showDetailedView && reports && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Business Insights</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="font-medium text-gray-900 mb-1">Order Performance</div>
                <div className="text-emerald-600">
                  {reports.successRate}% success rate
                </div>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="font-medium text-gray-900 mb-1">Revenue Growth</div>
                <div className={reports.monthlyGrowth >= 0 ? "text-emerald-600" : "text-rose-600"}>
                  {reports.monthlyGrowth >= 0 ? '+' : ''}{reports.monthlyGrowth}% growth
                </div>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="font-medium text-gray-900 mb-1">Customer Satisfaction</div>
                <div className={reports.averageRating >= 4 ? "text-emerald-600" : reports.averageRating >= 3 ? "text-amber-600" : "text-rose-600"}>
                  {reports.averageRating}/5 average rating
                </div>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="font-medium text-gray-900 mb-1">Inventory Health</div>
                <div className={reports.activeProducts > 0 ? "text-emerald-600" : "text-rose-600"}>
                  {reports.activeProducts}/{reports.totalProducts} active
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default Reports;