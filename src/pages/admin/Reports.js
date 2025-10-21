import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { 
  TrendingUp, 
  IndianRupee, 
  ShoppingBag, 
  Package, 
  Users, 
  RefreshCw,
  Download,
  Calendar,
  BarChart3,
  PieChart,
  TrendingDown,
  AlertCircle
} from 'lucide-react';
import { adminAPI } from '../../services/adminService';
import AdminLayout from '../../components/admin/AdminLayout';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import DevelopmentNotice from '../../components/common/DevelopmentNotice';
import toast from 'react-hot-toast';

const ReportsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const ReportsHeader = styled.div`
  background: white;
  border-radius: 12px;
  padding: 2rem;
  border: 1px solid #e5e7eb;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
`;

const HeaderContent = styled.div`
  h2 {
    font-size: 1.5rem;
    font-weight: 700;
    color: #1f2937;
    margin-bottom: 0.5rem;
  }
  
  p {
    color: #6b7280;
  }
`;

const HeaderActions = styled.div`
  display: flex;
  gap: 1rem;
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  
  &.primary {
    background: #2563eb;
    color: white;
    
    &:hover {
      background: #1d4ed8;
    }
  }
  
  &.secondary {
    background: white;
    color: #374151;
    border: 1px solid #d1d5db;
    
    &:hover {
      background: #f9fafb;
    }
  }
  
  svg {
    width: 16px;
    height: 16px;
  }
`;

const MetricsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2rem;
  margin-bottom: 3rem;
`;

const MetricCard = styled.div`
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

const MetricHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: between;
  margin-bottom: 1.5rem;
`;

const MetricIcon = styled.div`
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

const MetricContent = styled.div`
  flex: 1;
`;

const MetricValue = styled.div`
  font-size: 2.5rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 0.5rem;
  line-height: 1;
`;

const MetricLabel = styled.div`
  color: #6b7280;
  font-size: 0.875rem;
  margin-bottom: 1rem;
`;

const MetricChange = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: ${props => props.positive ? '#059669' : '#dc2626'};
  font-size: 0.875rem;
  font-weight: 500;
  
  svg {
    width: 16px;
    height: 16px;
  }
`;

const ChartsContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
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
  display: flex;
  align-items: center;
  gap: 0.75rem;
  
  svg {
    width: 20px;
    height: 20px;
    color: #6b7280;
  }
`;

const CategoryChart = styled.div`
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
  transition: background-color 0.2s;
  
  &:hover {
    background: #f3f4f6;
  }
`;

const CategoryInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const CategoryColor = styled.div`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: ${props => props.color};
`;

const CategoryName = styled.span`
  font-weight: 500;
  color: #1f2937;
`;

const CategoryValue = styled.span`
  color: #6b7280;
  font-weight: 600;
`;

const ActivityFeed = styled.div`
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

const Reports = () => {
  const [reports, setReports] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminAPI.getReports();
      setReports(data);
    } catch (err) {
      setError('Failed to load reports data');
      console.error('Reports error:', err);
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

  const categoryColors = [
    '#2563eb',
    '#059669',
    '#d97706',
    '#dc2626'
  ];

  const handleExportData = () => {
    toast.success('Export functionality would be implemented here');
  };

  if (loading) {
    return (
      <AdminLayout 
        title="Reports & Analytics" 
        description="Marketplace performance insights"
        breadcrumb="Reports"
      >
        <LoadingContainer>
          <LoadingSpinner />
        </LoadingContainer>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout 
      title="Reports & Analytics" 
      description="Marketplace performance insights"
      breadcrumb="Reports"
    >
      <ReportsContainer>
        <DevelopmentNotice type="permissions" />
        
        {error && (
          <ErrorContainer>
            <AlertCircle />
            {error}
          </ErrorContainer>
        )}

        <ReportsHeader>
          <HeaderContent>
            <h2>Performance Overview</h2>
            <p>Track your marketplace growth and key metrics</p>
          </HeaderContent>
          
          <HeaderActions>
            <ActionButton className="secondary" onClick={loadReports}>
              <RefreshCw />
              Refresh
            </ActionButton>
            <ActionButton className="primary" onClick={handleExportData}>
              <Download />
              Export Data
            </ActionButton>
          </HeaderActions>
        </ReportsHeader>

        {reports && (
          <>
            <MetricsGrid>
              <MetricCard>
                <MetricHeader>
                  <MetricIcon bgColor="#fef3c7" color="#d97706">
                    <IndianRupee />
                  </MetricIcon>
                  <MetricContent>
                    <MetricValue>{formatCurrency(reports.gmv)}</MetricValue>
                    <MetricLabel>Gross Merchandise Value</MetricLabel>
                    <MetricChange positive={true}>
                      <TrendingUp />
                      +{reports.monthlyGrowth}% this month
                    </MetricChange>
                  </MetricContent>
                </MetricHeader>
              </MetricCard>

              <MetricCard>
                <MetricHeader>
                  <MetricIcon bgColor="#dcfce7" color="#059669">
                    <ShoppingBag />
                  </MetricIcon>
                  <MetricContent>
                    <MetricValue>{reports.totalSales.toLocaleString()}</MetricValue>
                    <MetricLabel>Total Orders</MetricLabel>
                    <MetricChange positive={true}>
                      <TrendingUp />
                      Avg: {formatCurrency(reports.averageOrderValue)}
                    </MetricChange>
                  </MetricContent>
                </MetricHeader>
              </MetricCard>

              <MetricCard>
                <MetricHeader>
                  <MetricIcon bgColor="#fce7f3" color="#be185d">
                    <Package />
                  </MetricIcon>
                  <MetricContent>
                    <MetricValue>{reports.totalProducts.toLocaleString()}</MetricValue>
                    <MetricLabel>Active Products</MetricLabel>
                    <MetricChange positive={true}>
                      <TrendingUp />
                      Growing inventory
                    </MetricChange>
                  </MetricContent>
                </MetricHeader>
              </MetricCard>

              <MetricCard>
                <MetricHeader>
                  <MetricIcon bgColor="#e0e7ff" color="#3730a3">
                    <Users />
                  </MetricIcon>
                  <MetricContent>
                    <MetricValue>{reports.totalVendors.toLocaleString()}</MetricValue>
                    <MetricLabel>Active Vendors</MetricLabel>
                    <MetricChange positive={false}>
                      <TrendingDown />
                      {reports.refundCount} refunds processed
                    </MetricChange>
                  </MetricContent>
                </MetricHeader>
              </MetricCard>
            </MetricsGrid>

            <ChartsContainer>
              <ChartCard>
                <ChartTitle>
                  <PieChart />
                  Category Distribution
                </ChartTitle>
                <CategoryChart>
                  {reports.topCategories.map((category, index) => (
                    <CategoryItem key={index}>
                      <CategoryInfo>
                        <CategoryColor color={categoryColors[index]} />
                        <CategoryName>{category.name}</CategoryName>
                      </CategoryInfo>
                      <CategoryValue>{category.value}%</CategoryValue>
                    </CategoryItem>
                  ))}
                </CategoryChart>
              </ChartCard>

              <ActivityFeed>
                <ChartTitle>
                  <BarChart3 />
                  Recent Activity
                </ChartTitle>
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
              </ActivityFeed>
            </ChartsContainer>
          </>
        )}
      </ReportsContainer>
    </AdminLayout>
  );
};

export default Reports;