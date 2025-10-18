"use client";

import { useState, useRef, useEffect } from "react";
import {
  ShoppingCart,
  User,
  Search as SearchIcon,
  ChevronDown,
  X,
  LogOut,
  ClipboardList,
  Shield,
  Package,
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { getAuth, signOut } from "firebase/auth"; 

export default function Header() {
  const [showPromo, setShowPromo] = useState(true);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const userMenuRef = useRef(null);

  const { currentUser, userProfile, isSuperAdmin } = useAuth();
  const { getItemCount } = useCart();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) setIsScrolled(true);
      else setIsScrolled(false);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 🔹 Firebase Logout Function
  const handleLogout = async () => {
    const auth = getAuth();
    try {
      await signOut(auth);
      console.log("✅ User logged out successfully");
      setShowUserMenu(false);
      window.location.href = "/";
    } catch (error) {
      console.error("❌ Logout error:", error);
    }
  };

  return (
    <header
      className={`w-full top-0 left-0 z-50 sticky transition-all duration-300 
      ${isScrolled ? "backdrop-blur-md bg-black/70 shadow-lg border-b border-gray-800" : "bg-black"}`}
    >
      {/* 🔸 Promo Banner */}
      {showPromo && (
        <div className="bg-black/90 text-center text-[11px] sm:text-xs py-2 border-b border-gray-900 relative">
          <p className="text-gray-200">
            Sign up and get 20% off your first order.{" "}
            <Link href="/signup" className="underline hover:text-white">
              Sign Up Now
            </Link>
          </p>
          <X
            size={14}
            className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer text-gray-300 hover:text-white"
            onClick={() => setShowPromo(false)}
          />
        </div>
      )}

      {/* 🔸 Main Header */}
      <div className="flex items-center justify-between px-4 sm:px-8 py-3 relative">
        {/* Logo */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center">
            <h1 className="text-2xl font-extrabold tracking-tight leading-none">
              <span className="text-lime-500">Thrift</span>
              <span className="text-rose-500">X</span>
            </h1>
          </Link>

          {/* City Dropdown */}
          <div className="hidden sm:flex items-center gap-1 cursor-pointer text-sm font-medium">
            <span className="text-gray-300">BOMBAY</span>
            <ChevronDown size={14} className="text-gray-400 mt-[1px]" />
          </div>
        </div>

        {/* Search Bar */}
        <div className="flex-1 mx-4 sm:mx-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Search for products..."
              className="w-full bg-neutral-100 text-gray-800 text-sm rounded-full py-2.5 pl-10 pr-4 placeholder:text-gray-400 focus:outline-none"
            />
            <SearchIcon
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
            />
          </div>
        </div>

        {/* Icons */}
        <div className="flex items-center gap-5 relative">
          {/* Cart Icon */}
          {currentUser && (
            <Link href="/cart" className="relative">
              <ShoppingCart
                size={22}
                className="text-gray-200 hover:text-white cursor-pointer transition"
              />
              {getItemCount() > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5">
                  {getItemCount()}
                </span>
              )}
            </Link>
          )}

          {/* If Logged In → Show Dropdown */}
          {currentUser ? (
            <div ref={userMenuRef} className="relative">
              <button
                onClick={() => setShowUserMenu((prev) => !prev)}
                className="focus:outline-none flex items-center justify-center"
              >
                <User
                  size={22}
                  className="text-gray-200 hover:text-white cursor-pointer transition"
                />
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-3 w-52 bg-neutral-900/95 backdrop-blur-sm border border-gray-700 rounded-2xl shadow-lg overflow-hidden z-50 transition-all">
                  <div className="py-2">
                    <Link
                      href="/orders"
                      className="flex items-center gap-2 px-5 py-2.5 text-sm text-gray-200 hover:bg-neutral-800 hover:text-white transition"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <ClipboardList size={16} className="text-gray-400" />
                      Orders
                    </Link>

                    <Link
                      href="/profile"
                      className="flex items-center gap-2 px-5 py-2.5 text-sm text-gray-200 hover:bg-neutral-800 hover:text-white transition"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <User size={16} className="text-gray-400" />
                      Profile
                    </Link>

                    {userProfile?.role === "seller" && (
                      <Link
                        href="/seller/products"
                        className="flex items-center gap-2 px-5 py-2.5 text-sm text-gray-200 hover:bg-neutral-800 hover:text-white transition"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <Package size={16} className="text-gray-400" />
                        My Products
                      </Link>
                    )}

                    {isSuperAdmin(currentUser) && (
                      <Link
                        href="/admin/super"
                        className="flex items-center gap-2 px-5 py-2.5 text-sm text-gray-200 hover:bg-neutral-800 hover:text-white transition"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <Shield size={16} className="text-gray-400" />
                        Super Admin
                      </Link>
                    )}

                    <div className="border-t border-gray-700 my-1"></div>

                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 px-5 py-2.5 text-sm text-red-400 hover:bg-neutral-800 hover:text-red-300 transition w-full text-left"
                    >
                      <LogOut size={16} className="text-gray-500" />
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              {/* If Not Logged In → Show Login/Register */}
              <div className="flex items-center gap-3">
                <Link
                  href="/login"
                  className="px-4 py-2 text-sm font-medium border border-gray-700 text-gray-300 rounded-full 
                  hover:text-white hover:border-gray-500 transition-all duration-200"
                >
                  Login
                </Link>

                <Link
                  href="/register/customer"
                  className="px-4 py-2 text-sm font-medium bg-gradient-to-r from-lime-500 to-rose-500 text-black rounded-full 
                  hover:opacity-90 transition-all duration-200 shadow-md"
                >
                  Register
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
