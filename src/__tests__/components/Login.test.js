import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import LoginComponent from '../../components/auth/Login';

// Mock Next.js router
const mockPush = jest.fn();
const mockRouter = {
  push: mockPush
};

jest.mock('next/navigation', () => ({
  useRouter: () => mockRouter
}));

// Mock Auth Context
const mockLogin = jest.fn();
const mockLoginWithGoogle = jest.fn();
const mockUseAuth = jest.fn();

jest.mock('../../contexts/AuthContext', () => ({
  useAuth: () => mockUseAuth()
}));

// Mock react-hot-toast
jest.mock('react-hot-toast', () => ({
  success: jest.fn(),
  error: jest.fn()
}));

// Mock Next.js Link
jest.mock('next/link', () => {
  return function MockLink({ children, href }) {
    return <a href={href}>{children}</a>;
  };
});

// Mock Next.js Image
jest.mock('next/image', () => {
  return function MockImage({ src, alt, width, height, className }) {
    return <div data-testid="next-image" data-src={src} data-alt={alt} style={{ width, height }} className={className} />;
  };
});

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  Eye: () => <div data-testid="eye-icon" />,
  EyeOff: () => <div data-testid="eye-off-icon" />,
  Mail: () => <div data-testid="mail-icon" />,
  Lock: () => <div data-testid="lock-icon" />,
  Loader2: () => <div data-testid="loader-icon" />
}));

// Mock Firebase auth
jest.mock('firebase/auth', () => ({
  signOut: jest.fn(),
  getAuth: jest.fn(() => ({}))
}));

describe('Login Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAuth.mockReturnValue({
      login: mockLogin,
      loginWithGoogle: mockLoginWithGoogle
    });
  });

  describe('UI Rendering', () => {
    it('renders login page correctly with all UI elements visible', () => {
      render(<LoginComponent />);

      // Check main elements - "Welcome Back" is split into two elements
      expect(screen.getByText('Welcome')).toBeInTheDocument();
      expect(screen.getByText('Back')).toBeInTheDocument();
      expect(screen.getByText('Sign in to continue your ThriftX journey')).toBeInTheDocument();

      // Check form elements
      expect(screen.getByLabelText('Email')).toBeInTheDocument();
      expect(screen.getByLabelText('Password')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();

      // Check Google login button
      expect(screen.getByRole('button', { name: /continue with google/i })).toBeInTheDocument();

      // Check registration link - just check for the link element
      expect(screen.getByRole('link', { name: /sign up/i })).toBeInTheDocument();
    });

    it('displays email and password icons', () => {
      render(<LoginComponent />);

      expect(screen.getByTestId('mail-icon')).toBeInTheDocument();
      expect(screen.getByTestId('lock-icon')).toBeInTheDocument();
    });
  });

  describe('Form Validation', () => {
    it('shows validation errors for empty email and password fields', async () => {
      const user = userEvent.setup();
      render(<LoginComponent />);

      const submitButton = screen.getByRole('button', { name: /sign in/i });
      await user.click(submitButton);

      expect(screen.getByText('Email is required')).toBeInTheDocument();
      expect(screen.getByText('Password is required')).toBeInTheDocument();
    });

    it('shows validation error for invalid email format', async () => {
      const user = userEvent.setup();
      render(<LoginComponent />);

      const emailInput = screen.getByLabelText('Email');
      const passwordInput = screen.getByLabelText('Password');
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      await user.type(emailInput, 'invalid-email');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Invalid email')).toBeInTheDocument();
      });
    });

    it('clears validation errors when user starts typing', async () => {
      const user = userEvent.setup();
      render(<LoginComponent />);

      const submitButton = screen.getByRole('button', { name: /sign in/i });
      await user.click(submitButton);

      expect(screen.getByText('Email is required')).toBeInTheDocument();

      const emailInput = screen.getByLabelText('Email');
      await user.type(emailInput, 'test@example.com');

      expect(screen.queryByText('Email is required')).not.toBeInTheDocument();
    });
  });

  describe('Password Visibility Toggle', () => {
    it('toggles password visibility when eye icon is clicked', async () => {
      const user = userEvent.setup();
      render(<LoginComponent />);

      const passwordInput = screen.getByLabelText('Password');
      const toggleButton = screen.getByRole('button', { name: '' }); // Password toggle button

      // Initially password should be hidden
      expect(passwordInput).toHaveAttribute('type', 'password');

      // Click to show password
      await user.click(toggleButton);
      expect(passwordInput).toHaveAttribute('type', 'text');

      // Click again to hide password
      await user.click(toggleButton);
      expect(passwordInput).toHaveAttribute('type', 'password');
    });

    it('displays correct eye icons for password visibility state', async () => {
      const user = userEvent.setup();
      render(<LoginComponent />);

      const toggleButton = screen.getByRole('button', { name: '' });

      // Initially should show eye icon (password hidden)
      expect(screen.getByTestId('eye-icon')).toBeInTheDocument();

      // Click to show password - should show eye-off icon
      await user.click(toggleButton);
      expect(screen.getByTestId('eye-off-icon')).toBeInTheDocument();
    });
  });

  describe('Successful Login', () => {
    it('logs in user with valid credentials and redirects appropriately', async () => {
      const user = userEvent.setup();

      // Mock successful login
      const mockUserCredential = {
        user: {
          uid: 'user123',
          emailVerified: true
        }
      };
      mockLogin.mockResolvedValue(mockUserCredential);

      // Mock Firestore user data
      const mockGetDoc = jest.fn().mockResolvedValue({
        exists: () => true,
        data: () => ({ role: 'buyer' })
      });

      jest.mock('firebase/firestore', () => ({
        doc: jest.fn(),
        getDoc: mockGetDoc
      }));

      render(<LoginComponent />);

      const emailInput = screen.getByLabelText('Email');
      const passwordInput = screen.getByLabelText('Password');
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123');
        expect(mockPush).toHaveBeenCalledWith('/');
      });
    });

    it('redirects sellers to dashboard after successful login', async () => {
      const user = userEvent.setup();

      const mockUserCredential = {
        user: {
          uid: 'seller123',
          emailVerified: true
        }
      };
      mockLogin.mockResolvedValue(mockUserCredential);

      const mockGetDoc = jest.fn().mockResolvedValue({
        exists: () => true,
        data: () => ({ role: 'seller' })
      });

      jest.mock('firebase/firestore', () => ({
        doc: jest.fn(),
        getDoc: mockGetDoc
      }));

      render(<LoginComponent />);

      const emailInput = screen.getByLabelText('Email');
      const passwordInput = screen.getByLabelText('Password');
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      await user.type(emailInput, 'seller@example.com');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/seller/dashboard');
      });
    });
  });

  describe('Login Error Handling', () => {
    it('handles login errors gracefully', async () => {
      const user = userEvent.setup();
      const { toast } = require('react-hot-toast');

      // Mock a generic login error
      mockLogin.mockRejectedValue(new Error('Login failed'));

      render(<LoginComponent />);

      const emailInput = screen.getByLabelText('Email');
      const passwordInput = screen.getByLabelText('Password');
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Login failed. Please try again.');
      });
    });

    it('handles unverified email scenario', async () => {
      const user = userEvent.setup();
      const { toast } = require('react-hot-toast');

      // Mock successful login but unverified email
      const mockUserCredential = {
        user: {
          uid: 'user123',
          emailVerified: false
        }
      };
      mockLogin.mockResolvedValue(mockUserCredential);

      render(<LoginComponent />);

      const emailInput = screen.getByLabelText('Email');
      const passwordInput = screen.getByLabelText('Password');
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      await user.type(emailInput, 'unverified@example.com');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Please verify your email before logging in.');
      });
    });
  });

  describe('Google Authentication', () => {
    it('displays Google sign-in button', () => {
      render(<LoginComponent />);

      const googleButton = screen.getByRole('button', { name: /continue with google/i });
      expect(googleButton).toBeInTheDocument();
      expect(googleButton).toBeVisible();
    });

    it('calls Google sign-in function when button is clicked', async () => {
      const user = userEvent.setup();
      mockLoginWithGoogle.mockResolvedValue({});

      render(<LoginComponent />);

      const googleButton = screen.getByRole('button', { name: /continue with google/i });
      await user.click(googleButton);

      expect(mockLoginWithGoogle).toHaveBeenCalled();
    });

    it('shows loading state during Google sign-in', async () => {
      const user = userEvent.setup();
      mockLoginWithGoogle.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

      render(<LoginComponent />);

      const googleButton = screen.getByRole('button', { name: /continue with google/i });
      await user.click(googleButton);

      expect(screen.getByTestId('loader-icon')).toBeInTheDocument();
      expect(googleButton).toBeDisabled();
    });

    it('handles Google sign-in errors gracefully', async () => {
      const user = userEvent.setup();
      const { toast } = require('react-hot-toast');

      mockLoginWithGoogle.mockRejectedValue(new Error('Google sign-in failed'));

      render(<LoginComponent />);

      const googleButton = screen.getByRole('button', { name: /continue with google/i });
      await user.click(googleButton);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Google sign-in failed. Please try again.');
      });
    });
  });

  describe('Loading States', () => {
    it('shows loading spinner and disables submit button during login', async () => {
      const user = userEvent.setup();

      mockLogin.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

      render(<LoginComponent />);

      const submitButton = screen.getByRole('button', { name: /sign in/i });

      await user.type(screen.getByLabelText('Email'), 'test@example.com');
      await user.type(screen.getByLabelText('Password'), 'password123');
      await user.click(submitButton);

      expect(screen.getByTestId('loader-icon')).toBeInTheDocument();
      expect(submitButton).toBeDisabled();
      expect(submitButton).toHaveTextContent('Signing you in...');
    });

    it('re-enables form after login completes', async () => {
      const user = userEvent.setup();

      mockLogin.mockResolvedValue({
        user: { uid: 'user123', emailVerified: true }
      });

      render(<LoginComponent />);

      const submitButton = screen.getByRole('button', { name: /sign in/i });

      await user.type(screen.getByLabelText('Email'), 'test@example.com');
      await user.type(screen.getByLabelText('Password'), 'password123');
      await user.click(submitButton);

      await waitFor(() => {
        expect(submitButton).not.toBeDisabled();
      });
    });
  });

  describe('Navigation', () => {
    it('navigates to customer registration page when sign up link is clicked', () => {
      render(<LoginComponent />);

      const signUpLink = screen.getByRole('link', { name: /sign up/i });
      expect(signUpLink).toHaveAttribute('href', '/register/customer');
    });
  });
});
