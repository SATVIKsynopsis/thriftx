"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  getIdToken
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/firebase/config';
import { setCookie, deleteCookie } from 'cookies-next';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // ✅ UPDATED: Login handles token + cookie setting
const login = async (email, password) => {
  const result = await signInWithEmailAndPassword(auth, email, password);
  const user = result.user;

  // ✅ Get Firebase token
  const token = await getIdToken(user, true);

  // ✅ Firestore reference
  const userRef = doc(db, 'users', user.uid);
  const userSnap = await getDoc(userRef);

  let role;

  if (userSnap.exists()) {
    // ✅ If user exists in Firestore, use their stored role
    role = userSnap.data().role;
  } else {
    // ✅ If no Firestore doc exists, auto-create one
    // ✅ Automatically assign superadmin for specific email
    role = email === 'admin@thriftx.com' ? 'superadmin' : 'buyer';

    await setDoc(userRef, {
      name: user.displayName || 'Unknown User',
      email: user.email,
      role,
      createdAt: new Date()
    });
  }

  // ✅ Save token + role in cookie for middleware use
  setCookie('__session', JSON.stringify({ token, role }), {
    path: '/',
    secure: process.env.NODE_ENV === 'production'
  });

  console.log("✅ Cookie set with role:", role);
  return result;
};



  // ✅ UPDATED: Logout removes session cookie
const logout = async () => {
  await signOut(auth);
  deleteCookie('__session');
};


  const signup = async (email, password, userData) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    await updateProfile(user, { displayName: userData.name });

    await setDoc(doc(db, 'users', user.uid), {
      name: userData.name,
      email: userData.email,
      role: userData.role || 'buyer',
      createdAt: new Date(),
      ...userData
    });

    return userCredential;
  };

  const fetchUserProfile = async (uid) => {
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (userDoc.exists()) {
      setUserProfile(userDoc.data());
    }
  };

  const isSuperAdmin = (user) => {
    return user && user.email === 'admin@thriftx.com';
  };

  const isAdmin = (user) => {
    if (!user) return false;
    if (isSuperAdmin(user)) return true;
    return userProfile?.role === 'admin';
  };

  const isSeller = (user) => {
    if (!user) return false;
    if (isAdmin(user)) return true;
    return userProfile?.role === 'seller';
  };

useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, async (user) => {
    if (user) {
      // User logged in: set state
      setCurrentUser(user);
      await fetchUserProfile(user.uid);

      // ✅ Set fresh token in cookie
      const token = await user.getIdToken(true);
      setCookie('__session', token, {
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
      });
    } else {
      // ✅ User signed out: remove token + cookie
      setCurrentUser(null);
      setUserProfile(null);

      // Destroy token persistence
      if (typeof window !== 'undefined') {
        localStorage.removeItem('firebase:authUser');
        sessionStorage.clear();
      }

      deleteCookie('__session', { path: '/' });
    }

    setLoading(false);
  });

  return unsubscribe;
}, []);


  const value = {
    currentUser,
    userProfile,
    signup,
    login,
    logout,
    fetchUserProfile,
    isSuperAdmin,
    isAdmin,
    isSeller
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
