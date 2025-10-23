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

// Define the shape of the default value with all expected properties
const defaultAuthContextValue = {
  currentUser: null, // <-- Must be present!
  userProfile: null, // <-- Must be present!
  logout: () => Promise.resolve(), // Add dummy function for safety
  signup: () => Promise.resolve(),
  login: () => Promise.resolve(),
  fetchUserProfile: () => Promise.resolve(null),
  isSuperAdmin: () => false,
  isAdmin: () => false,
  isSeller: () => false,
  hasRole: () => false,
};

const AuthContext = createContext(defaultAuthContextValue);

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // ✅ CONSISTENT: Always set cookie as JSON object
  const setSessionCookie = async (user, role = null) => {
    const token = await getIdToken(user, true);
    
    // If role not provided, fetch it from Firestore
    let userRole = role;
    if (!userRole) {
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);
      userRole = userSnap.exists() ? userSnap.data().role : 'buyer';
    }

    const sessionData = { 
      token, 
      role: userRole,
      email: user.email // Optional: include email for easier debugging
    };

    setCookie('__session', JSON.stringify(sessionData), {
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 // 24 hours
    });

    console.log("✅ Cookie set with role:", userRole);
    return userRole;
  };

  // ✅ UPDATED: Login uses consistent cookie setting
  const login = async (email, password) => {
    const result = await signInWithEmailAndPassword(auth, email, password);
    const user = result.user;

    // ✅ Firestore reference to get user role
    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);

    let role;

    if (userSnap.exists()) {
      // ✅ If user exists in Firestore, use their stored role
      role = userSnap.data().role;
    } else {
      // ✅ If no Firestore doc exists, auto-create one
      role = email === 'admin@thriftx.com' ? 'superadmin' : 'buyer';

      await setDoc(userRef, {
        name: user.displayName || 'Unknown User',
        email: user.email,
        role,
        createdAt: new Date()
      });
    }

    // ✅ Use consistent cookie setting function
    await setSessionCookie(user, role);
    return result;
  };

  // ✅ UPDATED: Logout removes session cookie
  const logout = async () => {
    await signOut(auth);
    deleteCookie('__session', { path: '/' });
  };

  const signup = async (email, password, userData) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    await updateProfile(user, { displayName: userData.name });

    // Determine role - allow superadmin creation only for specific email
    const role = email === 'admin@thriftx.com' ? 'superadmin' : (userData.role || 'buyer');

    await setDoc(doc(db, 'users', user.uid), {
      name: userData.name,
      email: userData.email,
      role: role,
      createdAt: new Date(),
      ...userData
    });

    // Set initial cookie after signup
    await setSessionCookie(user, role);
    return userCredential;
  };

  const fetchUserProfile = async (uid) => {
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (userDoc.exists()) {
      const profileData = userDoc.data();
      setUserProfile(profileData);
      return profileData;
    }
    return null;
  };

  // ✅ Role checking functions
  const isSuperAdmin = () => {
    return userProfile?.role === 'superadmin';
  };

  const isAdmin = () => {
    return ['admin', 'superadmin'].includes(userProfile?.role);
  };

  const isSeller = () => {
    return ['seller', 'admin', 'superadmin'].includes(userProfile?.role);
  };

  const hasRole = (requiredRole) => {
    if (!userProfile?.role) return false;
    
    const roleHierarchy = {
      'superadmin': ['superadmin', 'admin', 'seller', 'buyer'],
      'admin': ['admin', 'seller', 'buyer'],
      'seller': ['seller', 'buyer'],
      'buyer': ['buyer']
    };

    return roleHierarchy[userProfile.role]?.includes(requiredRole) || false;
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // User logged in: set state
        setCurrentUser(user);
        const profile = await fetchUserProfile(user.uid);

        // ✅ Use consistent cookie setting function
        await setSessionCookie(user, profile?.role);

        console.log("🔄 Session refreshed with role:", profile?.role);
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
    isSeller,
    hasRole
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};