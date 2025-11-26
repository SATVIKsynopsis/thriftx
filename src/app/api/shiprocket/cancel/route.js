import { cancelShipment } from '@/utils/shiprocket';
import { collection, doc, setDoc, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/firebase/config';

export async function POST(request) {
  try {
    const body = await request.json();
    const { awb_code, orderId, reason } = body;

    // Validate required fields
    if (!awb_code && !orderId) {
      return Response.json(
        { error: 'Either awb_code or orderId is required' },
        { status: 400 }
      );
    }

    let awbToCancel = awb_code;

    // If orderId provided but no awb_code, fetch awb_code from order
    if (!awbToCancel && orderId) {
      const orderRef = doc(db, 'orders', orderId);
      const orderDoc = await getDoc(orderRef);

      if (orderDoc.exists()) {
        awbToCancel = orderDoc.data().awb_code;
      }

      if (!awbToCancel) {
        return Response.json(
          { error: 'Order not found or has no AWB code assigned' },
          { status: 404 }
        );
      }
    }

    // Cancel shipment in ShipRocket
    const cancelResponse = await cancelShipment(awbToCancel);

    if (cancelResponse && cancelResponse.success !== false) {
      // Update order status in Firestore
      if (orderId) {
        const orderRef = doc(db, 'orders', orderId);
        await setDoc(orderRef, {
          shipping_status: 'cancelled',
          cancelled_at: new Date(),
          cancellation_reason: reason || 'Seller initiated cancellation',
          updatedAt: new Date()
        }, { merge: true });
      }

      return Response.json({
        success: true,
        message: 'Shipment cancelled successfully',
        data: cancelResponse
      });
    } else {
      return Response.json({
        success: false,
        error: 'Failed to cancel shipment in ShipRocket',
        details: cancelResponse
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Error cancelling shipment:', error);

    // Even if ShipRocket API fails, try to update local order status
    try {
      if (body.orderId) {
        const orderRef = doc(db, 'orders', body.orderId);
        await setDoc(orderRef, {
          shipping_status: 'cancellation_requested',
          cancellation_reason: body.reason || 'Cancellation request failed',
          updatedAt: new Date()
        }, { merge: true });
      }
    } catch (updateError) {
      console.error('Failed to update order status locally:', updateError);
    }

    return Response.json({
      success: false,
      error: 'Shipment cancellation failed',
      details: error.message
    }, { status: 500 });
  }
}
