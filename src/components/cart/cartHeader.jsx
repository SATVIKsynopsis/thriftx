"use client"

import { Search, Heart, ShoppingCart, Settings, ChevronDown } from "lucide-react"
import { useState } from "react"

export default function Header() {
  const [showPromo, setShowPromo] = useState(true)

  return (
    <>
      {/* Promo Banner */}
      {showPromo && (
        <div className="bg-black px-4 py-2 flex items-center justify-between">
          <p className="text-xs sm:text-sm text-center flex-1 text-white">
            Sign up and get 20% off is your first order.{" "}
            <a href="#" className="underline hover:no-underline">
              Sign Up Now
            </a>
          </p>
          <button onClick={() => setShowPromo(false)} className="ml-4 text-white hover:text-gray-400 text-lg">
            ✕
          </button>
        </div>
      )}

      {/* Main Header */}
      <header className="bg-black px-4 sm:px-8 py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Logo and Dropdown */}
          <div className="flex items-center gap-4 flex-shrink-0">
            <h1 className="text-2xl sm:text-3xl font-bold">
              <span className="text-lime-400">Thrift</span>
              <span className="text-red-500">X</span>
            </h1>
            <button className="hidden sm:flex items-center gap-1 text-white text-sm hover:text-gray-300">
              BOMBAY
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>

          {/* Search Bar - Centered and takes up space */}
          <div className="hidden sm:flex flex-1 max-w-2xl mx-4">
            <div className="relative w-full">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="text"
                placeholder="Search for products..."
                className="w-full bg-white border-0 rounded-full pl-12 pr-4 py-3 text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-lime-400"
              />
            </div>
          </div>

          {/* Right Icons */}
          <div className="flex items-center gap-4 flex-shrink-0">
            <button className="text-white hover:text-gray-300">
              <ShoppingCart className="w-5 h-5" />
            </button>
            <button className="text-white hover:text-gray-300">
              <Heart className="w-5 h-5" />
            </button>
            <button className="text-white hover:text-gray-300">
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>
    </>
  )
}
