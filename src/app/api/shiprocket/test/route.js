export async function GET(request) {
  try {
    // Test ShipRocket pickup locations
    const { getPickupLocations } = await import('@/utils/shiprocket');
    const locations = await getPickupLocations();

    // Test Firebase Admin
    const { adminDb } = await import('@/lib/firebaseAdmin');

    return Response.json({
      success: true,
      message: 'All integrations working!',
      shiprocket: {
        locationsCount: locations.length,
        firstLocation: locations[0] || null
      },
      firebase: {
        initialized: !!adminDb,
        projectId: process.env.FIREBASE_PROJECT_ID
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Integration test failed:', error);
    return Response.json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}