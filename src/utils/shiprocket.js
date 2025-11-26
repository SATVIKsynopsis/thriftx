/**
 * Shiprocket API Integration
 * Handles authentication, order creation, tracking, and rate calculations
 */

// Shiprocket API Configuration
const SHIPROCKET_BASE_URL = 'https://apiv2.shiprocket.in/v1/external';

// Default product shipping specifications (across all categories)
const DEFAULT_SHIPPING_CONFIG = {
  weight: 0.4, // 400 grams
  length: 30,  // 30 cm
  width: 25,   // 25 cm
  height: 5    // 5 cm
};

// Shiprocket API Authentication
let authToken = null;
let tokenExpiry = null;

/**
 * Clear auth token cache (used for testing)
 */
function clearAuthToken() {
  authToken = null;
  tokenExpiry = null;
}

/**
 * Get authentication token for Shiprocket API
 */
async function getAuthToken() {
  // Return cached token if still valid (tokens typically last 24 hours)
  if (authToken && tokenExpiry && new Date() < tokenExpiry) {
    return authToken;
  }

  const email = process.env.SHIPROCKET_EMAIL;
  const password = process.env.SHIPROCKET_PASSWORD;

  if (!email || !password) {
    throw new Error('Shiprocket credentials not configured. Please set SHIPROCKET_EMAIL and SHIPROCKET_PASSWORD environment variables.');
  }

  try {
    const response = await fetch(`${SHIPROCKET_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to authenticate with Shiprocket');
    }

    authToken = data.token;
    // Set expiry to 1 day from now (Shiprocket tokens typically last 24 hours)
    tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

    return authToken;
  } catch (error) {
    console.error('Shiprocket Authentication Error:', error);
    throw new Error('Failed to authenticate with Shiprocket API');
  }
}

/**
 * Make authenticated request to Shiprocket API
 */
async function shiprocketRequest(endpoint, options = {}) {
  const token = await getAuthToken();

  const url = endpoint.startsWith('http') ? endpoint : `${SHIPROCKET_BASE_URL}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    console.error('Shiprocket API Error:', data);
    throw new Error(data.message || 'Shiprocket API request failed');
  }

  return data;
}

/**
 * Get pickup locations from ShipRocket
 */
async function getPickupLocations() {
  try {
    const response = await shiprocketRequest('/settings/company/pickup', {
      method: 'GET'
    });

    return response.data || [];
  } catch (error) {
    console.error('Error fetching pickup locations:', error);
    // Return default fallback location
    return [{
      pickup_location: process.env.DEFAULT_PICKUP_LOCATION || 'Default',
      state: 'Delhi',
      city: 'New Delhi',
      pin_code: '110001'
    }];
  }
}

/**
 * Calculate shipping rates for given pickup and delivery locations
 * Uses ShipRocket's serviceability API to get available couriers and rates
 */
async function calculateShippingRates({
  pickup_postcode,
  delivery_postcode,
  weight = DEFAULT_SHIPPING_CONFIG.weight,
  length = DEFAULT_SHIPPING_CONFIG.length,
  breadth = DEFAULT_SHIPPING_CONFIG.width,
  height = DEFAULT_SHIPPING_CONFIG.height
}) {
  try {
    // Check serviceability and get rates (POST request with shipment details)
    const ratesData = await shiprocketRequest('/courier/serviceability', {
      method: 'POST',
      body: JSON.stringify({
        pickup_postcode: parseInt(pickup_postcode),
        delivery_postcode: parseInt(delivery_postcode),
        weight,
        length,
        breadth,
        height,
        cod: 0, // Prepaid only for marketplace
        declared_value: 0, // Optional
      }),
    });

    // Return available courier options with rates
    return ratesData.data?.available_courier_companies || ratesData.data || [];
  } catch (error) {
    console.error('Error calculating shipping rates:', error);
    // Return default rates as fallback
    return [{
      courier_name: 'Standard Delivery',
      rate: 50,
      etd: '5-7 days',
      courier_id: 1
    }];
  }
}

/**
 * Create a shipment order in Shiprocket
 */
async function createShiprocketOrder(orderData) {
  const {
    order_id,
    order_date,
    pickup_location,
    channel_id = '', // Optional: your Shiprocket channel
    comment = '',
    billing_customer_name,
    billing_last_name,
    billing_address,
    billing_address_2 = '',
    billing_city,
    billing_pincode,
    billing_state,
    billing_country,
    billing_email,
    billing_phone,
    shipping_is_billing = true,
    shipping_customer_name,
    shipping_last_name,
    shipping_address,
    shipping_address_2 = '',
    shipping_city,
    shipping_pincode,
    shipping_country,
    shipping_state,
    shipping_email,
    shipping_phone,
    order_items,
    payment_method = 'Prepaid',
    sub_total,
    length = DEFAULT_SHIPPING_CONFIG.length,
    breadth = DEFAULT_SHIPPING_CONFIG.width,
    height = DEFAULT_SHIPPING_CONFIG.height,
    weight = DEFAULT_SHIPPING_CONFIG.weight
  } = orderData;

  try {
    const formattedItems = order_items.map(item => ({
      name: item.name.substring(0, 100), // Limit to 100 chars
      sku: item.sku || item.product_id || `PROD-${Date.now()}`,
      units: item.quantity,
      selling_price: item.price,
      discount: item.discount || 0,
      tax: item.tax || 0,
      hsn: item.hsn || 0
    }));

    const orderPayload = {
      order_id,
      order_date,
      pickup_location,
      channel_id,
      comment,
      billing_customer_name,
      billing_last_name,
      billing_address,
      billing_address_2,
      billing_city,
      billing_pincode,
      billing_state,
      billing_country,
      billing_email,
      billing_phone,
      shipping_is_billing,
      shipping_customer_name,
      shipping_last_name,
      shipping_address,
      shipping_address_2,
      shipping_city,
      shipping_pincode,
      shipping_country,
      shipping_state,
      shipping_email,
      shipping_phone,
      order_items: formattedItems,
      payment_method,
      sub_total,
      length,
      breadth,
      height,
      weight
    };

    const response = await shiprocketRequest('/orders/create/adhoc', {
      method: 'POST',
      body: JSON.stringify(orderPayload)
    });

    return response;
  } catch (error) {
    console.error('Error creating Shiprocket order:', error);
    throw error;
  }
}

/**
 * Generate shipping label/AWB for an order
 */
async function generateShippingLabel(order_id) {
  try {
    const response = await shiprocketRequest('/courier/generate/label', {
      method: 'POST',
      body: JSON.stringify({
        shipment_id: [order_id]
      })
    });

    return response;
  } catch (error) {
    console.error('Error generating shipping label:', error);
    throw error;
  }
}

/**
 * Track shipment by AWB number
 */
async function trackShipment(awb_code) {
  try {
    const response = await shiprocketRequest(`/courier/track/shipment/${awb_code}`, {
      method: 'GET'
    });

    return response;
  } catch (error) {
    console.error('Error tracking shipment:', error);
    throw error;
  }
}

/**
 * Cancel a shipment
 */
async function cancelShipment(awb_code) {
  try {
    const response = await shiprocketRequest(`/orders/cancel/shipment`, {
      method: 'POST',
      body: JSON.stringify({
        awbs: [awb_code]
      })
    });

    return response;
  } catch (error) {
    console.error('Error cancelling shipment:', error);
    throw error;
  }
}

module.exports = {
  clearAuthToken,
  getAuthToken,
  getPickupLocations,
  calculateShippingRates,
  createShiprocketOrder,
  generateShippingLabel,
  trackShipment,
  cancelShipment,
  DEFAULT_SHIPPING_CONFIG
};
