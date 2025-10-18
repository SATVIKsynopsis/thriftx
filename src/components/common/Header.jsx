"use client";

import React, { useState, useEffect } from 'react';
// Replaced Next.js specific imports with standard React and basic Lucide icons
import {
  ShoppingCart,
  Package,
  Shield,
  Menu,
  X,
  User, // Using 'User' from lucide-react instead of CgProfile
  Search as SearchIcon // Renaming lucide's Search icon to avoid conflicts
} from 'lucide-react'; 
import Link from 'next/link';
import { useAuth } from "@/contexts/AuthContext"
import { useCart } from "@/contexts/CartContext"

// --- MOCK IMPLEMENTATIONS TO RESOLVE COMPILATION ERRORS ---
// Since the compiler cannot resolve external contexts and hooks, we mock them.

// /** Mock implementation for useAuth */
// const useAuth = () => ({
//   // Dummy authenticated user
//   currentUser: { uid: 'mock-user-123', email: 'user@example.com' },
//   userProfile: { role: 'seller', name: 'Mock Seller' },
//   // Mock logout function (does nothing but log a message)
//   logout: async () => { console.log("Mock logout executed."); }, 
//   // Simple mock super admin check
//   isSuperAdmin: (user) => user?.uid === 'mock-super-admin', 
// });

// /** Mock implementation for useCart */
// const useCart = () => ({
//   // Always returns 3 items for demonstration
//   getItemCount: () => 1, 
// });

// Since 'motion/react' cannot be resolved, we use standard useState for visibility
// and transition classes for the sticky header effect.

// --- END MOCK IMPLEMENTATIONS ---


const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  
  // Use mock hooks
  const { currentUser, userProfile, logout, isSuperAdmin } = useAuth();
  const { getItemCount } = useCart();
  
  const [selectedCity, setSelectedCity] = useState('BANGALORE');
  const [isBannerVisible, setIsBannerVisible] = useState(true); 

  // State for sticky header visibility (simplified scroll logic)
  const [isStickyHeaderVisible, setIsStickyHeaderVisible] = useState(true);

  // Simplified scroll visibility logic using native browser events
  useEffect(() => {
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      if (window.scrollY < 50) {
        // Always show header near the top
        setIsStickyHeaderVisible(true);
      } else if (window.scrollY > lastScrollY) {
        // Scrolling down
        setIsStickyHeaderVisible(false);
      } else {
        // Scrolling up
        setIsStickyHeaderVisible(true);
      }
      lastScrollY = window.scrollY;
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleCityChange = (event) => setSelectedCity(event.target.value);

  const handleLogout = async () => {
    try {
      await logout();
      setUserMenuOpen(false);
      setMobileMenuOpen(false);
      // Removed router.push('/'); for compatibility
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const NavLinkClass = 'flex items-center gap-2 px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-all shadow-sm shadow-gray-700 hover:shadow-lg hover:shadow-gray-700 cursor-pointer';
  
  // Custom utility class for animation (mimics motion transition)
  const headerVisibilityClass = isStickyHeaderVisible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0';

  return (
    // AnimatePresence replaced by standard conditional rendering and CSS transitions
    <div className='relative'>
      {/* Top Promotional Banner */}
      {isBannerVisible && (
        <div
            // Using standard Tailwind classes for fade-in/out effect
            className="bg-black text-white text-center py-2 flex items-center justify-center gap-4 transition-all duration-300 ease-in-out"
        >
          <p className="text-[10px] sm:text-sm">
            Sign up and get 20% off your first order.
            {/* Replaced Next Link with standard anchor tag for compilation */}
            <Link href="/signup"> 
              <span className="underline font-extralight cursor-pointer ml-1 hover:text-blue-500">
                Sign Up Now
              </span>
            </Link>
          </p>

          {/* Close icon to hide the banner */}
          <X 
            size={20}
            className="cursor-pointer absolute right-4 hover:text-red-500 transition-colors"
            onClick={() => setIsBannerVisible(false)}
          />
        </div>
      )}

      {/* Main Navigation Header */}
      <div
        // Using simplified transition classes instead of motion.div
        className={`sticky top-0 left-0 right-0 bg-black shadow-lg z-50 transition-all duration-200 ease-in-out ${headerVisibilityClass}`}
      >
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex items-center justify-between py-2 gap-2 sm:gap-4'>

            {/* Logo */}
            {/* Replaced Next Link with standard anchor tag for compilation */}
            <Link
              href='/'
              className='text-xl font-bold text-blue-600 hover:text-blue-700 transition-colors flex-shrink-0'
            >
              <div className='select-none'>
                <h1 className='text-balance fontAnton text-2xl sm:text-3xl font-extrabold leading-none tracking-wide'>
                  <span className='text-lime-500'>Thrift</span>
                  {/* Removed motion.span animation for stability */}
                  <span className="inline-block text-rose-500">X</span>
                </h1>
              </div>
            </Link>

            {/* City Selector (Desktop) */}
            <div className='p-2 hidden md:block flex-shrink-0'>
              <select
                id='city-select'
                name='city'
                value={selectedCity}
                onChange={handleCityChange}
                className='block py-2 px-3 bg-black text-slate-100 rounded-md shadow-sm focus:outline-none focus:ring-gray-500 text-sm font-[Sansation] shadow-gray-700 hover:shadow-lg hover:shadow-gray-700 cursor-pointer border border-gray-700 appearance-none'
              >
                <option className='bg-black' value='BOMBAY'>
                  BOMBAY
                </option>
                <option className='bg-black' value='BANGALORE'>
                  BANGALORE
                </option>
              </select>
            </div>

            {/* Desktop Search - Placeholder instead of <Search /> component */}
            <div className='hidden md:block flex-1 max-w-2xl relative'>
              <input
                type="text"
                placeholder="Search products, brands, and sellers..."
                className="w-full py-2 pl-4 pr-10 bg-gray-900 text-white rounded-lg border border-gray-700 focus:ring-2 focus:ring-lime-500 focus:border-lime-500 transition-all"
              />
              <SearchIcon size={20} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
            </div>

            {/* Desktop Nav */}
            <nav className='hidden md:flex items-center gap-3 flex-shrink-0'>
              {currentUser ? (
                <>
                  {/* Super Admin Link */}
                  {isSuperAdmin(currentUser) && (
                    <a href='/admin/super' className={NavLinkClass}>
                      <Shield size={20} />
                      <span className='text-sm font-medium'>Super Admin</span>
                    </a>
                  )}

                  {/* Cart Icon */}
                  <a href='/cart' className={`${NavLinkClass} relative p-3`}>
                    <ShoppingCart size={20} />
                    {getItemCount() > 0 && (
                      <span className='absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-semibold'>
                        {getItemCount()}
                      </span>
                    )}
                  </a>

                  {/* User Menu Dropdown */}
                  <div className='relative'>
                    <button
                      onClick={() => setUserMenuOpen(!userMenuOpen)}
                      className={`${NavLinkClass} p-3`}
                      aria-expanded={userMenuOpen}
                    >
                      <User size={20} /> {/* Used Lucide 'User' icon */}
                    </button>

                    {userMenuOpen && (
                      <div className='absolute right-0 mt-2 w-48 bg-black rounded-lg shadow-xl border border-gray-400 py-1 z-50'>
                        {/* Dropdown Links */}
                        <a href='/profile' onClick={() => setUserMenuOpen(false)} className='block px-4 py-2 text-sm text-gray-100 hover:bg-gray-700 transition-colors'>Profile</a>
                        <a href='/orders' onClick={() => setUserMenuOpen(false)} className='flex items-center gap-2 px-4 py-2 text-sm text-gray-100 hover:bg-gray-700 transition-colors'><Package size={16} />Orders</a>
                        {userProfile?.role === 'seller' && (
                          <a href='/seller/products' onClick={() => setUserMenuOpen(false)} className='block px-4 py-2 text-sm text-gray-100 hover:bg-gray-700 transition-colors'>My Products</a>
                        )}
                        {isSuperAdmin(currentUser) && (
                          <a href='/admin/super' onClick={() => setUserMenuOpen(false)} className='flex items-center gap-2 px-4 py-2 text-sm text-gray-100 hover:bg-gray-700 transition-colors'><Shield size={16} />Super Admin</a>
                        )}
                        <button onClick={handleLogout} className='w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-gray-700 transition-colors'>Logout</button>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <>
                  {/* Auth Links */}
                  <a href='/login' className='px-4 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-all'>Login</a>
                  <a href='/register/customer' className='px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-all'>Register</a>
                </>
              )}
            </nav>

            {/* Mobile Icons*/}
            <div className='flex items-center gap-2 md:hidden flex-shrink-0'>

              {/* Mobile Cart Icon */}
              {currentUser && (
                <a href='/cart' className='relative p-2 text-white hover:bg-gray-800 rounded-full transition-all'>
                  <ShoppingCart size={20} />
                  {getItemCount() > 0 && (
                    <span className='absolute top-0 right-0 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs font-semibold'>
                      {getItemCount()}
                    </span>
                  )}
                </a>
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={() => {
                  setMobileMenuOpen(!mobileMenuOpen);
                  setUserMenuOpen(false);
                }}
                className='p-2 text-white hover:bg-gray-800 rounded-full transition-all'
                aria-expanded={mobileMenuOpen}
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div
            className='md:hidden bg-black/90 border-t border-gray-800 absolute w-full z-40 shadow-2xl transition-all duration-200'
          >
            {/* Mobile Search - Placeholder */}
            <div className='px-4 py-2 md:hidden relative'>
              <input
                type="text"
                placeholder="Search products, brands, and sellers..."
                className="w-full py-2 pl-4 pr-10 bg-gray-900 text-white rounded-lg border border-gray-700 focus:ring-2 focus:ring-lime-500 focus:border-lime-500 transition-all"
              />
              <SearchIcon size={20} className="absolute right-6 top-1/2 transform -translate-y-1/2 text-gray-500" />
            </div>

            <div className='px-4 pt-2 pb-3 space-y-1 sm:px-3'>

              {/* Mobile City Selector */}
              <select
                id='mobile-city-select'
                name='city'
                value={selectedCity}
                onChange={handleCityChange}
                className='w-full block py-2 px-3 bg-gray-900 text-slate-100 rounded-md shadow-sm focus:outline-none focus:ring-gray-500 text-sm font-[Sansation] border border-gray-700 mb-4 appearance-none'
              >
                <option className='bg-black' value='BOMBAY'>BOMBAY</option>
                <option className='bg-black' value='BANGALORE'>BANGALORE</option>
              </select>

              {/* Auth/User Links (Mobile) */}
              {currentUser ? (
                <>
                  <Link href='/profile' onClick={() => setMobileMenuOpen(false)} className='block px-3 py-2 text-base font-medium text-white hover:bg-gray-800 rounded-md'>Profile</Link>
                  <Link href='/orders' onClick={() => setMobileMenuOpen(false)} className='flex items-center gap-2 px-3 py-2 text-base font-medium text-white hover:bg-gray-800 rounded-md'><Package size={20} /> Orders</Link>
                  {userProfile?.role === 'seller' && (
                    <Link href='/seller/products' onClick={() => setMobileMenuOpen(false)} className='block px-3 py-2 text-base font-medium text-white hover:bg-gray-800 rounded-md'>My Products</Link>
                  )}
                  {isSuperAdmin(currentUser) && (
                    <Link href='/admin/super' onClick={() => setMobileMenuOpen(false)} className='flex items-center gap-2 px-3 py-2 text-base font-medium text-white hover:bg-gray-800 rounded-md'><Shield size={20} /> Super Admin</Link>
                  )}
                  <button onClick={handleLogout} className='w-full text-left px-3 py-2 text-base font-medium text-red-400 hover:bg-gray-800 rounded-md'>Logout</button>
                </>
              ) : (
                <>
                  <Link href='/login' onClick={() => setMobileMenuOpen(false)} className='block px-3 py-2 text-base font-medium text-gray-300 hover:text-white hover:bg-gray-800 rounded-md'>Login</Link>
                  <Link href='/register/customer' onClick={() => setMobileMenuOpen(false)} className='block px-3 py-2 text-base font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md text-center'>Register</Link>
                </>
              )}
            </div>
          </div>
        )}
    </div>
  );
};

export default Header;