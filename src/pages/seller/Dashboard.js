import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import '../../index.css';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  orderBy,
  limit
} from 'firebase/firestore';
import { 
  Package, 
  ShoppingCart, 
  IndianRupee, 
  TrendingUp, 
  Plus,
  Eye,
  Edit,
  Star,
  Calendar,
  DollarSign,
  RefreshCw
} from 'lucide-react';
import { db } from '../../firebase/config';
import { useAuth } from '../../contexts/AuthContext';
import { formatPrice } from '../../utils/formatters';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const DashboardContainer = styled.div`
  min-height: 100vh;
  background: #f9fafb;
  padding: 2rem 0;
`;

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  
  @media (max-width: 768px) {
    padding: 0 1rem;
  }
`;

const Header = styled.div`
  margin-bottom: 3rem;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 0.5rem;
`;

const Subtitle = styled.p`
  color: #6b7280;
  font-size: 1.125rem;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 3rem;
`;

const StatCard = styled.div`
  background: white;
  border-radius: 1rem;
  padding: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  border: 1px solid #e5e7eb;
`;

const StatHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
`;

const StatIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 3rem;
  height: 3rem;
  background: ${props => props.color};
  border-radius: 0.75rem;
  color: white;
  margin-right: 1rem;
`;

const StatInfo = styled.div`
  flex: 1;
`;

const StatValue = styled.div`
  font-size: 2rem;
  font-weight: 700;
  color: #1f2937;
`;

const StatLabel = styled.div`
  font-size: 0.875rem;
  color: #6b7280;
  margin-bottom: 0.5rem;
`;

const StatChange = styled.div`
  font-size: 0.875rem;
  color: ${props => props.positive ? '#059669' : '#dc2626'};
  font-weight: 600;
`;

const QuickActions = styled.div`
  background: white;
  border-radius: 1rem;
  padding: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  margin-bottom: 3rem;
`;

const ActionsTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 1.5rem;
`;

const ActionsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
`;

const ActionButton = styled(Link)`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  background: #f9fafb;
  border: 2px solid #e5e7eb;
  border-radius: 0.75rem;
  text-decoration: none;
  color: #374151;
  transition: all 0.2s;
  
  &:hover {
    border-color: #2563eb;
    background: #eff6ff;
    color: #2563eb;
  }
`;

const ActionIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  background: #2563eb;
  border-radius: 0.5rem;
  color: white;
`;

const ActionInfo = styled.div`
  flex: 1;
`;

const ActionTitle = styled.div`
  font-weight: 600;
  margin-bottom: 0.25rem;
`;

const ActionDescription = styled.div`
  font-size: 0.875rem;
  color: #6b7280;
`;

const RecentSection = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  
  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const RecentCard = styled.div`
  background: white;
  border-radius: 1rem;
  padding: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
`;

const RecentTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 1.5rem;
`;

const ProductList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const ProductItem = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  transition: all 0.2s;
  
  &:hover {
    border-color: #2563eb;
    background: #f9fafb;
  }
`;

const ProductImage = styled.img`
  width: 3rem;
  height: 3rem;
  object-fit: cover;
  border-radius: 0.5rem;
`;

const ProductImagePlaceholder = styled.div`
  width: 3rem;
  height: 3rem;
  background: #f3f4f6;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #9ca3af;
  font-size: 0.75rem;
`;

const ProductInfo = styled.div`
  flex: 1;
`;

const ProductName = styled.div`
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 0.25rem;
`;

const ProductDetails = styled.div`
  font-size: 0.875rem;
  color: #6b7280;
`;

const ProductActions = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const IconButton = styled(Link)`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  background: #f3f4f6;
  border-radius: 0.25rem;
  color: #6b7280;
  text-decoration: none;
  transition: all 0.2s;
  
  &:hover {
    background: #2563eb;
    color: white;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 2rem;
  color: #6b7280;
`;

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    avgRating: 0
  });
  const [recentProducts, setRecentProducts] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const { currentUser } = useAuth();

  const fetchDashboardData = async () => {
    if (!currentUser) {
      console.log('No current user, skipping dashboard data fetch');
      return;
    }

    // Check if Firebase is available
    if (!db) {
      console.error('Firebase database not available');
      setError('Database connection not available. Please check your configuration.');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching dashboard data for user:', currentUser.uid);

      // Fetch products with error handling
      let products = [];
      try {
        const productsQuery = query(
          collection(db, 'products'),
          where('sellerId', '==', currentUser.uid)
        );
        const productsSnapshot = await getDocs(productsQuery);
        products = productsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        console.log('Products fetched successfully:', products.length);
      } catch (productError) {
        console.warn('Could not fetch products:', productError);
        products = [];
      }

      // Fetch recent products with error handling
      let recentProds = [];
      try {
        const recentProductsQuery = query(
          collection(db, 'products'),
          where('sellerId', '==', currentUser.uid),
          orderBy('createdAt', 'desc'),
          limit(5)
        );
        const recentProductsSnapshot = await getDocs(recentProductsQuery);
        recentProds = recentProductsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        console.log('Recent products fetched successfully:', recentProds.length);
      } catch (recentError) {
        console.warn('Could not fetch recent products:', recentError);
        recentProds = [];
      }

      // Fetch orders with error handling
      let orders = [];
      try {
        const ordersQuery = query(
          collection(db, 'orders'),
          where('sellerId', '==', currentUser.uid)
          
        );
        const ordersSnapshot = await getDocs(ordersQuery);
  orders = await Promise.all(
    ordersSnapshot.docs.map(async (doc) => {
      const orderData = doc.data();
      const itemsWithImages = await Promise.all(
        (orderData.items || []).map(async (item) => {
          const productDoc = await getDocs(
            query(collection(db, 'products'), where('__name__', '==', item.productId))
          );

          if (!productDoc.empty) {
            const productData = productDoc.docs[0].data();
            return {
              ...item,
              images: productData.images || [],
              name: productData.name || 'Product'
            };
          }
          return item;
        })
      );
      return {
        id: doc.id,
        ...orderData,
        items: itemsWithImages
      };
    })
  );
} catch (orderError) {
  console.warn('Could not fetch orders:', orderError);
  orders = [];
}


      // Calculate stats with safeguards
      const totalProducts = products.length || 0;
      const totalOrders = orders.length || 0;
      const totalRevenue = orders.reduce((sum, order) => sum + (parseFloat(order.total) || 0), 0);
      const avgRating = products.length > 0 
        ? products.reduce((sum, product) => sum + (parseFloat(product.rating) || 0), 0) / products.length
        : 0;

      const newStats = {
        totalProducts,
        totalOrders,
        totalRevenue,
        avgRating: Math.round(avgRating * 10) / 10
      };

      console.log('Calculated stats:', newStats);

      setStats(newStats);
      setRecentProducts(recentProds);
      setRecentOrders(orders.slice(0, 5));
      
      console.log('Dashboard data loaded successfully');
      
      // Set default values if no data was found
      if (totalProducts === 0 && totalOrders === 0) {
        console.log('No data found, setting default empty state');
      }
      
    } catch (error) {
      console.error('Critical error fetching dashboard data:', error);
      
      // Provide more specific error messages
      let errorMessage = 'Failed to load dashboard data.';
      if (error.code === 'permission-denied') {
        errorMessage = 'Access denied. Please check your permissions.';
      } else if (error.code === 'unavailable') {
        errorMessage = 'Service temporarily unavailable. Please try again.';
      } else if (error.message) {
        errorMessage = `Error: ${error.message}`;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const refreshDashboard = () => {
    fetchDashboardData();
  };

  useEffect(() => {
    if (currentUser) {
      fetchDashboardData();
    }
  }, [currentUser?.uid]);



  if (loading) {
    return (
      <DashboardContainer>
        <Container>
          <LoadingSpinner 
            text="Loading dashboard..." 
            height="400px"
            textColor="#6b7280"
          />
        </Container>
      </DashboardContainer>
    );
  }

  if (error) {
    return (
      <DashboardContainer>
        <Container>
          <div style={{ 
            textAlign: 'center', 
            padding: '4rem 0',
            color: '#6b7280'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
            <h2 style={{ color: '#374151', marginBottom: '1rem' }}>Dashboard Error</h2>
            <p style={{ marginBottom: '1rem' }}>{error}</p>
            <p style={{ fontSize: '0.875rem', marginBottom: '2rem', color: '#9ca3af' }}>
              This might be due to network issues or missing data. Check your internet connection and try again.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button 
                onClick={refreshDashboard}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: '#2563eb',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.5rem',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                <RefreshCw size={16} />
                Retry
              </button>
              <button 
                onClick={() => window.location.reload()} 
                style={{
                  padding: '0.75rem 1.5rem',
                  background: '#f3f4f6',
                  color: '#374151',
                  border: '1px solid #e5e7eb',
                  borderRadius: '0.5rem',
                  cursor: 'pointer',
                  fontSize: '1rem'
                }}
              >
                Reload Page
              </button>
            </div>
          </div>
        </Container>
      </DashboardContainer>
    );
  }

  return (
    <DashboardContainer>
      <Container>
        <Header>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <Title>Seller Dashboard</Title>
              <Subtitle>Manage your products and track your sales</Subtitle>
            </div>
            <button
              onClick={refreshDashboard}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1rem',
                background: '#f3f4f6',
                border: '1px solid #e5e7eb',
                borderRadius: '0.5rem',
                cursor: 'pointer',
                color: '#374151',
                fontSize: '0.875rem',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = '#e5e7eb';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = '#f3f4f6';
              }}
            >
              <RefreshCw size={16} />
              Refresh
            </button>
          </div>
          

        </Header>

        <StatsGrid>
          <StatCard>
            <StatHeader>
              <StatIcon color="#2563eb">
                <Package size={24} />
              </StatIcon>
              <StatInfo>
                <StatLabel>Total Products</StatLabel>
                <StatValue>{stats.totalProducts}</StatValue>
                <StatChange positive={stats.totalProducts > 0}>
                  {stats.totalProducts > 0 ? 'Active listings' : 'No products yet'}
                </StatChange>
              </StatInfo>
            </StatHeader>
          </StatCard>

          <StatCard>
            <StatHeader>
              <StatIcon color="#059669">
                <ShoppingCart size={24} />
              </StatIcon>
              <StatInfo>
                <StatLabel>Total Orders</StatLabel>
                <StatValue>{stats.totalOrders}</StatValue>
                <StatChange positive={stats.totalOrders > 0}>
                  {stats.totalOrders > 0 ? 'Orders received' : 'No orders yet'}
                </StatChange>
              </StatInfo>
            </StatHeader>
          </StatCard>

          <StatCard>
            <StatHeader className="flex flex-wrap items-start gap-2">
              <StatIcon color="#dc2626" className="flex-shrink-0">
                <IndianRupee size={24} />
              </StatIcon>
              <StatInfo className="w-full sm:w-auto">
                <StatLabel className="text-sm font-medium text-gray-500">Total Revenue</StatLabel>
                <StatValue className="text-2xl font-bold text-gray-800 break-words">{formatPrice(stats.totalRevenue)}</StatValue>
                <StatChange positive={stats.totalRevenue > 0}>
                  {stats.totalRevenue > 0 ? 'Revenue earned' : 'No revenue yet'}
                </StatChange>
              </StatInfo>
            </StatHeader>
          </StatCard>

          <StatCard>
            <StatHeader>
              <StatIcon color="#f59e0b">
                <Star size={24} />
              </StatIcon>
              <StatInfo>
                <StatLabel>Average Rating</StatLabel>
                <StatValue>{stats.avgRating.toFixed(1)}</StatValue>
                <StatChange positive={stats.avgRating > 0}>
                  {stats.avgRating > 0 ? 'Customer satisfaction' : 'No ratings yet'}
                </StatChange>
              </StatInfo>
            </StatHeader>
          </StatCard>
        </StatsGrid>

        <QuickActions>
          <ActionsTitle>Quick Actions</ActionsTitle>
          <ActionsGrid>
            <ActionButton to="/seller/products/add">
              <ActionIcon>
                <Plus size={20} />
              </ActionIcon>
              <ActionInfo>
                <ActionTitle>Add Product</ActionTitle>
                <ActionDescription>List a new item for sale</ActionDescription>
              </ActionInfo>
            </ActionButton>

            <ActionButton to="/seller/products">
              <ActionIcon>
                <Package size={20} />
              </ActionIcon>
              <ActionInfo>
                <ActionTitle>Manage Products</ActionTitle>
                <ActionDescription>Edit and update your listings</ActionDescription>
              </ActionInfo>
            </ActionButton>

            <ActionButton to="/seller/orders">
              <ActionIcon>
                <ShoppingCart size={20} />
              </ActionIcon>
              <ActionInfo>
                <ActionTitle>View Orders</ActionTitle>
                <ActionDescription>Track and manage orders</ActionDescription>
              </ActionInfo>
            </ActionButton>

            <ActionButton to="/seller/analytics">
              <ActionIcon>
                <TrendingUp size={20} />
              </ActionIcon>
              <ActionInfo>
                <ActionTitle>Analytics</ActionTitle>
                <ActionDescription>View detailed reports</ActionDescription>
              </ActionInfo>
            </ActionButton>
          </ActionsGrid>
        </QuickActions>

        <RecentSection>
          <RecentCard>
            <RecentTitle>Recent Products</RecentTitle>
            {recentProducts.length > 0 ? (
              <ProductList>
                {recentProducts.map((product) => (
                  <ProductItem key={product.id}>
                    {product.images && product.images.length > 0 ? (
                      <ProductImage 
                        src={product.images[0]} 
                        alt={product.name}
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextElementSibling.style.display = 'flex';
                        }}
                      />
                    ) : (
                      <ProductImagePlaceholder>
                        <Package size={16} />
                      </ProductImagePlaceholder>
                    )}
                    
                    <ProductInfo>
                      <ProductName>{product.name}</ProductName>
                      <ProductDetails>
                        {formatPrice(product.price)} • Stock: {product.stock || 0}
                      </ProductDetails>
                    </ProductInfo>
                    
                    <ProductActions>
                      <IconButton to={`/product/${product.id}`} title="View">
                        <Eye size={16} />
                      </IconButton>
                      <IconButton to={`/seller/products/edit/${product.id}`} title="Edit">
                        <Edit size={16} />
                      </IconButton>
                    </ProductActions>
                  </ProductItem>
                ))}
              </ProductList>
            ) : (
              <EmptyState>
                <Package size={48} style={{ margin: '0 auto 1rem', display: 'block' }} />
                <p>No products yet</p>
                <p style={{ fontSize: '0.875rem', color: '#9ca3af', marginBottom: '1rem' }}>
                  Start your sustainable fashion journey by adding your first product
                </p>
                <Link to="/seller/products/add" style={{ 
                  color: '#2563eb',
                  textDecoration: 'none',
                  padding: '0.5rem 1rem',
                  border: '1px solid #2563eb',
                  borderRadius: '0.5rem',
                  transition: 'all 0.2s'
                }}>
                  Add Your First Product
                </Link>
              </EmptyState>
            )}
          </RecentCard>

          <RecentCard>
            <RecentTitle>Recent Activity</RecentTitle>
            {recentOrders.length > 0 ? (
              <ProductList>
                {recentOrders.map((order) => {
                  const firstItem = order.items?.[0];
                  const productImage = firstItem?.images?.[0];
                  return (
                    <Link
                      key={order.id}
                      to={`/seller/orders/${order.id}`}
                      style={{ textDecoration: 'none', color: 'inherit' }}
                    >
                      <ProductItem>
                        {productImage ? (
                          <ProductImage 
                            src={productImage} 
                            alt={firstItem?.name || 'Product'} 
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextElementSibling.style.display = 'flex';
                            }}
                          />
                        ) : (
                          <ProductImagePlaceholder>
                            <Package size={16} />
                          </ProductImagePlaceholder>
                        )}
                        <ProductInfo>
                          <ProductName>Order #{order.id.slice(-8)}</ProductName>
                          <ProductDetails>
                            {formatPrice(order.total)} • {order.status}
                          </ProductDetails>
                          <ProductDetails style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
                            {order.createdAt ? new Date(order.createdAt.seconds * 1000).toLocaleDateString() : ''}
                          </ProductDetails>
                        </ProductInfo>
                      </ProductItem>
                    </Link>
                  );
                })}
              </ProductList>
            ) : (
              <EmptyState>
                <ShoppingCart size={48} style={{ margin: '0 auto 1rem', display: 'block' }} />
                <p>No orders yet</p>
                <p style={{ fontSize: '0.875rem', color: '#9ca3af', marginBottom: '1rem' }}>
                  Orders will appear here once customers start buying your products
                </p>
                <Link to="/seller/products/add" style={{ 
                  color: '#2563eb',
                  textDecoration: 'none',
                  padding: '0.5rem 1rem',
                  border: '1px solid #2563eb',
                  borderRadius: '0.5rem',
                  transition: 'all 0.2s'
                }}>
                  Add More Products
                </Link>
              </EmptyState>
            )}
          </RecentCard>
        </RecentSection>
      </Container>
    </DashboardContainer>
  );
};

export default Dashboard;
