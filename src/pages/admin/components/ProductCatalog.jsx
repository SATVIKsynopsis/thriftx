import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { 
  Package, 
  User, 
  Calendar,
  IndianRupee,
  Search,
  Filter,
  RefreshCw,
  Eye,
  Trash2,
  AlertTriangle,
  Star,
  Tag,
  Image as ImageIcon
} from 'lucide-react';
import { adminAPI } from '../../services/adminService';
import AdminLayout from '../../components/admin/AdminLayout';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import DevelopmentNotice from '../../components/common/DevelopmentNotice';
import { formatPrice } from '../../utils/formatters';
import toast from 'react-hot-toast';

const ProductsContainer = styled.div`
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

const ProductGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 2rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const ProductCard = styled.div`
  background: white;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: transform 0.2s, box-shadow 0.2s;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
`;

const ProductImage = styled.div`
  width: 100%;
  height: 200px;
  background: ${props => props.imageUrl ? `url(${props.imageUrl})` : '#f3f4f6'};
  background-size: cover;
  background-position: center;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  
  svg {
    width: 48px;
    height: 48px;
    color: #9ca3af;
  }
`;

const ProductStatus = styled.div`
  position: absolute;
  top: 1rem;
  right: 1rem;
  padding: 0.5rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 500;
  background: ${props => {
    switch (props.status) {
      case 'active': return '#dcfce7';
      case 'inactive': return '#f3f4f6';
      case 'removed': return '#fecaca';
      default: return '#f3f4f6';
    }
  }};
  color: ${props => {
    switch (props.status) {
      case 'active': return '#059669';
      case 'inactive': return '#6b7280';
      case 'removed': return '#dc2626';
      default: return '#6b7280';
    }
  }};
`;

const ProductContent = styled.div`
  padding: 1.5rem;
`;

const ProductHeader = styled.div`
  margin-bottom: 1rem;
`;

const ProductTitle = styled.h3`
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 0.5rem;
  line-height: 1.4;
`;

const ProductCategory = styled.div`
  display: flex;
  align-items: center;
  color: #6b7280;
  font-size: 0.875rem;
  margin-bottom: 0.5rem;
  
  svg {
    margin-right: 0.5rem;
    width: 16px;
    height: 16px;
  }
`;

const ProductPrice = styled.div`
  display: flex;
  align-items: center;
  font-size: 1.25rem;
  font-weight: 700;
  color: #059669;
  margin-bottom: 1rem;
  
  svg {
    margin-right: 0.25rem;
    width: 20px;
    height: 20px;
  }
`;

const ProductDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
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

const ProductActions = styled.div`
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
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  &.view {
    background: #f3f4f6;
    color: #374151;
    
    &:hover {
      background: #e5e7eb;
    }
  }
  
  &.remove {
    background: #dc2626;
    color: white;
    
    &:hover {
      background: #b91c1c;
    }
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
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

const ProductCatalog = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [products, searchTerm, statusFilter]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const productData = await adminAPI.getAllProducts();
      setProducts(productData);
    } catch (error) {
      toast.error('Failed to load products');
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterProducts = () => {
    let filtered = products;
    
    if (searchTerm) {
      filtered = filtered.filter(product => 
        product.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.seller?.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(product => 
        statusFilter === 'active' ? product.status !== 'removed' : product.status === statusFilter
      );
    }
    
    setFilteredProducts(filtered);
  };

  const handleRemoveProduct = async (productId) => {
    if (window.confirm('Are you sure you want to remove this product?')) {
      try {
        await adminAPI.removeProduct(productId);
        toast.success('Product removed successfully');
        loadProducts();
      } catch (error) {
        toast.error('Failed to remove product');
        console.error('Error removing product:', error);
      }
    }
  };

  const formatDate = (date) => {
    if (!date) return 'Not available';
    return new Date(date.toDate ? date.toDate() : date).toLocaleDateString('en-IN');
  };

  if (loading) {
    return (
      <AdminLayout 
        title="Product Catalog" 
        description="Manage all marketplace products"
        breadcrumb="Products"
      >
        <LoadingContainer>
          <LoadingSpinner />
        </LoadingContainer>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout 
      title="Product Catalog" 
      description="Manage all marketplace products"
      breadcrumb="Products"
    >
      <ProductsContainer>
        <DevelopmentNotice type="permissions" />
        
        <FilterBar>
          <SearchInput>
            <Search />
            <input
              type="text"
              placeholder="Search products..."
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
            active={statusFilter === 'active'}
            onClick={() => setStatusFilter('active')}
          >
            Active
          </FilterButton>
          
          <FilterButton
            active={statusFilter === 'removed'}
            onClick={() => setStatusFilter('removed')}
          >
            Removed
          </FilterButton>
          
          <RefreshButton onClick={loadProducts}>
            <RefreshCw />
            Refresh
          </RefreshButton>
        </FilterBar>

        {filteredProducts.length === 0 ? (
          <EmptyState>
            <h3>No products found</h3>
            <p>No products match your current filters.</p>
          </EmptyState>
        ) : (
          <ProductGrid>
            {filteredProducts.map((product) => (
              <ProductCard key={product.id}>
                <ProductImage imageUrl={product.images?.[0]}>
                  {!product.images?.[0] && <ImageIcon />}
                  <ProductStatus status={product.status || 'active'}>
                    {(product.status || 'active').charAt(0).toUpperCase() + (product.status || 'active').slice(1)}
                  </ProductStatus>
                </ProductImage>
                
                <ProductContent>
                  <ProductHeader>
                    <ProductTitle>{product.title || 'Untitled Product'}</ProductTitle>
                    <ProductCategory>
                      <Tag />
                      {product.category || 'Uncategorized'}
                    </ProductCategory>
                  </ProductHeader>

                  <ProductPrice>
                    <IndianRupee />
                    {formatPrice(product.price || 0)}
                  </ProductPrice>

                  <ProductDetails>
                    <DetailItem>
                      <User />
                      {product.seller?.name || 'Unknown Seller'}
                    </DetailItem>
                    <DetailItem>
                      <Calendar />
                      Listed: {formatDate(product.createdAt)}
                    </DetailItem>
                    {product.condition && (
                      <DetailItem>
                        <Star />
                        Condition: {product.condition}
                      </DetailItem>
                    )}
                  </ProductDetails>

                  <ProductActions>
                    <ActionButton className="view">
                      <Eye />
                      View
                    </ActionButton>
                    
                    {product.status !== 'removed' && (
                      <ActionButton
                        className="remove"
                        onClick={() => handleRemoveProduct(product.id)}
                      >
                        <Trash2 />
                        Remove
                      </ActionButton>
                    )}
                  </ProductActions>
                </ProductContent>
              </ProductCard>
            ))}
          </ProductGrid>
        )}
      </ProductsContainer>
    </AdminLayout>
  );
};

export default ProductCatalog;