import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useForm } from 'react-hook-form';
import { CreditCard, MapPin, User, Mail, Phone, CheckCircle } from 'lucide-react';
import { collection, addDoc, serverTimestamp, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { formatPrice } from '../utils/formatters';
import toast from 'react-hot-toast';

const CheckoutContainer = styled.div`
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

const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 2rem;
  text-align: center;
`;

const CheckoutContent = styled.div`
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: 2rem;
  
  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
`;

const CheckoutForm = styled.form`
  background: white;
  border-radius: 1rem;
  padding: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
`;

const Section = styled.div`
  margin-bottom: 2rem;
`;

const SectionTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: ${props => props.columns || '1fr'};
  gap: 1rem;
  margin-bottom: 1rem;
`;

const FormGroup = styled.div``;

const Label = styled.label`
  display: block;
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.5rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 0.5rem;
  font-size: 1rem;
  transition: all 0.2s;
  
  &:focus {
    outline: none;
    border-color: #2563eb;
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
  }
  
  &.error {
    border-color: #ef4444;
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 0.75rem 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 0.5rem;
  font-size: 1rem;
  background: white;
  transition: all 0.2s;
  
  &:focus {
    outline: none;
    border-color: #2563eb;
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
  }
  
  &.error {
    border-color: #ef4444;
  }
`;

const ErrorMessage = styled.span`
  color: #ef4444;
  font-size: 0.875rem;
  margin-top: 0.25rem;
  display: block;
`;

const OrderSummary = styled.div`
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

const OrderItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 0;
  border-bottom: 1px solid #e5e7eb;
  
  &:last-child {
    border-bottom: none;
  }
`;

const ItemInfo = styled.div`
  flex: 1;
`;

const ItemName = styled.div`
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 0.25rem;
`;

const ItemDetails = styled.div`
  font-size: 0.875rem;
  color: #6b7280;
`;

const ItemPrice = styled.div`
  font-weight: 600;
  color: #059669;
`;

const SummaryRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin: 1rem 0;
  
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

const PlaceOrderButton = styled.button`
  width: 100%;
  background: #2563eb;
  color: white;
  border: none;
  border-radius: 0.75rem;
  padding: 1rem 2rem;
  font-size: 1.125rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  margin-top: 1.5rem;
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

const PaymentMethods = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
`;

const PaymentMethod = styled.div`
  padding: 1rem;
  border: 2px solid ${props => props.selected ? '#2563eb' : '#e5e7eb'};
  border-radius: 0.5rem;
  cursor: pointer;
  text-align: center;
  transition: all 0.2s;
  
  &:hover {
    border-color: #2563eb;
  }
`;

const Checkout = () => {
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const { currentUser } = useAuth();
  const { cartItems, getCartTotal, clearCart } = useCart();
  const navigate = useNavigate();
  
  const { register, handleSubmit, formState: { errors } } = useForm();



  const subtotal = getCartTotal();
  const shipping = subtotal > 50 ? 0 : 9.99;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  const sellerId = cartItems.length > 0 ? cartItems[0].sellerId : null;

  const onSubmit = async (data) => {
    setLoading(true);
    if (!sellerId) {
      toast.error("Seller information is missing. Cannot place order.");
      setLoading(false);
      return;
    }
    
    
    // For debugging
    console.log("Placing order for seller:", sellerId);

    try {
     const enrichedItems = await Promise.all(
      cartItems.map(async (item) => {
     const productRef = doc(db, 'products', item.productId); // ✅ use productId
     const productSnap = await getDoc(productRef);
    if (productSnap.exists()) {
      const productData = productSnap.data();
      return {
        ...item,
        category: productData.category || 'Uncategorized',
      };
    }
    return { ...item, category: 'Uncategorized' };
  })
);
      // Create order document
      const orderData = {
        buyerId: currentUser.uid,
        buyerInfo: data,
        sellerId: sellerId,
        items: enrichedItems,
        subtotal,
        shipping,
        tax,
        total,
        paymentMethod,
        status: 'pending',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      const orderRef = await addDoc(collection(db, 'orders'), orderData);
      
      // In a real application, you would integrate with a payment processor here
      // For demo purposes, we'll simulate a successful payment
      
      // Clear the cart
      await clearCart();
      
      toast.success('Order placed successfully!');
      navigate(`/orders`);
      
    } catch (error) {
      console.error('Error placing order:', error);
      toast.error('Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <CheckoutContainer>
        <Container>
          <div style={{ textAlign: 'center', padding: '4rem 0' }}>
            <h2>Your cart is empty</h2>
            <p>Add some items to proceed with checkout</p>
          </div>
        </Container>
      </CheckoutContainer>
    );
  }

  return (
    <CheckoutContainer>
      <Container>
        <Title>Checkout</Title>
        
        <CheckoutContent>
          <CheckoutForm onSubmit={handleSubmit(onSubmit)}>
            <Section>
              <SectionTitle>
                <User size={20} />
                Contact Information
              </SectionTitle>
              
              <FormRow columns="1fr 1fr">
                <FormGroup>
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    {...register('firstName', { required: 'First name is required' })}
                    className={errors.firstName ? 'error' : ''}
                  />
                  {errors.firstName && <ErrorMessage>{errors.firstName.message}</ErrorMessage>}
                </FormGroup>
                
                <FormGroup>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    {...register('lastName', { required: 'Last name is required' })}
                    className={errors.lastName ? 'error' : ''}
                  />
                  {errors.lastName && <ErrorMessage>{errors.lastName.message}</ErrorMessage>}
                </FormGroup>
              </FormRow>
              
              <FormRow>
                <FormGroup>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    defaultValue={currentUser?.email}
                    {...register('email', { 
                      required: 'Email is required',
                      pattern: {
                        value: /^\S+@\S+$/i,
                        message: 'Invalid email address'
                      }
                    })}
                    className={errors.email ? 'error' : ''}
                  />
                  {errors.email && <ErrorMessage>{errors.email.message}</ErrorMessage>}
                </FormGroup>
              </FormRow>
              
              <FormRow>
                <FormGroup>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    {...register('phone', { required: 'Phone number is required' })}
                    className={errors.phone ? 'error' : ''}
                  />
                  {errors.phone && <ErrorMessage>{errors.phone.message}</ErrorMessage>}
                </FormGroup>
              </FormRow>
            </Section>

            <Section>
              <SectionTitle>
                <MapPin size={20} />
                Shipping Address
              </SectionTitle>
              
              <FormRow>
                <FormGroup>
                  <Label htmlFor="address">Street Address</Label>
                  <Input
                    id="address"
                    {...register('address', { required: 'Address is required' })}
                    className={errors.address ? 'error' : ''}
                  />
                  {errors.address && <ErrorMessage>{errors.address.message}</ErrorMessage>}
                </FormGroup>
              </FormRow>
              
              <FormRow columns="2fr 1fr 1fr">
                <FormGroup>
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    {...register('city', { required: 'City is required' })}
                    className={errors.city ? 'error' : ''}
                  />
                  {errors.city && <ErrorMessage>{errors.city.message}</ErrorMessage>}
                </FormGroup>
                
                <FormGroup>
                  <Label htmlFor="state">State</Label>
                  <Select
                    id="state"
                    {...register('state', { required: 'State is required' })}
                    className={errors.state ? 'error' : ''}
                  >
                    <option value="">Select State</option>
                    <option value="CA">California</option>
                    <option value="NY">New York</option>
                    <option value="TX">Texas</option>
                    <option value="FL">Florida</option>
                    {/* Add more states as needed */}
                  </Select>
                  {errors.state && <ErrorMessage>{errors.state.message}</ErrorMessage>}
                </FormGroup>
                
                <FormGroup>
                  <Label htmlFor="zipCode">ZIP Code</Label>
                  <Input
                    id="zipCode"
                    {...register('zipCode', { required: 'ZIP code is required' })}
                    className={errors.zipCode ? 'error' : ''}
                  />
                  {errors.zipCode && <ErrorMessage>{errors.zipCode.message}</ErrorMessage>}
                </FormGroup>
              </FormRow>
            </Section>

            <Section>
              <SectionTitle>
                <CreditCard size={20} />
                Payment Method
              </SectionTitle>
              
              <PaymentMethods>
                <PaymentMethod 
                  selected={paymentMethod === 'card'}
                  onClick={() => setPaymentMethod('card')}
                >
                  <CreditCard size={24} style={{ margin: '0 auto 0.5rem' }} />
                  <div>Credit Card</div>
                </PaymentMethod>
                <PaymentMethod 
                  selected={paymentMethod === 'paypal'}
                  onClick={() => setPaymentMethod('paypal')}
                >
                  <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>PayPal</div>
                </PaymentMethod>
              </PaymentMethods>
              
              {paymentMethod === 'card' && (
                <>
                  <FormRow style={{ marginTop: '1rem' }}>
                    <FormGroup>
                      <Label htmlFor="cardNumber">Card Number</Label>
                      <Input
                        id="cardNumber"
                        placeholder="1234 5678 9012 3456"
                        {...register('cardNumber', { required: 'Card number is required' })}
                        className={errors.cardNumber ? 'error' : ''}
                      />
                      {errors.cardNumber && <ErrorMessage>{errors.cardNumber.message}</ErrorMessage>}
                    </FormGroup>
                  </FormRow>
                  
                  <FormRow columns="1fr 1fr 1fr">
                    <FormGroup>
                      <Label htmlFor="expiryMonth">Expiry Month</Label>
                      <Select
                        id="expiryMonth"
                        {...register('expiryMonth', { required: 'Expiry month is required' })}
                        className={errors.expiryMonth ? 'error' : ''}
                      >
                        <option value="">Month</option>
                        {[...Array(12)].map((_, i) => (
                          <option key={i + 1} value={i + 1}>
                            {(i + 1).toString().padStart(2, '0')}
                          </option>
                        ))}
                      </Select>
                      {errors.expiryMonth && <ErrorMessage>{errors.expiryMonth.message}</ErrorMessage>}
                    </FormGroup>
                    
                    <FormGroup>
                      <Label htmlFor="expiryYear">Expiry Year</Label>
                      <Select
                        id="expiryYear"
                        {...register('expiryYear', { required: 'Expiry year is required' })}
                        className={errors.expiryYear ? 'error' : ''}
                      >
                        <option value="">Year</option>
                        {[...Array(10)].map((_, i) => {
                          const year = new Date().getFullYear() + i;
                          return (
                            <option key={year} value={year}>
                              {year}
                            </option>
                          );
                        })}
                      </Select>
                      {errors.expiryYear && <ErrorMessage>{errors.expiryYear.message}</ErrorMessage>}
                    </FormGroup>
                    
                    <FormGroup>
                      <Label htmlFor="cvv">CVV</Label>
                      <Input
                        id="cvv"
                        placeholder="123"
                        {...register('cvv', { required: 'CVV is required' })}
                        className={errors.cvv ? 'error' : ''}
                      />
                      {errors.cvv && <ErrorMessage>{errors.cvv.message}</ErrorMessage>}
                    </FormGroup>
                  </FormRow>
                </>
              )}
            </Section>
          </CheckoutForm>

          <OrderSummary>
            <SummaryTitle>Order Summary</SummaryTitle>
            
            {cartItems.map((item) => (
              <OrderItem key={item.id}>
                <ItemInfo>
                  <ItemName>{item.productName}</ItemName>
                  <ItemDetails>Qty: {item.quantity}</ItemDetails>
                </ItemInfo>
                <ItemPrice>{formatPrice(item.price * item.quantity)}</ItemPrice>
              </OrderItem>
            ))}
            
            <SummaryRow>
              <SummaryLabel>Subtotal</SummaryLabel>
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

            <PlaceOrderButton 
              onClick={handleSubmit(onSubmit)}
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="loading-spinner" />
                  Processing...
                </>
              ) : (
                <>
                  <CheckCircle size={20} />
                  Place Order
                </>
              )}
            </PlaceOrderButton>
          </OrderSummary>
        </CheckoutContent>
      </Container>
    </CheckoutContainer>
  );
};

export default Checkout;
