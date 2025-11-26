import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';


const firebaseConfig = {
  apiKey: "AIzaSyDbtpTS6Jw7aNQdv2vsT655LhCluxwlvA0",
  authDomain: "thriftx-2.firebaseapp.com",
  databaseURL: "https://thriftx-2-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "thriftx-2",
  storageBucket: "thriftx-2.firebasestorage.app",
  messagingSenderId: "586699495632",
  appId: "1:586699495632:web:cc58f37e27bbe3cb3ae6d5",
  measurementId: "G-Y6C721EYBX"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
