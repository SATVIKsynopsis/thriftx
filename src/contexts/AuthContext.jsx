"use client";

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { auth, db } from '@/firebase/config';
import { setCookie, deleteCookie } from 'cookies-next';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

const defaultAuthContextValue = {
  currentUser: null, 
  userProfile: null, 
  logout: () => Promise.resolve(), 
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
  const recaptchaVerifierRef = useRef(null);
  const route = useRouter();

  const setSessionCookie = async (user, role = null) => {
    const { getIdToken } = await import('firebase/auth');
    const token = await getIdToken(user, true);

    let userRole = role;
    if (!userRole) {
      const { doc, getDoc } = await import('firebase/firestore');
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);
      userRole = userSnap.exists() ? userSnap.data().role : 'buyer';
    }

    const sessionData = {
      token,
      role: userRole,
      email: user.email 
    };

    setCookie('__session', JSON.stringify(sessionData), {
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 
    });

    console.log("✅ Cookie set with role:", userRole);
    return userRole;
  };

  const login = async (email, password) => {
    const { signInWithEmailAndPassword, signOut } = await import('firebase/auth');
    const { doc, getDoc, setDoc } = await import('firebase/firestore');

    const result = await signInWithEmailAndPassword(auth, email, password);
    const user = result.user;

    if (!user.emailVerified) {
      await signOut(auth);
      throw { code: "auth/email-not-verified", message: "Please verify your email or phone number" };
    }

    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);
    let role;

    if (userSnap.exists()) {
      role = userSnap.data().role;
    } else {
      role = email === 'admin@thriftx.com' ? 'superadmin' : 'buyer';

      await setDoc(userRef, {
        name: user.displayName || 'Unknown User',
        email: user.email,
        role,
        createdAt: new Date()
      });
    }

    await setSessionCookie(user, role);
    return result;
  };

  const logout = async () => {
    const { signOut } = await import('firebase/auth');
    await signOut(auth);
    deleteCookie('__session', { path: '/' });
  };

  const signup = async (email, password, userData) => {
    try {
      const { createUserWithEmailAndPassword, updateProfile, sendEmailVerification, signOut } = await import('firebase/auth');
      const { doc, setDoc } = await import('firebase/firestore');

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await updateProfile(user, { displayName: userData.name });

      
      await sendEmailVerification(user);
      console.log("✅ Verification email sent to:", user.email);

      
      alert(`Verification email sent to ${email}. Please check your inbox.`);

      
      const role =
        email === "admin@thriftx.com"
          ? "superadmin"
          : userData.role || "buyer";

      await setDoc(doc(db, "users", user.uid), {
        name: userData.name,
        email: userData.email,
        role,
        createdAt: new Date(),
        ...userData,
        emailVerified: false, 
      });

      await signOut(auth);
      return userCredential;
    } catch (error) {
      console.error("❌ Error during signup:", error);
      throw error;
    }
  };

  
  const sendPhoneOTP = async (phoneNumber) => {
    if (!phoneNumber) throw new Error("Phone number is required");

    if (phoneNumber.length < 10) {
      toast.error('Please enter a valid 10-digit phone number.');
      return;
    }

    try {
      const formattedPhoneNumber = `+${phoneNumber.replace(/\D/g, '')}`;
      if (recaptchaVerifierRef.current) {
        const { signInWithPhoneNumber } = await import('firebase/auth');
        const confirmation = await signInWithPhoneNumber(auth, formattedPhoneNumber, recaptchaVerifierRef.current);
        toast.success("OTP has been sent.");
        console.log("confirmation : ", confirmation);
        return confirmation;
      }
    } catch (error) {
      console.error('Error sending OTP:', error);
      toast.error("Error sending OTP");
      recaptchaVerifierRef.current?.clear();
    }
  };

  const fetchUserProfile = async (uid) => {
    const { doc, getDoc } = await import('firebase/firestore');
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (userDoc.exists()) {
      const profileData = userDoc.data();
      setUserProfile(profileData);
      return profileData;
    }
    return null;
  };

  
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
    let unsubscribe = () => {};
    (async () => {
      const { onAuthStateChanged } = await import('firebase/auth');
      unsubscribe = onAuthStateChanged(auth, async (user) => {
        if (user) {
          setCurrentUser(user);
          const profile = await fetchUserProfile(user.uid);
          await setSessionCookie(user, profile?.role);
          console.log("🔄 Session refreshed with role:", profile?.role);
          route.push('/');
        } else {
         
          setCurrentUser(null);
          setUserProfile(null);

          
          if (typeof window !== 'undefined') {
            localStorage.removeItem('firebase:authUser');
            sessionStorage.clear();
          }

          deleteCookie('__session', { path: '/' });
        }

        setLoading(false);
      });
    })();

    return () => {
      try { unsubscribe(); } catch (e) { }
    };
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
    hasRole,
    sendPhoneOTP,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};