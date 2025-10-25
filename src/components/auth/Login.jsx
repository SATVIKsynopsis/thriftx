"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Eye, EyeOff, Mail, Lock, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function NavbarLoginDialog() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false); 

  const { login } = useAuth();
  const router = useRouter();
  const pathname = usePathname(); 
  const from = "/";

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

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
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="text-sm md:text-base rounded-full">
          Login
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            Sign In to <span className="text-lime-400">ThriftX</span>
          </DialogTitle>
          <DialogDescription>
            Enter your email and password to continue.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-4 mt-2">
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

          <DialogFooter className="mt-4 flex justify-between">
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit">
              {loading && <Loader2 className="animate-spin mr-2" size={18} />}
              Sign In
            </Button>
          </DialogFooter>
        </form>

        <div className="text-center text-neutral-500 dark:text-neutral-400 mt-4 text-sm">
          Don’t have an account?{" "}
          <Link
            href="/register/customer"
            className="text-lime-600 dark:text-lime-400 hover:text-blue-500 font-semibold transition-colors hover:underline"
          >
            Sign up
          </Link>
        </div>
      </DialogContent>
    </Dialog>
  );
}

const InputField = ({ label, name, type = "text", icon, value, onChange, error, toggle, setToggle }) => (
  <div className="relative group">
    <Label className="block text-neutral-700 dark:text-neutral-300 font-medium mb-1">{label}</Label>
    <div
      className={`relative rounded-full overflow-hidden border ${error ? "border-red-500" : "border-neutral-400 dark:border-neutral-700"
        } bg-white dark:bg-neutral-900/50 transition-all group-hover:border-lime-400`}
    >
      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 dark:text-neutral-500">
        {icon}
      </div>
      <Input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        className="w-full bg-transparent text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-500 pl-10 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-lime-500 rounded-full"
      />
      {toggle !== undefined && (
        <button
          type="button"
          onClick={() => setToggle(!toggle)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 dark:text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
        >
          {toggle ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      )}
    </div>
    {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
  </div>
);
