"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import Header from "@/components/common/Header";
import Footer from "@/components/common/Footer";
import toast from "react-hot-toast";

export default function ClientLayout({ children }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // 🧠 Hide header & footer on login, register, cart, and admin pages
  const hideHeaderFooter =
    pathname === "/login" ||
    pathname === "/cart" ||
    pathname.startsWith("/register") ||
    pathname.startsWith("/admin");

  // ✅ Detect unauthorized redirect and show toast
  useEffect(() => {
    if (searchParams.get("unauthorized") === "true") {
      toast.error("You are not authorized to access that page.");
      // ✅ Remove the query param from the URL so it doesn't trigger again
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, [searchParams]);

  return (
    <div>
      {!hideHeaderFooter && <Header />}
      {/* <Header /> */}
      {children}
      {/* <Footer /> */}
      {!hideHeaderFooter && <Footer />}
    </div>
  );
}
