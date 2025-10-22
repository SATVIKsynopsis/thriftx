"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  ShoppingCart,
  User,
  Search as SearchIcon,
  X,
  LogOut,
  ClipboardList,
  Shield,
  Package,
  Heart,
  Menu as MenuIcon,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { getAuth, signOut } from "firebase/auth";
import Breadcrumb from "@/components/common/Breadcrumb";
import { searchProducts } from "@/utils/fuzzySearch";
import { collection, query, orderBy, getDocs } from "firebase/firestore";
import { db } from "@/firebase/config";

export default function Header() {
  const [showPromo, setShowPromo] = useState(true);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [selectedCity, setSelectedCity] = useState("Bangalore");
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [allProducts, setAllProducts] = useState([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const [isSearching, setIsSearching] = useState(false);

  const userMenuRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const searchRef = useRef(null);
  const suggestionsRef = useRef(null);

  const { currentUser, userProfile, isSuperAdmin, isAdmin } = useAuth();
  const isOnlyAdmin =
    currentUser && isAdmin(currentUser) && !isSuperAdmin(currentUser);
  const isOnlySuperAdmin =
    currentUser && isSuperAdmin(currentUser) && !isAdmin(currentUser);
  const isBoth =
    currentUser && isAdmin(currentUser) && isSuperAdmin(currentUser);

  const { getItemCount } = useCart();
  const router = useRouter();

  // Debounce function
  const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  };

  const handleCityChange = (event) => setSelectedCity(event.target.value);
  const toggleMobileMenu = () => setShowMobileMenu((prev) => !prev);

  // Search
  const handleSearch = async (query) => {
    if (query.trim() && !isSearching) {
      setIsSearching(true);
      setShowSuggestions(false);
      setSelectedSuggestionIndex(-1);

      // Navigate to search page
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);

      // Clear states after navigation starts
      setTimeout(() => {
        setSearchQuery("");
        setShowMobileMenu(false);
        setIsSearching(false);
      }, 100);
    }
  };





  // Scroll
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) setIsScrolled(true);
      else setIsScrolled(false);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Click outside for user menu
  useEffect(() => {
    const handleClickOutsideUser = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutsideUser);
    return () =>
      document.removeEventListener("mousedown", handleClickOutsideUser);
  }, []);

  // Click outside for mobile menu
  useEffect(() => {
    const handleClickOutsideMobile = (event) => {
      if (
        showMobileMenu &&
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target)
      ) {
        if (
          !document.querySelector(".mobile-menu-toggle")?.contains(event.target)
        ) {
          setShowMobileMenu(false);
        }
      }
    };
    document.addEventListener("mousedown", handleClickOutsideMobile);
    return () =>
      document.removeEventListener("mousedown", handleClickOutsideMobile);
  }, [showMobileMenu]);

  // Logout
  const handleLogout = async () => {
    const auth = getAuth();
    try {
      await signOut(auth);
      setShowUserMenu(false);
      setShowMobileMenu(false);
      window.location.href = "/";
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // Fetch all products for suggestions
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);
        const products = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setAllProducts(products);
      } catch (error) {
        console.error('Error fetching products for suggestions:', error);
      }
    };
    fetchProducts();
  }, []);

  // Debounced search for suggestions
  const debouncedSearch = useCallback(
    debounce((query) => {
      if (query.trim() && allProducts.length > 0) {
        setLoadingSuggestions(true);
        const results = searchProducts(allProducts, query).slice(0, 8);
        setSuggestions(results);
        setShowSuggestions(true);
        setLoadingSuggestions(false);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 300),
    [allProducts]
  );

  // Handle search query change
  useEffect(() => {
    if (searchQuery) {
      debouncedSearch(searchQuery);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
    setSelectedSuggestionIndex(-1);
  }, [searchQuery, debouncedSearch]);



  // Click outside for search suggestions
  useEffect(() => {
    const handleClickOutsideSearch = (event) => {
      // Don't close if clicking on suggestions dropdown
      const isClickOnSuggestions = suggestionsRef.current?.contains(event.target);

      if (!isClickOnSuggestions &&
          searchRef.current && !searchRef.current.contains(event.target)
      ) {
        setShowSuggestions(false);
        setSelectedSuggestionIndex(-1);
      }
    };
    document.addEventListener("mousedown", handleClickOutsideSearch);
    return () =>
      document.removeEventListener("mousedown", handleClickOutsideSearch);
  }, []);

  return (
    <header
      className={`w-full top-0 left-0 z-50 sticky transition-all duration-300 ${
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
          {/* Logo & City Dropdown */}
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
                className="block py-2 px-4 bg-black text-slate-100 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-lime-500/60 text-sm font-[Sansation] shadow-gray-700 border border-gray-700 hover:shadow-lg hover:shadow-lime-500/20 hover:border-lime-400/50 cursor-pointer transition-all duration-300 ease-in-out transform hover:-translate-y-[1px] focus:scale-[1.02]"
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

          {/* Desktop Search */}
          <div ref={searchRef} className="flex-1 mx-4 sm:mx-6 block relative">
            <div className="relative">
              <input
                type="text"
                placeholder={isSearching ? "Searching..." : "Search for products..."}
                value={searchQuery}
                disabled={isSearching}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    if (selectedSuggestionIndex >= 0 && suggestions[selectedSuggestionIndex]) {
                      handleSearch(suggestions[selectedSuggestionIndex].name);
                    } else {
                      handleSearch(searchQuery);
                    }
                  } else if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    setSelectedSuggestionIndex(prev =>
                      prev < suggestions.length - 1 ? prev + 1 : 0
                    );
                  } else if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    setSelectedSuggestionIndex(prev =>
                      prev > 0 ? prev - 1 : suggestions.length - 1
                    );
                  } else if (e.key === 'Escape') {
                    setShowSuggestions(false);
                    setSelectedSuggestionIndex(-1);
                  }
                }}
                onFocus={() => {
                  if (suggestions.length > 0 && !isSearching) setShowSuggestions(true);
                }}

                className={`w-full bg-neutral-100 text-gray-800 text-sm rounded-full py-2.5 pl-4 pr-10 placeholder:text-gray-400 focus:outline-none ${
                  isSearching ? 'opacity-75 cursor-not-allowed' : ''
                }`}
              />
              <SearchIcon
                size={18}
                className={`absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer transition-colors ${
                  isSearching
                    ? 'text-gray-400 cursor-not-allowed animate-pulse'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => !isSearching && handleSearch(searchQuery)}
              />

              {/* Suggestions Dropdown */}
              {showSuggestions && suggestions.length > 0 && (
                <div ref={suggestionsRef} className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-3xl shadow-lg z-50 max-h-80 overflow-y-auto">
                  {suggestions.map((product, index) => (
                    <div
                      key={product.id}
                      className={`p-3 cursor-pointer border-b border-gray-100 last:border-b-0 hover:bg-gray-50 ${
                        index === selectedSuggestionIndex ? 'bg-gray-100' : ''
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSearch(product.name);
                        setShowSuggestions(false);
                      }}
                      onMouseEnter={() => setSelectedSuggestionIndex(index)}
                    >
                      <div className="flex items-center gap-3">
                        {product.images && product.images.length > 0 ? (
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            className="w-10 h-10 object-cover rounded"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextElementSibling.style.display = 'flex';
                            }}
                          />
                        ) : (
                          <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-500">
                            No Image
                          </div>
                        )}
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">{product.name}</div>
                          <div className="text-sm text-gray-500">{product.category}</div>
                        </div>
                       
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Loading Indicator */}
              {loadingSuggestions && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 p-3">
                  <div className="text-sm text-gray-500">Loading suggestions...</div>
                </div>
              )}
            </div>
          </div>

          {/* Right Icons */}
          <div className="flex items-center gap-5 relative">

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

            {/* ✅ Desktop User Menu */}
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
                      <Link href="/orders" className="flex items-center gap-2 px-5 py-2.5 text-sm text-gray-200 hover:bg-neutral-800 transition"><ClipboardList size={16} className="text-gray-400" />Orders</Link>
                      <Link href="/wishlist" className="flex items-center gap-2 px-5 py-2.5 text-sm text-gray-200 hover:bg-neutral-800 transition"><Heart size={16} className="text-gray-400" />Wishlist</Link>
                      <Link href="/profile" className="flex items-center gap-2 px-5 py-2.5 text-sm text-gray-200 hover:bg-neutral-800 transition"><User size={16} className="text-gray-400" />Profile</Link>
                      {userProfile?.role === "seller" && (<Link href="/seller/products" className="flex items-center gap-2 px-5 py-2.5 text-sm text-gray-200 hover:bg-neutral-800 transition"><Package size={16} className="text-gray-400" />My Products</Link>)}

                      {/* ✅ Admin/Super Admin Links */}
                      {isOnlyAdmin && (
                        <Link href="/admin" className="flex items-center gap-2 px-5 py-2.5 text-sm text-gray-200 hover:bg-neutral-800 transition"><Shield size={16} className="text-gray-400" />Admin Panel</Link>
                      )}
                      {isOnlySuperAdmin && (
                        <Link href="/admin/super" className="flex items-center gap-2 px-5 py-2.5 text-sm text-gray-200 hover:bg-neutral-800 transition"><Shield size={16} className="text-gray-400" />Super Admin</Link>
                      )}
                      {isBoth && (
                        <>
                          <Link href="/admin" className="flex items-center gap-2 px-5 py-2.5 text-sm text-gray-200 hover:bg-neutral-800 transition"><Shield size={16} className="text-gray-400" />Admin Panel</Link>
                          <Link href="/admin/super" className="flex items-center gap-2 px-5 py-2.5 text-sm text-gray-200 hover:bg-neutral-800 transition"><Shield size={16} className="text-gray-400" />Super Admin</Link>
                        </>
                      )}

                      <div className="border-t border-gray-700 my-1"></div>
                      <button onClick={handleLogout} className="flex items-center gap-2 px-5 py-2.5 text-sm text-red-400 hover:bg-neutral-800 hover:text-red-300 transition w-full text-left">
                        <LogOut size={16} className="text-gray-500" />
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-3">
                <Link href="/login" className="px-4 py-2 text-sm font-medium border border-gray-700 text-gray-300 rounded-full hover:text-white transition-all">Login</Link>
                <Link href="/register/customer" className="px-4 py-2 text-sm font-medium bg-gradient-to-r from-lime-500 to-rose-500 text-black rounded-full hover:opacity-90 transition-all">Register</Link>
              </div>
            )}

            <button className="md:hidden text-gray-200 hover:text-white transition p-1 mobile-menu-toggle" onClick={toggleMobileMenu}>
              {showMobileMenu ? <X size={26} /> : <MenuIcon size={26} />}
            </button>
          </div>
        </div>

        {/* Breadcrumb */}
        <div className="px-4 sm:px-8 pb-2">
          <Breadcrumb />
        </div>

        {/* ✅ Mobile Menu */}
        <div ref={mobileMenuRef} className={`md:hidden absolute w-full bg-neutral-900/95 backdrop-blur-sm border-t border-gray-800 transition-all duration-300 ease-in-out transform overflow-hidden ${showMobileMenu ? "max-h-screen py-4" : "max-h-0"}`}>
          <div className="flex flex-col">
            {currentUser && (
              <>
                <Link href="/cart" className="flex items-center gap-3 px-6 py-3 text-lg text-gray-200 hover:bg-neutral-800 transition" onClick={toggleMobileMenu}><ShoppingCart size={20} className="text-lime-400" />Cart</Link>
                <Link href="/orders" className="flex items-center gap-3 px-6 py-3 text-lg text-gray-200 hover:bg-neutral-800 transition" onClick={toggleMobileMenu}><ClipboardList size={20} className="text-lime-400" />Orders</Link>
                <Link href="/wishlist" className="flex items-center gap-3 px-6 py-3 text-lg text-gray-200 hover:bg-neutral-800 transition" onClick={toggleMobileMenu}><Heart size={20} className="text-lime-400" />Wishlist</Link>
                <Link href="/profile" className="flex items-center gap-3 px-6 py-3 text-lg text-gray-200 hover:bg-neutral-800 transition" onClick={toggleMobileMenu}><User size={20} className="text-lime-400" />Profile</Link>

                {/* ✅ Mobile Admin logic */}
                {isOnlyAdmin && (<Link href="/admin" className="flex items-center gap-3 px-6 py-3 text-lg text-gray-200 hover:bg-neutral-800 transition" onClick={toggleMobileMenu}><Shield size={20} className="text-lime-400" />Admin Panel</Link>)}
                {isOnlySuperAdmin && (<Link href="/admin/super" className="flex items-center gap-3 px-6 py-3 text-lg text-gray-200 hover:bg-neutral-800 transition" onClick={toggleMobileMenu}><Shield size={20} className="text-lime-400" />Super Admin</Link>)}
                {isBoth && (
                  <>
                    <Link href="/admin" className="flex items-center gap-3 px-6 py-3 text-lg text-gray-200 hover:bg-neutral-800 transition" onClick={toggleMobileMenu}><Shield size={20} className="text-lime-400" />Admin Panel</Link>
                    <Link href="/admin/super" className="flex items-center gap-3 px-6 py-3 text-lg text-gray-200 hover:bg-neutral-800 transition" onClick={toggleMobileMenu}><Shield size={20} className="text-lime-400" />Super Admin</Link>
                  </>
                )}

                <button onClick={handleLogout} className="flex items-center gap-3 px-6 py-3 text-lg text-red-400 hover:bg-neutral-800 hover:text-red-300 transition w-full text-left"><LogOut size={20} className="text-red-400" />Logout</button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
