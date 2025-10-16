import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  orderBy 
} from 'firebase/firestore';
import { 
  Package, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Eye,
  Calendar,
  DollarSign
} from 'lucide-react';
import { db } from '../firebase/config';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { formatPrice } from '../utils/formatters';

const OrdersContainer = styled.div`
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
  margin-bottom: 2rem;
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

const FilterTabs = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-bottom: 2rem;
  background: white;
  padding: 1rem;
  border-radius: 1rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  overflow-x: auto;
`;

const FilterTab = styled.button`
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s;
  white-space: nowrap;
  
  background: ${props => props.active ? '#2563eb' : '#f3f4f6'};
  color: ${props => props.active ? 'white' : '#374151'};
  
  &:hover {
    background: ${props => props.active ? '#1d4ed8' : '#e5e7eb'};
  }
`;

const OrdersList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const OrderCard = styled.div`
  background: white;
  border-radius: 1rem;
  padding: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  border: 1px solid #e5e7eb;
`;

const OrderHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.5rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1rem;
  }
`;

const OrderInfo = styled.div`
  flex: 1;
`;

const OrderId = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 0.5rem;
`;

const OrderMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  color: #6b7280;
  font-size: 0.875rem;
  margin-bottom: 0.5rem;
  flex-wrap: wrap;
`;

const MetaItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;
`;

const OrderStatus = styled.div`
  display: inline-block;
  padding: 0.5rem 1rem;
  border-radius: 9999px;
  font-size: 0.875rem;
  font-weight: 600;
  background: ${props => {
    switch (props.status) {
      case 'pending': return '#fef3c7';
      case 'processing': return '#dbeafe';
      case 'shipped': return '#e0e7ff';
      case 'delivered': return '#dcfce7';
      case 'cancelled': return '#fee2e2';
      default: return '#f3f4f6';
    }
  }};
  color: ${props => {
    switch (props.status) {
      case 'pending': return '#92400e';
      case 'processing': return '#1e40af';
      case 'shipped': return '#3730a3';
      case 'delivered': return '#166534';
      case 'cancelled': return '#991b1b';
      default: return '#374151';
    }
  }};
`;

const OrderTotal = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  color: #059669;
`;

const OrderItems = styled.div`
  border-top: 1px solid #e5e7eb;
  padding-top: 1.5rem;
`;

const ItemsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const OrderItem = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: #f9fafb;
  border-radius: 0.75rem;
`;

const ItemImage = styled.img`
  width: 4rem;
  height: 4rem;
  object-fit: cover;
  border-radius: 0.5rem;
`;

const ItemImagePlaceholder = styled.div`
  width: 4rem;
  height: 4rem;
  background: #e5e7eb;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #9ca3af;
  font-size: 0.75rem;
`;

const ItemDetails = styled.div`
  flex: 1;
`;

const ItemName = styled.div`
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 0.25rem;
`;

const ItemPrice = styled.div`
  color: #6b7280;
  font-size: 0.875rem;
`;

const ItemQuantity = styled.div`
  color: #6b7280;
  font-size: 0.875rem;
  font-weight: 600;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  background: white;
  border-radius: 1rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
`;

const EmptyIcon = styled.div`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 5rem;
  height: 5rem;
  background: #f3f4f6;
  border-radius: 50%;
  margin-bottom: 1.5rem;
  color: #9ca3af;
`;

const EmptyTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 1rem;
`;

const EmptyText = styled.p`
  color: #6b7280;
  font-size: 1.125rem;
`;



const statusOptions = [
  { key: 'all', label: 'All Orders' },
  { key: 'pending', label: 'Pending' },
  { key: 'processing', label: 'Processing' },
  { key: 'shipped', label: 'Shipped' },
  { key: 'delivered', label: 'Delivered' },
  { key: 'cancelled', label: 'Cancelled' }
];

const Orders = () => {
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
        return dateB - dateA;
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
          <LoadingSpinner>
            <div className="loading-spinner" style={{ marginRight: '1rem' }} />
            Loading orders...
          </LoadingSpinner>
        </Container>
      </OrdersContainer>
    );
  }

  return (
    <OrdersContainer>
      <Container>
        <Header>
          <Title>My Orders</Title>
          <Subtitle>Track and manage your orders</Subtitle>
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
                        <Calendar size={16} />
                        {formatDate(order.createdAt)}
                      </MetaItem>
                      <MetaItem>
                        <Package size={16} />
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
                      {order.items.map((item, index) => (
                        <OrderItem key={index}>
                          {item.productImage ? (
                            <ItemImage 
                              src={item.productImage} 
                              alt={item.productName}
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextElementSibling.style.display = 'flex';
                              }}
                            />
                          ) : null}
                          <ItemImagePlaceholder style={{ display: item.productImage ? 'none' : 'flex' }}>
                            No Image
                          </ItemImagePlaceholder>
                          
                          <ItemDetails>
                            <ItemName>{item.productName}</ItemName>
                            <ItemPrice>{formatPrice(item.price)}</ItemPrice>
                          </ItemDetails>
                          
                          <ItemQuantity>
                            Qty: {item.quantity}
                          </ItemQuantity>
                        </OrderItem>
                      ))}
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
                ? 'When you make a purchase, your orders will appear here'
                : `You don't have any ${activeFilter} orders at the moment`
              }
            </EmptyText>
          </EmptyState>
        )}
      </Container>
    </OrdersContainer>
  );
};

export default Orders;
