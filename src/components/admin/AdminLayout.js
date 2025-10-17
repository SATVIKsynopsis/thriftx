import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { 
  Users, 
  ShoppingBag, 
  Package, 
  BarChart3, 
  Settings,
  Home,
  ChevronRight,
  Menu,
  X,
  ChevronLeft,
  User,
  LogOut,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const LayoutContainer = styled.div`
  min-height: 100vh;
  background: #f9fafb;
  display: flex;
  position: relative;
`;

const AdminHeader = styled.header`
  position: fixed;
  top: 0;
  left: ${props => props.sidebarCollapsed ? '80px' : '280px'};
  right: 0;
  height: 64px;
  background: white;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: between;
  padding: 0 2rem;
  z-index: 30;
  transition: left 0.3s ease;
  
  @media (max-width: 768px) {
    left: 0;
    padding: 0 4rem 0 1rem;
  }
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const HeaderTitle = styled.h1`
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  
  @media (max-width: 768px) {
    font-size: 1rem;
  }
`;

const HeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-left: auto;
`;

const HeaderButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: none;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  color: #374151;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: #f9fafb;
    border-color: #d1d5db;
  }
  
  svg {
    width: 16px;
    height: 16px;
  }
  
  @media (max-width: 768px) {
    display: none;
  }
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: #f9fafb;
  border-radius: 6px;
  
  svg {
    width: 16px;
    height: 16px;
    color: #6b7280;
  }
  
  span {
    font-size: 0.875rem;
    color: #374151;
    font-weight: 500;
  }
`;

const SidebarOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 40;
  display: ${props => props.isOpen ? 'block' : 'none'};
  
  @media (min-width: 769px) {
    display: none;
  }
`;

const MobileToggle = styled.button`
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  
  &:hover {
    background: #f9fafb;
  }
  
  svg {
    width: 20px;
    height: 20px;
    color: #374151;
  }
  
  @media (min-width: 769px) {
    display: none;
  }
`;

const Sidebar = styled.div`
  width: ${props => props.isCollapsed ? '80px' : '280px'};
  background: white;
  border-right: 1px solid #e5e7eb;
  padding: 2rem 0;
  position: fixed;
  height: 100vh;
  overflow-y: auto;
  z-index: 50;
  transition: width 0.3s ease;
  
  @media (max-width: 768px) {
    transform: ${props => props.isOpen ? 'translateX(0)' : 'translateX(-100%)'};
    width: 280px;
    transition: transform 0.3s ease;
  }
`;

const SidebarToggle = styled.button`
  position: absolute;
  top: 1rem;
  right: ${props => props.isCollapsed ? '1rem' : '2rem'};
  background: #f3f4f6;
  border: 1px solid #e5e7eb;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  z-index: 60;
  
  &:hover {
    background: #e5e7eb;
  }
  
  svg {
    width: 16px;
    height: 16px;
    color: #6b7280;
  }
  
  @media (max-width: 768px) {
    display: none;
  }
`;

const SidebarHeader = styled.div`
  padding: ${props => props.isCollapsed ? '0 1rem 2rem' : '0 2rem 2rem'};
  border-bottom: 1px solid #e5e7eb;
  margin-top: ${props => props.isCollapsed ? '3rem' : '0'};
  transition: all 0.3s ease;
`;

const SidebarTitle = styled.h2`
  font-size: ${props => props.isCollapsed ? '1rem' : '1.5rem'};
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 0.5rem;
  text-align: ${props => props.isCollapsed ? 'center' : 'left'};
  transition: all 0.3s ease;
  
  ${props => props.isCollapsed && `
    writing-mode: vertical-rl;
    text-orientation: mixed;
    margin-bottom: 1rem;
  `}
`;

const SidebarSubtitle = styled.p`
  color: #6b7280;
  font-size: 0.875rem;
  display: ${props => props.isCollapsed ? 'none' : 'block'};
  text-align: ${props => props.isCollapsed ? 'center' : 'left'};
  transition: all 0.3s ease;
`;

const SidebarNav = styled.nav`
  padding: 2rem 0;
`;

const NavItem = styled(Link)`
  display: flex;
  align-items: center;
  padding: ${props => props.isCollapsed ? '0.75rem 1rem' : '0.75rem 2rem'};
  color: ${props => props.isActive ? '#2563eb' : '#4b5563'};
  background: ${props => props.isActive ? '#eff6ff' : 'transparent'};
  border-right: ${props => props.isActive ? '3px solid #2563eb' : '3px solid transparent'};
  transition: all 0.2s;
  position: relative;
  justify-content: ${props => props.isCollapsed ? 'center' : 'flex-start'};
  
  &:hover {
    background: #f3f4f6;
    color: #2563eb;
  }
  
  svg {
    margin-right: ${props => props.isCollapsed ? '0' : '0.75rem'};
    width: 20px;
    height: 20px;
    min-width: 20px;
  }
  
  span {
    display: ${props => props.isCollapsed ? 'none' : 'block'};
    transition: all 0.3s ease;
  }
  
  &:hover span {
    ${props => props.isCollapsed && `
      display: block;
      position: absolute;
      left: 60px;
      background: #1f2937;
      color: white;
      padding: 0.5rem 1rem;
      border-radius: 6px;
      white-space: nowrap;
      z-index: 1000;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    `}
  }
`;

const MobileNavItems = styled.div`
  border-top: 1px solid #e5e7eb;
  margin-top: 2rem;
  padding-top: 1rem;
  
  @media (min-width: 769px) {
    display: none;
  }
`;

const MobileNavButton = styled.button`
  display: flex;
  align-items: center;
  padding: 0.75rem 2rem;
  color: #4b5563;
  background: transparent;
  border: none;
  width: 100%;
  text-align: left;
  transition: all 0.2s;
  cursor: pointer;
  
  &:hover {
    background: #f3f4f6;
    color: #2563eb;
  }
  
  &.logout {
    color: #dc2626;
    
    &:hover {
      background: #fef2f2;
      color: #dc2626;
    }
  }
  
  svg {
    margin-right: 0.75rem;
    width: 20px;
    height: 20px;
    min-width: 20px;
  }
  
  span {
    font-size: 0.875rem;
    font-weight: 500;
  }
`;

const MainContent = styled.div`
  flex: 1;
  margin-left: ${props => props.sidebarCollapsed ? '80px' : '280px'};
  margin-top: 64px;
  padding: 2rem;
  min-height: calc(100vh - 64px);
  transition: margin-left 0.3s ease;
  
  @media (max-width: 768px) {
    margin-left: 0;
    padding: 2rem 1rem;
  }
`;

const ContentHeader = styled.div`
  margin-bottom: 2rem;
`;

const Breadcrumb = styled.div`
  display: flex;
  align-items: center;
  color: #6b7280;
  font-size: 0.875rem;
  margin-bottom: 1rem;
  
  span {
    display: flex;
    align-items: center;
  }
  
  svg {
    margin: 0 0.5rem;
    width: 16px;
    height: 16px;
  }
`;

const PageTitle = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 0.5rem;
`;

const PageDescription = styled.p`
  color: #6b7280;
`;

const AdminLayout = ({ children, title, description, breadcrumb }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { currentUser, userProfile, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  const navItems = [
    { path: '/admin', label: 'Dashboard', icon: Home },
    { path: '/admin/vendors', label: 'Vendors', icon: Users },
    { path: '/admin/orders', label: 'Orders', icon: ShoppingBag },
    { path: '/admin/products', label: 'Products', icon: Package },
    { path: '/admin/reports', label: 'Reports', icon: BarChart3 },
  ];

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const toggleCollapse = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const goToMainSite = () => {
    navigate('/');
  };

  return (
    <LayoutContainer>
      <SidebarOverlay isOpen={sidebarOpen} onClick={closeSidebar} />
      
      <AdminHeader sidebarCollapsed={sidebarCollapsed}>
        <HeaderLeft>
          <MobileToggle onClick={toggleSidebar}>
            {sidebarOpen ? <X /> : <Menu />}
          </MobileToggle>
          <HeaderTitle>{title}</HeaderTitle>
        </HeaderLeft>
        
        <HeaderRight>
          <HeaderButton onClick={goToMainSite}>
            <ExternalLink />
            <span>Main Site</span>
          </HeaderButton>
          
          <UserInfo>
            <User />
            <span>{userProfile?.name || currentUser?.displayName || 'Admin'}</span>
          </UserInfo>
          
          <HeaderButton onClick={handleLogout}>
            <LogOut />
            <span>Logout</span>
          </HeaderButton>
        </HeaderRight>
      </AdminHeader>
      
      <Sidebar isOpen={sidebarOpen} isCollapsed={sidebarCollapsed}>
        <SidebarToggle isCollapsed={sidebarCollapsed} onClick={toggleCollapse}>
          {sidebarCollapsed ? <ChevronRight /> : <ChevronLeft />}
        </SidebarToggle>
        
        <SidebarHeader isCollapsed={sidebarCollapsed}>
          <SidebarTitle isCollapsed={sidebarCollapsed}>
            {sidebarCollapsed ? 'TX' : 'Admin Panel'}
          </SidebarTitle>
          <SidebarSubtitle isCollapsed={sidebarCollapsed}>
            ThriftX Management
          </SidebarSubtitle>
        </SidebarHeader>
        
        <SidebarNav>
          {navItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <NavItem 
                key={item.path} 
                to={item.path} 
                isActive={isActive}
                isCollapsed={sidebarCollapsed}
                onClick={closeSidebar}
              >
                <IconComponent />
                <span>{item.label}</span>
              </NavItem>
            );
          })}
          
          {/* Mobile-specific navigation items */}
          <MobileNavItems>
            <MobileNavButton onClick={() => { goToMainSite(); closeSidebar(); }}>
              <ExternalLink />
              <span>Main Site</span>
            </MobileNavButton>
            
            <MobileNavButton onClick={() => { handleLogout(); closeSidebar(); }} className="logout">
              <LogOut />
              <span>Logout</span>
            </MobileNavButton>
          </MobileNavItems>
        </SidebarNav>
      </Sidebar>
      
      <MainContent sidebarCollapsed={sidebarCollapsed}>
        <ContentHeader>
          {breadcrumb && (
            <Breadcrumb>
              <span>Admin</span>
              <ChevronRight />
              <span>{breadcrumb}</span>
            </Breadcrumb>
          )}
          
          <PageTitle>{title}</PageTitle>
          {description && <PageDescription>{description}</PageDescription>}
        </ContentHeader>
        
        {children}
      </MainContent>
    </LayoutContainer>
  );
};

export default AdminLayout;