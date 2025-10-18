import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';


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
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
