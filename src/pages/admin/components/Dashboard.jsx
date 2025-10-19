import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { 
  Users, 
  ShoppingBag, 
  Package, 
  TrendingUp,
  IndianRupee,
  RefreshCw,
  Eye,
  AlertCircle
} from 'lucide-react';
import { adminAPI } from '../../services/adminService';
import AdminLayout from '../../components/admin/AdminLayout';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import DevelopmentNotice from '../../components/common/DevelopmentNotice';

const DashboardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-bottom: 3rem;
`;

const StatsCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 2rem;
  border: 1px solid #e5e7eb;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s, box-shadow 0.2s;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
`;

const StatsHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: between;
  margin-bottom: 1rem;
`;

const StatsIcon = styled.div`
  background: ${props => props.bgColor || '#eff6ff'};
  color: ${props => props.color || '#2563eb'};
  padding: 0.75rem;
  border-radius: 8px;
  margin-right: 1rem;
  
  svg {
    width: 24px;
    height: 24px;
  }
`;

const StatsContent = styled.div`
  flex: 1;
`;

const StatsValue = styled.div`
  font-size: 2rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 0.25rem;
`;

const StatsLabel = styled.div`
  color: #6b7280;
  font-size: 0.875rem;
`;

const StatsChange = styled.div`
  color: ${props => props.positive ? '#059669' : '#dc2626'};
  font-size: 0.875rem;
  font-weight: 500;
  margin-top: 0.5rem;
`;

const ChartsContainer = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;
  margin-bottom: 3rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const ChartCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 2rem;
  border: 1px solid #e5e7eb;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const ChartTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 1.5rem;
`;

const CategoryList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const CategoryItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  background: #f9fafb;
  border-radius: 8px;
`;

const CategoryName = styled.span`
  font-weight: 500;
  color: #1f2937;
`;

const CategoryValue = styled.span`
  color: #6b7280;
  font-weight: 600;
`;

const RecentActivity = styled.div`
  background: white;
  border-radius: 12px;
  padding: 2rem;
  border: 1px solid #e5e7eb;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const ActivityList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const ActivityItem = styled.div`
  display: flex;
  align-items: center;
  padding: 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  transition: background-color 0.2s;
  
  &:hover {
    background: #f9fafb;
  }
`;

const ActivityIcon = styled.div`
  background: #eff6ff;
  color: #2563eb;
  padding: 0.5rem;
  border-radius: 6px;
  margin-right: 1rem;
  
  svg {
    width: 16px;
    height: 16px;
  }
`;

const ActivityContent = styled.div`
  flex: 1;
`;

const ActivityDescription = styled.div`
  color: #1f2937;
  font-weight: 500;
  margin-bottom: 0.25rem;
`;

const ActivityTime = styled.div`
  color: #6b7280;
  font-size: 0.875rem;
`;

const LoadingContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
`;

const ErrorContainer = styled.div`
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 2rem;
  display: flex;
  align-items: center;
  color: #dc2626;
  
  svg {
    margin-right: 0.75rem;
    width: 20px;
    height: 20px;
  }
`;

const AdminDashboard = () => {
  const [reports, setReports] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminAPI.getReports();
      setReports(data);
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <AdminLayout title="Dashboard" description="Overview of your marketplace">
        <LoadingContainer>
          <LoadingSpinner />
        </LoadingContainer>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout 
      title="Dashboard" 
      description="Overview of your marketplace"
      breadcrumb="Dashboard"
    >
      {error && (
        <ErrorContainer>
          <AlertCircle />
          {error}
        </ErrorContainer>
      )}

      {reports && (
        <>
          <DevelopmentNotice type="permissions" />
          
          <DashboardGrid>
            <StatsCard>
              <StatsHeader>
                <StatsIcon bgColor="#fef3c7" color="#d97706">
                  <IndianRupee />
                </StatsIcon>
                <StatsContent>
                  <StatsValue>{formatCurrency(reports.gmv)}</StatsValue>
                  <StatsLabel>Gross Merchandise Value</StatsLabel>
                  <StatsChange positive={true}>
                    +{reports.monthlyGrowth}% from last month
                  </StatsChange>
                </StatsContent>
              </StatsHeader>
            </StatsCard>

            <StatsCard>
              <StatsHeader>
                <StatsIcon bgColor="#dcfce7" color="#059669">
                  <ShoppingBag />
                </StatsIcon>
                <StatsContent>
                  <StatsValue>{reports.totalSales.toLocaleString()}</StatsValue>
                  <StatsLabel>Total Orders</StatsLabel>
                  <StatsChange positive={true}>
                    Avg: {formatCurrency(reports.averageOrderValue)}
                  </StatsChange>
                </StatsContent>
              </StatsHeader>
            </StatsCard>

            <StatsCard>
              <StatsHeader>
                <StatsIcon bgColor="#fce7f3" color="#be185d">
                  <Package />
                </StatsIcon>
                <StatsContent>
                  <StatsValue>{reports.totalProducts.toLocaleString()}</StatsValue>
                  <StatsLabel>Total Products</StatsLabel>
                  <StatsChange positive={true}>
                    Active listings
                  </StatsChange>
                </StatsContent>
              </StatsHeader>
            </StatsCard>

            <StatsCard>
              <StatsHeader>
                <StatsIcon bgColor="#e0e7ff" color="#3730a3">
                  <Users />
                </StatsIcon>
                <StatsContent>
                  <StatsValue>{reports.totalVendors.toLocaleString()}</StatsValue>
                  <StatsLabel>Active Vendors</StatsLabel>
                  <StatsChange positive={false}>
                    {reports.refundCount} refunds
                  </StatsChange>
                </StatsContent>
              </StatsHeader>
            </StatsCard>
          </DashboardGrid>

          <ChartsContainer>
            <ChartCard>
              <ChartTitle>Top Categories</ChartTitle>
              <CategoryList>
                {reports.topCategories.map((category, index) => (
                  <CategoryItem key={index}>
                    <CategoryName>{category.name}</CategoryName>
                    <CategoryValue>{category.value}%</CategoryValue>
                  </CategoryItem>
                ))}
              </CategoryList>
            </ChartCard>

            <RecentActivity>
              <ChartTitle>Recent Activity</ChartTitle>
              <ActivityList>
                {reports.recentActivity.map((activity, index) => (
                  <ActivityItem key={index}>
                    <ActivityIcon>
                      {activity.type === 'order' && <ShoppingBag />}
                      {activity.type === 'vendor' && <Users />}
                      {activity.type === 'product' && <Package />}
                    </ActivityIcon>
                    <ActivityContent>
                      <ActivityDescription>{activity.description}</ActivityDescription>
                      <ActivityTime>{activity.time}</ActivityTime>
                    </ActivityContent>
                  </ActivityItem>
                ))}
              </ActivityList>
            </RecentActivity>
          </ChartsContainer>
        </>
      )}
    </AdminLayout>
  );
};

export default AdminDashboard;