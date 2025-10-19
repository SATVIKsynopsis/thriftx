import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Mail, 
  Phone, 
  Calendar,
  MoreVertical,
  Search,
  Filter,
  RefreshCw,
  Plus,
  X,
  User,
  MapPin,
  Heart
} from 'lucide-react';
import { adminAPI } from '../../services/adminService';
import AdminLayout from '../../components/admin/AdminLayout';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import DevelopmentNotice from '../../components/common/DevelopmentNotice';
import toast from 'react-hot-toast';

const VendorContainer = styled.div`
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

const AddVendorButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
  
  &:hover {
    background: linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%);
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
  }
  
  &:active {
    transform: translateY(0);
  }
  
  svg {
    width: 16px;
    height: 16px;
  }
`;

const ModalOverlay = styled.div`
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
  padding: 2rem;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 1rem;
  padding: 2rem;
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  
  h3 {
    font-size: 1.5rem;
    font-weight: 700;
    color: #1f2937;
    margin: 0;
  }
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: #6b7280;
  padding: 0.5rem;
  border-radius: 0.5rem;
  transition: all 0.2s;
  
  &:hover {
    background: #f3f4f6;
    color: #374151;
  }
`;

const DevNotice = styled.div`
  background: linear-gradient(135deg, #e0f2fe 0%, #f0f9ff 100%);
  border: 1px solid #0ea5e9;
  border-radius: 0.75rem;
  padding: 1rem;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: #0369a1;
  font-size: 0.875rem;
  line-height: 1.4;
`;

const InfoIcon = styled.span`
  font-size: 1.25rem;
  flex-shrink: 0;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-weight: 600;
  color: #374151;
  font-size: 0.875rem;
`;

const InputWrapper = styled.div`
  position: relative;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 3rem;
  border: 2px solid #e5e7eb;
  border-radius: 0.5rem;
  font-size: 1rem;
  transition: all 0.2s;
  
  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }
  
  &.error {
    border-color: #ef4444;
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 3rem;
  border: 2px solid #e5e7eb;
  border-radius: 0.5rem;
  font-size: 1rem;
  transition: all 0.2s;
  background: white;
  
  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }
`;

const InputIcon = styled.div`
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #6b7280;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 1rem;
`;

const Button = styled.button`
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  
  &.primary {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;
    
    &:hover {
      background: linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%);
    }
    
    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }
  
  &.secondary {
    background: white;
    color: #374151;
    border: 2px solid #e5e7eb;
    
    &:hover {
      background: #f9fafb;
    }
  }
`;

const ErrorMessage = styled.span`
  color: #ef4444;
  font-size: 0.75rem;
  margin-top: 0.25rem;
`;

const VendorGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 2rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const VendorCard = styled.div`
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

const VendorHeader = styled.div`
  display: flex;
  align-items: start;
  justify-content: space-between;
  margin-bottom: 1.5rem;
`;

const VendorInfo = styled.div`
  flex: 1;
`;

const VendorName = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 0.5rem;
`;

const VendorEmail = styled.div`
  display: flex;
  align-items: center;
  color: #6b7280;
  font-size: 0.875rem;
  margin-bottom: 0.25rem;
  
  svg {
    margin-right: 0.5rem;
    width: 16px;
    height: 16px;
  }
`;

const VendorPhone = styled.div`
  display: flex;
  align-items: center;
  color: #6b7280;
  font-size: 0.875rem;
  
  svg {
    margin-right: 0.5rem;
    width: 16px;
    height: 16px;
  }
`;

const StatusBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 500;
  background: ${props => {
    switch (props.status) {
      case 'approved': return '#dcfce7';
      case 'pending': return '#fef3c7';
      case 'banned': return '#fecaca';
      default: return '#f3f4f6';
    }
  }};
  color: ${props => {
    switch (props.status) {
      case 'approved': return '#059669';
      case 'pending': return '#d97706';
      case 'banned': return '#dc2626';
      default: return '#6b7280';
    }
  }};
  
  svg {
    width: 16px;
    height: 16px;
  }
`;

const VendorDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
`;

const DetailItem = styled.div`
  display: flex;
  align-items: center;
  color: #6b7280;
  font-size: 0.875rem;
  
  svg {
    margin-right: 0.5rem;
    width: 16px;
    height: 16px;
  }
`;

const VendorActions = styled.div`
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
`;

const ActionButton = styled.button`
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  
  &.approve {
    background: #059669;
    color: white;
    
    &:hover {
      background: #047857;
    }
  }
  
  &.ban {
    background: #dc2626;
    color: white;
    
    &:hover {
      background: #b91c1c;
    }
  }
  
  &.view {
    background: #f3f4f6;
    color: #374151;
    
    &:hover {
      background: #e5e7eb;
    }
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
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

const VendorManagement = () => {
  const [vendors, setVendors] = useState([]);
  const [filteredVendors, setFilteredVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Add Vendor Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [addLoading, setAddLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    location: '',
    favoriteStyles: '',
    sustainabilityGoals: '',
    status: 'approved' // Default to approved since admin is creating
  });
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    loadVendors();
  }, []);

  useEffect(() => {
    filterVendors();
  }, [vendors, searchTerm, statusFilter]);

  const loadVendors = async () => {
    try {
      setLoading(true);
      const vendorData = await adminAPI.getVendors();
      setVendors(vendorData);
    } catch (error) {
      toast.error('Failed to load vendors');
      console.error('Error loading vendors:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterVendors = () => {
    let filtered = vendors;
    
    if (searchTerm) {
      filtered = filtered.filter(vendor => 
        vendor.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vendor.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(vendor => vendor.status === statusFilter);
    }
    
    setFilteredVendors(filtered);
  };

  const handleApproveVendor = async (vendorId) => {
    try {
      await adminAPI.approveVendor(vendorId);
      toast.success('Vendor approved successfully');
      loadVendors();
    } catch (error) {
      toast.error('Failed to approve vendor');
      console.error('Error approving vendor:', error);
    }
  };

  const handleBanVendor = async (vendorId) => {
    if (window.confirm('Are you sure you want to ban this vendor?')) {
      try {
        await adminAPI.banVendor(vendorId);
        toast.success('Vendor banned successfully');
        loadVendors();
      } catch (error) {
        toast.error('Failed to ban vendor');
        console.error('Error banning vendor:', error);
      }
    }
  };

  // Add Vendor Functions
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.name.trim()) {
      errors.name = 'Name is required';
    }
    
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email is invalid';
    }
    
    if (!formData.password.trim()) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddVendor = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setAddLoading(true);
    try {
      const result = await adminAPI.createVendor({
        ...formData,
        role: 'vendor',
        createdAt: new Date(),
        approvedAt: formData.status === 'approved' ? new Date() : null
      });
      
      // If we get a mock vendor, add it to the local state immediately
      if (result.mockVendor) {
        setVendors(prevVendors => [result.mockVendor, ...prevVendors]);
      }
      
      toast.success('Vendor created successfully!');
      setShowAddModal(false);
      resetForm();
      
      // Always reload vendors to get the latest data
      loadVendors();
    } catch (error) {
      if (error.message.includes('Email already in use')) {
        toast.error('Email already in use. Please use a different email.');
        setFormErrors({ email: 'Email already in use' });
      } else {
        toast.error(`Failed to create vendor: ${error.message}`);
      }
      console.error('Error creating vendor:', error);
    } finally {
      setAddLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      location: '',
      favoriteStyles: '',
      sustainabilityGoals: '',
      status: 'approved'
    });
    setFormErrors({});
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    resetForm();
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved': return <CheckCircle />;
      case 'banned': return <XCircle />;
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
        title="Vendor Management" 
        description="Manage and monitor all vendors"
        breadcrumb="Vendors"
      >
        <LoadingContainer>
          <LoadingSpinner />
        </LoadingContainer>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout 
      title="Vendor Management" 
      description="Manage and monitor all vendors"
      breadcrumb="Vendors"
    >
      <VendorContainer>
        <DevelopmentNotice type="permissions" />
        
        <FilterBar>
          <SearchInput>
            <Search />
            <input
              type="text"
              placeholder="Search vendors..."
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
            active={statusFilter === 'approved'}
            onClick={() => setStatusFilter('approved')}
          >
            Approved
          </FilterButton>
          
          <FilterButton
            active={statusFilter === 'banned'}
            onClick={() => setStatusFilter('banned')}
          >
            Banned
          </FilterButton>
          
          <RefreshButton onClick={loadVendors}>
            <RefreshCw />
            Refresh
          </RefreshButton>
          
          <AddVendorButton onClick={() => setShowAddModal(true)}>
            <Plus />
            Add Vendor
          </AddVendorButton>
        </FilterBar>

        {filteredVendors.length === 0 ? (
          <EmptyState>
            <h3>No vendors found</h3>
            <p>No vendors match your current filters.</p>
          </EmptyState>
        ) : (
          <VendorGrid>
            {filteredVendors.map((vendor) => (
              <VendorCard key={vendor.id}>
                <VendorHeader>
                  <VendorInfo>
                    <VendorName>{vendor.name || 'Unknown Vendor'}</VendorName>
                    <VendorEmail>
                      <Mail />
                      {vendor.email}
                    </VendorEmail>
                    {vendor.phone && (
                      <VendorPhone>
                        <Phone />
                        {vendor.phone}
                      </VendorPhone>
                    )}
                  </VendorInfo>
                  
                  <StatusBadge status={vendor.status || 'pending'}>
                    {getStatusIcon(vendor.status || 'pending')}
                    {(vendor.status || 'pending').charAt(0).toUpperCase() + (vendor.status || 'pending').slice(1)}
                  </StatusBadge>
                </VendorHeader>

                <VendorDetails>
                  <DetailItem>
                    <Calendar />
                    Joined: {formatDate(vendor.createdAt)}
                  </DetailItem>
                </VendorDetails>

                <VendorActions>
                  {vendor.status === 'pending' && (
                    <ActionButton
                      className="approve"
                      onClick={() => handleApproveVendor(vendor.id)}
                    >
                      Approve
                    </ActionButton>
                  )}
                  
                  {vendor.status !== 'banned' && (
                    <ActionButton
                      className="ban"
                      onClick={() => handleBanVendor(vendor.id)}
                    >
                      Ban
                    </ActionButton>
                  )}
                  
                  <ActionButton className="view">
                    View Details
                  </ActionButton>
                </VendorActions>
              </VendorCard>
            ))}
          </VendorGrid>
        )}
      </VendorContainer>

      {/* Add Vendor Modal */}
      {showAddModal && (
        <ModalOverlay onClick={(e) => e.target === e.currentTarget && handleCloseModal()}>
          <ModalContent>
            <ModalHeader>
              <h3>Add New Vendor</h3>
              <CloseButton onClick={handleCloseModal}>
                <X />
              </CloseButton>
            </ModalHeader>

            <DevNotice>
              <InfoIcon>ℹ️</InfoIcon>
              In development mode, vendors are stored locally. In production, this will create actual user accounts.
            </DevNotice>

            <Form onSubmit={handleAddVendor}>
              <InputGroup>
                <Label htmlFor="name">Full Name *</Label>
                <InputWrapper>
                  <InputIcon>
                    <User size={20} />
                  </InputIcon>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="Enter vendor's full name"
                    value={formData.name}
                    onChange={handleFormChange}
                    className={formErrors.name ? 'error' : ''}
                  />
                </InputWrapper>
                {formErrors.name && <ErrorMessage>{formErrors.name}</ErrorMessage>}
              </InputGroup>

              <InputGroup>
                <Label htmlFor="email">Email Address *</Label>
                <InputWrapper>
                  <InputIcon>
                    <Mail size={20} />
                  </InputIcon>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Enter vendor's email"
                    value={formData.email}
                    onChange={handleFormChange}
                    className={formErrors.email ? 'error' : ''}
                  />
                </InputWrapper>
                {formErrors.email && <ErrorMessage>{formErrors.email}</ErrorMessage>}
              </InputGroup>

              <InputGroup>
                <Label htmlFor="password">Password *</Label>
                <InputWrapper>
                  <InputIcon>
                    <User size={20} />
                  </InputIcon>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Create a password for the vendor"
                    value={formData.password}
                    onChange={handleFormChange}
                    className={formErrors.password ? 'error' : ''}
                  />
                </InputWrapper>
                {formErrors.password && <ErrorMessage>{formErrors.password}</ErrorMessage>}
              </InputGroup>

              <InputGroup>
                <Label htmlFor="status">Initial Status</Label>
                <InputWrapper>
                  <InputIcon>
                    <CheckCircle size={20} />
                  </InputIcon>
                  <Select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleFormChange}
                  >
                    <option value="approved">Approved (Active)</option>
                    <option value="pending">Pending Approval</option>
                  </Select>
                </InputWrapper>
              </InputGroup>

              <InputGroup>
                <Label htmlFor="location">Location</Label>
                <InputWrapper>
                  <InputIcon>
                    <MapPin size={20} />
                  </InputIcon>
                  <Input
                    id="location"
                    name="location"
                    type="text"
                    placeholder="e.g., Mumbai, Maharashtra"
                    value={formData.location}
                    onChange={handleFormChange}
                  />
                </InputWrapper>
              </InputGroup>

              <InputGroup>
                <Label htmlFor="favoriteStyles">Favorite Fashion Styles</Label>
                <InputWrapper>
                  <InputIcon>
                    <Heart size={20} />
                  </InputIcon>
                  <Input
                    id="favoriteStyles"
                    name="favoriteStyles"
                    type="text"
                    placeholder="e.g., Traditional, Vintage, Modern"
                    value={formData.favoriteStyles}
                    onChange={handleFormChange}
                  />
                </InputWrapper>
              </InputGroup>

              <InputGroup>
                <Label htmlFor="sustainabilityGoals">Sustainability Goals</Label>
                <InputWrapper>
                  <InputIcon>
                    <Heart size={20} />
                  </InputIcon>
                  <Input
                    id="sustainabilityGoals"
                    name="sustainabilityGoals"
                    type="text"
                    placeholder="e.g., Promote eco-friendly fashion"
                    value={formData.sustainabilityGoals}
                    onChange={handleFormChange}
                  />
                </InputWrapper>
              </InputGroup>

              <ButtonGroup>
                <Button type="button" className="secondary" onClick={handleCloseModal}>
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="primary" 
                  disabled={addLoading}
                >
                  {addLoading ? 'Creating...' : 'Create Vendor'}
                </Button>
              </ButtonGroup>
            </Form>
          </ModalContent>
        </ModalOverlay>
      )}
    </AdminLayout>
  );
};

export default VendorManagement;