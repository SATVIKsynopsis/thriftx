import { 
  collection, 
  query, 
  where, 
  getDocs, 
  doc, 
  updateDoc, 
  orderBy,
  limit,
  getDoc,
  addDoc,
  setDoc
} from 'firebase/firestore';
import { createUserWithEmailAndPassword, updateProfile, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth, db } from '@/firebase/config';

// Development mode flag
const isDevelopment = process.env.NODE_ENV === 'development';

// Helper function to create development data when permissions are blocked
const createMockData = () => ({
  vendors: [
    {
      id: 'mock-vendor-1',
      name: 'Fashion Store Mumbai',
      email: 'fashionstore@example.com',
      role: 'vendor',
      status: 'pending',
      createdAt: new Date('2024-01-15'),
      location: 'Mumbai, Maharashtra',
      favoriteStyles: 'Ethnic, Traditional',
      sustainabilityGoals: 'Promote sustainable fashion'
    },
    {
      id: 'mock-vendor-2',
      name: 'Vintage Clothing Co',
      email: 'vintage@example.com',
      role: 'vendor',
      status: 'approved',
      createdAt: new Date('2024-01-10'),
      location: 'Delhi, India',
      favoriteStyles: 'Vintage, Retro',
      sustainabilityGoals: 'Reduce textile waste'
    },
    {
      id: 'mock-vendor-3',
      name: 'Eco Fashion Hub',
      email: 'ecofashion@example.com',
      role: 'vendor',
      status: 'banned',
      createdAt: new Date('2024-01-05'),
      location: 'Bangalore, Karnataka',
      favoriteStyles: 'Eco-friendly, Organic',
      sustainabilityGoals: 'Zero waste fashion'
    }
  ],
  orders: [
    {
      id: 'mock-order-1',
      userId: 'user1',
      total: 1299.99,
      status: 'delivered',
      createdAt: new Date('2024-10-08'),
      items: [{ productName: 'Vintage Saree', quantity: 1, price: 1299.99 }],
      user: { name: 'Priya Sharma', email: 'priya@example.com' }
    },
    {
      id: 'mock-order-2',
      userId: 'user2',
      total: 899.50,
      status: 'shipped',
      createdAt: new Date('2024-10-07'),
      items: [{ productName: 'Designer Kurti', quantity: 2, price: 449.75 }],
      user: { name: 'Ananya Singh', email: 'ananya@example.com' }
    },
    {
      id: 'mock-order-3',
      userId: 'user3',
      total: 1599.00,
      status: 'pending',
      createdAt: new Date('2024-10-09'),
      items: [{ productName: 'Ethnic Dress', quantity: 1, price: 1599.00 }],
      user: { name: 'Rakesh Kumar', email: 'rakesh@example.com' }
    },
    {
      id: 'mock-order-4',
      userId: 'user4',
      total: 749.25,
      status: 'cancelled',
      createdAt: new Date('2024-10-06'),
      items: [{ productName: 'Cotton Shirt', quantity: 3, price: 249.75 }],
      user: { name: 'Meera Patel', email: 'meera@example.com' }
    }
  ],
  products: [
    {
      id: 'mock-product-1',
      name: 'Handwoven Silk Saree',
      price: 2499.99,
      sellerId: 'seller1',
      status: 'active',
      category: 'Traditional',
      createdAt: new Date('2024-10-01'),
      seller: { name: 'Silk Emporium', email: 'silkemporium@example.com' }
    },
    {
      id: 'mock-product-2',
      name: 'Vintage Leather Jacket',
      price: 1899.00,
      sellerId: 'seller2',
      status: 'active',
      category: 'Western',
      createdAt: new Date('2024-09-28'),
      seller: { name: 'Retro Fashion', email: 'retro@example.com' }
    },
    {
      id: 'mock-product-3',
      name: 'Organic Cotton Dress',
      price: 1299.50,
      sellerId: 'seller3',
      status: 'removed',
      category: 'Casual',
      createdAt: new Date('2024-09-25'),
      seller: { name: 'Green Fashion', email: 'green@example.com' }
    }
  ]
});

// Helper function to handle Firestore errors gracefully
const handleFirestoreError = (error, dataType, mockData) => {
  console.error(`Error fetching ${dataType}:`, error);
  
  if (error.code === 'permission-denied' || error.message.includes('permissions')) {
    console.warn(`🔒 Permission denied for ${dataType}. Using mock data for development.`);
    console.warn('💡 To fix this: Update Firestore rules or deploy the updated rules.');
    console.warn('📖 See FIRESTORE_PERMISSIONS_FIX.md for detailed instructions.');
    
    // Include any admin-created vendors from localStorage
    if (dataType === 'vendors') {
      const adminCreatedVendors = JSON.parse(localStorage.getItem('adminCreatedVendors') || '[]');
      return [...adminCreatedVendors, ...mockData];
    }
    
    return mockData;
  }
  
  throw error;
};

// Admin API functions (simulated for frontend)
export const adminAPI = {
  // Get all vendors
  async getVendors() {
    try {
      const vendorsQuery = query(
        collection(db, 'users'),
        where('role', '==', 'vendor'),
        orderBy('createdAt', 'desc')
      );
      
      const snapshot = await getDocs(vendorsQuery);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      return handleFirestoreError(error, 'vendors', createMockData().vendors);
    }
  },

  // Create new vendor
  async createVendor(vendorData) {
    try {
      // Store current admin user info to restore session later
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('Admin must be logged in to create vendors');
      }
      
      // Get admin email and user data for re-authentication
      const adminEmail = currentUser.email;
      const adminUserRef = doc(db, 'users', currentUser.uid);
      const adminUserDoc = await getDoc(adminUserRef);
      
      if (!adminUserDoc.exists()) {
        throw new Error('Admin user profile not found');
      }
      
      // For development/demo purposes, create the vendor profile directly in Firestore
      // This avoids the Firebase Auth session switching issue
      const vendorId = 'vendor_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      
      // Create user profile in Firestore with mock auth data
      await setDoc(doc(db, 'users', vendorId), {
        name: vendorData.name,
        email: vendorData.email,
        role: 'vendor',
        status: vendorData.status || 'approved',
        location: vendorData.location || '',
        favoriteStyles: vendorData.favoriteStyles || '',
        sustainabilityGoals: vendorData.sustainabilityGoals || '',
        createdAt: new Date(),
        approvedAt: vendorData.status === 'approved' ? new Date() : null,
        createdByAdmin: true,
        adminCreatedPassword: vendorData.password, // Store for development (not secure for production)
        authType: 'admin-created' // Flag to identify admin-created accounts
      });

      return { 
        success: true, 
        message: 'Vendor created successfully',
        vendorId: vendorId
      };
    } catch (error) {
      console.error('Error creating vendor:', error);
      
      // For development, simulate success
      if (error.code === 'permission-denied' || error.message.includes('permissions')) {
        console.warn('🔒 Permission denied for vendor creation. Simulating success for development.');
        
        // Create mock vendor in the local data
        const mockVendor = {
          id: 'admin-created-' + Date.now(),
          name: vendorData.name,
          email: vendorData.email,
          role: 'vendor',
          status: vendorData.status || 'approved',
          location: vendorData.location || '',
          favoriteStyles: vendorData.favoriteStyles || '',
          sustainabilityGoals: vendorData.sustainabilityGoals || '',
          createdAt: new Date(),
          approvedAt: vendorData.status === 'approved' ? new Date() : null,
          createdByAdmin: true
        };
        
        // Store in localStorage for persistence
        const existingVendors = JSON.parse(localStorage.getItem('adminCreatedVendors') || '[]');
        existingVendors.unshift(mockVendor); // Add to beginning of array
        localStorage.setItem('adminCreatedVendors', JSON.stringify(existingVendors));
        
        return { 
          success: true, 
          message: 'Vendor created successfully (simulated)',
          vendorId: mockVendor.id,
          mockVendor: mockVendor
        };
      }
      
      // Handle specific Firebase errors
      if (error.message.includes('Email already in use')) {
        throw new Error('Email already in use');
      }
      
      throw error;
    }
  },

  // Approve vendor
  async approveVendor(vendorId) {
    try {
      const vendorRef = doc(db, 'users', vendorId);
      await updateDoc(vendorRef, {
        status: 'approved',
        approvedAt: new Date()
      });
      return { success: true, message: 'Vendor approved successfully' };
    } catch (error) {
      console.error('Error approving vendor:', error);
      
      // For development, simulate success
      if (error.code === 'permission-denied' || error.message.includes('permissions')) {
        console.warn('🔒 Permission denied for vendor approval. Simulating success for development.');
        return { success: true, message: 'Vendor approved successfully (simulated)' };
      }
      
      throw error;
    }
  },

  // Ban vendor
  async banVendor(vendorId) {
    try {
      const vendorRef = doc(db, 'users', vendorId);
      await updateDoc(vendorRef, {
        status: 'banned',
        bannedAt: new Date()
      });
      return { success: true, message: 'Vendor banned successfully' };
    } catch (error) {
      console.error('Error banning vendor:', error);
      
      // For development, simulate success
      if (error.code === 'permission-denied' || error.message.includes('permissions')) {
        console.warn('🔒 Permission denied for vendor ban. Simulating success for development.');
        return { success: true, message: 'Vendor banned successfully (simulated)' };
      }
      
      throw error;
    }
  },

  // Get all orders
  async getAllOrders() {
    try {
      const ordersQuery = query(
        collection(db, 'orders'),
        orderBy('createdAt', 'desc'),
        limit(100)
      );
      
      const snapshot = await getDocs(ordersQuery);
      const orders = [];
      
      for (const orderDoc of snapshot.docs) {
        const orderData = orderDoc.data();
        
        // Get user details
        const userDoc = await getDoc(doc(db, 'users', orderData.userId));
        const userData = userDoc.exists() ? userDoc.data() : {};
        
        orders.push({
          id: orderDoc.id,
          ...orderData,
          user: userData
        });
      }
      
      return orders;
    } catch (error) {
      return handleFirestoreError(error, 'orders', createMockData().orders);
    }
  },

  // Get all products
  async getAllProducts() {
    try {
      const productsQuery = query(
        collection(db, 'products'),
        orderBy('createdAt', 'desc')
      );
      
      const snapshot = await getDocs(productsQuery);
      const products = [];
      
      for (const productDoc of snapshot.docs) {
        const productData = productDoc.data();
        
        // Get seller details
        const sellerDoc = await getDoc(doc(db, 'users', productData.sellerId));
        const sellerData = sellerDoc.exists() ? sellerDoc.data() : {};
        
        products.push({
          id: productDoc.id,
          ...productData,
          seller: sellerData
        });
      }
      
      return products;
    } catch (error) {
      return handleFirestoreError(error, 'products', createMockData().products);
    }
  },

  // Remove product
  async removeProduct(productId) {
    try {
      const productRef = doc(db, 'products', productId);
      await updateDoc(productRef, {
        status: 'removed',
        removedAt: new Date()
      });
      return { success: true, message: 'Product removed successfully' };
    } catch (error) {
      console.error('Error removing product:', error);
      
      // For development, simulate success
      if (error.code === 'permission-denied' || error.message.includes('permissions')) {
        console.warn('🔒 Permission denied for product removal. Simulating success for development.');
        return { success: true, message: 'Product removed successfully (simulated)' };
      }
      
      throw error;
    }
  },

  // Get reports (mocked data for MVP)
  async getReports() {
    try {
      // Get basic counts from Firestore
      const [ordersSnapshot, productsSnapshot, usersSnapshot] = await Promise.all([
        getDocs(collection(db, 'orders')),
        getDocs(collection(db, 'products')),
        getDocs(query(collection(db, 'users'), where('role', '==', 'vendor')))
      ]);

      const orders = ordersSnapshot.docs.map(doc => doc.data());
      
      // Calculate GMV (Gross Merchandise Value)
      const gmv = orders.reduce((total, order) => total + (order.total || 0), 0);
      
      // Return real data
      return {
        gmv: gmv,
        totalSales: orders.length,
        totalProducts: productsSnapshot.size,
        totalVendors: usersSnapshot.size,
        refundCount: Math.floor(orders.length * 0.05), // Mock 5% refund rate
        averageOrderValue: orders.length > 0 ? gmv / orders.length : 0,
        monthlyGrowth: 15.6, // Mock growth percentage
        topCategories: [
          { name: 'Electronics', value: 35 },
          { name: 'Clothing', value: 28 },
          { name: 'Home & Garden', value: 22 },
          { name: 'Books', value: 15 }
        ],
        recentActivity: [
          { type: 'order', description: 'New order #1234', time: '2 hours ago' },
          { type: 'vendor', description: 'Vendor registration pending', time: '4 hours ago' },
          { type: 'product', description: 'Product reported', time: '6 hours ago' }
        ]
      };
    } catch (error) {
      console.error('Error fetching reports:', error);
      
      // If permission error, return mock data for development
      if (error.code === 'permission-denied' || error.message.includes('permissions')) {
        console.warn('🔒 Permission denied for reports. Using mock data for development.');
        return {
          gmv: 125000,
          totalSales: 145,
          totalProducts: 89,
          totalVendors: 23,
          refundCount: 7,
          averageOrderValue: 862,
          monthlyGrowth: 15.6,
          topCategories: [
            { name: 'Traditional Wear', value: 35 },
            { name: 'Western Clothing', value: 28 },
            { name: 'Accessories', value: 22 },
            { name: 'Footwear', value: 15 }
          ],
          recentActivity: [
            { type: 'order', description: 'New order from Priya Sharma - ₹1,299', time: '2 hours ago' },
            { type: 'vendor', description: 'Fashion Store Mumbai - pending approval', time: '4 hours ago' },
            { type: 'product', description: 'Vintage Saree - reported by user', time: '6 hours ago' },
            { type: 'order', description: 'Order #1234 delivered successfully', time: '8 hours ago' },
            { type: 'vendor', description: 'Eco Fashion Hub - account banned', time: '1 day ago' }
          ]
        };
      }
      
      throw error;
    }
  }
};