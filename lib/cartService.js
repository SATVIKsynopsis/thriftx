import {
  collection,
  doc,
  setDoc,
  getDocs,
  deleteDoc,
  updateDoc,
  onSnapshot,
} from "firebase/firestore";
import { db } from "@/firebase/config";

// Fetch cart items (one-time)
export const getCartItems = async (uid) => {
  const cartRef = collection(db, "carts", uid, "items");
  const snapshot = await getDocs(cartRef);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

// Subscribe to realtime cart updates
export const subscribeToCart = (uid, callback) => {
  const cartRef = collection(db, "carts", uid, "items");
  return onSnapshot(cartRef, (snapshot) => {
    const items = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    callback(items);
  });
};

// Add new item or merge if exists
export const addOrUpdateCartItem = async (uid, item) => {
  const itemRef = doc(db, "carts", uid, "items", item.id.toString());
  await setDoc(itemRef, item, { merge: true });
};

// Update quantity only
export const updateCartQuantity = async (uid, id, quantity) => {
  const itemRef = doc(db, "carts", uid, "items", id.toString());
  await updateDoc(itemRef, { quantity });
};

// Remove item
export const removeCartItem = async (uid, id) => {
  const itemRef = doc(db, "carts", uid, "items", id.toString());
  await deleteDoc(itemRef);
};
