/**
 * ShipRocket Integration Tests
 * Tests the ShipRocket API integration functions
 */

import {
  clearAuthToken,
  getAuthToken,
  calculateShippingRates,
  createShiprocketOrder,
  trackShipment,
  cancelShipment,
  DEFAULT_SHIPPING_CONFIG
} from '@/utils/shiprocket';

// Mock fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('ShipRocket Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFetch.mockClear();

    // Clear cached auth token
    clearAuthToken();

    // Clear environment variables
    delete process.env.SHIPROCKET_EMAIL;
    delete process.env.SHIPROCKET_PASSWORD;
  });

  afterEach(() => {
    // Clean up after each test
    delete process.env.SHIPROCKET_EMAIL;
    delete process.env.SHIPROCKET_PASSWORD;
  });

  describe('getAuthToken', () => {
    it('should fetch and return auth token', async () => {
      process.env.SHIPROCKET_EMAIL = 'test@example.com';
      process.env.SHIPROCKET_PASSWORD = 'testpass';

      const mockToken = 'test-token-123';
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ token: mockToken }),
      });

      const token = await getAuthToken();

      expect(token).toBe(mockToken);
      expect(global.fetch).toHaveBeenCalledWith(
        'https://apiv2.shiprocket.in/v1/external/auth/login',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: 'test@example.com',
            password: 'testpass',
          }),
        })
      );
    });

    it('should throw error when credentials are missing', async () => {
      await expect(getAuthToken()).rejects.toThrow(
        'Shiprocket credentials not configured'
      );
    });

    it('should throw error when API fails', async () => {
      process.env.SHIPROCKET_EMAIL = 'test@example.com';
      process.env.SHIPROCKET_PASSWORD = 'testpass';

      global.fetch.mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ message: 'Invalid credentials' }),
      });

      await expect(getAuthToken()).rejects.toThrow('Failed to authenticate with Shiprocket API');
    });
  });

  describe('calculateShippingRates', () => {
    it('should calculate shipping rates successfully', async () => {
      process.env.SHIPROCKET_EMAIL = 'test@example.com';
      process.env.SHIPROCKET_PASSWORD = 'testpass';

      const mockRates = [
        {
          courier_name: 'Delhivery',
          rate: 45,
          etd: '2-3 days',
          courier_id: 123
        }
      ];

      global.fetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ token: 'test-token' }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ data: mockRates }),
        });

      const rates = await calculateShippingRates({
        pickup_postcode: '110001',
        delivery_postcode: '400001'
      });

      expect(rates).toEqual(mockRates);
    });

    it('should return fallback rates when API fails', async () => {
      process.env.SHIPROCKET_EMAIL = 'test@example.com';
      process.env.SHIPROCKET_PASSWORD = 'testpass';

      global.fetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ token: 'test-token' }),
        })
        .mockResolvedValueOnce({
          ok: false,
          json: () => Promise.resolve({ message: 'API Error' }),
        });

      const rates = await calculateShippingRates({
        pickup_postcode: '110001',
        delivery_postcode: '400001'
      });

      expect(rates).toEqual([{
        courier_name: 'Standard Delivery',
        rate: 50,
        etd: '5-7 days',
        courier_id: 1
      }]);
    });
  });

  describe('createShiprocketOrder', () => {
    it('should create order successfully', async () => {
      process.env.SHIPROCKET_EMAIL = 'test@example.com';
      process.env.SHIPROCKET_PASSWORD = 'testpass';

      const mockOrderResponse = {
        success: true,
        shipment_id: 123456,
        awb_code: 'AWB12345',
        courier_name: 'Delhivery',
        etd: '2-3 days',
        status: 'processing'
      };

      global.fetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ token: 'test-token' }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockOrderResponse),
        });

      const testOrderData = {
        order_id: 'ORD-TEST-001',
        order_date: '2024-01-01',
        pickup_location: 'Default',
        billing_customer_name: 'John',
        billing_last_name: 'Doe',
        billing_address: '123 Main St',
        billing_city: 'Delhi',
        billing_pincode: '110001',
        billing_state: 'Delhi',
        billing_country: 'India',
        billing_email: 'john@example.com',
        billing_phone: '9876543210',
        shipping_customer_name: 'John',
        shipping_last_name: 'Doe',
        shipping_address: '123 Main St',
        shipping_city: 'Delhi',
        shipping_pincode: '110001',
        shipping_country: 'India',
        shipping_state: 'Delhi',
        shipping_email: 'john@example.com',
        shipping_phone: '9876543210',
        order_items: [{
          name: 'Test Product',
          sku: 'PROD-001',
          units: 1,
          selling_price: 1000,
          discount: 0
        }],
        payment_method: 'Prepaid',
        sub_total: 1000
      };

      const result = await createShiprocketOrder(testOrderData);
      expect(result).toEqual(mockOrderResponse);
    });
  });

  describe('trackShipment', () => {
    it('should track shipment successfully', async () => {
      process.env.SHIPROCKET_EMAIL = 'test@example.com';
      process.env.SHIPROCKET_PASSWORD = 'testpass';

      const mockTrackingData = {
        tracking_data: {
          track_status: 1,
          shipment_status: 1,
          shipment_track: [
            {
              date: '2024-01-01',
              status: 'Order Placed',
              description: 'Order has been placed'
            }
          ]
        }
      };

      global.fetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ token: 'test-token' }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockTrackingData),
        });

      const result = await trackShipment('AWB12345');
      expect(result).toEqual(mockTrackingData);
    });
  });

  describe('cancelShipment', () => {
    it('should cancel shipment successfully', async () => {
      process.env.SHIPROCKET_EMAIL = 'test@example.com';
      process.env.SHIPROCKET_PASSWORD = 'testpass';

      const mockCancelResponse = {
        success: true,
        message: 'Shipment cancelled successfully'
      };

      global.fetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ token: 'test-token' }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockCancelResponse),
        });

      const result = await cancelShipment('AWB12345');
      expect(result).toEqual(mockCancelResponse);
    });
  });

  describe('DEFAULT_SHIPPING_CONFIG', () => {
    it('should have correct default values', () => {
      expect(DEFAULT_SHIPPING_CONFIG).toEqual({
        weight: 0.4,
        length: 30,
        width: 25,
        height: 5
      });
    });
  });
});
