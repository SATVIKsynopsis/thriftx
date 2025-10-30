"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
// Removed styled-components import
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
import { db } from '@/firebase/config';
import { useAuth } from '@/contexts/AuthContext';
import { formatPrice } from '@/utils/formatters';
import toast from 'react-hot-toast';

// --- Tailwind CSS Helper Components (Replacing Styled Components) ---

const ProductsContainer = ({ children }) => (
  <div className="min-h-screen bg-gray-50 py-8">
    {children}
  </div>
);

const Container = ({ children }) => (
  <div className="max-w-7xl mx-auto px-8 md:px-4 sm:px-2">
    {children}
  </div>
);

const Header = ({ children }) => (
  <div className="flex justify-between items-start mb-8 flex-col gap-4 md:flex-row md:items-center">
    {children}
  </div>
);

const HeaderLeft = ({ children }) => <div className="flex-1">{children}</div>;

const Title = ({ children }) => (
  <h1 className="text-3xl font-bold text-gray-900 mb-1 sm:text-4xl">
    {children}
  </h1>
);

const Subtitle = ({ children }) => (
  <p className="text-lg text-gray-600">
    {children}
  </p>
);

const AddButton = ({ to, children }) => (
  <Link
    href={to}
    className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold text-base no-underline transition-all duration-200 hover:bg-blue-700 hover:-translate-y-0.5 shadow-md hover:shadow-lg"
  >
    {children}
  </Link>
);

const FilterBar = ({ children }) => (
  <div className="bg-white rounded-xl p-4 md:p-6 mb-8 shadow-md flex gap-4 items-center flex-wrap border border-gray-100">
    {children}
  </div>
);

const SearchWrapper = ({ children }) => (
  <div className="relative flex-1 min-w-[250px]">
    {children}
  </div>
);

const SearchInput = ({ value, onChange, ...props }) => (
  <input
    {...props}
    value={value}
    onChange={onChange}
    className="w-full py-3 pl-12 pr-4 border-2 border-gray-200 rounded-lg text-base transition-colors focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-100"
  />
);

const SearchIcon = (props) => (
  <Search
    {...props}
    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5"
  />
);

const FilterSelect = ({ value, onChange, children }) => (
  <select
    value={value}
    onChange={onChange}
    className="py-3 px-4 border-2 border-gray-200 rounded-lg bg-white text-sm transition-colors focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-100"
  >
    {children}
  </select>
);

const ProductsGrid = ({ children }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-8">
    {children}
  </div>
);

const ProductCard = ({ children }) => (
  <div className="bg-white rounded-xl overflow-hidden shadow-lg border border-gray-200 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
    {children}
  </div>
);

const ProductImage = ({ alt, ...props }) => (
  <img
    className="w-full h-52 object-cover"
    alt={alt}
    {...props}
  />
);

const ProductImagePlaceholder = ({ children, style }) => (
  <div
    style={style}
    className="w-full h-52 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-gray-500 text-base"
  >
    {children}
  </div>
);

const ProductContent = ({ children }) => (
  <div className="p-6">
    {children}
  </div>
);

const ProductHeader = ({ children }) => (
  <div className="flex justify-between items-start mb-4">
    {children}
  </div>
);

const ProductTitle = ({ children }) => (
  <h3 className="text-xl font-semibold text-gray-900 mb-1 leading-tight">
    {children}
  </h3>
);

const ProductMenu = ({ children }) => (
  <div className="relative">
    {children}
  </div>
);

const MenuButton = ({ onClick, children }) => (
  <button
    onClick={onClick}
    className="bg-transparent border-none p-2 cursor-pointer rounded-md text-gray-600 hover:bg-gray-100 transition-colors"
  >
    {children}
  </button>
);

const MenuDropdown = ({ isOpen, children }) => (
  <div
    className={`absolute top-full right-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 min-w-[150px] z-10 transition-all duration-200 ${isOpen ? 'block opacity-100 scale-y-100 origin-top' : 'hidden opacity-0 scale-y-0 origin-top'}`}
  >
    {children}
  </div>
);

const MenuItem = ({ as, to, onClick, danger, children }) => {
  const commonClasses = `w-full text-left px-4 py-3 bg-transparent border-none cursor-pointer transition-colors flex items-center gap-2 text-gray-700 hover:bg-gray-100 first:rounded-t-lg last:rounded-b-lg`;
  const dangerClasses = 'text-red-600 hover:bg-red-50 hover:text-red-700';

  if (as === Link) {
    return (
      <Link
        href={to}
        className={`${commonClasses} ${danger ? dangerClasses : ''}`}
      >
        {children}
      </Link>
    );
  }
  return (
    <button
      onClick={onClick}
      className={`${commonClasses} ${danger ? dangerClasses : ''}`}
    >
      {children}
    </button>
  );
};

const ProductDescription = ({ children }) => (
  <p className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed">
    {children}
  </p>
);

const ProductDetails = ({ children }) => (
  <div className="flex justify-between items-center mb-4">
    {children}
  </div>
);

const ProductPrice = ({ children }) => (
  <div className="text-2xl font-bold text-green-700">
    {children}
  </div>
);

const ProductStock = ({ inStock, children }) => (
  <div className={`text-sm font-semibold ${inStock ? 'text-green-600' : 'text-red-600'}`}>
    {children}
  </div>
);

const getStatusClasses = (status) => {
  switch (status) {
    case 'active':
      return 'bg-green-100 text-green-800';
    case 'draft':
      return 'bg-amber-100 text-amber-800';
    case 'inactive':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-200 text-gray-700';
  }
};

const ProductStatus = ({ status, children }) => (
  <div className={`inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase ${getStatusClasses(status)}`}>
    {children}
  </div>
);

const ProductActions = ({ children }) => (
  <div className="flex gap-3">
    {children}
  </div>
);

const ActionButton = ({ to, variant, children }) => (
  <Link
    href={to}
    className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-sm font-medium no-underline transition-colors duration-200
      ${variant === 'primary'
        ? 'bg-blue-600 text-white hover:bg-blue-700'
        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
      }
    `}
  >
    {children}
  </Link>
);

const EmptyState = ({ children }) => (
  <div className="text-center p-16 bg-white rounded-xl shadow-lg border border-gray-100">
    {children}
  </div>
);

const EmptyIcon = ({ children }) => (
  <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-6 text-gray-400">
    {children}
  </div>
);

const EmptyTitle = ({ children }) => (
  <h2 className="text-xl font-bold text-gray-900 mb-2">
    {children}
  </h2>
);

const EmptyText = ({ children }) => (
  <p className="text-lg text-gray-600 mb-6">
    {children}
  </p>
);

// --- Component Logic ---

const ProductsComponent = () => {
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
    // Assuming product.draft is a boolean
    if (product.stock === 0) return 'inactive';
    if (product.draft) return 'draft';
    return 'active';
  };

  const handleDeleteProduct = async (productId) => {
    setOpenMenuId(null); // Close the menu immediately
    if (!window.confirm('Are you sure you want to delete this product? This action cannot be undone.')) return;

    try {
      await deleteDoc(doc(db, 'products', productId));
      setProducts(prev => prev.filter(p => p.id !== productId));
      toast.success('Product deleted successfully! 👋');
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Failed to delete product');
    }
  };

  const handleDocumentClick = (e) => {
    // Close dropdown menu if click is outside of it
    if (openMenuId && !e.target.closest('.product-menu')) {
      setOpenMenuId(null);
    }
  };

  useEffect(() => {
    document.addEventListener('click', handleDocumentClick);
    return () => {
      document.removeEventListener('click', handleDocumentClick);
    };
  }, [openMenuId]); // Dependency on openMenuId to refresh listener

  if (loading) {
    return (
      <ProductsContainer>
        <Container>
          {/* Using a simple Tailwind-styled loading message */}
          <div className="flex items-center justify-center min-h-[400px] text-gray-600 text-lg font-medium">
            {/* Replace custom loading-spinner with a simple indicator */}
            <div className="animate-spin h-6 w-6 border-4 border-blue-500 border-t-transparent rounded-full mr-4" />
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
          <div className="w-full aspect-[4/3] bg-gray-100 flex items-center justify-center overflow-hidden rounded-t-xl">
            <ProductImage
              src={product.images[0]}
              alt={product.name}
              className="w-full h-full object-contain transition-transform duration-300 hover:scale-105"
              onError={(e) => {
                e.currentTarget.src = "https://via.placeholder.com/400x300?text=No+Image";
              }}
            />
          </div>
        ) : (
          <div className="w-full aspect-[4/3] flex items-center justify-center bg-gray-100 rounded-t-xl">
            <ProductImagePlaceholder className="text-gray-500 text-base">
              No Image Available
            </ProductImagePlaceholder>
          </div>
        )}


                <ProductContent>
                  <ProductHeader>
                    <div className="flex-1">
                      <ProductTitle>{product.name}</ProductTitle>
                      <ProductStatus status={getProductStatus(product)}>
                        {getProductStatus(product)}
                      </ProductStatus>
                    </div>

                    {/* Add a class for click outside listener */}
                    <ProductMenu className="product-menu">
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
                          danger
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

export default ProductsComponent;