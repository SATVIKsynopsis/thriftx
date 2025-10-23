"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  MapPin,
  Heart,
  Users,
  Loader2,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import toast from "react-hot-toast";

const BuyerRegister = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "buyer",
    location: "",
    favoriteStyles: "",
    sustainabilityGoals: "",
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { signup } = useAuth();
  const router = useRouter();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "Invalid email";
    if (!formData.password) newErrors.password = "Password is required";
    else if (formData.password.length < 6)
      newErrors.password = "Password must be at least 6 characters";
    if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = "Passwords do not match";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    try {
      await signup(formData.email, formData.password, {
        name: formData.name.trim(),
        email: formData.email,
        role: "buyer",
        location: formData.location.trim(),
        favoriteStyles: formData.favoriteStyles.trim(),
        sustainabilityGoals: formData.sustainabilityGoals.trim(),
      });
      toast.success("Welcome to ThriftX 🎉");
      router.push("/");
    } catch (error) {
      console.error("Registration error:", error);
      toast.error(
        error.code === "auth/email-already-in-use"
          ? "Email already registered"
          : error.code === "auth/weak-password"
          ? "Password is too weak"
          : error.code === "auth/invalid-email"
          ? "Invalid email format"
          : `Error: ${error.message}`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      // Light Mode: bg-gray-50, Dark Mode: bg-gradient-to-br from-[#0a0a0a]...
      className="min-h-screen flex items-center justify-center 
      bg-gray-50 dark:bg-gradient-to-br dark:from-[#0a0a0a] dark:via-[#121212] dark:to-[#1a1a1a]
       px-4 sm:px-6 py-12 transition-colors"
    >
      <div
        // Light Mode: bg-white border-gray-200 shadow-xl, Dark Mode: border-gray-800 bg-gradient-to-br...
        className="w-full max-w-3xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gradient-to-br 
        dark:bg-black rounded-3xl 
        shadow-xl dark:shadow-[0_0_25px_rgba(255,255,255,0.05)] p-4 sm:p-8 backdrop-blur-md transition-colors"
      >
        {/* HEADER */}
        <div className="text-center mb-8">
          <h1 
            // Light Mode: text-gray-900, Dark Mode: text-white
            className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight"
          >
            Join{" "}
            <span className="text-transparent bg-clip-text bg-lime-500">
              Thrift<span className="text-rose-500">X</span>
            </span>
          </h1>
          <p 
            // Light Mode: text-gray-600, Dark Mode: text-gray-400
            className="text-gray-600 dark:text-gray-400 mt-2 text-sm font-light"
          >
            Discover fashion that feels right 🌿
          </p>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-4">
            <InputField
              label="Full Name"
              name="name"
              icon={<User size={18} />}
              value={formData.name}
              onChange={handleChange}
              error={errors.name}
            />
            <InputField
              label="Email"
              name="email"
              type="email"
              icon={<Mail size={18} />}
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
            />
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
          </div>

          <div className="flex flex-col gap-4">
            <InputField
              label="Confirm Password"
              name="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              icon={<Lock size={18} />}
              value={formData.confirmPassword}
              onChange={handleChange}
              error={errors.confirmPassword}
              toggle={showConfirmPassword}
              setToggle={setShowConfirmPassword}
            />
            <InputField
              label="Location (optional)"
              name="location"
              icon={<MapPin size={18} />}
              value={formData.location}
              onChange={handleChange}
            />
            <InputField
              label="Favorite Styles (optional)"
              name="favoriteStyles"
              icon={<Heart size={18} />}
              value={formData.favoriteStyles}
              onChange={handleChange}
            />
          </div>

          {/* Full width field */}
          <div className="md:col-span-2">
            <InputField
              label="Why Choose Sustainable Fashion? (optional)"
              name="sustainabilityGoals"
              icon={<Users size={18} />}
              value={formData.sustainabilityGoals}
              onChange={handleChange}
            />
          </div>

          {/* Submit button - Same color in both modes, so no dark: prefix needed */}
          <div className="md:col-span-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-lime-500 text-black 
          font-semibold rounded-full shadow-lg hover:scale-[1.02] hover:opacity-90 
          transition-all duration-300 flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="animate-spin" size={18} />}
              {loading ? "Creating your account..." : "Create Account"}
            </button>
          </div>
        </form>

        {/* FOOTER */}
        <div 
          // Light Mode: text-gray-500, Dark Mode: text-gray-400
          className="text-center text-gray-500 dark:text-gray-400 mt-8 text-sm"
        >
          <p>
            Want to become a{" "}
            <Link
              href="/register/seller"
              // Light Mode: text-lime-600, Dark Mode: text-lime-400
              className="text-lime-600 dark:text-lime-400 hover:text-blue-600 font-semibold transition-colors hover:underline"
            >
              Seller?
            </Link>
          </p>
          <p className="mt-1">
            Already have an account?{" "}
            <Link
              href="/login"
              // Light Mode: text-rose-600, Dark Mode: text-rose-400
              className="text-rose-600 dark:text-rose-400 hover:text-blue-500 font-semibold transition-colors hover:underline"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

// ------------------------ INPUT COMPONENT ------------------------
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
    <label 
      // Light Mode: text-gray-700, Dark Mode: text-gray-300
      className="block text-gray-700 dark:text-gray-300 font-medium mb-1"
    >
      {label}
    </label>
    <div
      // Light Mode: border-gray-300 bg-white, Dark Mode: border-gray-700 bg-neutral-900/50
      className={`relative rounded-full overflow-hidden border ${
        error ? "border-red-500" : "border-gray-300 dark:border-gray-700"
      } bg-white dark:bg-neutral-900/50 transition-all group-hover:border-lime-400`}
    >
      <div 
        // Light Mode: text-gray-400, Dark Mode: text-gray-500
        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500"
      >
        {icon}
      </div>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        // Light Mode: text-gray-900 placeholder-gray-400, Dark Mode: text-white placeholder-gray-500
        className="w-full bg-transparent text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 pl-10 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-lime-500 rounded-full"
      />
      {toggle !== undefined && (
        <button
          type="button"
          onClick={() => setToggle(!toggle)}
          // Light Mode: text-gray-400 hover:text-gray-900, Dark Mode: text-gray-500 hover:text-white
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white"
        >
          {toggle ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      )}
    </div>
    {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
  </div>
);

export default BuyerRegister;