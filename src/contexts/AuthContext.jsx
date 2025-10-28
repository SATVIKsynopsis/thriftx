"use client";

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
// Firebase will be dynamically imported and initialized on-demand to reduce
// initial JS and to support mobile-only lazy init. See lazyInitializeFirebase.
import { lazyInitializeFirebase } from '@/firebase/lazyInit';
import { setCookie, deleteCookie } from 'cookies-next';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

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
  const recaptchaVerifierRef = useRef(null);
  const authRef = useRef(null);
  const dbRef = useRef(null);
  const route = useRouter();

  const setSessionCookie = async (user, role = null) => {
    // Prefer the instance method to avoid importing helpers synchronously
    const token = await user.getIdToken(true);

    let userRole = role;
    if (!userRole) {
      const { doc, getDoc } = await import('firebase/firestore');
      const userRef = doc(dbRef.current, 'users', user.uid);
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

  const login = async (email, password) => {
    const { signInWithEmailAndPassword, signOut } = await import('firebase/auth');
    const { doc, getDoc, setDoc } = await import('firebase/firestore');

    const result = await signInWithEmailAndPassword(authRef.current, email, password);
    const user = result.user;

    if (!user.emailVerified) {
      await signOut(authRef.current);
      throw { code: "auth/email-not-verified", message: "Please verify your email or phone number" };
    }

    const userRef = doc(dbRef.current, 'users', user.uid);
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
    await signOut(authRef.current);
    deleteCookie('__session', { path: '/' });
  };

  const signup = async (email, password, userData) => {
    try {
      const { createUserWithEmailAndPassword, updateProfile, sendEmailVerification, signOut } = await import('firebase/auth');
      const { doc, setDoc } = await import('firebase/firestore');

      // 1️⃣ Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(authRef.current, email, password);
      const user = userCredential.user;

      // 2️⃣ Set display name
      await updateProfile(user, { displayName: userData.name });

      // 3️⃣ Send verification email (⚠️ Do NOT auto-login yet)
      await sendEmailVerification(user);
      console.log("✅ Verification email sent to:", user.email);

      // (Optional) You can use toast instead of alert for better UX
      alert(`Verification email sent to ${email}. Please check your inbox.`);

      // 4️⃣ Store user details in Firestore
      const role =
        email === "admin@thriftx.com"
          ? "superadmin"
          : userData.role || "buyer";

      await setDoc(doc(dbRef.current, "users", user.uid), {
        name: userData.name,
        email: userData.email,
        role,
        createdAt: new Date(),
        ...userData,
        emailVerified: false, // ✅ track verification status if you want
      });

      await signOut(authRef.current);
      return userCredential;
    } catch (error) {
      console.error("❌ Error during signup:", error);
      throw error;
    }
  };

  // Add at the bottom of AuthProvider before `return`
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
        const confirmation = await signInWithPhoneNumber(authRef.current, formattedPhoneNumber, recaptchaVerifierRef.current);
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
    const userDoc = await getDoc(doc(dbRef.current, 'users', uid));
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
    let unsub = null;
    (async () => {
      // Decide mobile vs desktop. Only perform the idle/lazy initialization on mobile.
      const isClient = typeof window !== 'undefined';
      const isMobile = isClient && window.matchMedia && window.matchMedia('(max-width: 767px)').matches;

      if (isClient) {
        if (isMobile) {
          const initialized = await lazyInitializeFirebase();
          authRef.current = initialized.auth;
          dbRef.current = initialized.db;
        } else {
          // For desktop keep behavior close to original: import the eager config at mount
          const mod = await import('@/firebase/config');
          authRef.current = mod.auth;
          dbRef.current = mod.db;
        }

        const { onAuthStateChanged } = await import('firebase/auth');
        unsub = onAuthStateChanged(authRef.current, async (user) => {
          if (user) {
            setCurrentUser(user);
            const profile = await fetchUserProfile(user.uid);
            await setSessionCookie(user, profile?.role);
            console.log("🔄 Session refreshed with role:", profile?.role);
            route.push('/');
          } else {
            // ✅ User signed out: remove token + cookie
            setCurrentUser(null);
            setUserProfile(null);
            // route.push('/login');

            // Destroy token persistence
            if (typeof window !== 'undefined') {
              localStorage.removeItem('firebase:authUser');
              sessionStorage.clear();
            }

            deleteCookie('__session', { path: '/' });
          }

          setLoading(false);
        });
      } else {
        // Server: nothing to do
        setLoading(false);
      }
    })();

    return () => {
      if (typeof unsub === 'function') unsub();
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