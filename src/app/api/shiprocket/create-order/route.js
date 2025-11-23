import { createShiprocketOrder, generateShippingLabel } from '@/utils/shiprocket';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '@/firebase/config';

export const runtime = "nodejs"; 

export async function POST(request) {
  try {
    const body = await request.json();
    const { orderId, orderData } = body;

    if (!orderId || !orderData) {
      return Response.json(
        { error: "orderId and orderData are required" },
        { status: 400 }
      );
    }

    const {
      orderNumber,
      shippingAddress,
      items,
      subtotal
    } = orderData;

    // Build Shiprocket payload
    const shiprocketPayload = {
      order_id: orderNumber,
      order_date: new Date().toISOString().split("T")[0],
      pickup_location: "Default",
      comment: "ThriftX Marketplace Order",

      billing_customer_name: shippingAddress.fullName.split(" ")[0],
      billing_last_name: shippingAddress.fullName.split(" ").slice(1).join(" ") || "",
      billing_address: shippingAddress.address,
      billing_city: shippingAddress.city,
      billing_pincode: shippingAddress.zipCode,
      billing_state: shippingAddress.state,
      billing_country: "India",
      billing_email: shippingAddress.email,
      billing_phone: shippingAddress.phone,

      shipping_customer_name: shippingAddress.fullName.split(" ")[0],
      shipping_last_name: shippingAddress.fullName.split(" ").slice(1).join(" ") || "",
      shipping_address: shippingAddress.address,
      shipping_city: shippingAddress.city,
      shipping_pincode: shippingAddress.zipCode,
      shipping_state: shippingAddress.state,
      shipping_country: "India",
      shipping_email: shippingAddress.email,
      shipping_phone: shippingAddress.phone,

      order_items: items.map(item => ({
        name: item.productName,
        sku: item.productId,
        units: item.quantity,
        selling_price: item.price,
        discount: item.discount || 0
      })),

      payment_method: "Prepaid",
      sub_total: subtotal
    };

    // Create Shiprocket order
    const shiprocketResponse = await createShiprocketOrder(shiprocketPayload);


    if (!shiprocketResponse || !shiprocketResponse.shipment_id) {
      console.error("Shiprocket order creation failed:", shiprocketResponse);
      return Response.json({
        success: false,
        error: "Failed to create shipping order. Manual processing required."
      });
    }

    const {
      shipment_id,
      awb_code,
      courier_company_id,
      courier_name,
      etd
    } = shiprocketResponse;

    
    const orderRef = doc(db, "orders", orderId);
    await setDoc(orderRef, {
      shiprocket_order_id: shipment_id,
      awb_code: awb_code || null,
      courier_name: courier_name || "Standard Delivery",
      estimated_delivery: etd || "5-7 days",
      tracking_url: awb_code ? `https://shiprocket.co/tracking/${awb_code}` : null,
      shipping_status: "processing",
      updatedAt: new Date()
    }, { merge: true });

  
    if (shipment_id) {
      try {
        await generateShippingLabel(shipment_id);
      } catch (labelError) {
        console.error("Shipping label generation failed:", labelError);
      }
    }

    return Response.json({
      success: true,
      data: {
        shiprocket_order_id: shipment_id,
        awb_code,
        courier_name: courier_name || "Standard Delivery",
        tracking_url: awb_code ? `https://shiprocket.co/tracking/${awb_code}` : null
      }
    });

  } catch (error) {
    console.error("Shiprocket order error:", error);

    
    try {
      if (orderId) {
        const orderRef = doc(db, "orders", orderId);
        await setDoc(orderRef, {
          shipping_error: "Shiprocket setup failed - manual action required",
          shipping_status: "manual",
          updatedAt: new Date()
        }, { merge: true });
      }
    } catch (err2) {
      console.error("Failed to update Firestore:", err2);
    }

    return Response.json({
      success: false,
      error: "Shipping setup failed. Order will be processed manually."
    });
  }
}
