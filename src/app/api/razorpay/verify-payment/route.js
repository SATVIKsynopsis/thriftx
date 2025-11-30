import crypto from "crypto";
import { adminDb } from "@/lib/firebaseAdmin";
import {
  createShiprocketOrder,
  generateShippingLabel,
  getPickupLocations,
} from "@/utils/shiprocket";

export async function POST(request) {
  try {
    const body = await request.json();

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderData, 
    } = body;

    
    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature ||
      !orderData
    ) {
      return Response.json(
        { success: false, message: "Missing Razorpay or order data" },
        { status: 400 }
      );
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    const payload = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(payload)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      console.error("❌ Invalid Razorpay signature");
      return Response.json(
        { success: false, message: "Payment verification failed" },
        { status: 400 }
      );
    }

    const orderRef = await adminDb.collection("orders").add({
      ...orderData,
      razorpay_order_id,
      razorpay_payment_id,
      status: "paid",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const orderId = orderRef.id;

    try {
      const { shippingAddress, items, subtotal, sellerId, orderNumber } =
        orderData;

      // Get pickup location
      let sellerLocation = "Primary"; // fallback
      try {
        const pickupLocations = await getPickupLocations();
        if (pickupLocations?.length > 0) {
          sellerLocation = pickupLocations[0].pickup_location;
        }
      } catch (err) {
        console.warn("⚠️ Failed to fetch pickup locations:", err);
      }

      const zip = shippingAddress.zipCode
        ?.toString()
        .padStart(6, "0")
        .slice(0, 6);

      const validatedItems = items.map((item) => ({
        name: item.productName || "Unknown Product",
        sku: item.productId || "UNKNOWN",
        quantity: Number(item.quantity) || 1,
        price: Number(item.price) || 0,
        discount: Number(item.discount) || 0,
        tax: 0,
        hsn: 0,
      }));

      const shipPayload = {
        order_id: orderNumber,
        order_date: new Date().toISOString().split("T")[0],
        pickup_location: sellerLocation,
        comment: "ThriftX Marketplace Order",
        billing_customer_name: shippingAddress.fullName.split(" ")[0],
        billing_last_name: shippingAddress.fullName.split(" ").slice(1).join(" "),
        billing_address: shippingAddress.address,
        billing_city: shippingAddress.city,
        billing_pincode: zip,
        billing_state: shippingAddress.state,
        billing_country: "India",
        billing_email: shippingAddress.email,
        billing_phone: shippingAddress.phone,
        shipping_customer_name: shippingAddress.fullName.split(" ")[0],
        shipping_last_name: shippingAddress.fullName.split(" ").slice(1).join(" "),
        shipping_address: shippingAddress.address,
        shipping_city: shippingAddress.city,
        shipping_pincode: zip,
        shipping_state: shippingAddress.state,
        shipping_country: "India",
        shipping_email: shippingAddress.email,
        shipping_phone: shippingAddress.phone,
        order_items: validatedItems,
        payment_method: "Prepaid",
        sub_total: Number(subtotal),
        length: 30,
        breadth: 25,
        height: 5,
        weight: 0.4,
      };

      const sr = await createShiprocketOrder(shipPayload);

      if (!sr || !sr.order_id || !sr.shipment_id) {
        throw new Error("Shiprocket order creation failed");
      }

      const enriched = {
        ...sr,
        awb_code: sr.awb_code || "TESTAWB123",
        courier_company_id: sr.courier_company_id || "1",
        courier_name: sr.courier_name || "Test Courier",
        status: sr.status || "READY_TO_SHIP",
        estimated_delivery: "2025-12-05",
        tracking_url: `https://shiprocket.co/tracking/${
          sr.awb_code || "TESTAWB123"
        }`,
      };

      await orderRef.update({
        shiprocket_order_id: enriched.order_id,
        shipment_id: enriched.shipment_id,
        awb_code: enriched.awb_code,
        courier_name: enriched.courier_name,
        tracking_url: enriched.tracking_url,
        shipping_status: enriched.status,
        estimated_delivery: enriched.estimated_delivery,
        pickup_location: sellerLocation,
        updatedAt: new Date(),
      });

      try {
        await generateShippingLabel(enriched.shipment_id);
      } catch (err) {
        console.warn("⚠️ Label generation failed", err);
      }
    } catch (err) {
      console.error("❌ Shiprocket error:", err);
      await orderRef.update({
        shipping_status: "manual",
        shipping_error: err.message,
      });
    }

    return Response.json(
      { success: true, orderId, message: "Payment verified & order created" },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ Internal error in verify-payment:", error);
    return Response.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
