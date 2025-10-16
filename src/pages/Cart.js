import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { formatPrice } from '../utils/formatters';

const CartContainer = styled.div`
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
  align-items: center;
  justify-content: between;
  margin-bottom: 2rem;
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

const CartContent = styled.div`
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: 2rem;
  
  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
`;

const CartItems = styled.div`
  background: white;
  border-radius: 1rem;
  padding: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
`;

const CartItem = styled.div`
  display: grid;
  grid-template-columns: 120px 1fr auto;
  gap: 1.5rem;
  padding: 1.5rem 0;
  border-bottom: 1px solid #e5e7eb;
  
  &:last-child {
    border-bottom: none;
  }
  
  @media (max-width: 768px) {
    grid-template-columns: 80px 1fr;
    gap: 1rem;
  }
`;

const ItemImage = styled.img`
  width: 120px;
  height: 120px;
  object-fit: cover;
  border-radius: 0.75rem;
  
  @media (max-width: 768px) {
    width: 80px;
    height: 80px;
  }
`;

const ItemImagePlaceholder = styled.div`
  width: 120px;
  height: 120px;
  background: #f3f4f6;
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #9ca3af;
  font-size: 0.75rem;
  text-align: center;
  
  @media (max-width: 768px) {
    width: 80px;
    height: 80px;
    font-size: 0.625rem;
  }
`;

const ItemDetails = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;

const ItemName = styled(Link)`
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
  text-decoration: none;
  margin-bottom: 0.5rem;
  
  &:hover {
    color: #2563eb;
  }
`;

const ItemSeller = styled.p`
  font-size: 0.875rem;
  color: #6b7280;
  margin-bottom: 0.5rem;
`;

const ItemPrice = styled.div`
  font-size: 1.25rem;
  font-weight: 700;
  color: #059669;
`;

const ItemActions = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: space-between;
  
  @media (max-width: 768px) {
    grid-column: 1 / -1;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    margin-top: 1rem;
  }
`;

const QuantityControls = styled.div`
  display: flex;
  align-items: center;
  border: 2px solid #e5e7eb;
  border-radius: 0.5rem;
  overflow: hidden;
`;

const QuantityButton = styled.button`
  padding: 0.5rem 0.75rem;
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

const QuantityDisplay = styled.span`
  padding: 0.5rem 1rem;
  font-weight: 600;
  background: white;
  min-width: 3rem;
  text-align: center;
`;

const RemoveButton = styled.button`
  background: none;
  border: none;
  color: #ef4444;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 0.5rem;
  transition: all 0.2s;
  
  &:hover {
    background: #fef2f2;
  }
`;

const CartSummary = styled.div`
  background: white;
  border-radius: 1rem;
  padding: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  height: fit-content;
  position: sticky;
  top: 2rem;
`;

const SummaryTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 1.5rem;
`;

const SummaryRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
  
  &.total {
    font-size: 1.25rem;
    font-weight: 700;
    color: #1f2937;
    padding-top: 1rem;
    border-top: 2px solid #e5e7eb;
  }
`;

const SummaryLabel = styled.span`
  color: #6b7280;
`;

const SummaryValue = styled.span`
  font-weight: 600;
  color: #1f2937;
`;

const CheckoutButton = styled(Link)`
  display: block;
  width: 100%;
  background: #2563eb;
  color: white;
  text-align: center;
  padding: 1rem 2rem;
  border-radius: 0.75rem;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.2s;
  margin-top: 1.5rem;
  
  &:hover {
    background: #1d4ed8;
  }
`;

const EmptyCart = styled.div`
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

const ShopButton = styled(Link)`
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
  }
`;

const Cart = () => {
  const { cartItems, removeFromCart, updateQuantity, getCartTotal, getItemCount } = useCart();
  const { currentUser } = useAuth();
  const navigate = useNavigate();



  const subtotal = getCartTotal();
  const shipping = subtotal > 50 ? 0 : 9.99;
  const tax = subtotal * 0.08; // 8% tax
  const total = subtotal + shipping + tax;

  if (!currentUser) {
    return (
      <CartContainer>
        <Container>
          <EmptyCart>
            <EmptyIcon>
              <ShoppingBag size={40} />
            </EmptyIcon>
            <EmptyTitle>Please Login</EmptyTitle>
            <EmptyText>You need to be logged in to view your cart</EmptyText>
            <ShopButton to="/login">
              Login
            </ShopButton>
          </EmptyCart>
        </Container>
      </CartContainer>
    );
  }

  if (cartItems.length === 0) {
    return (
      <CartContainer>
        <Container>
          <BackButton to="/search">
            <ArrowLeft size={20} />
            Continue Shopping
          </BackButton>
          
          <EmptyCart>
            <EmptyIcon>
              <ShoppingBag size={40} />
            </EmptyIcon>
            <EmptyTitle>Your cart is empty</EmptyTitle>
            <EmptyText>Add some products to get started</EmptyText>
            <ShopButton to="/search">
              <ShoppingBag size={20} />
              Start Shopping
            </ShopButton>
          </EmptyCart>
        </Container>
      </CartContainer>
    );
  }

  return (
    <CartContainer>
      <Container>
        <BackButton to="/search">
          <ArrowLeft size={20} />
          Continue Shopping
        </BackButton>

        <Header>
          <div>
            <Title>Shopping Cart</Title>
            <Subtitle>{getItemCount()} items in your cart</Subtitle>
          </div>
        </Header>

        <CartContent>
          <CartItems>
            {cartItems.map((item) => (
              <CartItem key={item.id}>
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
                  <div>
                    <ItemName to={`/product/${item.productId}`}>
                      {item.productName}
                    </ItemName>
                    <ItemSeller>Sold by seller</ItemSeller>
                  </div>
                  <ItemPrice>{formatPrice(item.price)}</ItemPrice>
                </ItemDetails>

                <ItemActions>
                  <RemoveButton 
                    onClick={() => removeFromCart(item.id)}
                    title="Remove item"
                  >
                    <Trash2 size={20} />
                  </RemoveButton>

                  <QuantityControls>
                    <QuantityButton 
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                    >
                      <Minus size={16} />
                    </QuantityButton>
                    <QuantityDisplay>{item.quantity}</QuantityDisplay>
                    <QuantityButton 
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    >
                      <Plus size={16} />
                    </QuantityButton>
                  </QuantityControls>
                </ItemActions>
              </CartItem>
            ))}
          </CartItems>

          <CartSummary>
            <SummaryTitle>Order Summary</SummaryTitle>
            
            <SummaryRow>
              <SummaryLabel>Subtotal ({getItemCount()} items)</SummaryLabel>
              <SummaryValue>{formatPrice(subtotal)}</SummaryValue>
            </SummaryRow>
            
            <SummaryRow>
              <SummaryLabel>Shipping</SummaryLabel>
              <SummaryValue>
                {shipping === 0 ? 'FREE' : formatPrice(shipping)}
              </SummaryValue>
            </SummaryRow>
            
            <SummaryRow>
              <SummaryLabel>Tax</SummaryLabel>
              <SummaryValue>{formatPrice(tax)}</SummaryValue>
            </SummaryRow>
            
            <SummaryRow className="total">
              <SummaryLabel>Total</SummaryLabel>
              <SummaryValue>{formatPrice(total)}</SummaryValue>
            </SummaryRow>

            <CheckoutButton to="/checkout">
              Proceed to Checkout
            </CheckoutButton>

            {subtotal < 50 && (
              <p style={{ 
                fontSize: '0.875rem', 
                color: '#6b7280', 
                marginTop: '1rem',
                textAlign: 'center'
              }}>
                Add {formatPrice(50 - subtotal)} more for free shipping
              </p>
            )}
          </CartSummary>
        </CartContent>
      </Container>
    </CartContainer>
  );
};

export default Cart;
