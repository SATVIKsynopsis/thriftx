import admin from 'firebase-admin';

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  const config = {
    projectId: process.env.FIREBASE_PROJECT_ID || "thriftx-2"
  };

  // Check if service account credentials are available
  if (process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL) {
    // Use service account credentials
    const serviceAccount = {
      type: "service_account",
      project_id: process.env.FIREBASE_PROJECT_ID || "thriftx-2",
      private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
      private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      client_email: process.env.FIREBASE_CLIENT_EMAIL,
      client_id: process.env.FIREBASE_CLIENT_ID,
      auth_uri: "https://accounts.google.com/o/oauth2/auth",
      token_uri: "https://oauth2.googleapis.com/token",
      auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
      client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL
    };
    config.credential = admin.credential.cert(serviceAccount);
    console.log('Firebase Admin: Using service account credentials');
  } else {
    console.warn('Firebase Admin: No service account credentials found. Firestore operations may fail.');
    console.warn('To fix this, set FIREBASE_PRIVATE_KEY and FIREBASE_CLIENT_EMAIL environment variables');
    // Initialize without credentials - this may work in some environments
  }

  try {
    admin.initializeApp(config);
    console.log('Firebase Admin: Initialized successfully');
  } catch (error) {
    console.error('Firebase Admin: Failed to initialize:', error.message);
  }
}

// Export Firestore instance
export const adminDb = admin.firestore();

export const adminAuth = {
  // Add auth methods as needed
};

export default admin;