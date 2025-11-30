import Razorpay from "razorpay";

export async function POST(request) {
  try {
    const body = await request.json();
    const amount = Number(body.amount);

    if (!amount || amount <= 0) {
      return Response.json(
        { success: false, message: "Invalid amount provided" },
        { status: 400 }
      );
    }

    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const options = {
      amount: Math.round(amount * 100), 
      currency: "INR",
      receipt: body.receipt || `rcpt_${Date.now()}`,
      notes: body.notes || {},
    };

    const order = await razorpay.orders.create(options);

    console.log("Razorpay Order Created:", order);

    return Response.json(
      { success: true, order },
      { status: 200 }
    );

  } catch (error) {
    console.error("Error creating Razorpay order:", error);

    return Response.json(
      {
        success: false,
        message: "Failed to create Razorpay order",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
