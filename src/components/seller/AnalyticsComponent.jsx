"use client";

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { useAuth } from '@/contexts/AuthContext';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { formatPrice } from '@/utils/formatters';
import { Star } from 'lucide-react';

const Line = dynamic(() => import('react-chartjs-2').then(mod => mod.Line), { ssr: false, loading: () => null });
const Doughnut = dynamic(() => import('react-chartjs-2').then(mod => mod.Doughnut), { ssr: false, loading: () => null });
const Bar = dynamic(() => import('react-chartjs-2').then(mod => mod.Bar), { ssr: false, loading: () => null });
const Pie = dynamic(() => import('react-chartjs-2').then(mod => mod.Pie), { ssr: false, loading: () => null });


const SellerAnalyticsComponent = () => {
  const { currentUser } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState('30');

  useEffect(() => {
    (async () => {
      try {
        const { Chart } = await import('chart.js/auto');
        
      } catch (e) {
        console.error('Failed to load chart.js on client:', e);
      }
    })();

    if (!currentUser) return;
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const q = query(collection(db, 'orders'), where('sellerId', '==', currentUser.uid));
        const snapshot = await getDocs(q);
        const fetchedOrders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setOrders(fetchedOrders);
      } catch (error) {
        console.error('Error fetching analytics orders:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [currentUser]);

  if (loading) return <LoadingSpinner text="Loading analytics..." />;

  const now = new Date();
  const filteredOrders = orders.filter(order => {
    const orderDate = order.createdAt?.toDate();
    if (!orderDate) return false;
    if (dateFilter === '7') return (now - orderDate) / (1000*60*60*24) <= 7;
    if (dateFilter === '30') return (now - orderDate) / (1000*60*60*24) <= 30;
    if (dateFilter === '90') return (now - orderDate) / (1000*60*60*24) <= 90;
    return true;
  });

  
  const totalRevenue = filteredOrders.reduce((sum, order) => sum + order.total, 0);
  const totalOrders = filteredOrders.length;
  const pendingOrders = filteredOrders.filter(order => order.status === 'pending').length;
  const ratings = filteredOrders.map(order => order.rating || 0).filter(r => r > 0);
  const avgRating = ratings.length ? (ratings.reduce((a,b) => a+b,0)/ratings.length).toFixed(1) : 0;
  const deliveryRate = totalOrders ? (filteredOrders.filter(o => o.status === 'delivered').length / totalOrders) * 100 : 0;

  
  const revenueByDay = filteredOrders.reduce((acc, order) => {
    const day = order.createdAt?.toDate().toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
    if (!day) return acc;
    acc[day] = (acc[day] || 0) + order.total;
    return acc;
  }, {});
  const lineData = {
    labels: Object.keys(revenueByDay),
    datasets: [
      {
        label: 'Revenue',
        data: Object.values(revenueByDay),
        fill: true,
        backgroundColor: 'rgba(59,130,246,0.2)',
        borderColor: 'rgba(59,130,246,1)',
        tension: 0.4,
      },
    ],
  };

  //Orders by status
  const statusCounts = filteredOrders.reduce((acc, order) => {
    acc[order.status] = (acc[order.status] || 0) + 1;
    return acc;
  }, {});
  const doughnutData = {
    labels: Object.keys(statusCounts),
    datasets: [
      {
        label: 'Orders',
        data: Object.values(statusCounts),
        backgroundColor: ['#3B82F6', '#FBBF24', '#10B981', '#EF4444', '#8B5CF6'],
      },
    ],
  };

  //Top products 
  const productCounts = {};
  filteredOrders.forEach(order => {
    order.items.forEach(item => {
      productCounts[item.productName] = (productCounts[item.productName] || 0) + item.quantity;
    });
  });
  const topProducts = Object.entries(productCounts).sort((a,b)=>b[1]-a[1]).slice(0,5);
  const barData = {
    labels: topProducts.map(([name]) => name),
    datasets: [
      {
        label: 'Units Sold',
        data: topProducts.map(([, qty]) => qty),
        backgroundColor: 'rgba(59,130,246,0.7)',
        borderRadius: 4,
      },
    ],
  };

  // Sales by category
  const categorySales = filteredOrders.reduce((acc, order) => {
    order.items.forEach(item => {
      const category = item.category || 'Uncategorized';
      acc[category] = (acc[category] || 0) + (item.price * item.quantity);
    });
    return acc;
  }, {});
  const pieData = {
    labels: Object.keys(categorySales),
    datasets: [{
      label: 'Sales',
      data: Object.values(categorySales),
      backgroundColor: [
        'rgba(59, 130, 246, 0.8)',
        'rgba(239, 68, 68, 0.8)',
        'rgba(245, 158, 11, 0.8)',
        'rgba(16, 185, 129, 0.8)',
        'rgba(139, 92, 246, 0.8)',
      ],
    }],
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Analytics</h1>

      {/* Date Filter */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {['7','30','90','all'].map(d => (
          <button
            key={d}
            onClick={() => setDateFilter(d)}
            className={`px-4 py-2 rounded-lg font-semibold transition ${
              dateFilter === d ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            {d==='7'?'Last 7 Days':d==='30'?'Last 30 Days':d==='90'?'Last 90 Days':'All Time'}
          </button>
        ))}
      </div>

      {/* KPI Cards */}
      <div className="flex flex-wrap gap-6 mb-8">
        <div className="flex-grow sm:w-[calc(50%-0.75rem)] bg-white shadow rounded-xl p-6">
          <p className="text-gray-500 font-medium">Total Revenue</p>
          <p className="text-2xl font-bold text-green-600 mt-2">{formatPrice(totalRevenue)}</p>
        </div>
        <div className="flex-grow sm:w-[calc(50%-0.75rem)] bg-white shadow rounded-xl p-6">
          <p className="text-gray-500 font-medium">Total Orders</p>
          <p className="text-2xl font-bold text-blue-600 mt-2">{totalOrders}</p>
        </div>
        <div className="flex-grow sm:w-[calc(50%-0.75rem)] bg-white shadow rounded-xl p-6">
          <p className="text-gray-500 font-medium">Pending Orders</p>
          <p className="text-2xl font-bold text-yellow-500 mt-2">{pendingOrders}</p>
        </div>
        <div className="flex-grow sm:w-[calc(50%-0.75rem)] bg-white shadow rounded-xl p-6">
          <p className="text-gray-500 font-medium">Avg Rating</p>
          <div className="flex items-center gap-1 mt-1">
            <p className="text-2xl font-bold text-indigo-600">{avgRating}</p>
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className={`h-5 w-5 ${i < Math.round(avgRating) ? 'text-yellow-400' : 'text-gray-300'}`} />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="flex flex-wrap gap-6 mb-6">
        <div className="flex-grow sm:w-[calc(50%-0.75rem)] bg-white shadow rounded-xl p-6">
          <h2 className="text-gray-700 font-semibold mb-4">Revenue Over Time</h2>
          <div className="h-64"><Line data={lineData} /></div>
        </div>
        <div className="flex-grow sm:w-[calc(50%-0.75rem)] bg-white shadow rounded-xl p-6">
          <h2 className="text-gray-700 font-semibold mb-4">Orders by Status</h2>
          <div className="h-64 flex justify-center items-center"><Doughnut data={doughnutData} /></div>
        </div>
      </div>

      <div className="flex flex-wrap gap-6 mb-6">
        <div className="flex-grow sm:w-[calc(50%-0.75rem)] bg-white shadow rounded-xl p-6">
          <h2 className="text-gray-700 font-semibold mb-4">Top Selling Products</h2>
          <div className="h-64"><Bar data={barData} /></div>
        </div>
        <div className="flex-grow sm:w-[calc(50%-0.75rem)] bg-white shadow rounded-xl p-6">
            <h2 className="text-gray-700 font-semibold mb-4">Sales by Category</h2>
            <div className="h-64 flex justify-center items-center">
                <Pie data={pieData} />
            </div>
        </div>

      </div>

      {/* Delivery Rate */}
      <div className="flex-grow  bg-white shadow rounded-xl p-6">
        <h2 className="text-gray-700 font-semibold mb-4">Delivery Rate</h2>
        <div className="w-full bg-gray-200 rounded-full h-6 mb-2">
          <div
            className="bg-green-500 h-6 rounded-full transition-all duration-1000"
            style={{ width: `${deliveryRate}%` }}
          ></div>
        </div>
        <p className="text-gray-600">{deliveryRate.toFixed(1)}% of orders delivered</p>
      </div>
    </div>
  );
};

export default SellerAnalyticsComponent;
