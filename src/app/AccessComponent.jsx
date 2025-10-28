"use client";

import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
import { ThemeProvider } from "@/ThemeProvider/ThemeProvider";
import dynamic from "next/dynamic";
import Breadcrumb from "@/components/common/Breadcrumb";
import { usePathname } from "next/navigation";
 

const Header = dynamic(() => import("@/components/common/Header"), { ssr: false, loading: () => null });
const FooterComponent = dynamic(() => import("@/components/common/Footer"), { ssr: false, loading: () => null });
const ToastLoader = dynamic(() => import("@/components/common/ToastLoader"), { ssr: false, loading: () => null });

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
                    <ToastLoader />
                </CartProvider>
            </AuthProvider>
        </ThemeProvider>
    );
}
