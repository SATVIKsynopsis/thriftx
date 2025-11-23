

const SHIPROCKET_BASE_URL = "https://apiv2.shiprocket.in/v1/external";


const DEFAULT_SHIPPING_CONFIG = {
  weight: 0.4,
  length: 30,
  width: 25,
  height: 5
};

let authToken = null;
let tokenExpiry = null;

/** ShipRocket Authentication  */
async function getAuthToken() {
  if (authToken && tokenExpiry && new Date() < tokenExpiry) {
    return authToken;
  }

  const email = process.env.SHIPROCKET_EMAIL;
  const password = process.env.SHIPROCKET_PASSWORD;

  if (!email || !password) {
    throw new Error("Shiprocket credentials are missing");
  }

  try {
    const response = await fetch(`${SHIPROCKET_BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) throw new Error(data.message);

    authToken = data.token;
    tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

    return authToken;
  } catch (err) {
    console.error("Shiprocket Authentication Error:", err);
    throw new Error("Failed to authenticate with Shiprocket API");
  }
}

/**
  API request
 */
async function shiprocketRequest(endpoint, options = {}) {
  const token = await getAuthToken();

  const url = endpoint.startsWith("http")
    ? endpoint
    : `${SHIPROCKET_BASE_URL}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
      ...options.headers
    }
  });

  const data = await response.json();

  if (!response.ok) {
    console.error("Shiprocket API Error:", data);
    throw new Error(data.message || "Shiprocket API request failed");
  }

  return data;
}

/**
 * Calculate shipping rates
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
    const response = await shiprocketRequest('/courier/serviceability', {
      method: "POST",
      body: JSON.stringify({
        pickup_postcode: Number(pickup_postcode),
        delivery_postcode: Number(delivery_postcode),
        weight,
        length,
        breadth,
        height,
        cod: 0
      }),
    });

    return response?.data?.available_courier_companies || [];
  } catch (err) {
    console.error("Error calculating shipping rates:", err);

    return [{
      courier_name: "Standard Delivery",
      rate: 50,
      estimated_delivery_days: "5–7 days"
    }];
  }
}

/**
 * Create a Shiprocket order
 */
async function createShiprocketOrder(orderData) {
  try {
    const formattedItems = orderData.order_items.map(item => ({
      name: item.name.substring(0, 100),
      sku: item.sku || item.product_id || `PROD-${Date.now()}`,
      units: item.quantity,
      selling_price: item.price,
      discount: item.discount || 0,
      tax: item.tax || 0,
      hsn: item.hsn || 0
    }));

    const payload = {
      ...orderData,
      order_items: formattedItems,
      length: orderData.length ?? DEFAULT_SHIPPING_CONFIG.length,
      breadth: orderData.breadth ?? DEFAULT_SHIPPING_CONFIG.width,
      height: orderData.height ?? DEFAULT_SHIPPING_CONFIG.height,
      weight: orderData.weight ?? DEFAULT_SHIPPING_CONFIG.weight
    };

    return await shiprocketRequest("/orders/create/adhoc", {
      method: "POST",
      body: JSON.stringify(payload)
    });

  } catch (err) {
    console.error("Error creating Shiprocket order:", err);
    throw err;
  }
}

/**
 * Generate shipping label
 */
async function generateShippingLabel(shipment_id) {
  try {
    return await shiprocketRequest("/courier/generate/label", {
      method: "POST",
      body: JSON.stringify({ shipment_id: [shipment_id] })
    });
  } catch (err) {
    console.error("Error generating shipping label:", err);
    throw err;
  }
}

/**
 * Track a shipment
 */
async function trackShipment(awb_code) {
  try {
    return await shiprocketRequest(`/courier/track/awb/${awb_code}`, {
      method: "GET"
    });
  } catch (err) {
    console.error("Error tracking shipment:", err);
    throw err;
  }
}

/**
 * Cancel a shipment
 */
async function cancelShipment(awb_code) {
  try {
    return await shiprocketRequest("/orders/cancel/shipment/awbs", {
      method: "POST",
      body: JSON.stringify({
        awbs: [awb_code]
      })
    });
  } catch (err) {
    console.error("Error cancelling shipment:", err);
    throw err;
  }
}

module.exports = {
  getAuthToken,
  calculateShippingRates,
  createShiprocketOrder,
  generateShippingLabel,
  trackShipment,
  cancelShipment,
  DEFAULT_SHIPPING_CONFIG
};
