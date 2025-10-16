"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/firebase/config';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const signup = async (email, password, userData) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Update display name
    await updateProfile(user, {
      displayName: userData.name
    });

    // Create user profile in Firestore
    await setDoc(doc(db, 'users', user.uid), {
      name: userData.name,
      email: userData.email,
      role: userData.role || 'buyer',
      createdAt: new Date(),
      ...userData
    });

    return userCredential;
  };

  const login = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  const logout = () => {
    return signOut(auth);
  };

  const fetchUserProfile = async (uid) => {
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (userDoc.exists()) {
      setUserProfile(userDoc.data());
    }
  };

  // Check if user is super admin
  const isSuperAdmin = (user) => {
    return user && user.email === 'admin@thriftx.com';
  };

  // Check if user is admin or super admin
  const isAdmin = (user) => {
    if (!user) return false;
    if (isSuperAdmin(user)) return true;
    return userProfile?.role === 'admin';
  };

  // Check if user is seller, admin, or super admin
  const isSeller = (user) => {
    if (!user) return false;
    if (isAdmin(user)) return true;
    return userProfile?.role === 'seller';
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        await fetchUserProfile(user.uid);
      } else {
        setCurrentUser(null);
        setUserProfile(null);
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
