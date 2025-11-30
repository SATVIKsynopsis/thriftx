import { getPickupLocations } from '@/utils/shiprocket';

export async function GET(request) {
  try {
    console.log('=== TESTING SHIPROCKET PICKUP LOCATIONS ===');
    const pickupLocations = await getPickupLocations();

    console.log('Raw pickup locations from ShipRocket:', JSON.stringify(pickupLocations, null, 2));
    console.log('Number of locations:', pickupLocations.length);

    if (pickupLocations.length > 0) {
      console.log('First location structure:', JSON.stringify(pickupLocations[0], null, 2));
      console.log('pickup_location field:', pickupLocations[0].pickup_location);
    }

    return Response.json({
      success: true,
      data: pickupLocations,
      message: `Found ${pickupLocations.length} pickup locations`,
      test: true
    });

  } catch (error) {
    console.error('Error fetching pickup locations:', error);

    // Return empty array - don't provide fake locations that will cause errors
    return Response.json({
      success: false,
      data: [],
      message: 'Failed to fetch pickup locations from ShipRocket',
      error: error.message
    }, { status: 500 });
  }
}
