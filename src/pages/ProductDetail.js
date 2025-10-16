import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { doc, getDoc, collection, query, where, limit, getDocs, setDoc, serverTimestamp,updateDoc } from 'firebase/firestore';
import { 
  Star, 
  ShoppingCart, 
  Heart, 
  Share2, 
  ArrowLeft, 
  Truck, 
  Shield, 
  RotateCcw,
  User,
  Clock,
  Package
} from 'lucide-react';
import { db } from '../firebase/config';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import ProductCard from '../components/products/ProductCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { formatPrice } from '../utils/formatters';
import toast from 'react-hot-toast';

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  
  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const BackButton = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: #6b7280;
  text-decoration: none;
  margin-bottom: 2rem;
  transition: color 0.2s;
  
  &:hover {
    color: #2563eb;
  }
`;

const ProductMain = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3rem;
  margin-bottom: 4rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
`;

const ImageSection = styled.div`
  position: relative;
`;

const MainImage = styled.img`
  width: 100%;
  height: 400px;
  object-fit: cover;
  border-radius: 1rem;
  margin-bottom: 1rem;
`;

const ImagePlaceholder = styled.div`
  width: 100%;
  height: 400px;
  background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
  border-radius: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #9ca3af;
  font-size: 1.125rem;
  margin-bottom: 1rem;
`;

const ThumbnailGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
  gap: 0.5rem;
`;

const Thumbnail = styled.img`
  width: 100%;
  height: 80px;
  object-fit: cover;
  border-radius: 0.5rem;
  cursor: pointer;
  border: 2px solid ${props => props.active ? '#2563eb' : 'transparent'};
  transition: all 0.2s;
  
  &:hover {
    border-color: #2563eb;
  }
`;

const ProductInfo = styled.div``;

const ProductTitle = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 1rem;
  line-height: 1.2;
  
  @media (max-width: 768px) {
    font-size: 1.5rem;
  }
`;

const SellerInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
  color: #6b7280;
  font-size: 0.875rem;
`;

const Rating = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
`;

const RatingStars = styled.div`
  display: flex;
  color: #fbbf24;
`;

const RatingText = styled.span`
  color: #6b7280;
  font-size: 0.875rem;
`;

const PriceSection = styled.div`
  margin-bottom: 2rem;
`;

const CurrentPrice = styled.div`
  font-size: 2.5rem;
  font-weight: 700;
  color: #059669;
  
  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const OriginalPrice = styled.div`
  font-size: 1.25rem;
  color: #9ca3af;
  text-decoration: line-through;
  margin-top: 0.25rem;
`;

const Discount = styled.div`
  display: inline-block;
  background: #dc2626;
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  margin-top: 0.5rem;
`;

const Description = styled.div`
  margin-bottom: 2rem;
  
  h3 {
    font-size: 1.25rem;
    font-weight: 600;
    margin-bottom: 1rem;
    color: #1f2937;
  }
  
  p {
    color: #6b7280;
    line-height: 1.6;
    margin-bottom: 1rem;
  }
`;

const Features = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: #f9fafb;
  border-radius: 1rem;
`;

const Feature = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: #374151;
  font-size: 0.875rem;
`;

const FeatureIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  background: #2563eb;
  color: white;
  border-radius: 50%;
`;

const ActionSection = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const QuantitySelector = styled.div`
  display: flex;
  align-items: center;
  border: 2px solid #e5e7eb;
  border-radius: 0.5rem;
  overflow: hidden;
`;

const QuantityButton = styled.button`
  padding: 0.75rem 1rem;
  background: #f9fafb;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: #e5e7eb;
  }
  
  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
`;

const QuantityInput = styled.input`
  width: 4rem;
  padding: 0.75rem;
  border: none;
  text-align: center;
  font-weight: 600;
  
  &:focus {
    outline: none;
  }
`;

const AddToCartButton = styled.button`
  flex: 1;
  background: #2563eb;
  color: white;
  border: none;
  border-radius: 0.75rem;
  padding: 1rem 2rem;
  font-size: 1.125rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  
  &:hover {
    background: #1d4ed8;
  }
  
  &:disabled {
    background: #9ca3af;
    cursor: not-allowed;
  }
`;

const SecondaryButton = styled.button`
  padding: 1rem;
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 0.75rem;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    border-color: #2563eb;
    color: #2563eb;
  }
`;

const StockInfo = styled.div`
  font-size: 0.875rem;
  color: ${props => props.inStock ? '#059669' : '#dc2626'};
  font-weight: 600;
  margin-bottom: 1rem;
`;

const RelatedSection = styled.section`
  margin-top: 4rem;
`;

const SectionTitle = styled.h2`
  font-size: 1.875rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 2rem;
  text-align: center;
`;

const RelatedGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 2rem;
`;



const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { addToCart, loading: cartLoading } = useCart();
  
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [userRating, setUserRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);


  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const productDoc = await getDoc(doc(db, 'products', id));
        
        if (productDoc.exists()) {
          const productData = { id: productDoc.id, ...productDoc.data() };
          setProduct(productData);
          
          // Fetch related products
          if (productData.category) {
            const relatedQuery = query(
              collection(db, 'products'),
              where('category', '==', productData.category),
              limit(4)
            );
            const relatedSnapshot = await getDocs(relatedQuery);
            const related = relatedSnapshot.docs
              .map(doc => ({ id: doc.id, ...doc.data() }))
              .filter(p => p.id !== id);
            
            setRelatedProducts(related);
          }
        } else {
          toast.error('Product not found');
          navigate('/');
        }
      } catch (error) {
        console.error('Error fetching product:', error);
        toast.error('Failed to load product');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id, navigate]);

  const handleAddToCart = () => {
    if (!currentUser) {
      toast.error('Please login to add items to cart');
      navigate('/login');
      return;
    }

    addToCart(product, quantity);
  };

  const handleQuantityChange = (delta) => {
    const newQuantity = quantity + delta;
    if (newQuantity >= 1 && newQuantity <= (product?.stock || 1)) {
      setQuantity(newQuantity);
    }
  };



  const calculateDiscount = () => {
    if (product?.originalPrice && product?.price < product?.originalPrice) {
      return Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
    }
    return 0;
  };

  if (loading) {
    return (
      <Container>
        <LoadingSpinner>
          <div className="loading-spinner" />
          Loading product details...
        </LoadingSpinner>
      </Container>
    );
  }

  if (!product) {
    return (
      <Container>
        <div style={{ textAlign: 'center', padding: '4rem 0' }}>
          <h2>Product not found</h2>
          <p>The product you're looking for doesn't exist or has been removed.</p>
          <Link to="/" style={{ color: '#2563eb', textDecoration: 'underline' }}>
            Go back to homepage
          </Link>
        </div>
      </Container>
    );
  }

  const isOwnProduct = currentUser && product.sellerId === currentUser.uid;
  const discount = calculateDiscount();
  
  const submitRating = async (star) => {

    try {
      setSubmitting(true);
      const ratingRef = doc(db, 'products', product.id, 'ratings', currentUser.uid);
      await setDoc(ratingRef, {
        userId: currentUser.uid,
        rating: star,
        createdAt: serverTimestamp(),
      });
      setUserRating(star); 
      toast.success('Rating submitted');
    } catch (error) {
      console.error('Error submitting rating:', error);
      toast.error('Failed to submit rating');
    } finally {
      setSubmitting(false);
    }
};
  return (
    <Container>
      <BackButton to="/search">
        <ArrowLeft size={20} />
        Back to search
      </BackButton>

      <ProductMain>
        <ImageSection>
          {product.images && product.images.length > 0 ? (
            <>
              <MainImage 
                src={product.images[selectedImage]} 
                alt={product.name}
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextElementSibling.style.display = 'flex';
                }}
              />
              {product.images.length > 1 && (
                <ThumbnailGrid>
                  {product.images.map((image, index) => (
                    <Thumbnail
                      key={index}
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      active={selectedImage === index}
                      onClick={() => setSelectedImage(index)}
                    />
                  ))}
                </ThumbnailGrid>
              )}
            </>
          ) : (
            <ImagePlaceholder>
              No Image Available
            </ImagePlaceholder>
          )}
        </ImageSection>

        <ProductInfo>
          <SellerInfo>
            <User size={16} />
            Sold by {product.sellerName || 'Unknown Seller'}
          </SellerInfo>

          <ProductTitle>{product.name}</ProductTitle>

          {product.rating && (
            <Rating>
              <RatingStars>
                {[...Array(5)].map((_, index) => (
                  <Star 
                    key={index} 
                    size={16} 
                    fill={index < product.rating ? 'currentColor' : 'none'} 
                  />
                ))}
              </RatingStars>
              <span>{product.rating.toFixed(1)}</span>
              <RatingText>({product.reviewCount || 0} reviews)</RatingText>
            </Rating>
          )}

          <PriceSection>
            <CurrentPrice>{formatPrice(product.price)}</CurrentPrice>
            {product.originalPrice && product.originalPrice > product.price && (
              <>
                <OriginalPrice>{formatPrice(product.originalPrice)}</OriginalPrice>
                <Discount>{discount}% OFF</Discount>
              </>
            )}
          </PriceSection>

          <StockInfo inStock={product.stock > 0}>
            {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
          </StockInfo>

          <Features>
            <Feature>
              <FeatureIcon>
                <Truck size={16} />
              </FeatureIcon>
              <span>Free shipping on orders over $50</span>
            </Feature>
            <Feature>
              <FeatureIcon>
                <Shield size={16} />
              </FeatureIcon>
              <span>Secure payment</span>
            </Feature>
            <Feature>
              <FeatureIcon>
                <RotateCcw size={16} />
              </FeatureIcon>
              <span>30-day return policy</span>
            </Feature>
            <Feature>
              <FeatureIcon>
                <Clock size={16} />
              </FeatureIcon>
              <span>Fast delivery</span>
            </Feature>
          </Features>

          {!isOwnProduct && product.stock > 0 && (
            <ActionSection>
              <QuantitySelector>
                <QuantityButton 
                  onClick={() => handleQuantityChange(-1)}
                  disabled={quantity <= 1}
                >
                  -
                </QuantityButton>
                <QuantityInput 
                  type="number" 
                  value={quantity}
                  onChange={(e) => {
                    const value = parseInt(e.target.value) || 1;
                    if (value >= 1 && value <= product.stock) {
                      setQuantity(value);
                    }
                  }}
                  min="1"
                  max={product.stock}
                />
                <QuantityButton 
                  onClick={() => handleQuantityChange(1)}
                  disabled={quantity >= product.stock}
                >
                  +
                </QuantityButton>
              </QuantitySelector>

              <AddToCartButton 
                onClick={handleAddToCart}
                disabled={cartLoading}
              >
                <ShoppingCart size={20} />
                {cartLoading ? 'Adding...' : 'Add to Cart'}
              </AddToCartButton>

              <SecondaryButton>
                <Heart size={20} />
              </SecondaryButton>

              <SecondaryButton>
                <Share2 size={20} />
              </SecondaryButton>
            </ActionSection>
          )}

          {isOwnProduct && (
            <ActionSection>
              <AddToCartButton as={Link} to={`/seller/products/edit/${product.id}`}>
                <Package size={20} />
                Edit Product
              </AddToCartButton>
            </ActionSection>
          )}

          <Description>
            <h3>Description</h3>
            <p>{product.description}</p>
            <div style={{ marginTop: '2rem' }}></div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>
              Rate this product</h3>
              {currentUser ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                    key={star}
                    size={28}
                    style={{ cursor: 'pointer' }}
                    color={(hoverRating || userRating) >= star ? '#fbbf24' : '#d1d5db'}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => submitRating(star)}/>
                ))}
                {submitting && (
                  <div className="loading-spinner"style={{ width: '20px', height: '20px', borderWidth: '2px' }}></div>
                  )}
                </div>
                ) : (
                <p>Please <Link to="/login" style={{ color: '#2563eb' }}>login</Link> to rate this product.</p>
                )}
          </Description>

        </ProductInfo>
      </ProductMain>

      {relatedProducts.length > 0 && (
        <RelatedSection>
          <SectionTitle>Related Products</SectionTitle>
          <RelatedGrid>
            {relatedProducts.map(relatedProduct => (
              <ProductCard key={relatedProduct.id} product={relatedProduct} />
            ))}
          </RelatedGrid>
        </RelatedSection>
      )}
    </Container>
  );
};

export default ProductDetail;
