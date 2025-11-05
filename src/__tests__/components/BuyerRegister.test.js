import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import BuyerRegister from '../../components/auth/BuyerRegister';

// Mock Next.js router
const mockPush = jest.fn();
const mockRouter = {
  push: mockPush
};

jest.mock('next/navigation', () => ({
  useRouter: () => mockRouter
}));

// Mock Auth Context
const mockSignup = jest.fn();
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
  User: () => <div data-testid="user-icon" />,
  MapPin: () => <div data-testid="map-pin-icon" />,
  Heart: () => <div data-testid="heart-icon" />,
  Users: () => <div data-testid="users-icon" />,
  Phone: () => <div data-testid="phone-icon" />,
  Loader2: () => <div data-testid="loader-icon" />,
  MessageSquare: () => <div data-testid="message-square-icon" />
}));

// Mock Firebase
jest.mock('firebase/auth', () => ({
  RecaptchaVerifier: jest.fn().mockImplementation(() => ({
    render: jest.fn().mockResolvedValue('recaptcha-id'),
    clear: jest.fn()
  })),
  signInWithPhoneNumber: jest.fn(),
  updateProfile: jest.fn(),
  GoogleAuthProvider: jest.fn(),
  signInWithPopup: jest.fn(),
  getAuth: jest.fn(() => ({}))
}));

jest.mock('firebase/firestore', () => ({
  doc: jest.fn(),
  setDoc: jest.fn(),
  getDoc: jest.fn()
}));

jest.mock('../../firebase/config', () => ({
  auth: {},
  db: {}
}));

// Mock input-otp component
jest.mock('../../components/ui/input-otp', () => ({
  InputOTP: ({ children, onChange, maxLength }) => (
    <div data-testid="input-otp" onChange={onChange} data-maxlength={maxLength}>
      {children}
    </div>
  ),
  InputOTPGroup: ({ children }) => <div data-testid="input-otp-group">{children}</div>,
  InputOTPSeparator: () => <div data-testid="input-otp-separator">-</div>,
  InputOTPSlot: ({ index }) => <input data-testid={`input-otp-slot-${index}`} maxLength={1} />
}));

describe('BuyerRegister Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAuth.mockReturnValue({
      signup: mockSignup
    });
  });

  describe('UI Rendering', () => {
    it('renders registration form with all required fields', () => {
      render(<BuyerRegister />);

      expect(screen.getByText('Join ThriftX')).toBeInTheDocument();
      expect(screen.getByText('Discover fashion that feels right 🌿')).toBeInTheDocument();

      // Check form fields
      expect(screen.getByLabelText('Full Name')).toBeInTheDocument();
      expect(screen.getByLabelText('Email')).toBeInTheDocument();
      expect(screen.getByLabelText('Password')).toBeInTheDocument();
      expect(screen.getByLabelText('Confirm Password')).toBeInTheDocument();
      expect(screen.getByLabelText('Location (optional)')).toBeInTheDocument();
      expect(screen.getByLabelText('Favorite Styles (optional)')).toBeInTheDocument();
      expect(screen.getByLabelText('Why Choose Sustainable Fashion? (optional)')).toBeInTheDocument();

      // Check buttons
      expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /continue with google/i })).toBeInTheDocument();
    });

    it('displays contact method toggle', () => {
      render(<BuyerRegister />);

      expect(screen.getByText('Contact Method:')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /switch to phone/i })).toBeInTheDocument();
    });

    it('shows sign in link in footer', () => {
      render(<BuyerRegister />);

      expect(screen.getByText('Already have an account?')).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /sign in/i })).toBeInTheDocument();
    });
  });

  describe('Form Validation', () => {
    it('shows validation errors for empty required fields', async () => {
      const user = userEvent.setup();
      render(<BuyerRegister />);

      const submitButton = screen.getByRole('button', { name: /create account/i });
      await user.click(submitButton);

      expect(screen.getByText('Name is required')).toBeInTheDocument();
      expect(screen.getByText('Email is required')).toBeInTheDocument();
      expect(screen.getByText('Password is required')).toBeInTheDocument();
    });

    it('shows validation error for invalid email format', async () => {
      const user = userEvent.setup();
      render(<BuyerRegister />);

      const emailInput = screen.getByLabelText('Email');
      const nameInput = screen.getByLabelText('Full Name');
      const passwordInput = screen.getByLabelText('Password');
      const confirmPasswordInput = screen.getByLabelText('Confirm Password');
      const submitButton = screen.getByRole('button', { name: /create account/i });

      await user.type(nameInput, 'John Doe');
      await user.type(emailInput, 'invalid-email');
      await user.type(passwordInput, 'password123');
      await user.type(confirmPasswordInput, 'password123');
      await user.click(submitButton);

      expect(screen.getByText('Invalid email')).toBeInTheDocument();
    });

    it('shows validation error for password too short', async () => {
      const user = userEvent.setup();
      render(<BuyerRegister />);

      const nameInput = screen.getByLabelText('Full Name');
      const emailInput = screen.getByLabelText('Email');
      const passwordInput = screen.getByLabelText('Password');
      const confirmPasswordInput = screen.getByLabelText('Confirm Password');
      const submitButton = screen.getByRole('button', { name: /create account/i });

      await user.type(nameInput, 'John Doe');
      await user.type(emailInput, 'john@example.com');
      await user.type(passwordInput, '123');
      await user.type(confirmPasswordInput, '123');
      await user.click(submitButton);

      expect(screen.getByText('Password must be at least 6 characters')).toBeInTheDocument();
    });

    it('shows validation error for mismatched passwords', async () => {
      const user = userEvent.setup();
      render(<BuyerRegister />);

      const nameInput = screen.getByLabelText('Full Name');
      const emailInput = screen.getByLabelText('Email');
      const passwordInput = screen.getByLabelText('Password');
      const confirmPasswordInput = screen.getByLabelText('Confirm Password');
      const submitButton = screen.getByRole('button', { name: /create account/i });

      await user.type(nameInput, 'John Doe');
      await user.type(emailInput, 'john@example.com');
      await user.type(passwordInput, 'password123');
      await user.type(confirmPasswordInput, 'differentpassword');
      await user.click(submitButton);

      expect(screen.getByText('Passwords do not match')).toBeInTheDocument();
    });

    it('clears validation errors when user starts typing', async () => {
      const user = userEvent.setup();
      render(<BuyerRegister />);

      const submitButton = screen.getByRole('button', { name: /create account/i });
      await user.click(submitButton);

      expect(screen.getByText('Name is required')).toBeInTheDocument();

      const nameInput = screen.getByLabelText('Full Name');
      await user.type(nameInput, 'John Doe');

      expect(screen.queryByText('Name is required')).not.toBeInTheDocument();
    });
  });

  describe('Contact Method Toggle', () => {
    it('switches from email to phone input', async () => {
      const user = userEvent.setup();
      render(<BuyerRegister />);

      const toggleButton = screen.getByRole('button', { name: /switch to phone/i });
      await user.click(toggleButton);

      expect(screen.getByLabelText('Phone Number with country code eg:(+91)')).toBeInTheDocument();
      expect(screen.queryByLabelText('Email')).not.toBeInTheDocument();
      expect(screen.getByRole('button', { name: /switch to email/i })).toBeInTheDocument();
    });

    it('switches from phone back to email input', async () => {
      const user = userEvent.setup();
      render(<BuyerRegister />);

      // Switch to phone first
      const toggleButton = screen.getByRole('button', { name: /switch to phone/i });
      await user.click(toggleButton);

      // Switch back to email
      const emailToggleButton = screen.getByRole('button', { name: /switch to email/i });
      await user.click(emailToggleButton);

      expect(screen.getByLabelText('Email')).toBeInTheDocument();
      expect(screen.queryByLabelText('Phone Number with country code eg:(+91)')).not.toBeInTheDocument();
    });
  });

  describe('Password Visibility Toggle', () => {
    it('toggles password visibility', async () => {
      const user = userEvent.setup();
      render(<BuyerRegister />);

      const passwordInput = screen.getByLabelText('Password');
      const toggleButton = screen.getAllByRole('button')[1]; // Password toggle button

      // Initially password should be hidden
      expect(passwordInput).toHaveAttribute('type', 'password');

      // Click to show password
      await user.click(toggleButton);
      expect(passwordInput).toHaveAttribute('type', 'text');

      // Click again to hide password
      await user.click(toggleButton);
      expect(passwordInput).toHaveAttribute('type', 'password');
    });

    it('toggles confirm password visibility independently', async () => {
      const user = userEvent.setup();
      render(<BuyerRegister />);

      const confirmPasswordInput = screen.getByLabelText('Confirm Password');
      const toggleButtons = screen.getAllByRole('button');
      const confirmPasswordToggle = toggleButtons[2]; // Confirm password toggle button

      // Initially confirm password should be hidden
      expect(confirmPasswordInput).toHaveAttribute('type', 'password');

      // Click to show confirm password
      await user.click(confirmPasswordToggle);
      expect(confirmPasswordInput).toHaveAttribute('type', 'text');
    });
  });

  describe('Successful Email Registration', () => {
    it('registers user with valid email data and redirects to login', async () => {
      const user = userEvent.setup();

      mockSignup.mockResolvedValue({});

      render(<BuyerRegister />);

      const nameInput = screen.getByLabelText('Full Name');
      const emailInput = screen.getByLabelText('Email');
      const passwordInput = screen.getByLabelText('Password');
      const confirmPasswordInput = screen.getByLabelText('Confirm Password');
      const submitButton = screen.getByRole('button', { name: /create account/i });

      await user.type(nameInput, 'John Doe');
      await user.type(emailInput, 'john@example.com');
      await user.type(passwordInput, 'password123');
      await user.type(confirmPasswordInput, 'password123');
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockSignup).toHaveBeenCalledWith('john@example.com', 'password123', {
          name: 'John Doe',
          email: 'john@example.com',
          role: 'buyer',
          location: '',
          favoriteStyles: '',
          sustainabilityGoals: ''
        });
        expect(mockPush).toHaveBeenCalledWith('/login');
      });
    });

    it('includes optional fields in registration data', async () => {
      const user = userEvent.setup();

      mockSignup.mockResolvedValue({});

      render(<BuyerRegister />);

      const nameInput = screen.getByLabelText('Full Name');
      const emailInput = screen.getByLabelText('Email');
      const passwordInput = screen.getByLabelText('Password');
      const confirmPasswordInput = screen.getByLabelText('Confirm Password');
      const locationInput = screen.getByLabelText('Location (optional)');
      const stylesInput = screen.getByLabelText('Favorite Styles (optional)');
      const goalsInput = screen.getByLabelText('Why Choose Sustainable Fashion? (optional)');
      const submitButton = screen.getByRole('button', { name: /create account/i });

      await user.type(nameInput, 'Jane Smith');
      await user.type(emailInput, 'jane@example.com');
      await user.type(passwordInput, 'password123');
      await user.type(confirmPasswordInput, 'password123');
      await user.type(locationInput, 'New York');
      await user.type(stylesInput, 'Casual, Bohemian');
      await user.type(goalsInput, 'Reduce environmental impact');
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockSignup).toHaveBeenCalledWith('jane@example.com', 'password123', {
          name: 'Jane Smith',
          email: 'jane@example.com',
          role: 'buyer',
          location: 'New York',
          favoriteStyles: 'Casual, Bohemian',
          sustainabilityGoals: 'Reduce environmental impact'
        });
      });
    });
  });

  describe('Email Registration Error Handling', () => {
    it('shows error for existing email', async () => {
      const user = userEvent.setup();
      const { toast } = require('react-hot-toast');

      mockSignup.mockRejectedValue({
        code: 'auth/email-already-in-use',
        message: 'Email already exists'
      });

      render(<BuyerRegister />);

      const nameInput = screen.getByLabelText('Full Name');
      const emailInput = screen.getByLabelText('Email');
      const passwordInput = screen.getByLabelText('Password');
      const confirmPasswordInput = screen.getByLabelText('Confirm Password');
      const submitButton = screen.getByRole('button', { name: /create account/i });

      await user.type(nameInput, 'John Doe');
      await user.type(emailInput, 'existing@example.com');
      await user.type(passwordInput, 'password123');
      await user.type(confirmPasswordInput, 'password123');
      await user.click(submitButton);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Email already exists');
      });
    });
  });

  describe('Phone Registration', () => {
    it('switches to phone registration mode', async () => {
      const user = userEvent.setup();
      render(<BuyerRegister />);

      const toggleButton = screen.getByRole('button', { name: /switch to phone/i });
      await user.click(toggleButton);

      expect(screen.getByLabelText('Phone Number with country code eg:(+91)')).toBeInTheDocument();
    });

    it('validates phone number format', async () => {
      const user = userEvent.setup();
      render(<BuyerRegister />);

      const toggleButton = screen.getByRole('button', { name: /switch to phone/i });
      await user.click(toggleButton);

      const nameInput = screen.getByLabelText('Full Name');
      const phoneInput = screen.getByLabelText('Phone Number with country code eg:(+91)');
      const passwordInput = screen.getByLabelText('Password');
      const confirmPasswordInput = screen.getByLabelText('Confirm Password');
      const submitButton = screen.getByRole('button', { name: /create account/i });

      await user.type(nameInput, 'John Doe');
      await user.type(phoneInput, '1234567890'); // Missing + prefix
      await user.type(passwordInput, 'password123');
      await user.type(confirmPasswordInput, 'password123');
      await user.click(submitButton);

      expect(screen.getByText('Phone number is required.')).toBeInTheDocument();
    });

    it('sends OTP for valid phone number', async () => {
      const user = userEvent.setup();
      const { signInWithPhoneNumber } = require('firebase/auth');

      signInWithPhoneNumber.mockResolvedValue({
        confirm: jest.fn()
      });

      render(<BuyerRegister />);

      const toggleButton = screen.getByRole('button', { name: /switch to phone/i });
      await user.click(toggleButton);

      const nameInput = screen.getByLabelText('Full Name');
      const phoneInput = screen.getByLabelText('Phone Number with country code eg:(+91)');
      const passwordInput = screen.getByLabelText('Password');
      const confirmPasswordInput = screen.getByLabelText('Confirm Password');
      const submitButton = screen.getByRole('button', { name: /create account/i });

      await user.type(nameInput, 'John Doe');
      await user.type(phoneInput, '+1234567890');
      await user.type(passwordInput, 'password123');
      await user.type(confirmPasswordInput, 'password123');
      await user.click(submitButton);

      await waitFor(() => {
        expect(signInWithPhoneNumber).toHaveBeenCalledWith(
          {},
          '+1234567890',
          expect.any(Object)
        );
      });
    });
  });

  describe('OTP Verification', () => {
    it('shows OTP input after sending OTP', async () => {
      const user = userEvent.setup();
      const { signInWithPhoneNumber } = require('firebase/auth');

      signInWithPhoneNumber.mockResolvedValue({
        confirm: jest.fn()
      });

      render(<BuyerRegister />);

      const toggleButton = screen.getByRole('button', { name: /switch to phone/i });
      await user.click(toggleButton);

      const nameInput = screen.getByLabelText('Full Name');
      const phoneInput = screen.getByLabelText('Phone Number with country code eg:(+91)');
      const passwordInput = screen.getByLabelText('Password');
      const confirmPasswordInput = screen.getByLabelText('Confirm Password');
      const submitButton = screen.getByRole('button', { name: /create account/i });

      await user.type(nameInput, 'John Doe');
      await user.type(phoneInput, '+1234567890');
      await user.type(passwordInput, 'password123');
      await user.type(confirmPasswordInput, 'password123');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Verify Phone')).toBeInTheDocument();
        expect(screen.getByTestId('input-otp')).toBeInTheDocument();
      });
    });

    it('validates OTP format', async () => {
      const user = userEvent.setup();
      const { signInWithPhoneNumber } = require('firebase/auth');

      signInWithPhoneNumber.mockResolvedValue({
        confirm: jest.fn()
      });

      render(<BuyerRegister />);

      const toggleButton = screen.getByRole('button', { name: /switch to phone/i });
      await user.click(toggleButton);

      // Fill form and send OTP
      const nameInput = screen.getByLabelText('Full Name');
      const phoneInput = screen.getByLabelText('Phone Number with country code eg:(+91)');
      const passwordInput = screen.getByLabelText('Password');
      const confirmPasswordInput = screen.getByLabelText('Confirm Password');
      const submitButton = screen.getByRole('button', { name: /create account/i });

      await user.type(nameInput, 'John Doe');
      await user.type(phoneInput, '+1234567890');
      await user.type(passwordInput, 'password123');
      await user.type(confirmPasswordInput, 'password123');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Verify Phone')).toBeInTheDocument();
      });

      // Try to submit with incomplete OTP
      const otpInputs = screen.getAllByTestId(/^input-otp-slot-/);
      await user.type(otpInputs[0], '1');
      await user.type(otpInputs[1], '2');
      await user.type(otpInputs[2], '3');

      const verifyButton = screen.getByRole('button', { name: /verify phone & finish/i });
      await user.click(verifyButton);

      expect(screen.getByText('6-digit OTP code is required')).toBeInTheDocument();
    });
  });

  describe('Google Authentication', () => {
    it('displays Google sign-in button', () => {
      render(<BuyerRegister />);

      const googleButton = screen.getByRole('button', { name: /continue with google/i });
      expect(googleButton).toBeInTheDocument();
      expect(googleButton).toBeVisible();
    });

    it('calls Google sign-in function when button is clicked', async () => {
      const user = userEvent.setup();
      const { signInWithPopup } = require('firebase/auth');

      signInWithPopup.mockResolvedValue({
        user: {
          uid: 'google-user-123',
          displayName: 'Google User',
          email: 'google@example.com'
        }
      });

      render(<BuyerRegister />);

      const googleButton = screen.getByRole('button', { name: /continue with google/i });
      await user.click(googleButton);

      expect(signInWithPopup).toHaveBeenCalled();
    });

    it('creates new user account for Google sign-in', async () => {
      const user = userEvent.setup();
      const { signInWithPopup } = require('firebase/auth');
      const { getDoc, setDoc } = require('firebase/firestore');

      signInWithPopup.mockResolvedValue({
        user: {
          uid: 'google-user-123',
          displayName: 'Google User',
          email: 'google@example.com'
        }
      });

      getDoc.mockResolvedValue({
        exists: () => false
      });

      setDoc.mockResolvedValue({});

      render(<BuyerRegister />);

      const googleButton = screen.getByRole('button', { name: /continue with google/i });
      await user.click(googleButton);

      await waitFor(() => {
        expect(setDoc).toHaveBeenCalledWith(
          expect.any(Object),
          expect.objectContaining({
            uid: 'google-user-123',
            name: 'Google User',
            email: 'google@example.com',
            role: 'buyer',
            provider: 'google'
          })
        );
        expect(mockPush).toHaveBeenCalledWith('/');
      });
    });
  });

  describe('Loading States', () => {
    it('shows loading state during registration', async () => {
      const user = userEvent.setup();

      mockSignup.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

      render(<BuyerRegister />);

      const nameInput = screen.getByLabelText('Full Name');
      const emailInput = screen.getByLabelText('Email');
      const passwordInput = screen.getByLabelText('Password');
      const confirmPasswordInput = screen.getByLabelText('Confirm Password');
      const submitButton = screen.getByRole('button', { name: /create account/i });

      await user.type(nameInput, 'John Doe');
      await user.type(emailInput, 'john@example.com');
      await user.type(passwordInput, 'password123');
      await user.type(confirmPasswordInput, 'password123');
      await user.click(submitButton);

      expect(screen.getByTestId('loader-icon')).toBeInTheDocument();
      expect(submitButton).toBeDisabled();
      expect(submitButton).toHaveTextContent('Creating Account...');
    });
  });

  describe('Navigation', () => {
    it('navigates to login page when sign in link is clicked', () => {
      render(<BuyerRegister />);

      const signInLink = screen.getByRole('link', { name: /sign in/i });
      expect(signInLink).toHaveAttribute('href', '/login');
    });
  });
});
