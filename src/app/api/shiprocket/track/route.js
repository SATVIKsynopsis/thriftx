import { trackShipment } from '@/utils/shiprocket';

export async function GET(request) {
  try {
    const url = new URL(request.url);
    const awb_code = url.searchParams.get('awb_code');

    if (!awb_code) {
      return Response.json(
        { error: 'awb_code parameter is required' },
        { status: 400 }
      );
    }

    const tracking = await trackShipment(awb_code);

    return Response.json({
      success: true,
      data: tracking
    });

  } catch (error) {
    console.error('Error tracking shipment:', error);

    return Response.json({
      success: false,
      error: 'Unable to track shipment',
      data: null
    }, { status: 500 });
  }
}
