import { adminDb } from '@/lib/firebaseAdmin';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return Response.json({ error: 'User ID required' }, { status: 400 });
    }

    // Fetch orders where user is buyer
    const buyerOrdersQuery = adminDb.collection('orders')
      .where('buyerId', '==', userId)
      .orderBy('createdAt', 'desc')
      .limit(50);

    const buyerSnapshot = await buyerOrdersQuery.get();
    const buyerOrders = buyerSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      type: 'purchase'
    }));

    // Fetch orders where user is seller
    const sellerOrdersQuery = adminDb.collection('orders')
      .where('sellerId', '==', userId)
      .orderBy('createdAt', 'desc')
      .limit(50);

    const sellerSnapshot = await sellerOrdersQuery.get();
    const sellerOrders = sellerSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      type: 'sale'
    }));

    // Combine and sort
    const allOrders = [...buyerOrders, ...sellerOrders].sort((a, b) => {
      const dateA = a.createdAt?.toDate?.() || new Date(a.createdAt || 0);
      const dateB = b.createdAt?.toDate?.() || new Date(b.createdAt || 0);
      return dateB.getTime() - dateA.getTime();
    });

    return Response.json({ orders: allOrders });

  } catch (error) {
    console.error('Error fetching orders:', error);
    return Response.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}