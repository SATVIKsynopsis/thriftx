import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { 
  Package, 
  Truck, 
  CheckCircle, 
  Clock, 
  User, 
  Calendar,
  IndianRupee,
  Search,
  Filter,
  RefreshCw,
  Eye,
  MoreVertical
} from 'lucide-react';
import { adminAPI } from '../../services/adminService';
import AdminLayout from '../../components/admin/AdminLayout';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import DevelopmentNotice from '../../components/common/DevelopmentNotice';
import { formatPrice } from '../../utils/formatters';
import toast from 'react-hot-toast';

const OrdersContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const FilterBar = styled.div`
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid #e5e7eb;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;
`;

const SearchInput = styled.div`
  position: relative;
  flex: 1;
  min-width: 300px;
  
  svg {
    position: absolute;
    left: 1rem;
    top: 50%;
    transform: translateY(-50%);
    color: #6b7280;
    width: 20px;
    height: 20px;
  }
  
  input {
    width: 100%;
    padding: 0.75rem 1rem 0.75rem 3rem;
    border: 1px solid #d1d5db;
    border-radius: 8px;
    font-size: 0.875rem;
    
    &:focus {
      outline: none;
      border-color: #2563eb;
      box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
    }
  }
`;

const FilterButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  background: ${props => props.active ? '#2563eb' : 'white'};
  color: ${props => props.active ? 'white' : '#374151'};
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: ${props => props.active ? '#1d4ed8' : '#f9fafb'};
  }
  
  svg {
    width: 16px;
    height: 16px;
  }
`;

const RefreshButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  background: white;
  color: #374151;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: #f9fafb;
  }
  
  svg {
    width: 16px;
    height: 16px;
  }
`;

const OrdersTable = styled.div`
  background: white;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
`;

const TableHeader = styled.div`
  display: grid;
  grid-template-columns: 1fr 150px 150px 120px 120px 120px 100px;
  gap: 1rem;
  padding: 1.5rem;
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
  font-weight: 600;
  color: #374151;
  font-size: 0.875rem;
  
  @media (max-width: 768px) {
    display: none;
  }
`;

const OrderRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 150px 150px 120px 120px 120px 100px;
  gap: 1rem;
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
  align-items: center;
  transition: background-color 0.2s;
  
  &:hover {
    background: #f9fafb;
  }
  
  &:last-child {
    border-bottom: none;
  }
  
  @media (max-width: 768px) {
    display: block;
    padding: 1rem;
  }
`;

const OrderInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const OrderId = styled.div`
  font-weight: 600;
  color: #1f2937;
`;

const CustomerName = styled.div`
  color: #6b7280;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  svg {
    width: 16px;
    height: 16px;
  }
`;

const StatusBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 500;
  width: fit-content;
  background: ${props => {
    switch (props.status) {
      case 'delivered': return '#dcfce7';
      case 'shipped': return '#dbeafe';
      case 'processing': return '#fef3c7';
      case 'pending': return '#f3f4f6';
      default: return '#f3f4f6';
    }
  }};
  color: ${props => {
    switch (props.status) {
      case 'delivered': return '#059669';
      case 'shipped': return '#2563eb';
      case 'processing': return '#d97706';
      case 'pending': return '#6b7280';
      default: return '#6b7280';
    }
  }};
  
  svg {
    width: 16px;
    height: 16px;
  }
`;

const OrderAmount = styled.div`
  font-weight: 600;
  color: #1f2937;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  
  svg {
    width: 16px;
    height: 16px;
  }
`;

const OrderDate = styled.div`
  color: #6b7280;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  svg {
    width: 16px;
    height: 16px;
  }
`;

const ItemCount = styled.div`
  color: #6b7280;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  svg {
    width: 16px;
    height: 16px;
  }
`;

const ActionButton = styled.button`
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: white;
  color: #374151;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: #f9fafb;
  }
  
  svg {
    width: 16px;
    height: 16px;
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  color: #6b7280;
  
  h3 {
    color: #1f2937;
    margin-bottom: 0.5rem;
  }
`;

const MobileOrderCard = styled.div`
  display: none;
  
  @media (max-width: 768px) {
    display: block;
    background: white;
    border-radius: 8px;
    border: 1px solid #e5e7eb;
    padding: 1rem;
    margin-bottom: 1rem;
  }
`;

const MobileOrderHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: start;
  margin-bottom: 1rem;
`;

const MobileOrderDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  font-size: 0.875rem;
`;

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
      filtered = filtered.filter(order => 
        order.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.user?.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }
    
    setFilteredOrders(filtered);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'delivered': return <CheckCircle />;
      case 'shipped': return <Truck />;
      case 'processing': return <Package />;
      default: return <Clock />;
    }
  };

  const formatDate = (date) => {
    if (!date) return 'Not available';
    return new Date(date.toDate ? date.toDate() : date).toLocaleDateString('en-IN');
  };

  if (loading) {
    return (
      <AdminLayout 
        title="Orders Overview" 
        description="Monitor all marketplace orders"
        breadcrumb="Orders"
      >
        <LoadingContainer>
          <LoadingSpinner />
        </LoadingContainer>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout 
      title="Orders Overview" 
      description="Monitor all marketplace orders"
      breadcrumb="Orders"
    >
      <OrdersContainer>
        <DevelopmentNotice type="permissions" />
        
        <FilterBar>
          <SearchInput>
            <Search />
            <input
              type="text"
              placeholder="Search orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </SearchInput>
          
          <FilterButton
            active={statusFilter === 'all'}
            onClick={() => setStatusFilter('all')}
          >
            All
          </FilterButton>
          
          <FilterButton
            active={statusFilter === 'pending'}
            onClick={() => setStatusFilter('pending')}
          >
            Pending
          </FilterButton>
          
          <FilterButton
            active={statusFilter === 'processing'}
            onClick={() => setStatusFilter('processing')}
          >
            Processing
          </FilterButton>
          
          <FilterButton
            active={statusFilter === 'shipped'}
            onClick={() => setStatusFilter('shipped')}
          >
            Shipped
          </FilterButton>
          
          <FilterButton
            active={statusFilter === 'delivered'}
            onClick={() => setStatusFilter('delivered')}
          >
            Delivered
          </FilterButton>
          
          <RefreshButton onClick={loadOrders}>
            <RefreshCw />
            Refresh
          </RefreshButton>
        </FilterBar>

        {filteredOrders.length === 0 ? (
          <EmptyState>
            <h3>No orders found</h3>
            <p>No orders match your current filters.</p>
          </EmptyState>
        ) : (
          <OrdersTable>
            <TableHeader>
              <div>Order Details</div>
              <div>Customer</div>
              <div>Status</div>
              <div>Amount</div>
              <div>Date</div>
              <div>Items</div>
              <div>Actions</div>
            </TableHeader>
            
            {filteredOrders.map((order) => (
              <OrderRow key={order.id}>
                <OrderInfo>
                  <OrderId>#{order.id?.substring(0, 8) || 'Unknown'}</OrderId>
                  <CustomerName>
                    <User />
                    {order.user?.name || 'Unknown Customer'}
                  </CustomerName>
                </OrderInfo>
                
                <div>{order.user?.email || 'No email'}</div>
                
                <StatusBadge status={order.status || 'pending'}>
                  {getStatusIcon(order.status || 'pending')}
                  {(order.status || 'pending').charAt(0).toUpperCase() + (order.status || 'pending').slice(1)}
                </StatusBadge>
                
                <OrderAmount>
                  <IndianRupee />
                  {formatPrice(order.total || 0)}
                </OrderAmount>
                
                <OrderDate>
                  <Calendar />
                  {formatDate(order.createdAt)}
                </OrderDate>
                
                <ItemCount>
                  <Package />
                  {order.items?.length || 0} items
                </ItemCount>
                
                <ActionButton>
                  <Eye />
                </ActionButton>
                
                {/* Mobile Card View */}
                <MobileOrderCard>
                  <MobileOrderHeader>
                    <div>
                      <OrderId>#{order.id?.substring(0, 8) || 'Unknown'}</OrderId>
                      <StatusBadge status={order.status || 'pending'}>
                        {getStatusIcon(order.status || 'pending')}
                        {(order.status || 'pending').charAt(0).toUpperCase() + (order.status || 'pending').slice(1)}
                      </StatusBadge>
                    </div>
                    <OrderAmount>
                      <IndianRupee />
                      {formatPrice(order.total || 0)}
                    </OrderAmount>
                  </MobileOrderHeader>
                  
                  <MobileOrderDetails>
                    <CustomerName>
                      <User />
                      {order.user?.name || 'Unknown Customer'}
                    </CustomerName>
                    <OrderDate>
                      <Calendar />
                      {formatDate(order.createdAt)}
                    </OrderDate>
                    <ItemCount>
                      <Package />
                      {order.items?.length || 0} items
                    </ItemCount>
                  </MobileOrderDetails>
                </MobileOrderCard>
              </OrderRow>
            ))}
          </OrdersTable>
        )}
      </OrdersContainer>
    </AdminLayout>
  );
};

export default OrdersOverview;