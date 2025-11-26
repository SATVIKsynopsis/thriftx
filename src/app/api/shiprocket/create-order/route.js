import { createShiprocketOrder, generateShippingLabel } from '@/utils/shiprocket';
import { collection, doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '@/firebase/config';

export async function POST(request) {
  try {
    const body = await request.json();
    const { orderId, orderData } = body;

    // Validate required fields
    if (!orderId || !orderData) {
      return Response.json(
        { error: 'orderId and orderData are required' },
        { status: 400 }
      );
    }

    const {
      orderNumber,
      shippingAddress,
      user,
      items,
      subtotal,
      shipping,
      sellerId
    } = orderData;

    // Get seller's location for pickup
    let sellerLocation = 'Default'; // fallback
    if (sellerId) {
      try {
        const sellerRef = doc(db, 'users', sellerId);
        const sellerDoc = await getDoc(sellerRef);
        if (sellerDoc.exists()) {
          const sellerData = sellerDoc.data();
          // Use seller's location from registration if available
          sellerLocation = sellerData.location || 'Default';
        }
      } catch (error) {
        console.error('Error fetching seller location:', error);
        // Continue with default location
      }
    }

    // Prepare Shiprocket order payload
    const shiprocketPayload = {
      order_id: orderNumber,
      order_date: new Date().toISOString().split('T')[0], // YYYY-MM-DD format
      pickup_location: sellerLocation, // Now using seller's actual location
      comment: 'ThriftX Marketplace Order',
      billing_customer_name: shippingAddress.fullName.split(' ')[0],
      billing_last_name: shippingAddress.fullName.split(' ').slice(1).join(' ') || ' ',
      billing_address: shippingAddress.address,
      billing_city: shippingAddress.city,
      billing_pincode: shippingAddress.zipCode,
      billing_state: shippingAddress.state,
      billing_country: 'India',
      billing_email: shippingAddress.email,
      billing_phone: shippingAddress.phone,
      shipping_customer_name: shippingAddress.fullName.split(' ')[0],
      shipping_last_name: shippingAddress.fullName.split(' ').slice(1).join(' ') || ' ',
      shipping_address: shippingAddress.address,
      shipping_city: shippingAddress.city,
      shipping_pincode: shippingAddress.zipCode,
      shipping_country: 'India',
      shipping_state: shippingAddress.state,
      shipping_email: shippingAddress.email,
      shipping_phone: shippingAddress.phone,
      order_items: items.map(item => ({
        name: item.productName,
        sku: item.productId,
        units: item.quantity,
        selling_price: item.price,
        discount: item.discount || 0
      })),
      payment_method: 'Prepaid',
      sub_total: subtotal,
      length: 30, // Default package dimensions
      breadth: 25,
      height: 5,
      weight: 0.4
    };

    // Create order in Shiprocket
    const shiprocketResponse = await createShiprocketOrder(shiprocketPayload);

    if (!shiprocketResponse || !shiprocketResponse.success) {
      console.error('Shiprocket order creation failed:', shiprocketResponse);
      return Response.json({
        success: false,
        error: 'Failed to create shipping order. Order will be manually processed.'
      });
    }

    // Extract shipping details from response
    const { shipment_id, awb_code, courier_name, etd, status } = shiprocketResponse;

    // Update order in Firestore with shipping details
    const orderRef = doc(db, 'orders', orderId);
    await setDoc(orderRef, {
      shiprocket_order_id: shipment_id,
      awb_code,
      courier_name: courier_name || 'Standard Delivery',
      shipping_status: status || 'processing',
      estimated_delivery: etd || '5-7 days',
      tracking_url: awb_code ? `https://shiprocket.co/tracking/${awb_code}` : null,
      pickup_location: sellerLocation, // Store which location was used
      updatedAt: new Date()
    }, { merge: true });

    // Optionally generate shipping label
    if (awb_code) {
      try {
        await generateShippingLabel(shipment_id);
      } catch (labelError) {
        console.error('Failed to generate shipping label:', labelError);
        // Don't fail the entire process if label generation fails
      }
    }

    return Response.json({
      success: true,
      data: {
        shiprocket_order_id: shipment_id,
        awb_code,
        courier_name,
        tracking_url: awb_code ? `https://shiprocket.co/tracking/${awb_code}` : null,
        pickup_location: sellerLocation
      }
    });

  } catch (error) {
    console.error('Error creating Shiprocket order:', error);

    // Mark order as shipping setup failed but don't break order flow
    try {
      if (orderId) {
        const orderRef = doc(db, 'orders', orderId);
        await setDoc(orderRef, {
          shipping_error: 'Shiprocket integration failed - manual processing required',
          shipping_status: 'manual',
          updatedAt: new Date()
        }, { merge: true });
      }
    } catch (updateError) {
      console.error('Failed to update order with error:', updateError);
    }

    return Response.json({
      success: false,
      error: 'Shipping setup failed. Order will be manually processed.'
    });
  }
}
