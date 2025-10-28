"use client";

import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
import { Toaster } from "react-hot-toast";
import { ThemeProvider } from "@/ThemeProvider/ThemeProvider";
import Header from "@/components/common/Header";
import FooterComponent from "@/components/common/Footer";
import Breadcrumb from "@/components/common/Breadcrumb";
import { usePathname } from "next/navigation";

export default function AccessComponent({ children }) {

    const pathName = usePathname();
    const hiddenPaths = ["/admin"];
    const handleAccess = hiddenPaths.some((path) => pathName.startsWith(path));

    return (

        <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
        >
            <AuthProvider>
                <CartProvider>
                    {!handleAccess && <Header />}
                    <Breadcrumb />
                    {children}
                    {!handleAccess && <FooterComponent />}
                    <Toaster position="top-right" />
                </CartProvider>
            </AuthProvider>
        </ThemeProvider>
    );
}
