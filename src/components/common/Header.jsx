"use client";

import { useState, useRef, useEffect } from "react";
import {
  ShoppingCart,
  User,
  Search as SearchIcon,
  X,
  LogOut,
  ClipboardList,
  Shield,
  Package,
  Menu as MenuIcon,
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { getAuth, signOut } from "firebase/auth";

export default function Header() {
  const [showPromo, setShowPromo] = useState(true);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [selectedCity, setSelectedCity] = useState("Bangalore");

  const userMenuRef = useRef(null);
  const mobileMenuRef = useRef(null);

  const { currentUser, userProfile, isSuperAdmin, isAdmin } = useAuth();
  const { getItemCount } = useCart();

  const handleCityChange = (event) => setSelectedCity(event.target.value);
  const toggleMobileMenu = () => setShowMobileMenu((prev) => !prev);

  const isOnlyAdmin =
    isAdmin(currentUser) && !isSuperAdmin(currentUser);
  const isOnlySuperAdmin =
    isSuperAdmin(currentUser) && !isAdmin(currentUser);
  const isBoth =
    isAdmin(currentUser) && isSuperAdmin(currentUser);

  // Scroll listener
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) setIsScrolled(true);
      else setIsScrolled(false);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Click outside listeners
  useEffect(() => {
    const handleClickOutsideUser = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutsideUser);
    return () => document.removeEventListener("mousedown", handleClickOutsideUser);
  }, []);

  useEffect(() => {
    const handleClickOutsideMobile = (event) => {
      if (
        showMobileMenu &&
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target)
      ) {
        if (
          !document
            .querySelector(".mobile-menu-toggle")
            ?.contains(event.target)
        ) {
          setShowMobileMenu(false);
        }
      }
    };
    document.addEventListener("mousedown", handleClickOutsideMobile);
    return () => document.removeEventListener("mousedown", handleClickOutsideMobile);
  }, [showMobileMenu]);

  // Logout
  const handleLogout = async () => {
    const auth = getAuth();
    try {
      await signOut(auth);
      console.log("✅ User logged out successfully");
      setShowUserMenu(false);
      setShowMobileMenu(false);
      window.location.href = "/";
    } catch (error) {
      console.error("❌ Logout error:", error);
    }
  };

  return (
    <header
      className={`w-full top-0 left-0 z-50 sticky transition-all duration-300 
      ${
        isScrolled
          ? "backdrop-blur-md bg-black/70 shadow-lg border-b border-gray-800"
          : "bg-black"
      }`}
    >
      <div className="max-w-7xl mx-auto">
        {showPromo && (
          <div className="bg-black/90 text-center text-[11px] sm:text-xs py-2 border-b border-gray-900 relative">
            <p className="text-gray-200">
              Sign up and get 20% off your first order.{" "}
              <Link
                href="/signup"
                className="underline hover:text-blue-600"
                onClick={() => setShowPromo(false)}
              >
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

        <div className="flex items-center justify-between px-4 sm:px-8 py-3 relative">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center">
              <h1 className="text-2xl font-extrabold fontAnton tracking-wider leading-none">
                <span className="text-lime-500">Thrift</span>
                <span className="text-rose-500">X</span>
              </h1>
            </Link>

            <div className="p-2 hidden md:block flex-shrink-0">
              <select
                id="city-select"
                name="city"
                value={selectedCity}
                onChange={handleCityChange}
                className="block py-2 px-4 bg-black text-slate-100 rounded-2xl 
                shadow-sm focus:outline-none focus:ring-2 focus:ring-lime-500/60 
                text-sm font-[Sansation] shadow-gray-700 border border-gray-700
                hover:shadow-lg hover:shadow-lime-500/20 hover:border-lime-400/50
                cursor-pointer transition-all duration-300 ease-in-out 
                transform hover:-translate-y-[1px] focus:scale-[1.02]"
              >
                <option className="bg-black" value="BOMBAY">
                  BOMBAY
                </option>
                <option className="bg-black" value="BANGALORE">
                  BANGALORE
                </option>
              </select>
            </div>
          </div>

          <div className="flex-1 mx-4 sm:mx-6 hidden sm:block">
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

          <div className="flex items-center gap-5 relative">
            <button className="sm:hidden text-gray-200 hover:text-white transition p-1">
              <SearchIcon size={22} />
            </button>

            {currentUser && (
              <Link href="/cart" className="relative hidden md:block">
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

            {currentUser ? (
              <div ref={userMenuRef} className="relative hidden md:block">
                <button
                  onClick={() => setShowUserMenu((prev) => !prev)}
                  className="focus:outline-none flex items-center justify-center"
                >
                  <User
                    size={22}
                    className="text-gray-200 hover:text-white cursor-pointer transition"
                  />
                  <span className="text-lg pl-2 text-gray-200">
                    {currentUser.displayName}
                  </span>
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-3 w-52 bg-neutral-900/95 backdrop-blur-sm border border-gray-700 rounded-2xl shadow-lg overflow-hidden z-50 transition-all">
                    <div className="py-2">
                      <Link
                        href="/orders"
                        className="flex items-center gap-2 px-5 py-2.5 text-sm text-gray-200 hover:bg-neutral-800 hover:text-white transition"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <ClipboardList
                          size={16}
                          className="text-gray-400"
                        />
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

                      {/* ✅ Admin-based logic */}
                      {isOnlyAdmin && (
                        <Link
                          href="/admin"
                          className="flex items-center gap-2 px-5 py-2.5 text-sm text-gray-200 hover:bg-neutral-800 hover:text-white transition"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <Shield size={16} className="text-gray-400" />
                          Admin Panel
                        </Link>
                      )}
                      {isOnlySuperAdmin && (
                        <Link
                          href="/admin/super"
                          className="flex items-center gap-2 px-5 py-2.5 text-sm text-gray-200 hover:bg-neutral-800 hover:text-white transition"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <Shield size={16} className="text-gray-400" />
                          Super Admin
                        </Link>
                      )}
                      {isBoth && (
                        <>
                          <Link
                            href="/admin"
                            className="flex items-center gap-2 px-5 py-2.5 text-sm text-gray-200 hover:bg-neutral-800 hover:text-white transition"
                            onClick={() => setShowUserMenu(false)}
                          >
                            <Shield size={16} className="text-gray-400" />
                            Admin Panel
                          </Link>
                          <Link
                            href="/admin/super"
                            className="flex items-center gap-2 px-5 py-2.5 text-sm text-gray-200 hover:bg-neutral-800 hover:text-white transition"
                            onClick={() => setShowUserMenu(false)}
                          >
                            <Shield size={16} className="text-gray-400" />
                            Super Admin
                          </Link>
                        </>
                      )}

                      {userProfile?.role === "seller" && (
                        <Link
                          href="/seller/products"
                          className="flex items-center gap-2 px-5 py-2.5 text-sm text-gray-200 hover:bg-neutral-800 hover:text-white transition"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <Package
                            size={16}
                            className="text-gray-400"
                          />
                          My Products
                        </Link>
                      )}

                      <div className="border-t border-gray-700 my-1"></div>
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 px-5 py-2.5 text-sm text-red-400 hover:bg-neutral-800 hover:text-red-300 transition w-full text-left"
                      >
                        <LogOut
                          size={16}
                          className="text-gray-500"
                        />
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-3">
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
            )}

            <button
              className="md:hidden text-gray-200 hover:text-white transition p-1 mobile-menu-toggle"
              onClick={toggleMobileMenu}
              aria-label="Toggle menu"
            >
              {showMobileMenu ? (
                <X size={26} />
              ) : (
                <MenuIcon size={26} />
              )}
            </button>
          </div>
        </div>

        <div
          ref={mobileMenuRef}
          className={`md:hidden absolute w-full bg-neutral-900/95 backdrop-blur-sm border-t border-gray-800 
          transition-all duration-300 ease-in-out transform overflow-hidden ${
            showMobileMenu ? "max-h-screen py-4" : "max-h-0"
          }`}
        >
          <div className="px-4 pb-4">
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

          <div className="flex flex-col">
            {currentUser && (
              <>
                <Link
                  href="/cart"
                  className="flex items-center gap-3 px-6 py-3 text-lg text-gray-200 hover:bg-neutral-800 hover:text-white transition"
                  onClick={toggleMobileMenu}
                >
                  <ShoppingCart
                    size={20}
                    className="text-lime-400"
                  />
                  Cart
                  {getItemCount() > 0 && (
                    <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
                      {getItemCount()}
                    </span>
                  )}
                </Link>
                <Link
                  href="/orders"
                  className="flex items-center gap-3 px-6 py-3 text-lg text-gray-200 hover:bg-neutral-800 hover:text-white transition"
                  onClick={toggleMobileMenu}
                >
                  <ClipboardList
                    size={20}
                    className="text-lime-400"
                  />
                  Orders
                </Link>
                <Link
                  href="/profile"
                  className="flex items-center gap-3 px-6 py-3 text-lg text-gray-200 hover:bg-neutral-800 hover:text-white transition"
                  onClick={toggleMobileMenu}
                >
                  <User size={20} className="text-lime-400" />
                  Profile
                </Link>

                {/* ✅ Added mobile admin logic */}
                {isOnlyAdmin && (
                  <Link
                    href="/admin"
                    className="flex items-center gap-3 px-6 py-3 text-lg text-gray-200 hover:bg-neutral-800 hover:text-white transition"
                    onClick={toggleMobileMenu}
                  >
                    <Shield size={20} className="text-lime-400" />
                    Admin Panel
                  </Link>
                )}
                {isOnlySuperAdmin && (
                  <Link
                    href="/admin/super"
                    className="flex items-center gap-3 px-6 py-3 text-lg text-gray-200 hover:bg-neutral-800 hover:text-white transition"
                    onClick={toggleMobileMenu}
                  >
                    <Shield size={20} className="text-lime-400" />
                    Super Admin
                  </Link>
                )}
                {isBoth && (
                  <>
                    <Link
                      href="/admin"
                      className="flex items-center gap-3 px-6 py-3 text-lg text-gray-200 hover:bg-neutral-800 hover:text-white transition"
                      onClick={toggleMobileMenu}
                    >
                      <Shield size={20} className="text-lime-400" />
                      Admin Panel
                    </Link>
                    <Link
                      href="/admin/super"
                      className="flex items-center gap-3 px-6 py-3 text-lg text-gray-200 hover:bg-neutral-800 hover:text-white transition"
                      onClick={toggleMobileMenu}
                    >
                      <Shield size={20} className="text-lime-400" />
                      Super Admin
                    </Link>
                  </>
                )}

                {userProfile?.role === "seller" && (
                  <Link
                    href="/seller/products"
                    className="flex items-center gap-3 px-6 py-3 text-lg text-gray-200 hover:bg-neutral-800 hover:text-white transition"
                    onClick={toggleMobileMenu}
                  >
                    <Package
                      size={20}
                      className="text-lime-400"
                    />
                    My Products
                  </Link>
                )}

                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-6 py-3 text-lg text-red-400 hover:bg-neutral-800 hover:text-red-300 transition w-full text-left"
                >
                  <LogOut size={20} className="text-red-400" />
                  Logout
                </button>
              </>
            )}

            {!currentUser && (
              <div className="flex flex-col gap-3 p-4">
                <Link
                  href="/login"
                  className="text-center px-4 py-3 text-lg font-medium border border-gray-700 text-gray-300 rounded-lg 
                            hover:text-white hover:border-gray-500 transition-all duration-200"
                  onClick={toggleMobileMenu}
                >
                  Login
                </Link>
                <Link
                  href="/register/customer"
                  className="text-center px-4 py-3 text-lg font-medium bg-gradient-to-r from-lime-500 to-rose-500 text-black rounded-lg 
                            hover:opacity-90 transition-all duration-200 shadow-md"
                  onClick={toggleMobileMenu}
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          <div className="p-4 border-t border-gray-800 mt-2">
            <label
              htmlFor="mobile-city-select"
              className="block text-sm font-medium text-gray-400 mb-2"
            >
              Select City:
            </label>
            <select
              id="mobile-city-select"
              name="city"
              value={selectedCity}
              onChange={handleCityChange}
              className="block w-full py-2 px-4 bg-black text-slate-100 rounded-lg 
                    shadow-sm focus:outline-none focus:ring-2 focus:ring-lime-500/60 
                    text-base font-[Sansation] shadow-gray-700 border border-gray-700
                    cursor-pointer"
            >
              <option className="bg-black" value="BOMBAY">
                BOMBAY
              </option>
              <option className="bg-black" value="BANGALORE">
                BANGALORE
              </option>
            </select>
          </div>
        </div>
      </div>
    </header>
  );
}
