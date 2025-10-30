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
  Store,
  Menu as MenuIcon,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { getAuth, signOut } from "firebase/auth";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { ModeToggle } from "@/ThemeProvider/ModeToggle";
import { searchProducts } from "@/utils/fuzzySearch";
import { collection, query, orderBy, getDocs } from "firebase/firestore";
import { db } from "@/firebase/config";
import LoginWithDialog from "../auth/Login";

export default function Header() {
  const [showPromo, setShowPromo] = useState(true);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileSearchQuery, setMobileSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedCity, setSelectedCity] = useState("Bangalore");
  const [suggestions, setSuggestions] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const [showMobileSearch, setShowMobileSearch] = useState(false);

  const userMenuRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const searchRef = useRef(null);
  const suggestionsRef = useRef(null);


  const { currentUser, userProfile, isSuperAdmin } = useAuth();
  const { getItemCount } = useCart();
  const router = useRouter();
  // console.log("Current User in header :", currentUser);

  const toggleMobileMenu = () => setShowMobileMenu(prev => !prev);

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

  const handleLogout = async () => {
    const auth = getAuth();
    try {
      await signOut(auth);
      setShowUserMenu(false);
      setShowMobileMenu(false);
      window.location.href = "/";
    } catch (error) { console.error("Logout error:", error); }
  };

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
    <header className={`w-full top-0 left-0 z-100 sticky transition-all duration-300 
      ${isScrolled
        ? "bg-white/90 backdrop-blur-md shadow-lg border-b border-gray-200 dark:backdrop-blur-md dark:bg-black/70 dark:shadow-lg dark:border-b dark:border-gray-800"
        : "bg-white dark:bg-black"}`
    }>
      <div className="max-w-[1100px] mx-auto">

        {/* Promo Banner */}
        {showPromo && (
          <div className="bg-gray-100 text-center text-[11px] sm:text-xs py-2 border-b border-gray-200 relative dark:bg-black/90 dark:border-gray-900">
            <p className="text-gray-700 dark:text-gray-200">
              Sign up and get 20% off your first order.{" "}
              <Link href="/register/customer" className="underline hover:text-blue-600" onClick={() => setShowPromo(false)}>Sign Up Now</Link>
            </p>
            <X size={14} className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer text-gray-500 hover:text-gray-800 dark:text-gray-300 dark:hover:text-white" onClick={() => setShowPromo(false)} />
          </div>
        )}

        {/* Main Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 relative">

          {/* Logo & City Dropdown */}
          <div className="flex items-center gap-4 sm:gap-6">
            <Link href="/" className="flex items-center">
              <h1 className="text-4xl sm:text-4xl md:text-4xl font-extrabold fontAnton tracking-wider leading-none">
                <span className="text-lime-500">Thrift</span>
                <span className="text-rose-500">X</span>
              </h1>
            </Link>

            {/* City Dropdown */}
            <div className="hidden md:block">
              <Select>
                <SelectTrigger className="bg-white text-gray-800 border border-gray-300 rounded-lg px-3 py-1 sm:px-4 sm:py-2 text-xs sm:text-sm focus:ring-1 focus:ring-gray-400 focus:border-gray-400 transition-all duration-200 dark:bg-black dark:text-white dark:border-gray-700 dark:focus:ring-gray-600 dark:focus:border-gray-600">
                  <SelectValue placeholder="Bombay" />
                </SelectTrigger>
                {/* <SelectContent className="bg-white text-gray-800 border border-gray-300 rounded-xl dark:bg-black dark:text-white dark:border-gray-700">
                  <SelectGroup>
                    <SelectItem value="bombay" className="cursor-pointer hover:bg-gray-200 focus:bg-lime-200 dark:hover:bg-gray-700 dark:focus:bg-lime-400 dark:focus:text-black">Bombay</SelectItem>
                    <SelectItem value="bangalore" className="cursor-pointer hover:bg-gray-200 focus:bg-lime-200 dark:hover:bg-gray-700 dark:focus:bg-lime-400 dark:focus:text-black">Bangalore</SelectItem>
                  </SelectGroup>
                </SelectContent> */}
              </Select>
            </div>
          </div>

          {/* Desktop Search */}
          <div ref={searchRef} className="flex-1 hidden mx-4 sm:mx-6 sm:block relative">
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
                className={`w-full bg-neutral-100 dark:bg-neutral-900 text-neutral-800 dark:text-neutral-100 text-sm rounded-full py-2.5 pl-4 pr-10 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none ${isSearching ? 'opacity-75 cursor-not-allowed' : ''
                  }`}
              />
              <SearchIcon
                size={18}
                className={`absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer transition-colors ${isSearching
                  ? 'text-gray-400 dark:text-gray-500 cursor-not-allowed animate-pulse'
                  : 'text-gray-500 dark:text-gray-300 hover:text-neutral-700 dark:hover:text-white'
                  }`}
                onClick={() => !isSearching && handleSearch(searchQuery)}
              />

              {/* Suggestions Dropdown */}
              {showSuggestions && suggestions.length > 0 && (
                <div ref={suggestionsRef} className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-neutral-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg z-50 max-h-80 overflow-y-auto">
                  {suggestions.map((product, index) => (
                    <div
                      key={product.id}
                      className={`p-3 cursor-pointer border-b border-gray-100 dark:border-neutral-700 last:border-b-0 hover:bg-neutral-50 dark:hover:bg-neutral-700 ${index === selectedSuggestionIndex ? 'bg-neutral-100 dark:bg-neutral-700' : ''
                        }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSearch(product.name);
                        setShowSuggestions(false);
                        setShowMobileSearch(false);
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
                          <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center text-xs text-gray-500 dark:text-gray-300">
                            No Image
                          </div>
                        )}
                        <div className="flex-1">
                          <div className="font-medium text-gray-900 dark:text-gray-100">{product.name}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-300">{product.category}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Loading Indicator */}
              {loadingSuggestions && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 p-3">
                  <div className="text-sm text-gray-500 dark:text-gray-300">Loading suggestions...</div>
                </div>
              )}
            </div>
          </div>


          {/* Icons & Mobile Toggle */}
          <div className="flex items-center gap-3 sm:gap-5 relative">
            {/* Cart Icon */}
            {currentUser && (
              <Link href="/cart" className="relative hidden md:block">
                <ShoppingCart size={22} className="text-gray-600 hover:text-gray-800 cursor-pointer transition dark:text-gray-200 dark:hover:text-white" />
                {getItemCount() > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5">{getItemCount()}</span>
                )}
              </Link>
            )}
            {/* Vendor Dashboard Icon */}
            {userProfile?.role === "seller" && (
              <Link href="/seller/dashboard" className="relative hidden md:block">
                <Store
                size={22}
                className="text-gray-600 hover:text-gray-800 cursor-pointer transition dark:text-gray-200 dark:hover:text-white"
                />
              </Link>
             )}


            {/* User Menu */}
            {currentUser ? (
              <div ref={userMenuRef} className="relative hidden md:block">
                <button onClick={() => setShowUserMenu(prev => !prev)} className="focus:outline-none flex items-center justify-center">
                  <User size={22} className="text-gray-600 hover:text-gray-800 cursor-pointer transition dark:text-gray-200 dark:hover:text-white" />
                  <span className="text-sm sm:text-base pl-1 sm:pl-2 text-gray-700 dark:text-gray-200">{currentUser.displayName}</span>
                </button>
                {showUserMenu && (
                  <div className="absolute right-0 mt-3 w-48 sm:w-52 bg-white/95 backdrop-blur-sm border border-gray-300 rounded-2xl shadow-lg overflow-hidden z-50 transition-all dark:bg-neutral-900/95 dark:border-gray-700">
                    <div className="py-2">
                      <Link href="/orders" className="flex items-center gap-2 px-5 py-2.5 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition dark:text-gray-200 dark:hover:bg-neutral-800 dark:hover:text-white"> <ClipboardList size={16} className="text-gray-500 dark:text-gray-400" />Orders</Link>
                      <Link href="/wishlist" className="flex items-center gap-2 px-5 py-2.5 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition dark:text-gray-200 dark:hover:bg-neutral-800 dark:hover:text-white"> <Heart size={16} className="text-gray-500 dark:text-gray-400" />Wishlist</Link>
                      <Link href="/profile" className="flex items-center gap-2 px-5 py-2.5 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition dark:text-gray-200 dark:hover:bg-neutral-800 dark:hover:text-white"> <User size={16} className="text-gray-500 dark:text-gray-400" />Profile</Link>
                      {userProfile?.role === "seller" && <Link href="/seller/products" className="flex items-center gap-2 px-5 py-2.5 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition dark:text-gray-200 dark:hover:bg-neutral-800 dark:hover:text-white"><Package size={16} className="text-gray-500 dark:text-gray-400" />My Products</Link>}
                      {isSuperAdmin(currentUser) && <Link href="/admin" className="flex items-center gap-2 px-5 py-2.5 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition dark:text-gray-200 dark:hover:bg-neutral-800 dark:hover:text-white"><Shield size={16} className="text-gray-500 dark:text-gray-400" />Super Admin</Link>}
                      <div className="border-t border-gray-300 my-1 dark:border-gray-700"></div>
                      <button onClick={handleLogout} className="flex items-center gap-2 px-5 py-2.5 text-sm text-red-600 hover:bg-gray-100 hover:text-red-700 transition w-full text-left dark:text-red-400 dark:hover:bg-neutral-800 dark:hover:text-red-300"><LogOut size={16} className="text-gray-500 dark:text-gray-500" />Logout</button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-2 sm:gap-3">
                <Link href="/login" className="px-3 py-1 sm:px-4 sm:py-2 text-sm sm:text-base font-bold border border-gray-300 bg-rose-500 text-black rounded-full hover:opacity-70 transition-all duration-200 dark:border-gray-900">Login</Link>
                <Link href="/register/customer" className="px-3 py-1 sm:px-4 sm:py-2 text-sm sm:text-base font-bold bg-lime-400 text-black rounded-full hover:opacity-70 transition-all duration-200 shadow-md">Register</Link>
              </div>
            )}

            {/* Mobile Icons */}
            <div className="flex items-center gap-3 sm:gap-5 relative ">
              {/* Search icon for mobile */}
              <button
                onClick={() => setShowMobileSearch(prev => !prev)}
                className="text-gray-700 sm:hidden hover:text-gray-900 transition p-1 dark:text-gray-200 dark:hover:text-white"
              >
                {showMobileSearch ? <X size={24} /> : <SearchIcon size={24} />}
              </button>

              <ModeToggle />

              {/* Menu toggle */}
              <button
                className="text-gray-700 md:hidden hover:text-gray-900 transition p-1 mobile-menu-toggle dark:text-gray-200 dark:hover:text-white"
                onClick={toggleMobileMenu}
              >
                {showMobileMenu ? <X size={26} /> : <MenuIcon size={26} />}
              </button>
            </div>

          </div>
        </div>

        {/* Mobile Menu */}
        <div ref={mobileMenuRef} className={`md:hidden absolute w-full bg-white/90 backdrop-blur-sm border-t border-gray-300 transition-all duration-300 ease-in-out transform overflow-hidden dark:bg-black/90 dark:border-gray-800 ${showMobileMenu ? "max-h-screen py-4" : "max-h-0"}`}>
          {/* Mobile Search */}
          <div className="px-4 pb-4">
            <div className="relative">
              {/* <input type="text" placeholder="Search for products..." value={mobileSearchQuery} onChange={(e) => setMobileSearchQuery(e.target.value)} onKeyPress={(e) => handleKeyPress(e, mobileSearchQuery)} className="w-full bg-neutral-100 text-gray-800 text-sm rounded-full py-2.5 pl-10 pr-4 placeholder:text-gray-400 focus:outline-none dark:bg-neutral-800 dark:text-white dark:placeholder:text-gray-500" /> */}
              <SearchIcon size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 cursor-pointer hover:text-gray-700 dark:text-gray-500 dark:hover:text-gray-300" onClick={() => handleSearch(mobileSearchQuery)} />
            </div>
          </div>

          <div className="flex flex-col">
            {currentUser && <>
              <Link href="/cart" className="flex items-center gap-3 px-6 py-3 text-lg text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition dark:text-gray-200 dark:hover:bg-neutral-800 dark:hover:text-white"> <ShoppingCart size={20} className="text-lime-500" />Cart {getItemCount() > 0 && <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-2 py-0.5">{getItemCount()}</span>} </Link>
              <Link href="/orders" className="flex items-center gap-3 px-6 py-3 text-lg text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition dark:text-gray-200 dark:hover:bg-neutral-800 dark:hover:text-white"> <ClipboardList size={20} className="text-lime-500" />Orders</Link>
              <Link href="/wishlist" className="flex items-center gap-3 px-6 py-3 text-lg text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition dark:text-gray-200 dark:hover:bg-neutral-800 dark:hover:text-white"> <Heart size={20} className="text-lime-500" />Wishlist</Link>
              <Link href="/profile" className="flex items-center gap-3 px-6 py-3 text-lg text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition dark:text-gray-200 dark:hover:bg-neutral-800 dark:hover:text-white"> <User size={20} className="text-lime-500" />Profile</Link>
              {userProfile?.role === "seller" && <Link href="/seller/products" className="flex items-center gap-3 px-6 py-3 text-lg text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition dark:text-gray-200 dark:hover:bg-neutral-800 dark:hover:text-white"><Package size={20} className="text-lime-500" />My Products</Link>}
              {userProfile?.role === "seller" && (
                <Link href="/seller/dashboard"className="flex items-center gap-3 px-6 py-3 text-lg text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition dark:text-gray-200 dark:hover:bg-neutral-800 dark:hover:text-white"><Store size={20} className="text-lime-500" />Vendor Dashboard</Link>)}

              {isSuperAdmin(currentUser) && <Link href="/admin" className="flex items-center gap-3 px-6 py-3 text-lg text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition dark:text-gray-200 dark:hover:bg-neutral-800 dark:hover:text-white"><Shield size={20} className="text-lime-500" />Super Admin</Link>}
              <button onClick={handleLogout} className="flex items-center gap-3 px-6 py-3 text-lg text-red-600 hover:bg-gray-100 hover:text-red-700 transition w-full text-left dark:text-red-400 dark:hover:bg-neutral-800 dark:hover:text-red-300"> <LogOut size={20} className="text-red-600 dark:text-red-400" />Logout </button>
            </>}

            {!currentUser && (
              <div className="flex flex-col gap-3 p-4">
                <Link href="/login" className="text-center px-4 py-3 text-lg font-bold bg-rose-500 border-none text-black rounded-lg hover:opacity-90" onClick={toggleMobileMenu}>Login</Link>
                {/* <LoginWithDialog /> */}
                <Link href="/register/customer" className="text-center px-4 py-3 text-lg font-bold bg-lime-500 hover:opacity-90 text-black rounded-lg" onClick={toggleMobileMenu}>Register</Link>
              </div>
            )}
          </div>

          {/* Mobile City Dropdown */}
          <div className="p-4 border-t border-gray-300 mt-2 dark:border-gray-800" onClick={(e) => e.stopPropagation()}>
            <Select className="w-full">
              <SelectTrigger className="w-full bg-white text-gray-800 border border-gray-300 rounded-lg px-4 py-2 text-sm sm:text-base focus:ring-1 focus:ring-gray-400 focus:border-gray-400 transition-all duration-200 dark:bg-black dark:text-white dark:border-gray-700 dark:focus:ring-gray-600 dark:focus:border-gray-600">
                <SelectValue placeholder="Bombay" />
              </SelectTrigger>
              {/* <SelectContent className="bg-white text-gray-800 border border-gray-300 rounded-xl dark:bg-black dark:text-white dark:border-gray-700">
                <SelectGroup>
                  <SelectItem value="bombay" className="cursor-pointer hover:bg-gray-200 hover:text-gray-900 dark:hover:bg-gray-700 dark:hover:text-white">Bombay</SelectItem>
                  <SelectItem value="bangalore" className="cursor-pointer hover:bg-gray-200 hover:text-gray-900 dark:hover:bg-gray-700 dark:hover:text-white">Bangalore</SelectItem>
                </SelectGroup>
              </SelectContent> */}
            </Select>
          </div>
        </div>

        {showMobileSearch && (
          <div
            className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 backdrop-blur-sm md:hidden"
            onClick={() => setShowMobileSearch(false)} // close when clicking outside
          >
            {/* Search Box Container */}
            <div
              className="w-full max-w-md bg-white dark:bg-neutral-900 rounded-2xl mt-10 mx-4 p-4 shadow-2xl relative"
              onClick={(e) => e.stopPropagation()} // prevent closing when clicking inside
            >
              {/* Close Icon */}
              <button
                onClick={() => setShowMobileSearch(false)}
                className="absolute right-4 top-2 text-gray-500 hover:text-gray-800 dark:text-gray-300 dark:hover:text-white"
              >
                <X size={22} />
              </button>

              {/* Your existing search input + suggestions */}
              <div ref={searchRef} className="flex-1 block relative">
                <div className="relative mt-6">
                  <input
                    type="text"
                    placeholder={isSearching ? "Searching..." : "Search for products..."}
                    value={searchQuery}
                    disabled={isSearching}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        if (selectedSuggestionIndex >= 0 && suggestions[selectedSuggestionIndex]) {
                          handleSearch(suggestions[selectedSuggestionIndex].name);
                        } else {
                          handleSearch(searchQuery);
                        }
                      } else if (e.key === "ArrowDown") {
                        e.preventDefault();
                        setSelectedSuggestionIndex(prev =>
                          prev < suggestions.length - 1 ? prev + 1 : 0
                        );
                      } else if (e.key === "ArrowUp") {
                        e.preventDefault();
                        setSelectedSuggestionIndex(prev =>
                          prev > 0 ? prev - 1 : suggestions.length - 1
                        );
                      } else if (e.key === "Escape") {
                        setShowSuggestions(false);
                        setSelectedSuggestionIndex(-1);
                      }
                    }}
                    onFocus={() => {
                      if (suggestions.length > 0 && !isSearching) setShowSuggestions(true);
                    }}
                    className={`w-full bg-neutral-100 dark:bg-neutral-800 text-gray-800 dark:text-white text-sm rounded-full py-2.5 pl-4 pr-10 placeholder:text-gray-400 focus:outline-none ${isSearching ? "opacity-75 cursor-not-allowed" : ""
                      }`}
                  />
                  <SearchIcon
                    size={18}
                    className={`absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer transition-colors ${isSearching
                      ? "text-gray-400 cursor-not-allowed animate-pulse"
                      : "text-gray-500 hover:text-gray-700"
                      }`}
                    onClick={() => !isSearching && handleSearch(searchQuery)}
                  />

                  {/* Suggestions Dropdown */}
                  {showSuggestions && suggestions.length > 0 && (
                    <div
                      ref={suggestionsRef}
                      className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-gray-700 rounded-3xl shadow-lg z-50 max-h-80 overflow-y-auto"
                    >
                      {suggestions.map((product, index) => (
                        <div
                          key={product.id}
                          className={`p-3 cursor-pointer border-b border-gray-100 dark:border-gray-800 last:border-b-0 hover:bg-gray-50 dark:hover:bg-neutral-800 ${index === selectedSuggestionIndex ? "bg-gray-100 dark:bg-neutral-800" : ""
                            }`}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSearch(product.name);
                            setShowSuggestions(false);
                            setShowMobileSearch(false);
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
                                  e.target.style.display = "none";
                                  e.target.nextElementSibling.style.display = "flex";
                                }}
                              />
                            ) : (
                              <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-500">
                                No Image
                              </div>
                            )}
                            <div className="flex-1">
                              <div className="font-medium text-gray-900 dark:text-white">{product.name}</div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">{product.category}</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Loading Indicator */}
                  {loadingSuggestions && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-gray-800 rounded-lg shadow-lg z-50 p-3">
                      <div className="text-sm text-gray-500 dark:text-gray-300">Loading suggestions...</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </header>
  );
}