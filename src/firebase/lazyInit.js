// Mobile-only lazy initializer for Firebase
// This file intentionally duplicates the firebaseConfig to avoid importing
// the eager `src/firebase/config.js` which initializes Firebase at module load.
export async function lazyInitializeFirebase() {
  if (typeof window === 'undefined') return {};

  // Wait until the browser is idle (after first paint) to avoid blocking FCP/LCP
  await new Promise((resolve) => {
    if ('requestIdleCallback' in window) requestIdleCallback(resolve);
    else setTimeout(resolve, 200);
  });

  const { initializeApp } = await import('firebase/app');
  const { getAuth } = await import('firebase/auth');
  const { getFirestore } = await import('firebase/firestore');
  const { getStorage } = await import('firebase/storage');

  const firebaseConfig = {
    apiKey: "AIzaSyDNz7FyH04bJ1uJIEstiLn-PtqTwd3iXF8",
    authDomain: "thriftx-a236f.firebaseapp.com",
    databaseURL: "https://thriftx-a236f-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "thriftx-a236f",
    storageBucket: "thriftx-a236f.firebasestorage.app",
    messagingSenderId: "415766022413",
    appId: "1:415766022413:web:6a3e17b8a9a1352889c844",
    measurementId: "G-6VJJ00SYVW"
  };

  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const db = getFirestore(app);
  const storage = getStorage(app);

  return { app, auth, db, storage };
}
