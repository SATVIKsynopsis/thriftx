import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import RatingSection from '../../components/products/RatingSection';
import ReviewForm from '../../components/products/ReviewForm';

// Mock Firebase
jest.mock('../../firebase/config', () => ({
  db: {}
}));

const mockUnsubscribe = jest.fn();
jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  query: jest.fn(),
  onSnapshot: jest.fn((query, callback) => {
    // Immediately call the callback with empty data to avoid loading state
    callback({
      docs: []
    });
    return mockUnsubscribe; // Return the unsubscribe function
  }),
  addDoc: jest.fn(),
  orderBy: jest.fn(),
  serverTimestamp: jest.fn(() => ({ seconds: Date.now() / 1000, nanoseconds: 0 }))
}));

// Mock Auth Context
const mockUseAuth = jest.fn();
jest.mock('../../contexts/AuthContext', () => ({
  useAuth: () => mockUseAuth()
}));

// Mock ReviewForm
jest.mock('../../components/products/ReviewForm', () => {
  return function MockReviewForm({ onSubmit, onCancel }) {
    return (
      <div data-testid="review-form">
        <button
          onClick={() => onSubmit({ rating: 5, text: 'Great product!' })}
          data-testid="submit-review"
        >
          Submit Review
        </button>
        <button onClick={onCancel} data-testid="cancel-review">
          Cancel
        </button>
      </div>
    );
  };
});

// Mock Next.js Link
jest.mock('next/link', () => {
  return function MockLink({ children }) {
    return <a>{children}</a>;
  };
});

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  Star: () => <div data-testid="star" />,
  ChevronDown: ({ className }) => <div data-testid="chevron-down" className={className} />
}));

const mockProduct = {
  id: 'product-1',
  name: 'Test Product',
  description: 'This is a great test product',
  reviewCount: 3
};

const mockUser = {
  uid: 'user-123',
  displayName: 'Test User',
  email: 'test@example.com'
};

const mockReviews = [
  {
    id: 'review-1',
    rating: 5,
    text: 'Amazing product!',
    userId: 'user-456',
    userName: 'Reviewer 1',
    createdAt: { toDate: () => new Date('2024-01-15') }
  },
  {
    id: 'review-2',
    rating: 4,
    text: 'Good quality',
    userId: 'user-789',
    userName: 'Reviewer 2',
    createdAt: { toDate: () => new Date('2024-01-10') }
  }
];

describe('RatingSection', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    mockUseAuth.mockReturnValue({ currentUser: null });
    render(<RatingSection product={mockProduct} />);
    expect(screen.getByText('Product Details')).toBeInTheDocument();
  });

  it('returns null when no product is provided', () => {
    const { container } = render(<RatingSection product={null} />);
    expect(container.firstChild).toBeNull();
  });

  describe('tab navigation', () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({ currentUser: null });
    });

    it('shows product details by default', () => {
      render(<RatingSection product={mockProduct} />);
      expect(screen.getByText('This is a great test product')).toBeInTheDocument();
    });

    it('switches to reviews tab', () => {
      render(<RatingSection product={mockProduct} />);
      fireEvent.click(screen.getByText(/Rating & Reviews/));
      expect(screen.getByText('Customer Reviews')).toBeInTheDocument();
    });

    it('switches to FAQs tab', () => {
      render(<RatingSection product={mockProduct} />);
      fireEvent.click(screen.getByText('FAQs'));
      expect(screen.getByText('What are your shipping options?')).toBeInTheDocument();
    });
  });

  describe('auth functionality', () => {
    it('shows login prompt when user is not authenticated', () => {
      mockUseAuth.mockReturnValue({ currentUser: null });
      render(<RatingSection product={mockProduct} />);
      fireEvent.click(screen.getByText(/Rating & Reviews/));
      expect(screen.getByText('Login')).toBeInTheDocument();
    });

    it('shows write review button when user is authenticated', () => {
      mockUseAuth.mockReturnValue({ currentUser: mockUser });
      render(<RatingSection product={mockProduct} />);
      fireEvent.click(screen.getByText(/Rating & Reviews/));
      expect(screen.getByText('Write a Review')).toBeInTheDocument();
    });

    it('opens review form when write review button is clicked', () => {
      mockUseAuth.mockReturnValue({ currentUser: mockUser });
      render(<RatingSection product={mockProduct} />);
      fireEvent.click(screen.getByText(/Rating & Reviews/));
      fireEvent.click(screen.getByText('Write a Review'));

      expect(screen.getByTestId('review-form')).toBeInTheDocument();
    });
  });

  describe('FAQ functionality', () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({ currentUser: null });
    });

    it('renders all FAQ questions', () => {
      render(<RatingSection product={mockProduct} />);
      fireEvent.click(screen.getByText('FAQs'));

      expect(screen.getByText('What are your shipping options?')).toBeInTheDocument();
      expect(screen.getByText('How can I track my order?')).toBeInTheDocument();
      expect(screen.getByText('What is your return policy?')).toBeInTheDocument();
      expect(screen.getByText('What payment methods do you accept?')).toBeInTheDocument();
    });

    it('expands FAQ answers when clicked', () => {
      render(<RatingSection product={mockProduct} />);
      fireEvent.click(screen.getByText('FAQs'));

      const firstQuestion = screen.getByText('What are your shipping options?');
      fireEvent.click(firstQuestion);

      expect(screen.getByText(/We offer free standard shipping/)).toBeInTheDocument();
    });

    it('collapses other FAQs when one is opened', () => {
      render(<RatingSection product={mockProduct} />);
      fireEvent.click(screen.getByText('FAQs'));

      // Open first FAQ
      const firstQuestion = screen.getByText('What are your shipping options?');
      fireEvent.click(firstQuestion);
      expect(screen.getByText(/We offer free standard shipping/)).toBeInTheDocument();

      // Open second FAQ
      const secondQuestion = screen.getByText('How can I track my order?');
      fireEvent.click(secondQuestion);

      // First answer should still be visible, second should appear
      expect(screen.getAllByText(/Once your order has been shipped/)).toHaveLength(1);
    });
  });

  describe('styling', () => {
    it('applies custom className', () => {
      mockUseAuth.mockReturnValue({ currentUser: null });
      const { container } = render(<RatingSection product={mockProduct} className="custom-class" />);
      expect(container.firstChild).toHaveClass('custom-class');
    });
  });

  // Integration tests with mocked Firebase would go here
  // Note: Firebase mocking requires more complex setup for real integration tests
});
