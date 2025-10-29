"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Eye, EyeOff, Mail, Lock, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import toast from "react-hot-toast";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db, auth } from "@/firebase/config";

const LoginComponent = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const router = useRouter();
  const from = "/";
  const pathname = usePathname();
  const role = pathname.includes("seller") ? "seller" : "buyer";

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Invalid email";

    if (!formData.password) newErrors.password = "Password is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const userCredential = await login(formData.email, formData.password);
      const user = userCredential.user;

      if (!user.emailVerified) {
        await auth.signOut();
        toast.error("Please verify your email before logging in.");
        setLoading(false);
        return;
      }

      toast.success("Welcome back to ThriftX 👋");
      router.push("/");
    } catch (error) {
      console.error("Login error:", error);
      // console.log(error);
      if (error.code.includes('auth/email-not-verified')) {
        toast.error(error.message);
      } else {
        switch (error.code) {
          case "auth/user-not-found":
            toast.error("No account found with this email");
            break;
          case "auth/wrong-password":
            toast.error("Incorrect password");
            break;
          case "auth/invalid-email":
            toast.error("Invalid email address");
            break;
          default:
            toast.error("Login failed. Please try again.");
        }
      }
    } finally {
      setLoading(false);
    }
  };

   // Google Login
  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    setLoading(true);

    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        await setDoc(userRef, {
          name: user.displayName,
          email: user.email,
          photoURL: user.photoURL,
          role,
          createdAt: new Date().toISOString(),
        });
      }

      toast.success(`Welcome ${user.displayName}!`);
      router.push("/");
    } catch (error) {
      console.error("Google sign-in error:", error);
      toast.error("Google sign-in failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };




  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-neutral-900 px-3 md:px-6 py-12">
      <div className="w-full max-w-md border border-gray-200 dark:border-gray-800 bg-white dark:bg-black rounded-3xl shadow-xl dark:shadow-[0_0_25px_rgba(255,255,255,0.05)] p-5 md:p-8 backdrop-blur-md transition-colors">

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Welcome <span className="text-transparent bg-clip-text bg-lime-500">Back</span>
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm font-light">
            Sign in to continue your ThriftX journey
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">

          {/* Email */}
          <InputField
            label="Email"
            name="email"
            type="email"
            icon={<Mail size={18} />}
            value={formData.email}
            onChange={handleChange}
            error={errors.email}
          />

          {/* Password */}
          <InputField
            label="Password"
            name="password"
            type={showPassword ? "text" : "password"}
            icon={<Lock size={18} />}
            value={formData.password}
            onChange={handleChange}
            error={errors.password}
            toggle={showPassword}
            setToggle={setShowPassword}
          />

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-lime-500 text-black font-semibold rounded-full shadow-lg hover:scale-[1.02] hover:opacity-90 transition-all duration-300 flex items-center justify-center gap-2"
          >
            {loading && <Loader2 className="animate-spin" size={18} />}
            {loading ? "Signing you in..." : "Sign In"}
          </button>
        </form>
        {/* Google Login */}
        <div className="mt-6 flex flex-col items-center">
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-3">or</p>
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full py-3 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 font-semibold rounded-full shadow-md hover:bg-gray-100 dark:hover:bg-neutral-800 flex items-center justify-center gap-3 transition-all duration-300"
          >
            <img
              src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
              alt="Google"
              className="w-5 h-5"
            />
            Continue with Google
          </button>
        </div>

        {/* Footer */}
        <div className="text-center text-gray-500 dark:text-gray-400 mt-8 text-sm">
          <p>
            Don’t have an account?{" "}
            <Link
              href="/register/customer"
              className="text-lime-600 dark:text-lime-400 hover:text-blue-500 font-semibold transition-colors hover:underline"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

/* ------------------ Input Field Component ------------------ */
const InputField = ({
  label,
  name,
  type = "text",
  icon,
  value,
  onChange,
  error,
  toggle,
  setToggle,
}) => (
  <div className="relative group">
    <label className="block text-gray-700 dark:text-gray-300 font-medium mb-1">
      {label}
    </label>

    <div
      className={`relative rounded-full overflow-hidden border ${error ? "border-red-500" : "border-gray-300 dark:border-gray-700"
        } bg-white dark:bg-neutral-900/50 transition-all group-hover:border-lime-400`}
    >
      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">
        {icon}
      </div>

      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        className="w-full bg-transparent text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 pl-10 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-lime-500 rounded-full"
      />

      {toggle !== undefined && (
        <button
          type="button"
          onClick={() => setToggle(!toggle)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white"
        >
          {toggle ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      )}
    </div>

    {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
  </div>
);

export default LoginComponent;
