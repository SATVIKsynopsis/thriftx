"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Mail, Lock, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import toast from "react-hot-toast";

const LoginComponent = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const router = useRouter();
  const from = "/"; 

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "Invalid email";
    if (!formData.password) newErrors.password = "Password is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      await login(formData.email, formData.password);
      toast.success("Welcome back to ThriftX 👋");
      router.push(from);
    } catch (error) {
      console.error("Login error:", error);
      if (error.code === "auth/user-not-found")
        toast.error("No account found with this email");
      else if (error.code === "auth/wrong-password")
        toast.error("Incorrect password");
      else if (error.code === "auth/invalid-email")
        toast.error("Invalid email address");
      else toast.error("Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center 
      bg-gradient-to-br from-[#0a0a0a] via-[#121212] to-[#1a1a1a]
      px-6 py-12"
    >
      <div
        className="w-full max-w-md border border-gray-800 bg-gradient-to-br 
        from-neutral-950/95 via-black/90 to-neutral-900/95 rounded-3xl 
        shadow-[0_0_25px_rgba(255,255,255,0.05)] p-8 backdrop-blur-md"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold text-white tracking-tight">
            Welcome{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-lime-400 to-rose-500">
              Back
            </span>
          </h1>
          <p className="text-gray-400 mt-2 text-sm font-light">
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
            className="w-full py-3 bg-gradient-to-r from-lime-500 via-yellow-400 to-rose-500 text-black 
            font-semibold rounded-full shadow-lg hover:scale-[1.02] hover:opacity-90 
            transition-all duration-300 flex items-center justify-center gap-2"
          >
            {loading && <Loader2 className="animate-spin" size={18} />}
            {loading ? "Signing you in..." : "Sign In"}
          </button>
        </form>

        {/* Footer */}
        <div className="text-center text-gray-400 mt-8 text-sm">
          <p>
            Don’t have an account?{" "}
            <Link
              href="/register/customer"
              className="text-lime-400 hover:text-rose-400 font-semibold transition-colors"
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
    <label className="block text-gray-300 font-medium mb-1">{label}</label>
    <div
      className={`relative rounded-lg overflow-hidden border ${
        error ? "border-red-500" : "border-gray-700"
      } bg-neutral-900/50 transition-all group-hover:border-lime-400`}
    >
      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
        {icon}
      </div>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        className="w-full bg-transparent text-white placeholder-gray-500 pl-10 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-lime-500 rounded-lg"
      />
      {toggle !== undefined && (
        <button
          type="button"
          onClick={() => setToggle(!toggle)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
        >
          {toggle ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      )}
    </div>
    {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
  </div>
);

export default LoginComponent;
