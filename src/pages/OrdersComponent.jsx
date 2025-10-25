"use client"

import React, { useState, useEffect } from 'react';
import {
  collection,
  query,
  where,
  getDocs,
  orderBy
} from 'firebase/firestore';
import {
  Package,
  Calendar,
  Eye,
  // Removed unused icons: Clock, CheckCircle, XCircle, DollarSign
} from 'lucide-react';
import { db } from '@/firebase/config';
import { useAuth } from '@/contexts/AuthContext';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { formatPrice } from '@/utils/formatters';
import Image from 'next/image';

// --- Tailwind Wrapper Components (Replacements for Styled Components) ---

const OrdersContainer = ({ children }) => (
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
  <div className="mb-8">
    {children}
  </div>
);

const Title = ({ children }) => (
  <h1 className="text-4xl font-bold text-gray-900 mb-2">
    {children}
  </h1>
);

const Subtitle = ({ children }) => (
  <p className="text-lg text-gray-600">
    {children}
  </p>
);

const FilterTabs = ({ children }) => (
  <div className="flex gap-2 mb-8 bg-white p-4 rounded-xl shadow-md overflow-x-auto border border-gray-100">
    {children}
  </div>
);

// Helper function to map status to Tailwind color classes
const getStatusClasses = (status) => {
  switch (status) {
    case 'pending':
      return 'bg-amber-100 text-amber-800'; // #fef3c7 / #92400e
    case 'processing':
      return 'bg-blue-100 text-blue-800'; // #dbeafe / #1e40af
    case 'shipped':
      return 'bg-indigo-100 text-indigo-800'; // #e0e7ff / #3730a3
    case 'delivered':
      return 'bg-green-100 text-green-800'; // #dcfce7 / #166534
    case 'cancelled':
      return 'bg-red-100 text-red-800'; // #fee2e2 / #991b1b
    default:
      return 'bg-gray-100 text-gray-800'; // #f3f4f6 / #374151
  }
};

const FilterTab = ({ active, onClick, children }) => (
  <button
    onClick={onClick}
    className={`
      py-3 px-6 rounded-lg font-semibold transition-all duration-200 whitespace-nowrap
      ${active
        ? 'bg-blue-600 text-white hover:bg-blue-700'
        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
      }
    `}
  >
    {children}
  </button>
);

const OrdersList = ({ children }) => (
  <div className="flex flex-col gap-6">
    {children}
  </div>
);

const OrderCard = ({ children }) => (
  <div className="bg-white rounded-xl p-8 shadow-md border border-gray-200">
    {children}
  </div>
);

const OrderHeader = ({ children }) => (
  <div className="flex justify-between items-start mb-6 flex-col md:flex-row md:gap-0 gap-4">
    {children}
  </div>
);

const OrderInfo = ({ children }) => (
  <div className="flex-1">
    {children}
  </div>
);

const OrderId = ({ children }) => (
  <h3 className="text-xl font-semibold text-gray-900 mb-1">
    {children}
  </h3>
);

const OrderMeta = ({ children }) => (
  <div className="flex items-center gap-4 text-gray-600 text-sm mb-2 flex-wrap">
    {children}
  </div>
);

const MetaItem = ({ children }) => (
  <div className="flex items-center gap-1">
    {children}
  </div>
);

const OrderStatus = ({ status, children }) => {
  const statusClasses = getStatusClasses(status);
  return (
    <div className={`inline-block py-1 px-3 rounded-full text-sm font-semibold ${statusClasses}`}>
      {children}
    </div>
  );
};

const OrderTotal = ({ children }) => (
  <div className="text-2xl font-bold text-green-700">
    {children}
  </div>
);

const OrderItems = ({ children }) => (
  <div className="border-t border-gray-200 pt-6 mt-6">
    {children}
  </div>
);

const ItemsList = ({ children }) => (
  <div className="flex flex-col gap-4">
    {children}
  </div>
);

const OrderItem = ({ children }) => (
  <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
    {children}
  </div>
);

const ItemImage = ({ alt, ...props }) => (
  <Image
    className="w-16 h-16 object-cover rounded-md shrink-0"
    alt={alt}
    {...props}
  />
);

const ItemImagePlaceholder = ({ children, isVisible }) => (
  <div className={`w-16 h-16 bg-gray-200 rounded-md flex items-center justify-center text-gray-500 text-xs shrink-0 ${isVisible ? 'flex' : 'hidden'}`}>
    {children}
  </div>
);

const ItemDetails = ({ children }) => (
  <div className="flex-1 min-w-0">
    {children}
  </div>
);

const ItemName = ({ children }) => (
  <div className="font-semibold text-gray-900 mb-0.5 truncate">
    {children}
  </div>
);

const ItemPrice = ({ children }) => (
  <div className="text-sm text-gray-600">
    {children}
  </div>
);

const ItemQuantity = ({ children }) => (
  <div className="text-sm text-gray-600 font-semibold shrink-0">
    {children}
  </div>
);

const EmptyState = ({ children }) => (
  <div className="text-center p-16 bg-white rounded-xl shadow-md border border-gray-200">
    {children}
  </div>
);

const EmptyIcon = ({ children }) => (
  <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-6 text-gray-500">
    {children}
  </div>
);

const EmptyTitle = ({ children }) => (
  <h2 className="text-2xl font-bold text-gray-900 mb-4">
    {children}
  </h2>
);

const EmptyText = ({ children }) => (
  <p className="text-lg text-gray-600">
    {children}
  </p>
);

// --- Component Logic ---

const statusOptions = [
  { key: 'all', label: 'All Orders' },
  { key: 'pending', label: 'Pending' },
  { key: 'processing', label: 'Processing' },
  { key: 'shipped', label: 'Shipped' },
  { key: 'delivered', label: 'Delivered' },
  { key: 'cancelled', label: 'Cancelled' }
];

const OrdersComponent = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');

  const { currentUser } = useAuth();

  useEffect(() => {
    const fetchOrders = async () => {
      if (!currentUser) {
        console.log("No current user, stopping fetch.");
        return;
      }

      setLoading(true);
      console.log(`[Step 1] Fetching orders for UID: ${currentUser.uid}`);

      try {
        // Fetch orders where user is the buyer
        const buyerOrdersQuery = query(
          collection(db, 'orders'),
          where('buyerId', '==', currentUser.uid),
          orderBy('createdAt', 'desc')
        );

        const buyerSnapshot = await getDocs(buyerOrdersQuery);

        const buyerOrders = buyerSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          type: 'purchase'
        }));

        // Fetch orders where user is the seller
        const sellerOrdersQuery = query(
          collection(db, 'orders'),
          where('sellerId', '==', currentUser.uid),
          orderBy('createdAt', 'desc')
        );

        const sellerSnapshot = await getDocs(sellerOrdersQuery);

        const sellerOrders = sellerSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          type: 'sale'
        }));

        const allUserOrders = [...buyerOrders, ...sellerOrders].sort((a, b) => {
          const dateA = a.createdAt?.toDate?.() || 0;
          const dateB = b.createdAt?.toDate?.() || 0;
          // Sort descending (latest first)
          return dateB.getTime() - dateA.getTime();
        });

        setOrders(allUserOrders);
        setFilteredOrders(allUserOrders);

      } catch (error) {
        console.error("Error fetching orders:", error);

      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [currentUser]);


  useEffect(() => {
    if (activeFilter === 'all') {
      setFilteredOrders(orders);
    } else {
      const filtered = orders.filter(order => order.status === activeFilter);
      setFilteredOrders(filtered);
    }
  }, [orders, activeFilter]);


  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';

    let date;
    if (timestamp.toDate) {
      date = timestamp.toDate();
    } else {
      date = new Date(timestamp);
    }

    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <OrdersContainer>
        <Container>
          <div className="flex justify-center items-center h-96">
            <LoadingSpinner text="Loading orders..." />
          </div>
        </Container>
      </OrdersContainer>
    );
  }

  return (
    <OrdersContainer>
      <Container>
        <Header>
          <Title>My Orders</Title>
          <Subtitle>Track and manage your purchases and sales</Subtitle>
        </Header>

        <FilterTabs>
          {statusOptions.map(option => (
            <FilterTab
              key={option.key}
              active={activeFilter === option.key}
              onClick={() => setActiveFilter(option.key)}
            >
              {option.label}
            </FilterTab>
          ))}
        </FilterTabs>

        {filteredOrders.length > 0 ? (
          <OrdersList>
            {filteredOrders.map((order) => (
              <OrderCard key={order.id}>
                <OrderHeader>
                  <OrderInfo>
                    <OrderId>{order.type === 'sale' ? 'Sale' : 'Order'} #{order.id.slice(-8)}</OrderId>
                    <OrderMeta>
                      <MetaItem>
                        <Calendar size={16} className="text-blue-500" />
                        {formatDate(order.createdAt)}
                      </MetaItem>
                      <MetaItem>
                        <Package size={16} className="text-blue-500" />
                        {order.items?.length || 0} items
                      </MetaItem>
                    </OrderMeta>
                    <OrderStatus status={order.status}>
                      {order.status || 'pending'}
                    </OrderStatus>
                  </OrderInfo>

                  <OrderTotal>
                    {formatPrice(order.total || 0)}
                  </OrderTotal>
                </OrderHeader>

                {order.items && order.items.length > 0 && (
                  <OrderItems>
                    <ItemsList>
                      {order.items.map((item, index) => {
                        const hasImage = !!item.productImage;
                        return (
                          <OrderItem key={index}>
                            <div className="relative w-16 h-16 shrink-0">
                              <ItemImage
                                src={item.productImage}
                                alt={item.productName}
                                className={hasImage ? 'block' : 'hidden'}
                                onError={(e) => {
                                  e.target.classList.add('hidden');
                                  e.target.parentElement.querySelector('.placeholder-box').classList.remove('hidden');
                                  e.target.parentElement.querySelector('.placeholder-box').classList.add('flex');
                                }}
                              />
                              <ItemImagePlaceholder isVisible={!hasImage} className="placeholder-box absolute top-0 left-0">
                                No Image
                              </ItemImagePlaceholder>
                            </div>

                            <ItemDetails>
                              <ItemName>{item.productName}</ItemName>
                              <ItemPrice>{formatPrice(item.price)}</ItemPrice>
                            </ItemDetails>

                            <ItemQuantity>
                              Qty: {item.quantity}
                            </ItemQuantity>
                            <a
                              href={`/orders/${order.id}`}
                              className="text-blue-600 hover:text-blue-700 p-2 rounded-full transition-colors hover:bg-blue-50"
                              title="View Order Details"
                            >
                              <Eye size={18} />
                            </a>
                          </OrderItem>
                        );
                      })}
                    </ItemsList>
                  </OrderItems>
                )}
              </OrderCard>
            ))}
          </OrdersList>
        ) : (
          <EmptyState>
            <EmptyIcon>
              <Package size={40} />
            </EmptyIcon>
            <EmptyTitle>
              {activeFilter === 'all' ? 'No orders yet' : `No ${activeFilter} orders`}
            </EmptyTitle>
            <EmptyText>
              {activeFilter === 'all'
                ? 'When you make a purchase or sell an item, your orders will appear here.'
                : `You don't have any ${activeFilter} orders at the moment.`
              }
            </EmptyText>
          </EmptyState>
        )}
      </Container>
    </OrdersContainer>
  );
};

export default OrdersComponent;