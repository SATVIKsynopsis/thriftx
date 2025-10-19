"use client";

import { usePathname } from "next/navigation";
import Header from "@/components/common/Header";
import Footer from "@/components/common/Footer";

export default function ClientLayout({ children }) {
  const pathname = usePathname();

  // 🧠 Hide header & footer on login, register, cart, and admin pages
  const hideHeaderFooter =
    pathname === "/login" ||
    pathname === "/cart" ||
    pathname.startsWith("/register") ||
    pathname.startsWith("/admin");

  return (
    <div>
      {!hideHeaderFooter && <Header />}
      {children}
      {!hideHeaderFooter && <Footer />}
    </div>
  );
}
