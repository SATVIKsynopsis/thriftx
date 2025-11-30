import { adminDb } from '@/lib/firebaseAdmin';

/**
 * ShipRocket Webhook Handler
 * Handles shipment status updates from ShipRocket
 */
export async function POST(request) {
  try {
    const webhookData = await request.json();

    console.log('ShipRocket Webhook Received:', webhookData);

    // ShipRocket webhook structure
    const {
      shipment_id,
      awb,
      courier_name,
      status,
      etd,
      delivered_date,
      activity,
      order_id,
      // ... other fields
    } = webhookData;

    if (!order_id && !shipment_id) {
      console.error('Webhook missing order_id or shipment_id');
      return Response.json({ error: 'Invalid webhook data' }, { status: 400 });
    }

    // Find the order by ShipRocket shipment_id or awb
    let orderId = null;

    if (shipment_id) {
      // Query orders where shiprocket_order_id matches
      const querySnapshot = await adminDb.collection('orders')
        .where('shiprocket_order_id', '==', shipment_id)
        .limit(1)
        .get();

      if (!querySnapshot.empty) {
        orderId = querySnapshot.docs[0].id;
      }
    }

    if (!orderId && awb) {
      // Query orders where awb_code matches
      const querySnapshot = await adminDb.collection('orders')
        .where('awb_code', '==', awb)
        .limit(1)
        .get();

      if (!querySnapshot.empty) {
        orderId = querySnapshot.docs[0].id;
      }
    }

    if (!orderId) {
      console.error('Order not found for webhook data:', { shipment_id, awb, order_id });
      return Response.json({ error: 'Order not found' }, { status: 404 });
    }

    // Update order with new shipment status
    const orderRef = adminDb.collection('orders').doc(orderId);

    const updateData = {
      shipping_status: status,
      updatedAt: new Date()
    };

    // Add specific fields based on status
    if (etd) updateData.estimated_delivery = etd;
    if (delivered_date) updateData.delivered_date = delivered_date;
    if (courier_name) updateData.courier_name = courier_name;

    // Add activity history if provided
    if (activity && Array.isArray(activity)) {
      updateData.shipping_activity = activity;
    }

    await orderRef.update(updateData);

    console.log('Order updated with webhook data:', { orderId, status });

    return Response.json({
      success: true,
      message: 'Webhook processed successfully'
    });

  } catch (error) {
    console.error('Error processing ShipRocket webhook:', error);
    return Response.json({
      error: 'Failed to process webhook',
      details: error.message
    }, { status: 500 });
  }
}

// GET endpoint for webhook verification (optional)
export async function GET(request) {
  // ShipRocket might send a GET request for webhook URL verification
  const url = new URL(request.url);
  const challenge = url.searchParams.get('challenge');

  if (challenge) {
    // Respond with the challenge for webhook verification
    return Response.json({
      challenge: challenge,
      verified: true
    });
  }

  return Response.json({
    message: 'ShipRocket Webhook endpoint is active',
    timestamp: new Date().toISOString()
  });
}
