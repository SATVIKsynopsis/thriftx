"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
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
import Image from 'next/image';
import { db } from '../../firebase/config';
import { useAuth } from '../../contexts/AuthContext';
import { formatPrice } from '../../utils/formatters';
import LoadingSpinner from '../../components/common/LoadingSpinner';

// Converted Styled Components to Tailwind CSS Class Wrappers/Components:
// (These are kept from the previous conversion as they define the structure)

const DashboardContainer = ({ children }) => (
  <div className="min-h-screen bg-gray-50 py-8">
    {children}
  </div>
);

const Container = ({ children }) => (
  <div className="max-w-7xl mx-auto px-8 lg:px-4 sm:px-2">
    {children}
  </div>
);

const Header = ({ children }) => (
  <div className="mb-12">
    {children}
  </div>
);

const Title = ({ children }) => (
  <h1 className="text-4xl font-bold text-gray-800 mb-2">
    {children}
  </h1>
);

const Subtitle = ({ children }) => (
  <p className="text-lg text-gray-600">
    {children}
  </p>
);

const StatsGrid = ({ children }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
    {children}
  </div>
);

const StatCard = ({ children }) => (
  <div className="bg-white rounded-xl p-8 shadow-md border border-gray-200">
    {children}
  </div>
);

const StatHeader = ({ children, className = '' }) => (
  <div className={`flex items-center justify-between mb-4 ${className}`}>
    {children}
  </div>
);

const StatIcon = ({ color, children }) => {
  // Map color prop to a Tailwind background class
  let bgColorClass = '';
  switch (color) {
    case '#2563eb': // blue-600
      bgColorClass = 'bg-blue-600';
      break;
    case '#059669': // emerald-600
      bgColorClass = 'bg-emerald-600';
      break;
    case '#dc2626': // red-600
      bgColorClass = 'bg-red-600';
      break;
    case '#f59e0b': // amber-500
      bgColorClass = 'bg-amber-500';
      break;
    default:
      bgColorClass = 'bg-gray-500';
  }

  return (
    <div className={`flex items-center justify-center w-12 h-12 ${bgColorClass} rounded-lg text-white mr-4 flex-shrink-0`}>
      {children}
    </div>
  );
};

const StatInfo = ({ children, className = '' }) => (
  <div className={`flex-1 ${className}`}>
    {children}
  </div>
);

const StatValue = ({ children, className = '' }) => (
  <div className={`text-3xl font-bold text-gray-800 ${className}`}>
    {children}
  </div>
);

const StatLabel = ({ children, className = '' }) => (
  <div className={`text-sm text-gray-500 mb-1 ${className}`}>
    {children}
  </div>
);

const StatChange = ({ positive, children }) => (
  <div className={`text-sm font-semibold ${positive ? 'text-emerald-600' : 'text-red-600'}`}>
    {children}
  </div>
);

const QuickActions = ({ children }) => (
  <div className="bg-white rounded-xl p-8 shadow-md mb-12">
    {children}
  </div>
);

const ActionsTitle = ({ children }) => (
  <h2 className="text-2xl font-bold text-gray-800 mb-6">
    {children}
  </h2>
);

const ActionsGrid = ({ children }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
    {children}
  </div>
);

const ActionButton = React.forwardRef(({ href, children, ...props }, ref) => (
  <Link
    href={href}
    ref={ref}
    className="flex items-center gap-4 p-6 bg-gray-50 border-2 border-gray-200 rounded-lg text-gray-700 transition-all hover:border-blue-600 hover:bg-blue-50 hover:text-blue-600"
    {...props}
  >
    {children}
  </Link>
));
ActionButton.displayName = 'ActionButton';

const ActionIcon = ({ children }) => (
  <div className="flex items-center justify-center w-10 h-10 bg-blue-600 rounded-md text-white">
    {children}
  </div>
);

const ActionInfo = ({ children }) => (
  <div className="flex-1">
    {children}
  </div>
);

const ActionTitle = ({ children }) => (
  <div className="font-semibold mb-0.5">
    {children}
  </div>
);

const ActionDescription = ({ children }) => (
  <div className="text-sm text-gray-500">
    {children}
  </div>
);

const RecentSection = ({ children }) => (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
    {children}
  </div>
);

const RecentCard = ({ children }) => (
  <div className="bg-white rounded-xl p-8 shadow-md">
    {children}
  </div>
);

const RecentTitle = ({ children }) => (
  <h3 className="text-xl font-bold text-gray-800 mb-6">
    {children}
  </h3>
);

const ProductList = ({ children }) => (
  <div className="flex flex-col gap-4">
    {children}
  </div>
);

const ProductItem = ({ children }) => (
  <div className="flex items-center gap-4 p-4 border border-gray-200 rounded-md transition-all hover:border-blue-600 hover:bg-gray-50">
    {children}
  </div>
);

const ProductImage = ({ alt, src }) => (
  <div className="w-12 h-12 rounded-md overflow-hidden shrink-0">
    <Image src={src} alt={alt || ''} width={48} height={48} className="object-cover" />
  </div>
);

const ProductImagePlaceholder = ({ children }) => (
  <div className="w-12 h-12 bg-gray-100 rounded-md flex items-center justify-center text-gray-400 text-xs flex-shrink-0">
    {children}
  </div>
);

const ProductInfo = ({ children }) => (
  <div className="flex-1 min-w-0">
    {children}
  </div>
);

const ProductName = ({ children }) => (
  <div className="font-semibold text-gray-800 mb-0.5 truncate">
    {children}
  </div>
);

const ProductDetails = ({ children, className = '' }) => (
  <div className={`text-sm text-gray-500 ${className}`}>
    {children}
  </div>
);

const ProductActions = ({ children }) => (
  <div className="flex gap-2 flex-shrink-0">
    {children}
  </div>
);

const IconButton = React.forwardRef(({ href, title, children, ...props }, ref) => (
  <Link
    href={href}
    ref={ref}
    title={title}
    aria-label={title}
    className="flex items-center justify-center w-8 h-8 bg-gray-100 rounded-md text-gray-600 transition-all hover:bg-blue-600 hover:text-white"
    {...props}
  >
    {children}
  </Link>
));
IconButton.displayName = 'IconButton';

const EmptyState = ({ children }) => (
  <div className="text-center p-8 text-gray-600">
    {children}
  </div>
);


const DashboardComponent = ({ onShowCoupons }) => {
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
      // No current user - skip fetch
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

  // fetching dashboard data for user

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
  // products fetched
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
  // recent products fetched
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

  // calculated stats

      setStats(newStats);
      setRecentProducts(recentProds);
      setRecentOrders(orders.slice(0, 5));

  // dashboard data loaded

      // Set default values if no data was found
      if (totalProducts === 0 && totalOrders === 0) {
  // no data found - default empty state
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
          <div className="text-center py-16 text-gray-600">
            <div className="text-5xl mb-4">⚠️</div>
            <h2 className="text-gray-700 mb-4 text-2xl font-semibold">Dashboard Error</h2>
            <p className="mb-4">{error}</p>
            <p className="text-sm mb-8 text-gray-400">
              This might be due to network issues or missing data. Check your internet connection and try again.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <button
                onClick={refreshDashboard}
                className="py-3 px-6 bg-blue-600 text-white rounded-lg cursor-pointer text-base flex items-center gap-2 transition-colors duration-200 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                <RefreshCw size={16} />
                Retry
              </button>
              <button
                onClick={() => window.location.reload()}
                className="py-3 px-6 bg-gray-100 text-gray-700 border border-gray-200 rounded-lg cursor-pointer text-base transition-colors duration-200 hover:bg-gray-200"
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
          <div className="flex justify-between items-start">
            <div>
              <Title>Seller Dashboard</Title>
              <Subtitle>Manage your products and track your sales</Subtitle>
            </div>
            <button
              onClick={refreshDashboard}
              className="flex items-center gap-2 p-3 bg-gray-100 border border-gray-200 rounded-lg cursor-pointer text-gray-700 text-sm transition-all hover:bg-gray-200"
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
            <ActionButton href="/seller/products/add">
              <ActionIcon>
                <Plus size={20} />
              </ActionIcon>
              <ActionInfo>
                <ActionTitle>Add Product</ActionTitle>
                <ActionDescription>List a new item for sale</ActionDescription>
              </ActionInfo>
            </ActionButton>

            <ActionButton href="/seller/products">
              <ActionIcon>
                <Package size={20} />
              </ActionIcon>
              <ActionInfo>
                <ActionTitle>Manage Products</ActionTitle>
                <ActionDescription>Edit and update your listings</ActionDescription>
              </ActionInfo>
            </ActionButton>

            <ActionButton href="/seller/orders">
              <ActionIcon>
                <ShoppingCart size={20} />
              </ActionIcon>
              <ActionInfo>
                <ActionTitle>View Orders</ActionTitle>
                <ActionDescription>Track and manage orders</ActionDescription>
              </ActionInfo>
            </ActionButton>

            <ActionButton href="/seller/analytics">
              <ActionIcon>
                <TrendingUp size={20} />
              </ActionIcon>
              <ActionInfo>
                <ActionTitle>Analytics</ActionTitle>
                <ActionDescription>View detailed reports</ActionDescription>
              </ActionInfo>
            </ActionButton>

            <button
              type="button"
              onClick={onShowCoupons}
              className="flex items-center gap-4 p-6 bg-yellow-50 border-2 border-yellow-400 rounded-lg text-yellow-800 font-semibold transition-all hover:border-yellow-600 hover:bg-yellow-100 hover:text-yellow-900"
            >
              <ActionIcon>
                <Star size={20} />
              </ActionIcon>
              <ActionInfo>
                <ActionTitle>Review Coupons</ActionTitle>
                <ActionDescription>Approve or reject coupon requests</ActionDescription>
              </ActionInfo>
            </button>
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
                      <IconButton href={`/product/${product.id}`} title="View">
                        <Eye size={16} />
                      </IconButton>
                      <IconButton href={`/seller/products/edit/${product.id}`} title="Edit">
                        <Edit size={16} />
                      </IconButton>
                    </ProductActions>
                  </ProductItem>
                ))}
              </ProductList>
            ) : (
              <EmptyState>
                <Package size={48} className="mx-auto mb-4 block" />
                <p>No products yet</p>
                <p className="text-sm text-gray-400 mb-4">
                  Start your sustainable fashion journey by adding your first product
                </p>
                <Link href="/seller/products/add" className="text-blue-600 border border-blue-600 rounded-lg py-2 px-4 transition-all hover:bg-blue-50">
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
                      href={`/seller/orders/${order.id}`}
                      className="text-inherit no-underline"
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
                          <ProductDetails className="text-xs text-gray-400">
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
                <ShoppingCart size={48} className="mx-auto mb-4 block" />
                <p>No orders yet</p>
                <p className="text-sm text-gray-400 mb-4">
                  Orders will appear here once customers start buying your products
                </p>
                <Link href="/seller/products/add" className="text-blue-600 border border-blue-600 rounded-lg py-2 px-4 transition-all hover:bg-blue-50">
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

export default DashboardComponent;