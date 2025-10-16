import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
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
import { useAuth } from '../../contexts/AuthContext';
import { collection, getDocs, query, where, doc, updateDoc, deleteDoc, orderBy, limit } from 'firebase/firestore';
import { db } from '../../firebase/config';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

const DashboardContainer = styled.div`
  min-height: 100vh;
  background: #f9fafb;
  padding: 2rem 0;
`;

const Container = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 2rem;
  
  @media (max-width: 768px) {
    padding: 0 1rem;
  }
`;

const Header = styled.div`
  margin-bottom: 3rem;
  text-align: center;
`;

const Title = styled.h1`
  font-size: 3rem;
  font-weight: 800;
  color: #1f2937;
  margin-bottom: 1rem;
`;

const Subtitle = styled.p`
  color: #6b7280;
  font-size: 1.25rem;
`;

const SuperAdminBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 2rem;
  font-weight: 600;
  margin-top: 1rem;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  margin-bottom: 3rem;
`;

const StatCard = styled.div`
  background: white;
  border-radius: 1rem;
  padding: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  text-align: center;
  transition: transform 0.2s;
  
  &:hover {
    transform: translateY(-4px);
  }
`;

const StatIcon = styled.div`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 4rem;
  height: 4rem;
  background: ${props => props.color || '#e5e7eb'};
  border-radius: 50%;
  margin-bottom: 1rem;
  color: white;
`;

const StatNumber = styled.div`
  font-size: 2.5rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 0.5rem;
`;

const StatLabel = styled.div`
  color: #6b7280;
  font-size: 1rem;
`;

const TabContainer = styled.div`
  background: white;
  border-radius: 1rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  margin-bottom: 2rem;
`;

const TabHeader = styled.div`
  display: flex;
  border-bottom: 1px solid #e5e7eb;
  overflow-x: auto;
`;

const TabButton = styled.button`
  padding: 1rem 2rem;
  background: none;
  border: none;
  cursor: pointer;
  color: ${props => props.active ? '#2563eb' : '#6b7280'};
  border-bottom: 2px solid ${props => props.active ? '#2563eb' : 'transparent'};
  font-weight: 600;
  transition: all 0.2s;
  white-space: nowrap;
  
  &:hover {
    color: #2563eb;
    background: #f8fafc;
  }
`;

const TabContent = styled.div`
  padding: 2rem;
`;

const SearchBar = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const SearchInput = styled.input`
  flex: 1;
  padding: 0.75rem 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 0.5rem;
  font-size: 1rem;
  
  &:focus {
    outline: none;
    border-color: #2563eb;
  }
`;

const FilterSelect = styled.select`
  padding: 0.75rem 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 0.5rem;
  font-size: 1rem;
  background: white;
  
  &:focus {
    outline: none;
    border-color: #2563eb;
  }
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: #2563eb;
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: #1d4ed8;
  }
  
  &.secondary {
    background: #6b7280;
    
    &:hover {
      background: #4b5563;
    }
  }
  
  &.danger {
    background: #ef4444;
    
    &:hover {
      background: #dc2626;
    }
  }
`;

const DataTable = styled.div`
  background: white;
  border-radius: 0.5rem;
  overflow: hidden;
  border: 1px solid #e5e7eb;
`;

const TableHeader = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr auto;
  gap: 1rem;
  padding: 1rem;
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
  font-weight: 600;
  color: #374151;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr 1fr auto;
  }
`;

const TableRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr auto;
  gap: 1rem;
  padding: 1rem;
  border-bottom: 1px solid #e5e7eb;
  align-items: center;
  
  &:hover {
    background: #f9fafb;
  }
  
  &:last-child {
    border-bottom: none;
  }
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr 1fr auto;
  }
`;

const TableCell = styled.div`
  color: #374151;
  
  &.actions {
    display: flex;
    gap: 0.5rem;
  }
  
  &.status {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  
  &.status.active {
    color: #059669;
  }
  
  &.status.inactive {
    color: #dc2626;
  }
`;

const StatusBadge = styled.span`
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.875rem;
  font-weight: 500;
  
  &.active {
    background: #d1fae5;
    color: #059669;
  }
  
  &.inactive {
    background: #fee2e2;
    color: #dc2626;
  }
  
  &.pending {
    background: #fef3c7;
    color: #d97706;
  }
`;

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 1rem;
  padding: 2rem;
  max-width: 500px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
`;

const ModalTitle = styled.h3`
  font-size: 1.5rem;
  font-weight: 600;
  color: #1f2937;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #6b7280;
  
  &:hover {
    color: #374151;
  }
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  display: block;
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.5rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e5e7eb;
  border-radius: 0.5rem;
  font-size: 1rem;
  
  &:focus {
    outline: none;
    border-color: #2563eb;
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e5e7eb;
  border-radius: 0.5rem;
  font-size: 1rem;
  background: white;
  
  &:focus {
    outline: none;
    border-color: #2563eb;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
`;

const SuperAdminDashboard = () => {
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
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  useEffect(() => {
    if (!isSuperAdmin(currentUser)) {
      toast.error('Access denied. Super admin privileges required.');
      return;
    }
    
    fetchDashboardData();
  }, [currentUser, isSuperAdmin]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch users with error handling
      let usersData = [];
      try {
        const usersSnapshot = await getDocs(collection(db, 'users'));
        usersData = usersSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setUsers(usersData);
      } catch (error) {
        console.warn('Could not fetch users:', error);
        setUsers([]);
      }

      // Fetch products with error handling
      let productsData = [];
      try {
        const productsSnapshot = await getDocs(collection(db, 'products'));
        productsData = productsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setProducts(productsData);
      } catch (error) {
        console.warn('Could not fetch products:', error);
        setProducts([]);
      }

      // Fetch orders with error handling
      let ordersData = [];
      try {
        const ordersSnapshot = await getDocs(collection(db, 'orders'));
        ordersData = ordersSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setOrders(ordersData);
      } catch (error) {
        console.warn('Could not fetch orders:', error);
        setOrders([]);
      }

      // Calculate stats
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
      
      console.log('Dashboard data loaded successfully:', {
        users: usersData.length,
        products: productsData.length,
        orders: ordersData.length
      });
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load dashboard data. Please check your internet connection and try again.');
      toast.error('Failed to load dashboard data. Please check your internet connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleUserRoleUpdate = async (userId, newRole) => {
    try {
      await updateDoc(doc(db, 'users', userId), {
        role: newRole,
        updatedAt: new Date()
      });
      
      toast.success('User role updated successfully');
      fetchDashboardData();
    } catch (error) {
      console.error('Error updating user role:', error);
      toast.error('Failed to update user role');
    }
  };

  const handleUserStatusToggle = async (userId, currentStatus) => {
    try {
      await updateDoc(doc(db, 'users', userId), {
        isActive: !currentStatus,
        updatedAt: new Date()
      });
      
      toast.success('User status updated successfully');
      fetchDashboardData();
    } catch (error) {
      console.error('Error updating user status:', error);
      toast.error('Failed to update user status');
    }
  };

  const handleProductApproval = async (productId, approved) => {
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

  const handleProductStatusToggle = async (productId, currentStatus) => {
    try {
      await updateDoc(doc(db, 'products', productId), {
        isActive: !currentStatus,
        updatedAt: new Date()
      });
      
      toast.success('Product status updated successfully');
      fetchDashboardData();
    } catch (error) {
      console.error('Error updating product status:', error);
      toast.error('Failed to update product status');
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

  if (!isSuperAdmin(currentUser)) {
    return (
      <DashboardContainer>
        <Container>
          <div style={{ textAlign: 'center', padding: '4rem 0' }}>
            <AlertTriangle size={64} color="#ef4444" />
            <h2>Access Denied</h2>
            <p>You need super admin privileges to access this dashboard.</p>
          </div>
        </Container>
      </DashboardContainer>
    );
  }

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <DashboardContainer>
        <Container>
          <div style={{ textAlign: 'center', padding: '4rem 0' }}>
            <AlertTriangle size={64} color="#ef4444" />
            <h2>Dashboard Error</h2>
            <p style={{ color: '#6b7280', marginBottom: '2rem' }}>{error}</p>
            <Button onClick={fetchDashboardData}>
              <RefreshCw size={20} />
              Retry Loading Data
            </Button>
          </div>
        </Container>
      </DashboardContainer>
    );
  }

  return (
    <DashboardContainer>
      <Container>
        <Header>
          <Title>Super Admin Dashboard</Title>
          <Subtitle>Complete control over the ThriftX Fashion Marketplace</Subtitle>
          <SuperAdminBadge>
            <Shield size={20} />
            Super Administrator
          </SuperAdminBadge>
          <Button 
            onClick={fetchDashboardData}
            style={{ marginTop: '1rem' }}
            className="secondary"
          >
            <RefreshCw size={20} />
            Refresh Data
          </Button>
        </Header>

        <TabContainer>
          <TabHeader>
            <TabButton 
              active={activeTab === 'overview'} 
              onClick={() => setActiveTab('overview')}
            >
              <BarChart3 size={20} />
              Overview
            </TabButton>
            <TabButton 
              active={activeTab === 'users'} 
              onClick={() => setActiveTab('users')}
            >
              <Users size={20} />
              User Management
            </TabButton>
            <TabButton 
              active={activeTab === 'products'} 
              onClick={() => setActiveTab('products')}
            >
              <Package size={20} />
              Product Oversight
            </TabButton>
            <TabButton 
              active={activeTab === 'orders'} 
              onClick={() => setActiveTab('orders')}
            >
              <ShoppingCart size={20} />
              Orders
            </TabButton>
            <TabButton 
              active={activeTab === 'analytics'} 
              onClick={() => setActiveTab('analytics')}
            >
              <TrendingUp size={20} />
              Analytics
            </TabButton>
            <TabButton 
              active={activeTab === 'settings'} 
              onClick={() => setActiveTab('settings')}
            >
              <Settings size={20} />
              Platform Settings
            </TabButton>
          </TabHeader>

          <TabContent>
            {activeTab === 'overview' && (
              <>
                <StatsGrid>
                  <StatCard>
                    <StatIcon color="#3b82f6">
                      <Users size={24} />
                    </StatIcon>
                    <StatNumber>{stats.totalUsers}</StatNumber>
                    <StatLabel>Total Users</StatLabel>
                  </StatCard>

                  <StatCard>
                    <StatIcon color="#10b981">
                      <Package size={24} />
                    </StatIcon>
                    <StatNumber>{stats.totalProducts}</StatNumber>
                    <StatLabel>Total Products</StatLabel>
                  </StatCard>

                  <StatCard>
                    <StatIcon color="#f59e0b">
                      <ShoppingCart size={24} />
                    </StatIcon>
                    <StatNumber>{stats.totalOrders}</StatNumber>
                    <StatLabel>Total Orders</StatLabel>
                  </StatCard>

                  <StatCard>
                    <StatIcon color="#8b5cf6">
                      <DollarSign size={24} />
                    </StatIcon>
                    <StatNumber>₹{stats.totalRevenue.toLocaleString()}</StatNumber>
                    <StatLabel>Total Revenue</StatLabel>
                  </StatCard>
                </StatsGrid>

                <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                  <ActionButton onClick={fetchDashboardData}>
                    <RefreshCw size={20} />
                    Refresh Data
                  </ActionButton>
                </div>
              </>
            )}

            {activeTab === 'users' && (
              <>
                <SearchBar>
                  <SearchInput
                    type="text"
                    placeholder="Search users by name or email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <FilterSelect
                    value={filterRole}
                    onChange={(e) => setFilterRole(e.target.value)}
                  >
                    <option value="">All Roles</option>
                    <option value="buyer">Buyer</option>
                    <option value="seller">Seller</option>
                    <option value="admin">Admin</option>
                  </FilterSelect>
                  <ActionButton onClick={() => setShowUserModal(true)}>
                    <Plus size={20} />
                    Add User
                  </ActionButton>
                </SearchBar>

                <DataTable>
                  <TableHeader>
                    <div>Name</div>
                    <div>Email</div>
                    <div>Role</div>
                    <div>Status</div>
                    <div>Actions</div>
                  </TableHeader>
                  
                  {filteredUsers.map(user => (
                    <TableRow key={user.id}>
                      <TableCell>{user.name || 'N/A'}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Select
                          value={user.role || 'buyer'}
                          onChange={(e) => handleUserRoleUpdate(user.id, e.target.value)}
                        >
                          <option value="buyer">Buyer</option>
                          <option value="seller">Seller</option>
                          <option value="admin">Admin</option>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <StatusBadge className={user.isActive ? 'active' : 'inactive'}>
                          {user.isActive ? 'Active' : 'Inactive'}
                        </StatusBadge>
                      </TableCell>
                      <TableCell className="actions">
                        <ActionButton
                          className="secondary"
                          onClick={() => handleUserStatusToggle(user.id, user.isActive)}
                        >
                          {user.isActive ? <XCircle size={16} /> : <CheckCircle size={16} />}
                          {user.isActive ? 'Deactivate' : 'Activate'}
                        </ActionButton>
                        <ActionButton
                          className="secondary"
                          onClick={() => {
                            setEditingUser(user);
                            setShowUserModal(true);
                          }}
                        >
                          <Edit size={16} />
                          Edit
                        </ActionButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </DataTable>
              </>
            )}

            {activeTab === 'products' && (
              <>
                <SearchBar>
                  <SearchInput
                    type="text"
                    placeholder="Search products by name or category..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <ActionButton onClick={() => setShowProductModal(true)}>
                    <Plus size={20} />
                    Add Product
                  </ActionButton>
                </SearchBar>

                <DataTable>
                  <TableHeader>
                    <div>Name</div>
                    <div>Category</div>
                    <div>Price</div>
                    <div>Status</div>
                    <div>Actions</div>
                  </TableHeader>
                  
                  {filteredProducts.map(product => (
                    <TableRow key={product.id}>
                      <TableCell>{product.name}</TableCell>
                      <TableCell>{product.category}</TableCell>
                      <TableCell>₹{product.price?.toLocaleString() || '0'}</TableCell>
                      <TableCell>
                        <div className="status">
                          <StatusBadge className={product.isApproved ? 'active' : 'pending'}>
                            {product.isApproved ? 'Approved' : 'Pending'}
                          </StatusBadge>
                        </div>
                      </TableCell>
                      <TableCell className="actions">
                        <ActionButton
                          className={product.isApproved ? 'danger' : 'secondary'}
                          onClick={() => handleProductApproval(product.id, !product.isApproved)}
                        >
                          {product.isApproved ? <XCircle size={16} /> : <CheckCircle size={16} />}
                          {product.isApproved ? 'Reject' : 'Approve'}
                        </ActionButton>
                        <ActionButton
                          className="secondary"
                          onClick={() => {
                            setEditingProduct(product);
                            setShowProductModal(true);
                          }}
                        >
                          <Edit size={16} />
                          Edit
                        </ActionButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </DataTable>
              </>
            )}

            {activeTab === 'orders' && (
              <>
                <SearchBar>
                  <SearchInput
                    type="text"
                    placeholder="Search orders..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <ActionButton>
                    <Download size={20} />
                    Export Orders
                  </ActionButton>
                </SearchBar>

                <DataTable>
                  <TableHeader>
                    <div>Order ID</div>
                    <div>Customer</div>
                    <div>Total</div>
                    <div>Status</div>
                    <div>Actions</div>
                  </TableHeader>
                  
                  {orders.map(order => (
                    <TableRow key={order.id}>
                      <TableCell>{order.id.slice(-8)}</TableCell>
                      <TableCell>{order.customerName || 'N/A'}</TableCell>
                      <TableCell>₹{order.total?.toLocaleString() || '0'}</TableCell>
                      <TableCell>
                        <StatusBadge className={order.status === 'delivered' ? 'active' : 'pending'}>
                          {order.status}
                        </StatusBadge>
                      </TableCell>
                      <TableCell className="actions">
                        <ActionButton className="secondary">
                          <Eye size={16} />
                          View
                        </ActionButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </DataTable>
              </>
            )}

            {activeTab === 'analytics' && (
              <div style={{ textAlign: 'center', padding: '4rem 0' }}>
                <BarChart3 size={64} color="#6b7280" />
                <h2>Advanced Analytics</h2>
                <p>Detailed analytics and reporting features coming soon...</p>
                <ActionButton style={{ marginTop: '1rem' }}>
                  <Download size={20} />
                  Generate Report
                </ActionButton>
              </div>
            )}

            {activeTab === 'settings' && (
              <div style={{ textAlign: 'center', padding: '4rem 0' }}>
                <Settings size={64} color="#6b7280" />
                <h2>Platform Settings</h2>
                <p>Platform configuration and settings coming soon...</p>
                <ActionButton style={{ marginTop: '1rem' }}>
                  <Edit size={20} />
                  Configure Platform
                </ActionButton>
              </div>
            )}
          </TabContent>
        </TabContainer>

        {/* User Modal */}
        {showUserModal && (
          <Modal onClick={() => setShowUserModal(false)}>
            <ModalContent onClick={e => e.stopPropagation()}>
              <ModalHeader>
                <ModalTitle>
                  {editingUser ? 'Edit User' : 'Add New User'}
                </ModalTitle>
                <CloseButton onClick={() => setShowUserModal(false)}>×</CloseButton>
              </ModalHeader>
              
              <FormGroup>
                <Label>Name</Label>
                <Input 
                  defaultValue={editingUser?.name || ''} 
                  placeholder="Enter user name"
                />
              </FormGroup>
              
              <FormGroup>
                <Label>Email</Label>
                <Input 
                  defaultValue={editingUser?.email || ''} 
                  placeholder="Enter user email"
                  type="email"
                />
              </FormGroup>
              
              <FormGroup>
                <Label>Role</Label>
                <Select defaultValue={editingUser?.role || 'buyer'}>
                  <option value="buyer">Buyer</option>
                  <option value="seller">Seller</option>
                  <option value="admin">Admin</option>
                </Select>
              </FormGroup>
              
              <ButtonGroup>
                <ActionButton className="secondary" onClick={() => setShowUserModal(false)}>
                  Cancel
                </ActionButton>
                <ActionButton>
                  {editingUser ? 'Update User' : 'Add User'}
                </ActionButton>
              </ButtonGroup>
            </ModalContent>
          </Modal>
        )}

        {/* Product Modal */}
        {showProductModal && (
          <Modal onClick={() => setShowProductModal(false)}>
            <ModalContent onClick={e => e.stopPropagation()}>
              <ModalHeader>
                <ModalTitle>
                  {editingProduct ? 'Edit Product' : 'Add New Product'}
                </ModalTitle>
                <CloseButton onClick={() => setShowProductModal(false)}>×</CloseButton>
              </ModalHeader>
              
              <FormGroup>
                <Label>Product Name</Label>
                <Input 
                  defaultValue={editingProduct?.name || ''} 
                  placeholder="Enter product name"
                />
              </FormGroup>
              
              <FormGroup>
                <Label>Category</Label>
                <Select defaultValue={editingProduct?.category || ''}>
                  <option value="">Select Category</option>
                  <option value="womens-clothing">Women's Clothing</option>
                  <option value="mens-clothing">Men's Clothing</option>
                  <option value="dresses">Dresses</option>
                  <option value="shoes">Shoes</option>
                  <option value="bags-accessories">Bags & Accessories</option>
                  <option value="jewelry">Jewelry</option>
                  <option value="vintage">Vintage</option>
                  <option value="designer">Designer</option>
                </Select>
              </FormGroup>
              
              <FormGroup>
                <Label>Price (₹)</Label>
                <Input 
                  defaultValue={editingProduct?.price || ''} 
                  placeholder="Enter price in INR"
                  type="number"
                />
              </FormGroup>
              
              <ButtonGroup>
                <ActionButton className="secondary" onClick={() => setShowProductModal(false)}>
                  Cancel
                </ActionButton>
                <ActionButton>
                  {editingProduct ? 'Update Product' : 'Add Product'}
                </ActionButton>
              </ButtonGroup>
            </ModalContent>
          </Modal>
        )}
      </Container>
    </DashboardContainer>
  );
};

export default SuperAdminDashboard;
