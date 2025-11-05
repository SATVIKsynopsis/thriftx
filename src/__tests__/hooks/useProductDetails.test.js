import { renderHook, act, waitFor } from '@testing-library/react';
import { useProductDetails } from '../../hooks/useProductDetails';

// Mock Next.js router
const mockPush = jest.fn();
const mockRouter = { push: mockPush };
jest.mock('next/navigation', () => ({
  useRouter: () => mockRouter
}));

// Mock Firebase
jest.mock('../../firebase/config', () => ({
  db: {}
}));

jest.mock('firebase/firestore', () => ({
  doc: jest.fn(() => ({ /* mock DocumentReference */ })),
  getDoc: jest.fn(),
  collection: jest.fn(),
  query: jest.fn(),
  limit: jest.fn(),
  getDocs: jest.fn(),
  setDoc: jest.fn(),
  serverTimestamp: jest.fn(() => ({ seconds: Date.now() / 1000, nanoseconds: 0 }))
}));

// Mock contexts
const mockCurrentUser = { uid: 'user123' };
const mockUseAuth = jest.fn(() => ({ currentUser: null }));
const mockUseCart = jest.fn(() => ({
  addToCart: jest.fn(),
  loading: false
}));

jest.mock('../../contexts/AuthContext', () => ({
  useAuth: () => mockUseAuth()
}));

jest.mock('../../contexts/CartContext', () => ({
  useCart: () => mockUseCart()
}));

// Mock toast
jest.mock('react-hot-toast', () => ({
  error: jest.fn(),
  success: jest.fn()
}));

const { doc, getDoc, collection, query, limit, getDocs, setDoc } = require('firebase/firestore');
const toast = require('react-hot-toast');

describe('useProductDetails', () => {
  let mockProduct;
  let mockRelatedProducts;
  let cartMock;

  beforeEach(() => {
    jest.clearAllMocks();

    mockProduct = {
      id: 'product123',
      name: 'Test Product',
      price: 99.99,
      originalPrice: 129.99,
      stock: 5,
      sellerId: 'seller456'
    };

    mockRelatedProducts = [
      { id: 'related1', name: 'Related 1' },
      { id: 'related2', name: 'Related 2' },
      { id: 'related3', name: 'Related 3' },
      { id: 'related4', name: 'Related 4' }
    ];

    cartMock = mockUseCart();

    // Mock Firebase responses
    getDoc.mockResolvedValue({
      exists: () => true,
      data: () => mockProduct
    });

    getDocs.mockResolvedValue({
      docs: mockRelatedProducts.map(product => ({
        data: () => product,
        id: product.id
      }))
    });
  });

  describe('initialization and loading states', () => {
    it('returns initial loading state', () => {
      const { result } = renderHook(() => useProductDetails(null));
      expect(result.current.loading).toBe(false);
      expect(result.current.product).toBe(null);
      expect(result.current.relatedProducts).toEqual([]);
    });

    it('loads product data on mount', async () => {
      const { result } = renderHook(() => useProductDetails('product123'));

      expect(result.current.loading).toBe(true);

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.product).toEqual({ id: 'product123', ...mockProduct });
      expect(result.current.relatedProducts).toHaveLength(4);
    });

    it('handles product not found', async () => {
      getDoc.mockResolvedValue({
        exists: () => false
      });

      const { result } = renderHook(() => useProductDetails('invalid'));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(toast.error).toHaveBeenCalledWith('Product not found');
      expect(mockRouter.push).toHaveBeenCalledWith('/');
    });

    it('handles fetch error', async () => {
      getDoc.mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => useProductDetails('product123'));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(toast.error).toHaveBeenCalledWith('Failed to load product');
    });
  });

  describe('initial state', () => {
    it('sets initial quantity to 1', () => {
      const { result } = renderHook(() => useProductDetails('product123'));
      expect(result.current.quantity).toBe(1);
    });

    it('sets initial selected states', () => {
      const { result } = renderHook(() => useProductDetails('product123'));
      expect(result.current.selectedImage).toBe(0);
      expect(result.current.selectedColor).toBe(0);
      expect(result.current.selectedSize).toBe('Medium');
      expect(result.current.userRating).toBe(0);
      expect(result.current.hoverRating).toBe(0);
      expect(result.current.submitting).toBe(false);
    });
  });

  describe('quantity management', () => {
    it('increases quantity', async () => {
      cartMock = { addToCart: jest.fn(), loading: false };
      mockUseCart.mockReturnValue(cartMock);

      const { result } = renderHook(() => useProductDetails('product123'));

      await waitFor(() => {
        expect(result.current.product).toBeTruthy();
      });

      act(() => {
        result.current.handleQuantityChange(1);
      });

      expect(result.current.quantity).toBe(2);
    });

    it('decreases quantity', async () => {
      cartMock = { addToCart: jest.fn(), loading: false };
      mockUseCart.mockReturnValue(cartMock);

      const { result } = renderHook(() => useProductDetails('product123'));

      await waitFor(() => {
        expect(result.current.product).toBeTruthy();
      });

      act(() => {
        result.current.setQuantity(3);
      });

      expect(result.current.quantity).toBe(3);

      act(() => {
        result.current.handleQuantityChange(-1);
      });

      expect(result.current.quantity).toBe(2);
    });

    it('does not go below 1', async () => {
      const { result } = renderHook(() => useProductDetails('product123'));

      await waitFor(() => {
        expect(result.current.product).toBeTruthy();
      });

      act(() => {
        result.current.setQuantity(1);
      });

      expect(result.current.quantity).toBe(1);

      act(() => {
        result.current.handleQuantityChange(-1);
      });

      expect(result.current.quantity).toBe(1);
    });

    it('does not exceed stock', async () => {
      const { result } = renderHook(() => useProductDetails('product123'));

      await waitFor(() => {
        expect(result.current.product).toBeTruthy();
      });

      // Test setting quantity directly
      act(() => {
        result.current.setQuantity(2);
      });

      expect(result.current.quantity).toBe(2);

      // Test quantity increase (2 + 1 = 3, should work since stock = 5)
      act(() => {
        result.current.handleQuantityChange(1);
      });

      expect(result.current.quantity).toBe(3); // Should be 3

      // Test trying to exceed stock (3 + 2 = 5, should be allowed since stock = 5)
      act(() => {
        result.current.setQuantity(3);
        result.current.handleQuantityChange(2);
      });

      expect(result.current.quantity).toBe(5); // Should be 5 (at stock limit)

      // Test exceeding stock should be prevented (5 + 1 = 6, should not allow)
      act(() => {
        result.current.handleQuantityChange(1);
      });

      expect(result.current.quantity).toBe(5); // Should stay at 5 (stock limit)
    });
  });

  describe('selection management', () => {
    it('updates selected image', () => {
      const { result } = renderHook(() => useProductDetails('product123'));

      act(() => {
        result.current.setSelectedImage(2);
      });

      expect(result.current.selectedImage).toBe(2);
    });

    it('updates selected color', () => {
      const { result } = renderHook(() => useProductDetails('product123'));

      act(() => {
        result.current.setSelectedColor(3);
      });

      expect(result.current.selectedColor).toBe(3);
    });

    it('updates selected size', () => {
      const { result } = renderHook(() => useProductDetails('product123'));

      act(() => {
        result.current.setSelectedSize('Large');
      });

      expect(result.current.selectedSize).toBe('Large');
    });

    it('updates rating hover state', () => {
      const { result } = renderHook(() => useProductDetails('product123'));

      act(() => {
        result.current.setHoverRating(4);
      });

      expect(result.current.hoverRating).toBe(4);
    });
  });

  describe('cart functionality', () => {
    beforeEach(() => {
      cartMock = { addToCart: jest.fn(), loading: false };
      mockUseCart.mockReturnValue(cartMock);
    });

    it('adds product to cart when user is logged in', async () => {
      mockUseAuth.mockReturnValue({ currentUser: mockCurrentUser });

      const { result } = renderHook(() => useProductDetails('product123'));

      await waitFor(() => {
        expect(result.current.product).toBeTruthy();
      });

      act(() => {
        result.current.handleAddToCart();
      });

      expect(cartMock.addToCart).toHaveBeenCalledWith(
        { id: 'product123', ...mockProduct },
        1, // quantity
        0, // selectedColor
        'Medium' // selectedSize
      );
    });

    it('redirects to login when user not authenticated', async () => {
      mockUseAuth.mockReturnValue({ currentUser: null });

      const { result } = renderHook(() => useProductDetails('product123'));

      await waitFor(() => {
        expect(result.current.product).toBeTruthy();
      });

      act(() => {
        result.current.handleAddToCart();
      });

      expect(toast.error).toHaveBeenCalledWith('Please login to add items to cart');
      expect(mockRouter.push).toHaveBeenCalledWith('/login');
      expect(cartMock.addToCart).not.toHaveBeenCalled();
    });

    it('does nothing when no product loaded', () => {
      const { result } = renderHook(() => useProductDetails(null));

      act(() => {
        result.current.handleAddToCart();
      });

      expect(cartMock.addToCart).not.toHaveBeenCalled();
    });
  });

  describe('discount calculation', () => {
    it('calculates discount percentage', async () => {
      const { result } = renderHook(() => useProductDetails('product123'));

      await waitFor(() => {
        expect(result.current.product).toBeTruthy();
      });

      // 30 / 130 = 0.230769 ≈ 23%
      expect(result.current.discount).toBe(23);
    });

    it('returns 0 when no discount', async () => {
      mockProduct.price = 129.99;
      mockProduct.originalPrice = 129.99;

      const { result } = renderHook(() => useProductDetails('product123'));

      await waitFor(() => {
        expect(result.current.product).toBeTruthy();
      });

      expect(result.current.discount).toBe(0);
    });

    it('returns 0 when no original price', async () => {
      mockProduct.originalPrice = null;

      const { result } = renderHook(() => useProductDetails('product123'));

      await waitFor(() => {
        expect(result.current.product).toBeTruthy();
      });

      expect(result.current.discount).toBe(0);
    });
  });

  describe('rating submission', () => {
    it('submits rating successfully', async () => {
      mockUseAuth.mockReturnValue({ currentUser: mockCurrentUser });
      setDoc.mockResolvedValue();

      const { result } = renderHook(() => useProductDetails('product123'));

      await waitFor(() => {
        expect(result.current.product).toBeTruthy();
      });

      await act(async () => {
        result.current.submitRating(5);
      });

      // Verify setDoc was called with the rating data
      expect(setDoc).toHaveBeenCalledWith(
        expect.any(Object), // Firestore DocumentReference from doc() call
        {
          userId: 'user123',
          rating: 5,
          createdAt: expect.any(Object) // serverTimestamp mock return value
        }
      );

      expect(result.current.userRating).toBe(5);
      expect(result.current.submitting).toBe(false);
      expect(toast.success).toHaveBeenCalledWith('Rating submitted');
    });

    it('handles rating submission error', async () => {
      mockUseAuth.mockReturnValue({ currentUser: mockCurrentUser });
      setDoc.mockRejectedValue(new Error('Submit failed'));

      const { result } = renderHook(() => useProductDetails('product123'));

      await waitFor(() => {
        expect(result.current.product).toBeTruthy();
      });

      act(() => {
        result.current.submitRating(4);
      });

      await waitFor(() => {
        expect(result.current.submitting).toBe(false);
      });

      expect(toast.error).toHaveBeenCalledWith('Failed to submit rating');
    });

    it('prevents rating submission when not logged in', async () => {
      mockUseAuth.mockReturnValue({ currentUser: null });

      const { result } = renderHook(() => useProductDetails('product123'));

      await waitFor(() => {
        expect(result.current.product).toBeTruthy();
      });

      act(() => {
        result.current.submitRating(3);
      });

      expect(setDoc).not.toHaveBeenCalled();
    });
  });

  describe('product ownership', () => {
    it('identifies own product', async () => {
      mockUseAuth.mockReturnValue({ currentUser: mockCurrentUser });
      mockProduct.sellerId = 'user123'; // Same as current user

      const { result } = renderHook(() => useProductDetails('product123'));

      await waitFor(() => {
        expect(result.current.product).toBeTruthy();
      });

      expect(result.current.isOwnProduct).toBe(true);
    });

    it('identifies not own product', async () => {
      mockUseAuth.mockReturnValue({ currentUser: mockCurrentUser });
      mockProduct.sellerId = 'differentSeller';

      const { result } = renderHook(() => useProductDetails('product123'));

      await waitFor(() => {
        expect(result.current.product).toBeTruthy();
      });

      expect(result.current.isOwnProduct).toBe(false);
    });

    it('handles no current user', async () => {
      mockUseAuth.mockReturnValue({ currentUser: null });

      const { result } = renderHook(() => useProductDetails('product123'));

      await waitFor(() => {
        expect(result.current.product).toBeTruthy();
      });

      expect(result.current.isOwnProduct).toBe(false);
    });
  });

  describe('returned values', () => {
    it('returns all expected state values', async () => {
      mockUseAuth.mockReturnValue({ currentUser: mockCurrentUser });
      mockUseCart.mockReturnValue({
        addToCart: jest.fn(),
        loading: true
      });

      const { result } = renderHook(() => useProductDetails('product123'));

      await waitFor(() => {
        expect(result.current.product).toBeTruthy();
      });

      expect(result.current).toEqual(
        expect.objectContaining({
          product: expect.objectContaining({ id: 'product123' }),
          relatedProducts: expect.any(Array),
          loading: false,
          quantity: 1,
          selectedImage: 0,
          selectedColor: 0,
          selectedSize: 'Medium',
          userRating: 0,
          hoverRating: 0,
          submitting: false,
          cartLoading: true,
          isOwnProduct: false,
          discount: expect.any(Number),
          setQuantity: expect.any(Function),
          setSelectedImage: expect.any(Function),
          setSelectedColor: expect.any(Function),
          setSelectedSize: expect.any(Function),
          setHoverRating: expect.any(Function),
          handleAddToCart: expect.any(Function),
          handleQuantityChange: expect.any(Function),
          submitRating: expect.any(Function)
        })
      );
    });
  });
});
