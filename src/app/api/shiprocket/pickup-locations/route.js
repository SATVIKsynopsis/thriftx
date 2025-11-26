import { getPickupLocations } from '@/utils/shiprocket';

export async function GET(request) {
  try {
    const pickupLocations = await getPickupLocations();

    return Response.json({
      success: true,
      data: pickupLocations
    });

  } catch (error) {
    console.error('Error fetching pickup locations:', error);

    // Return a default location as fallback
    return Response.json({
      success: true,
      data: [{
        pickup_location: 'Default Warehouse',
        state: 'Delhi',
        city: 'New Delhi',
        pin_code: '110001',
        address: 'Default Pickup Address'
      }],
      message: 'Using fallback pickup location due to API error'
    });
  }
}
