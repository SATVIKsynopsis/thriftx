import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  orderBy,
  deleteDoc,
  doc
} from 'firebase/firestore';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Eye, 
  Package,
  MoreVertical
} from 'lucide-react';
import { db } from '../../firebase/config';
import { useAuth } from '../../contexts/AuthContext';
import { formatPrice } from '../../utils/formatters';
import toast from 'react-hot-toast';

const ProductsContainer = styled.div`
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
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1rem;
  }
`;

const HeaderLeft = styled.div``;

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

const AddButton = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: #2563eb;
  color: white;
  padding: 1rem 2rem;
  border-radius: 0.75rem;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.2s;
  
  &:hover {
    background: #1d4ed8;
    transform: translateY(-2px);
  }
`;

const FilterBar = styled.div`
  background: white;
  border-radius: 1rem;
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;
`;

const SearchWrapper = styled.div`
  position: relative;
  flex: 1;
  min-width: 250px;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 3rem;
  border: 2px solid #e5e7eb;
  border-radius: 0.5rem;
  font-size: 1rem;
  
  &:focus {
    outline: none;
    border-color: #2563eb;
  }
`;

const SearchIcon = styled(Search)`
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #6b7280;
  width: 1.25rem;
  height: 1.25rem;
`;

const FilterSelect = styled.select`
  padding: 0.75rem 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 0.5rem;
  background: white;
  font-size: 0.875rem;
  
  &:focus {
    outline: none;
    border-color: #2563eb;
  }
`;

const ProductsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 2rem;
`;

const ProductCard = styled.div`
  background: white;
  border-radius: 1rem;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  border: 1px solid #e5e7eb;
  transition: all 0.3s;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  }
`;

const ProductImage = styled.img`
  width: 100%;
  height: 200px;
  object-fit: cover;
`;

const ProductImagePlaceholder = styled.div`
  width: 100%;
  height: 200px;
  background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #9ca3af;
  font-size: 1rem;
`;

const ProductContent = styled.div`
  padding: 1.5rem;
`;

const ProductHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
`;

const ProductTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 0.5rem;
  line-height: 1.4;
`;

const ProductMenu = styled.div`
  position: relative;
`;

const MenuButton = styled.button`
  background: none;
  border: none;
  padding: 0.5rem;
  cursor: pointer;
  border-radius: 0.25rem;
  color: #6b7280;
  
  &:hover {
    background: #f3f4f6;
  }
`;

const MenuDropdown = styled.div`
  position: absolute;
  top: 100%;
  right: 0;
  background: white;
  border-radius: 0.5rem;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
  min-width: 150px;
  z-index: 1000;
  display: ${props => props.isOpen ? 'block' : 'none'};
`;

const MenuItem = styled.button`
  width: 100%;
  text-align: left;
  padding: 0.75rem 1rem;
  background: none;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  &:hover {
    background: #f3f4f6;
  }
  
  &.danger {
    color: #ef4444;
    
    &:hover {
      background: #fef2f2;
    }
  }
  
  &:first-child {
    border-radius: 0.5rem 0.5rem 0 0;
  }
  
  &:last-child {
    border-radius: 0 0 0.5rem 0.5rem;
  }
`;

const ProductDescription = styled.p`
  color: #6b7280;
  font-size: 0.875rem;
  margin-bottom: 1rem;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const ProductDetails = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const ProductPrice = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  color: #059669;
`;

const ProductStock = styled.div`
  font-size: 0.875rem;
  color: ${props => props.inStock ? '#059669' : '#ef4444'};
  font-weight: 600;
`;

const ProductStatus = styled.div`
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  background: ${props => {
    switch (props.status) {
      case 'active': return '#dcfce7';
      case 'draft': return '#fef3c7';
      case 'inactive': return '#fee2e2';
      default: return '#f3f4f6';
    }
  }};
  color: ${props => {
    switch (props.status) {
      case 'active': return '#166534';
      case 'draft': return '#92400e';
      case 'inactive': return '#991b1b';
      default: return '#374151';
    }
  }};
`;

const ProductActions = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const ActionButton = styled(Link)`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem;
  background: ${props => props.variant === 'primary' ? '#2563eb' : '#f3f4f6'};
  color: ${props => props.variant === 'primary' ? 'white' : '#374151'};
  border-radius: 0.5rem;
  text-decoration: none;
  font-weight: 500;
  transition: all 0.2s;
  
  &:hover {
    background: ${props => props.variant === 'primary' ? '#1d4ed8' : '#e5e7eb'};
  }
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
  margin-bottom: 2rem;
`;

const Products = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [openMenuId, setOpenMenuId] = useState(null);
  
  const { currentUser } = useAuth();

  useEffect(() => {
    const fetchProducts = async () => {
      if (!currentUser) return;

      try {
        const productsQuery = query(
          collection(db, 'products'),
          where('sellerId', '==', currentUser.uid),
          orderBy('createdAt', 'desc')
        );
        
        const snapshot = await getDocs(productsQuery);
        const productsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        setProducts(productsData);
        setFilteredProducts(productsData);
      } catch (error) {
        console.error('Error fetching products:', error);
        toast.error('Failed to load products');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [currentUser]);

  useEffect(() => {
    let filtered = products;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(product => {
        const status = getProductStatus(product);
        return status === statusFilter;
      });
    }

    setFilteredProducts(filtered);
  }, [products, searchTerm, statusFilter]);

  const getProductStatus = (product) => {
    if (product.stock === 0) return 'inactive';
    if (product.draft) return 'draft';
    return 'active';
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;

    try {
      await deleteDoc(doc(db, 'products', productId));
      setProducts(prev => prev.filter(p => p.id !== productId));
      toast.success('Product deleted successfully');
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Failed to delete product');
    }
  };



  if (loading) {
    return (
      <ProductsContainer>
        <Container>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            minHeight: '400px',
            color: '#6b7280'
          }}>
            <div className="loading-spinner" style={{ marginRight: '1rem' }} />
            Loading products...
          </div>
        </Container>
      </ProductsContainer>
    );
  }

  return (
    <ProductsContainer>
      <Container>
        <Header>
          <HeaderLeft>
            <Title>My Products</Title>
            <Subtitle>Manage your product listings</Subtitle>
          </HeaderLeft>
          <AddButton to="/seller/products/add">
            <Plus size={20} />
            Add Product
          </AddButton>
        </Header>

        <FilterBar>
          <SearchWrapper>
            <SearchIcon />
            <SearchInput
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </SearchWrapper>
          
          <FilterSelect
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="draft">Draft</option>
            <option value="inactive">Out of Stock</option>
          </FilterSelect>
        </FilterBar>

        {filteredProducts.length > 0 ? (
          <ProductsGrid>
            {filteredProducts.map((product) => (
              <ProductCard key={product.id}>
                {product.images && product.images.length > 0 ? (
                  <ProductImage 
                    src={product.images[0]} 
                    alt={product.name}
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextElementSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                <ProductImagePlaceholder style={{ display: product.images && product.images.length > 0 ? 'none' : 'flex' }}>
                  No Image Available
                </ProductImagePlaceholder>

                <ProductContent>
                  <ProductHeader>
                    <div style={{ flex: 1 }}>
                      <ProductTitle>{product.name}</ProductTitle>
                      <ProductStatus status={getProductStatus(product)}>
                        {getProductStatus(product)}
                      </ProductStatus>
                    </div>
                    
                    <ProductMenu>
                      <MenuButton onClick={() => setOpenMenuId(openMenuId === product.id ? null : product.id)}>
                        <MoreVertical size={20} />
                      </MenuButton>
                      
                      <MenuDropdown isOpen={openMenuId === product.id}>
                        <MenuItem as={Link} to={`/product/${product.id}`}>
                          <Eye size={16} />
                          View
                        </MenuItem>
                        <MenuItem as={Link} to={`/seller/products/edit/${product.id}`}>
                          <Edit size={16} />
                          Edit
                        </MenuItem>
                        <MenuItem 
                          className="danger"
                          onClick={() => handleDeleteProduct(product.id)}
                        >
                          <Trash2 size={16} />
                          Delete
                        </MenuItem>
                      </MenuDropdown>
                    </ProductMenu>
                  </ProductHeader>

                  <ProductDescription>{product.description}</ProductDescription>

                  <ProductDetails>
                    <ProductPrice>{formatPrice(product.price)}</ProductPrice>
                    <ProductStock inStock={product.stock > 0}>
                      Stock: {product.stock || 0}
                    </ProductStock>
                  </ProductDetails>

                  <ProductActions>
                    <ActionButton to={`/product/${product.id}`} variant="secondary">
                      <Eye size={16} />
                      View
                    </ActionButton>
                    <ActionButton to={`/seller/products/edit/${product.id}`} variant="primary">
                      <Edit size={16} />
                      Edit
                    </ActionButton>
                  </ProductActions>
                </ProductContent>
              </ProductCard>
            ))}
          </ProductsGrid>
        ) : (
          <EmptyState>
            <EmptyIcon>
              <Package size={40} />
            </EmptyIcon>
            <EmptyTitle>
              {products.length === 0 ? 'No products yet' : 'No products match your search'}
            </EmptyTitle>
            <EmptyText>
              {products.length === 0 
                ? 'Start by adding your first product to begin selling'
                : 'Try adjusting your search or filter criteria'
              }
            </EmptyText>
            {products.length === 0 && (
              <AddButton to="/seller/products/add">
                <Plus size={20} />
                Add Your First Product
              </AddButton>
            )}
          </EmptyState>
        )}
      </Container>
    </ProductsContainer>
  );
};

export default Products;
