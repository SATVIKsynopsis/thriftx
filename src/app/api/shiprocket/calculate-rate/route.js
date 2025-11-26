import { calculateShippingRates } from '@/utils/shiprocket';

export async function POST(request) {
  try {
    const body = await request.json();
    const { pickup_postcode, delivery_postcode } = body;

    // Validate required fields
    if (!pickup_postcode || !delivery_postcode) {
      return Response.json(
        { error: 'pickup_postcode and delivery_postcode are required' },
        { status: 400 }
      );
    }

    // Validate PIN code format (Indian PIN codes are 6 digits)
    if (!/^\d{6}$/.test(pickup_postcode) || !/^\d{6}$/.test(delivery_postcode)) {
      return Response.json(
        { error: 'Invalid PIN code format. Must be 6 digits.' },
        { status: 400 }
      );
    }

    const rates = await calculateShippingRates({
      pickup_postcode,
      delivery_postcode
    });

    // Transform rates to a simpler format for frontend
    const formattedRates = rates.map(rate => ({
      courier_name: rate.courier_name || 'Standard Delivery',
      rate: parseFloat(rate.rate) || 0,
      estimated_delivery: rate.etd || rate.estimated_delivery_days || '5-7 days',
      courier_id: rate.courier_id || 0
    }));

    return Response.json({
      success: true,
      data: formattedRates
    });

  } catch (error) {
    console.error('Error calculating shipping rates:', error);

    // Return fallback rate if Shiprocket API fails
    return Response.json({
      success: true,
      data: [{
        courier_name: 'Standard Delivery',
        rate: 50,
        estimated_delivery: '5-7 days',
        courier_id: 1
      }]
    });
  }
}
