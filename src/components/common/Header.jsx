"use client";

import React, { useState, useEffect } from "react";
import {
  ShoppingCart,
  Package,
  Shield,
  Menu,
  X,
  User,
  Search as SearchIcon,
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { useRouter } from "next/navigation";

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [isBannerVisible, setIsBannerVisible] = useState(true);
  const [selectedCity, setSelectedCity] = useState("BANGALORE");
  const [isStickyHeaderVisible, setIsStickyHeaderVisible] = useState(true);

  const { currentUser, userProfile, logout, isSuperAdmin } = useAuth();
  const { getItemCount } = useCart();
  const router = useRouter();

  // Sticky header logic
  useEffect(() => {
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      if (window.scrollY < 50) {
        setIsStickyHeaderVisible(true);
      } else if (window.scrollY > lastScrollY) {
        setIsStickyHeaderVisible(false);
      } else {
        setIsStickyHeaderVisible(true);
      }
      lastScrollY = window.scrollY;
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Logout logic
  const handleLogout = async () => {
    try {
      await logout();
      setUserMenuOpen(false);
      setMobileMenuOpen(false);
      router.push("/login");
    } catch (error) {
      console.error("Error during logout:", error);
      alert("Failed to log out. Please try again.");
    }
  };

  const NavLinkClass =
    "flex items-center gap-2 px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-all shadow-sm shadow-gray-700 hover:shadow-lg hover:shadow-gray-700 cursor-pointer";

  const headerVisibilityClass = isStickyHeaderVisible
    ? "translate-y-0 opacity-100"
    : "-translate-y-full opacity-0";

  return (
    <div className="relative">
      {/* Top Banner */}
      {isBannerVisible && (
        <div className="bg-black text-white text-center py-3 flex items-center justify-center gap-4 relative">
          <p className="text-[10px] sm:text-sm">
            Sign up and get 20% off your first order.
            <a
              href="/signup"
              className="underline ml-1 text-gray-300 hover:text-white"
            >
              Sign Up Now
            </a>
          </p>
          <X
            size={20}
            className="cursor-pointer absolute right-4 hover:text-red-500 transition-colors"
            onClick={() => setIsBannerVisible(false)}
          />
        </div>
      )}

      {/* Main Header */}
      <div
        className={`sticky top-0 bg-black shadow-lg z-50 transition-all duration-200 ease-in-out ${headerVisibilityClass}`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">
            {/* Logo */}
            <Link
              href="/"
              className="text-xl font-bold text-blue-600 hover:text-blue-700 transition-colors flex-shrink-0"
            >
              <h1 className="font-extrabold tracking-tight text-3xl">
                <span className="text-lime-500">Thrift</span>
                <span className="text-rose-500">X</span>
              </h1>
            </Link>

            {/* City Selector (Desktop) */}
            <div className="p-2 hidden md:block">
              <select
                id="city-select"
                name="city"
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="block py-2 px-3 bg-black text-slate-100 rounded-md border border-gray-700 focus:ring-2 focus:ring-gray-500"
              >
                <option className="bg-black" value="BOMBAY">
                  BOMBAY
                </option>
                <option className="bg-black" value="BANGALORE">
                  BANGALORE
                </option>
              </select>
            </div>

            {/* Desktop Search */}
            <div className="hidden md:block flex-1 max-w-2xl relative">
              <input
                type="text"
                placeholder="Search products, brands, and sellers..."
                className="w-full py-2 pl-4 pr-10 bg-gray-900 text-white rounded-lg border border-gray-700 focus:ring-2 focus:ring-lime-500 focus:border-lime-500"
              />
              <SearchIcon
                size={20}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
              />
            </div>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-3">
              {currentUser ? (
                <>
                  {isSuperAdmin(currentUser) && (
                    <Link href="/admin/super" className={NavLinkClass}>
                      <Shield size={20} />
                      <span className="text-sm font-medium">Super Admin</span>
                    </Link>
                  )}

                  <Link href="/cart" className={`${NavLinkClass} relative p-3`}>
                    <ShoppingCart size={20} />
                    {getItemCount() > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-semibold">
                        {getItemCount()}
                      </span>
                    )}
                  </Link>

                  <div className="relative">
                    <button
                      onClick={() => setUserMenuOpen(!userMenuOpen)}
                      className={`${NavLinkClass} p-3`}
                    >
                      <User size={20} />
                    </button>

                    {userMenuOpen && (
                      <div className="absolute right-0 mt-2 w-48 bg-black rounded-lg shadow-xl border border-gray-700 py-1 z-50">
                        <Link
                          href="/profile"
                          className="block px-4 py-2 text-sm text-gray-100 hover:bg-gray-700"
                        >
                          Profile
                        </Link>
                        <Link
                          href="/orders"
                          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-100 hover:bg-gray-700"
                        >
                          <Package size={16} /> Orders
                        </Link>
                        {userProfile?.role === "seller" && (
                          <Link
                            href="/seller/products"
                            className="block px-4 py-2 text-sm text-gray-100 hover:bg-gray-700"
                          >
                            My Products
                          </Link>
                        )}
                        <button
                          onClick={handleLogout}
                          className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-gray-700"
                        >
                          Logout
                        </button>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-all"
                  >
                    Login
                  </Link>
                  <Link
                    href="/register/buyer"
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-all"
                  >
                    Register
                  </Link>
                </>
              )}
            </nav>

            {/* Mobile Icons */}
            <div className="flex items-center gap-2 md:hidden">
              {currentUser && (
                <Link
                  href="/cart"
                  className="relative p-2 text-white hover:bg-gray-800 rounded-full"
                >
                  <ShoppingCart size={20} />
                  {getItemCount() > 0 && (
                    <span className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs font-semibold">
                      {getItemCount()}
                    </span>
                  )}
                </Link>
              )}
              <button
                onClick={() => {
                  setMobileMenuOpen(!mobileMenuOpen);
                  setUserMenuOpen(false);
                }}
                className="p-2 text-white hover:bg-gray-800 rounded-full"
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-black/95 border-t border-gray-800 absolute w-full z-40 shadow-2xl transition-all duration-200">
          <div className="px-4 py-2 relative">
            <input
              type="text"
              placeholder="Search products, brands, and sellers..."
              className="w-full py-2 pl-4 pr-10 bg-gray-900 text-white rounded-lg border border-gray-700 focus:ring-2 focus:ring-lime-500 focus:border-lime-500 transition-all"
            />
            <SearchIcon
              size={20}
              className="absolute right-6 top-1/2 transform -translate-y-1/2 text-gray-500"
            />
          </div>

          <div className="px-4 pt-2 pb-3 space-y-1 sm:px-3">
            <select
              id="mobile-city-select"
              name="city"
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="w-full block py-2 px-3 bg-gray-900 text-slate-100 rounded-md border border-gray-700 mb-4"
            >
              <option value="BOMBAY">BOMBAY</option>
              <option value="BANGALORE">BANGALORE</option>
            </select>

            {currentUser ? (
              <>
                <Link
                  href="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 text-base font-medium text-white hover:bg-gray-800 rounded-md"
                >
                  Profile
                </Link>
                <Link
                  href="/orders"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 text-base font-medium text-white hover:bg-gray-800 rounded-md"
                >
                  <Package size={20} /> Orders
                </Link>
                {userProfile?.role === "seller" && (
                  <Link
                    href="/seller/products"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 text-base font-medium text-white hover:bg-gray-800 rounded-md"
                  >
                    My Products
                  </Link>
                )}
                {isSuperAdmin(currentUser) && (
                  <Link
                    href="/admin/super"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 text-base font-medium text-white hover:bg-gray-800 rounded-md"
                  >
                    <Shield size={20} /> Super Admin
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-3 py-2 text-base font-medium text-red-400 hover:bg-gray-800 rounded-md"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 text-base font-medium text-gray-300 hover:text-white hover:bg-gray-800 rounded-md"
                >
                  Login
                </Link>
                <Link
                  href="/register/buyer"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 text-base font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md text-center"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Header;
