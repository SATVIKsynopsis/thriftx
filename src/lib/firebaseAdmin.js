import admin from "firebase-admin";

if (!admin.apps.length) {
  console.log("Initializing Firebase Admin…");

  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      }),
    });

    console.log("🔥 Firebase Admin initialized");
  } catch (err) {
    console.error("❌ Firebase Admin init error:", err);
  }
}

export const adminDb = admin.firestore();
