"use client";

import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Package, 
  ShoppingCart, 
  DollarSign, 
  Settings, 
  Shield,
  UserCheck,
  AlertTriangle,
  TrendingUp,
  BarChart3,
  Edit,
  Trash2,
  Eye,
  CheckCircle,
  XCircle,
  Filter,
  Search,
  Plus,
  Download,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { collection, getDocs, query, where, doc, updateDoc, deleteDoc, orderBy, limit } from 'firebase/firestore';
import { db } from '@/firebase/config';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import toast from 'react-hot-toast';

// Helper component for conditional Tailwind classes (replaces ActionButton and Button)
const ActionButton = ({ children, className = '', onClick, type = 'button' }) => {
  let baseClasses = 'flex items-center gap-2 px-6 py-3 rounded-lg font-semibold cursor-pointer transition-all duration-200 shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  if (className.includes('secondary')) {
    baseClasses += ' bg-gray-500 text-white hover:bg-gray-700 focus:ring-gray-500';
  } else if (className.includes('danger')) {
    baseClasses += ' bg-red-600 text-white hover:bg-red-700 focus:ring-red-600';
  } else {
    baseClasses += ' bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-600';
  }
  
  return (
    <button type={type} className={baseClasses + ' ' + className} onClick={onClick}>
      {children}
    </button>
  );
};

// Helper component for badges
const StatusBadge = ({ children, status }) => {
  let classes = 'px-3 py-1 text-sm font-medium rounded-full whitespace-nowrap';
  
  if (status === 'active' || status === 'delivered') {
    classes += ' bg-green-100 text-green-700';
  } else if (status === 'inactive' || status === 'rejected') {
    classes += ' bg-red-100 text-red-700';
  } else { // pending
    classes += ' bg-yellow-100 text-yellow-700';
  }
  
  return <span className={classes}>{children}</span>;
};

// Helper component for TabButton (Handles active state)
const TabButton = ({ active, onClick, children }) => {
  const activeClasses = 'text-blue-600 border-b-2 border-blue-600 bg-white';
  const inactiveClasses = 'text-gray-600 border-b-2 border-transparent hover:text-blue-600 hover:bg-gray-50';
  
  return (
    <button
      className={`flex items-center gap-2 px-4 md:px-8 py-3 font-semibold transition-all duration-200 whitespace-nowrap ${active ? activeClasses : inactiveClasses}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
};


const SuperAdminDashboardComponent = () => {
  const { currentUser, isSuperAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0
  });
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState('');
  
  // Modals state
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  // Form state for modals
  const [userModalForm, setUserModalForm] = useState({ name: '', email: '', role: 'buyer' });
  const [productModalForm, setProductModalForm] = useState({ name: '', category: '', price: 0 });

  useEffect(() => {
    if (!currentUser || !isSuperAdmin(currentUser)) {
      if (!currentUser) return; // Wait for currentUser to load
      toast.error('Access denied. Super admin privileges required.');
      return;
    }
    
    fetchDashboardData();
  }, [currentUser, isSuperAdmin]);

  const fetchDashboardData = async () => {
    // Existing data fetching logic remains the same (omitted for brevity)
    // ... (Your Firebase fetchDashboardData logic here)
    try {
        setLoading(true);
        let usersData = [];
        try {
            const usersSnapshot = await getDocs(collection(db, 'users'));
            usersData = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), isActive: doc.data().isActive ?? true })); // Default isActive
            setUsers(usersData);
        } catch (error) {
            console.warn('Could not fetch users:', error);
            setUsers([]);
        }

        let productsData = [];
        try {
            const productsSnapshot = await getDocs(collection(db, 'products'));
            productsData = productsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), isApproved: doc.data().isApproved ?? false })); // Default isApproved
            setProducts(productsData);
        } catch (error) {
            console.warn('Could not fetch products:', error);
            setProducts([]);
        }

        let ordersData = [];
        try {
            const ordersSnapshot = await getDocs(collection(db, 'orders'));
            ordersData = ordersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setOrders(ordersData);
        } catch (error) {
            console.warn('Could not fetch orders:', error);
            setOrders([]);
        }

        const totalUsers = usersData.length;
        const totalProducts = productsData.length;
        const totalOrders = ordersData.length;
        let totalRevenue = 0;
        
        ordersData.forEach(order => {
            if (order.status === 'delivered' && order.total) {
                totalRevenue += order.total;
            }
        });

        setStats({
            totalUsers,
            totalProducts,
            totalOrders,
            totalRevenue
        });
        
        console.log('Dashboard data loaded successfully:', { users: usersData.length, products: productsData.length, orders: ordersData.length });
    } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setError('Failed to load dashboard data. Please check your internet connection and try again.');
        toast.error('Failed to load dashboard data. Please check your internet connection and try again.');
    } finally {
        setLoading(false);
    }
  };

  const handleUserRoleUpdate = async (userId, newRole) => {
    // Existing role update logic remains the same
    // ...
    try {
        await updateDoc(doc(db, 'users', userId), { role: newRole, updatedAt: new Date() });
        toast.success('User role updated successfully');
        fetchDashboardData();
    } catch (error) {
        console.error('Error updating user role:', error);
        toast.error('Failed to update user role');
    }
  };

  const handleUserStatusToggle = async (userId, currentStatus) => {
    // Existing status toggle logic remains the same
    // ...
    try {
        await updateDoc(doc(db, 'users', userId), { isActive: !currentStatus, updatedAt: new Date() });
        toast.success('User status updated successfully');
        fetchDashboardData();
    } catch (error) {
        console.error('Error updating user status:', error);
        toast.error('Failed to update user status');
    }
  };

  const handleProductApproval = async (productId, approved) => {
    // Existing product approval logic remains the same
    // ...
    try {
        await updateDoc(doc(db, 'products', productId), {
            isApproved: approved,
            approvedAt: approved ? new Date() : null,
            updatedAt: new Date()
        });
        toast.success(`Product ${approved ? 'approved' : 'rejected'} successfully`);
        fetchDashboardData();
    } catch (error) {
        console.error('Error updating product approval:', error);
        toast.error('Failed to update product approval');
    }
  };
  
  // NOTE: You did not include a handleUserSubmit function, so I'll add a simplified one
  const handleUserSubmit = async (e) => {
    e.preventDefault();
    if (!userModalForm.name || !userModalForm.email || !userModalForm.role) {
        toast.error('All fields are required.');
        return;
    }
    
    try {
        if (editingUser) {
            // Update User
            await updateDoc(doc(db, 'users', editingUser.id), { ...userModalForm, updatedAt: new Date() });
            toast.success('User updated successfully!');
        } else {
            // Add User (Simplified: In a real app, this should involve Firebase Auth registration)
            // This is just a Firestore document creation
            // const newUserRef = await addDoc(collection(db, 'users'), { ...userModalForm, createdAt: new Date(), isActive: true });
            toast.error('User creation not fully implemented on client-side.');
            setShowUserModal(false);
            setEditingUser(null);
            return;
        }
        
        setShowUserModal(false);
        setEditingUser(null);
        fetchDashboardData();
    } catch (error) {
        console.error('Error saving user:', error);
        toast.error('Failed to save user.');
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          user.email?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = !filterRole || user.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          product.category?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });
  
  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          order.customerName?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  if (!isSuperAdmin(currentUser)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-xl shadow-lg">
          <AlertTriangle size={64} className="text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800">Access Denied</h2>
          <p className="text-gray-500">You need super admin privileges to access this dashboard.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto text-center py-16">
          <AlertTriangle size={64} className="text-red-500 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Dashboard Error</h2>
          <p className="text-lg text-gray-600 mb-8">{error}</p>
          <ActionButton onClick={fetchDashboardData}>
            <RefreshCw size={20} />
            Retry Loading Data
          </ActionButton>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-5xl font-extrabold text-gray-900 mb-2">Super Admin Dashboard</h1>
          <p className="text-xl text-gray-500">Complete control over the ThriftX Fashion Marketplace</p>
          <div className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-full font-semibold text-white 
              bg-gradient-to-r from-indigo-500 to-purple-600 shadow-lg">
            <Shield size={20} />
            Super Administrator
          </div>
          <ActionButton 
            onClick={fetchDashboardData}
            className="secondary mt-4 ml-4"
          >
            <RefreshCw size={20} />
            Refresh Data
          </ActionButton>
        </div>

        {/* Tabs Container */}
        <div className="bg-white rounded-xl shadow-lg mb-8">
          
          {/* Tab Header */}
          <div className="flex border-b border-gray-200 overflow-x-auto">
            <TabButton active={activeTab === 'overview'} onClick={() => { setActiveTab('overview'); setSearchQuery(''); }}>
              <BarChart3 size={20} /> Overview
            </TabButton>
            <TabButton active={activeTab === 'users'} onClick={() => { setActiveTab('users'); setSearchQuery(''); setFilterRole(''); }}>
              <Users size={20} /> User Management
            </TabButton>
            <TabButton active={activeTab === 'products'} onClick={() => { setActiveTab('products'); setSearchQuery(''); }}>
              <Package size={20} /> Product Oversight
            </TabButton>
            <TabButton active={activeTab === 'orders'} onClick={() => { setActiveTab('orders'); setSearchQuery(''); }}>
              <ShoppingCart size={20} /> Orders
            </TabButton>
            <TabButton active={activeTab === 'analytics'} onClick={() => { setActiveTab('analytics'); setSearchQuery(''); }}>
              <TrendingUp size={20} /> Analytics
            </TabButton>
            <TabButton active={activeTab === 'settings'} onClick={() => { setActiveTab('settings'); setSearchQuery(''); }}>
              <Settings size={20} /> Platform Settings
            </TabButton>
          </div>

          {/* Tab Content */}
          <div className="p-8">
            
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  
                  {/* Total Users Stat Card */}
                  <div className="bg-white rounded-xl p-6 shadow-md text-center transition duration-200 hover:shadow-lg hover:-translate-y-1">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-500 rounded-full mb-3 text-white">
                      <Users size={28} />
                    </div>
                    <div className="text-4xl font-bold text-gray-900">{stats.totalUsers}</div>
                    <div className="text-gray-500 mt-1">Total Users</div>
                  </div>

                  {/* Total Products Stat Card */}
                  <div className="bg-white rounded-xl p-6 shadow-md text-center transition duration-200 hover:shadow-lg hover:-translate-y-1">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500 rounded-full mb-3 text-white">
                      <Package size={28} />
                    </div>
                    <div className="text-4xl font-bold text-gray-900">{stats.totalProducts}</div>
                    <div className="text-gray-500 mt-1">Total Products</div>
                  </div>

                  {/* Total Orders Stat Card */}
                  <div className="bg-white rounded-xl p-6 shadow-md text-center transition duration-200 hover:shadow-lg hover:-translate-y-1">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-500 rounded-full mb-3 text-white">
                      <ShoppingCart size={28} />
                    </div>
                    <div className="text-4xl font-bold text-gray-900">{stats.totalOrders}</div>
                    <div className="text-gray-500 mt-1">Total Orders</div>
                  </div>

                  {/* Total Revenue Stat Card */}
                  <div className="bg-white rounded-xl p-6 shadow-md text-center transition duration-200 hover:shadow-lg hover:-translate-y-1">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-500 rounded-full mb-3 text-white">
                      <DollarSign size={28} />
                    </div>
                    <div className="text-4xl font-bold text-gray-900">₹{stats.totalRevenue.toLocaleString()}</div>
                    <div className="text-gray-500 mt-1">Total Revenue</div>
                  </div>
                </div>
              </>
            )}

            {/* User Management Tab */}
            {activeTab === 'users' && (
              <>
                {/* Search Bar */}
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                  <div className="relative flex-grow">
                    <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search users by name or email..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-600 text-base"
                    />
                  </div>
                  <select
                    value={filterRole}
                    onChange={(e) => setFilterRole(e.target.value)}
                    className="py-3 px-4 border-2 border-gray-200 rounded-lg bg-white focus:outline-none focus:border-blue-600 text-base min-w-[150px]"
                  >
                    <option value="">All Roles</option>
                    <option value="buyer">Buyer</option>
                    <option value="seller">Seller</option>
                    <option value="admin">Admin</option>
                  </select>
                  <ActionButton 
                    onClick={() => { 
                      setEditingUser(null);
                      setUserModalForm({ name: '', email: '', role: 'buyer' });
                      setShowUserModal(true); 
                    }}
                  >
                    <Plus size={20} />
                    Add User
                  </ActionButton>
                </div>

                {/* Data Table */}
                <div className="bg-white rounded-xl overflow-hidden border border-gray-200 shadow-sm">
                  
                  {/* Table Header */}
                  <div className="grid grid-cols-5 gap-4 p-4 bg-gray-50 border-b border-gray-200 font-semibold text-gray-700">
                    <div className="col-span-1">Name</div>
                    <div className="col-span-1">Email</div>
                    <div className="col-span-1">Role</div>
                    <div className="col-span-1">Status</div>
                    <div className="col-span-1 text-right pr-4">Actions</div>
                  </div>
                  
                  {/* Table Rows */}
                  {filteredUsers.map(user => (
                    <div key={user.id} className="grid grid-cols-5 gap-4 p-4 border-b border-gray-100 items-center hover:bg-gray-50">
                      <div className="text-gray-800 truncate">{user.name || 'N/A'}</div>
                      <div className="text-gray-800 truncate">{user.email}</div>
                      
                      <div className="text-gray-800">
                        <select
                          value={user.role || 'buyer'}
                          onChange={(e) => handleUserRoleUpdate(user.id, e.target.value)}
                          className="py-1 px-2 border border-gray-300 rounded-md text-sm bg-white focus:outline-none focus:border-blue-500"
                        >
                          <option value="buyer">Buyer</option>
                          <option value="seller">Seller</option>
                          <option value="admin">Admin</option>
                        </select>
                      </div>

                      <div>
                        <StatusBadge status={user.isActive ? 'active' : 'inactive'}>
                          {user.isActive ? 'Active' : 'Inactive'}
                        </StatusBadge>
                      </div>
                      
                      <div className="flex justify-end gap-2 text-right">
                        <ActionButton
                          className="secondary !p-2 !px-3" // Small action button style
                          onClick={() => handleUserStatusToggle(user.id, user.isActive)}
                          title={user.isActive ? 'Deactivate User' : 'Activate User'}
                        >
                          {user.isActive ? <XCircle size={18} /> : <UserCheck size={18} />}
                        </ActionButton>
                        <ActionButton
                          className="secondary !p-2 !px-3"
                          onClick={() => {
                            setEditingUser(user);
                            setUserModalForm({ name: user.name || '', email: user.email || '', role: user.role || 'buyer' });
                            setShowUserModal(true);
                          }}
                          title="Edit User"
                        >
                          <Edit size={18} />
                        </ActionButton>
                      </div>
                    </div>
                  ))}
                  {!filteredUsers.length && (
                      <div className="p-4 text-center text-gray-500">No users found matching the filter.</div>
                  )}
                </div>
              </>
            )}

            {/* Product Oversight Tab */}
            {activeTab === 'products' && (
              <>
                {/* Search Bar */}
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                  <div className="relative flex-grow">
                    <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search products by name or category..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-600 text-base"
                    />
                  </div>
                  <ActionButton onClick={() => { setEditingProduct(null); setProductModalForm({ name: '', category: '', price: 0 }); setShowProductModal(true); }}>
                    <Plus size={20} />
                    Add Product
                  </ActionButton>
                </div>
                
                {/* Data Table */}
                <div className="bg-white rounded-xl overflow-hidden border border-gray-200 shadow-sm">
                  
                  {/* Table Header */}
                  <div className="grid grid-cols-5 gap-4 p-4 bg-gray-50 border-b border-gray-200 font-semibold text-gray-700">
                    <div className="col-span-1">Name</div>
                    <div className="col-span-1">Category</div>
                    <div className="col-span-1">Price</div>
                    <div className="col-span-1">Approval Status</div>
                    <div className="col-span-1 text-right pr-4">Actions</div>
                  </div>
                  
                  {/* Table Rows */}
                  {filteredProducts.map(product => (
                    <div key={product.id} className="grid grid-cols-5 gap-4 p-4 border-b border-gray-100 items-center hover:bg-gray-50">
                      <div className="text-gray-800 truncate">{product.name}</div>
                      <div className="text-gray-800 truncate">{product.category}</div>
                      <div className="text-gray-800">₹{product.price?.toLocaleString() || '0'}</div>
                      
                      <div>
                        <StatusBadge status={product.isApproved ? 'active' : 'pending'}>
                          {product.isApproved ? 'Approved' : 'Pending'}
                        </StatusBadge>
                      </div>
                      
                      <div className="flex justify-end gap-2 text-right">
                        <ActionButton
                          className={product.isApproved ? 'danger !p-2 !px-3' : 'secondary !p-2 !px-3'}
                          onClick={() => handleProductApproval(product.id, !product.isApproved)}
                          title={product.isApproved ? 'Reject Product' : 'Approve Product'}
                        >
                          {product.isApproved ? <XCircle size={18} /> : <CheckCircle size={18} />}
                        </ActionButton>
                        <ActionButton
                          className="secondary !p-2 !px-3"
                          onClick={() => {
                            setEditingProduct(product);
                            setProductModalForm({ name: product.name, category: product.category, price: product.price });
                            setShowProductModal(true);
                          }}
                          title="Edit Product"
                        >
                          <Edit size={18} />
                        </ActionButton>
                      </div>
                    </div>
                  ))}
                  {!filteredProducts.length && (
                      <div className="p-4 text-center text-gray-500">No products found matching the filter.</div>
                  )}
                </div>
              </>
            )}
            
            {/* Orders Tab */}
            {activeTab === 'orders' && (
                <>
                    {/* Search Bar */}
                    <div className="flex flex-col md:flex-row gap-4 mb-6">
                        <div className="relative flex-grow">
                            <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search orders..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-600 text-base"
                            />
                        </div>
                        <ActionButton>
                            <Download size={20} />
                            Export Orders
                        </ActionButton>
                    </div>

                    {/* Data Table */}
                    <div className="bg-white rounded-xl overflow-hidden border border-gray-200 shadow-sm">
                        
                        {/* Table Header */}
                        <div className="grid grid-cols-5 gap-4 p-4 bg-gray-50 border-b border-gray-200 font-semibold text-gray-700">
                            <div className="col-span-1">Order ID</div>
                            <div className="col-span-1">Customer</div>
                            <div className="col-span-1">Total</div>
                            <div className="col-span-1">Status</div>
                            <div className="col-span-1 text-right pr-4">Actions</div>
                        </div>
                        
                        {/* Table Rows */}
                        {filteredOrders.map(order => (
                            <div key={order.id} className="grid grid-cols-5 gap-4 p-4 border-b border-gray-100 items-center hover:bg-gray-50">
                                <div className="text-gray-800 truncate">{order.id.slice(-8)}</div>
                                <div className="text-gray-800 truncate">{order.customerName || 'N/A'}</div>
                                <div className="text-gray-800">₹{order.total?.toLocaleString() || '0'}</div>
                                
                                <div>
                                    <StatusBadge status={order.status}>
                                        {order.status}
                                    </StatusBadge>
                                </div>
                                
                                <div className="flex justify-end gap-2 text-right">
                                    <ActionButton className="secondary !p-2 !px-3">
                                        <Eye size={18} />
                                    </ActionButton>
                                </div>
                            </div>
                        ))}
                        {!filteredOrders.length && (
                            <div className="p-4 text-center text-gray-500">No orders found matching the filter.</div>
                        )}
                    </div>
                </>
            )}

            {/* Analytics Tab */}
            {activeTab === 'analytics' && (
              <div className="text-center py-16">
                <BarChart3 size={64} className="text-gray-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-800">Advanced Analytics</h2>
                <p className="text-gray-600 mb-6">Detailed analytics and reporting features coming soon...</p>
                <ActionButton>
                  <Download size={20} />
                  Generate Report
                </ActionButton>
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <div className="text-center py-16">
                <Settings size={64} className="text-gray-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-800">Platform Settings</h2>
                <p className="text-gray-600 mb-6">Platform configuration and settings coming soon...</p>
                <ActionButton>
                  <Edit size={20} />
                  Configure Platform
                </ActionButton>
              </div>
            )}
          </div>
        </div>

        {/* User Modal (Tailwind CSS) */}
        {showUserModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[1000]" onClick={() => setShowUserModal(false)}>
            <div className="bg-white rounded-xl p-8 max-w-lg w-11/12 max-h-[90vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
              
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900">
                  {editingUser ? 'Edit User' : 'Add New User'}
                </h3>
                <button className="text-gray-500 text-3xl hover:text-gray-800" onClick={() => setShowUserModal(false)}>
                  &times;
                </button>
              </div>
              
              <form onSubmit={handleUserSubmit}>
                <div className="mb-4">
                  <label className="block font-medium text-gray-700 mb-1">Name</label>
                  <input 
                    defaultValue={userModalForm.name} 
                    onChange={(e) => setUserModalForm({ ...userModalForm, name: e.target.value })}
                    placeholder="Enter user name"
                    className="w-full p-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-600"
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block font-medium text-gray-700 mb-1">Email</label>
                  <input 
                    defaultValue={userModalForm.email} 
                    onChange={(e) => setUserModalForm({ ...userModalForm, email: e.target.value })}
                    placeholder="Enter user email"
                    type="email"
                    className="w-full p-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-600"
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block font-medium text-gray-700 mb-1">Role</label>
                  <select 
                    defaultValue={userModalForm.role}
                    onChange={(e) => setUserModalForm({ ...userModalForm, role: e.target.value })}
                    className="w-full p-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-600 bg-white"
                  >
                    <option value="buyer">Buyer</option>
                    <option value="seller">Seller</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                
                <div className="flex gap-4 justify-end mt-8">
                  <ActionButton className="secondary" type="button" onClick={() => setShowUserModal(false)}>
                    Cancel
                  </ActionButton>
                  <ActionButton type="submit">
                    {editingUser ? 'Update User' : 'Add User'}
                  </ActionButton>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Product Modal (Tailwind CSS) */}
        {showProductModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[1000]" onClick={() => setShowProductModal(false)}>
            <div className="bg-white rounded-xl p-8 max-w-lg w-11/12 max-h-[90vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
              
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900">
                  {editingProduct ? 'Edit Product' : 'Add New Product'}
                </h3>
                <button className="text-gray-500 text-3xl hover:text-gray-800" onClick={() => setShowProductModal(false)}>
                  &times;
                </button>
              </div>
              
              <form> {/* Add onSubmit handler for real logic */}
                <div className="mb-4">
                  <label className="block font-medium text-gray-700 mb-1">Product Name</label>
                  <input 
                    defaultValue={productModalForm.name} 
                    placeholder="Enter product name"
                    className="w-full p-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-600"
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block font-medium text-gray-700 mb-1">Category</label>
                  <select 
                    defaultValue={productModalForm.category}
                    className="w-full p-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-600 bg-white"
                  >
                    <option value="">Select Category</option>
                    <option value="womens-clothing">Women's Clothing</option>
                    <option value="mens-clothing">Men's Clothing</option>
                    <option value="dresses">Dresses</option>
                    <option value="shoes">Shoes</option>
                    <option value="bags-accessories">Bags & Accessories</option>
                    <option value="jewelry">Jewelry</option>
                    <option value="vintage">Vintage</option>
                    <option value="designer">Designer</option>
                  </select>
                </div>
                
                <div className="mb-4">
                  <label className="block font-medium text-gray-700 mb-1">Price (₹)</label>
                  <input 
                    defaultValue={productModalForm.price} 
                    placeholder="Enter price in INR"
                    type="number"
                    className="w-full p-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-600"
                  />
                </div>
                
                <div className="flex gap-4 justify-end mt-8">
                  <ActionButton className="secondary" type="button" onClick={() => setShowProductModal(false)}>
                    Cancel
                  </ActionButton>
                  <ActionButton type="submit">
                    {editingProduct ? 'Update Product' : 'Add Product'}
                  </ActionButton>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SuperAdminDashboardComponent;