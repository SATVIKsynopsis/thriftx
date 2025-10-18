"use client";

import { useState } from "react";
import { ShoppingCart, User, Search as SearchIcon, ChevronDown, X } from "lucide-react";
import Link from "next/link";

export default function Header() {
  const [showPromo, setShowPromo] = useState(true);

  return (
    <header className="w-full bg-black text-white">
      {/* 🔸 Promo Banner */}
      {showPromo && (
        <div className="bg-black text-center text-[11px] sm:text-xs py-2 border-b border-gray-900 relative">
          <p className="text-gray-200">
            Sign up and get 20% off to your first order.{" "}
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
      <div className="flex items-center justify-between px-4 sm:px-8 py-3 bg-black">
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
        <div className="flex items-center gap-4">
          <Link href="/cart">
            <ShoppingCart
              size={20}
              className="text-gray-200 hover:text-white cursor-pointer transition"
            />
          </Link>
          <Link href="/profile">
            <User
              size={20}
              className="text-gray-200 hover:text-white cursor-pointer transition"
            />
          </Link>
        </div>
      </div>
    </header>
  );
}
