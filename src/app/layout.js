import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
import { Toaster } from "react-hot-toast";
// import ClientLayout from "../components/ClientLayout";
import { Anton } from "next/font/google";
import { ThemeProvider } from "@/ThemeProvider/ThemeProvider";
import Header from "@/components/common/Header";
import FooterComponent from "@/components/common/Footer";

const anton = Anton({
  weight: "400",
  subsets: ["latin"],
});

export const metadata = {
  title: "ThriftX",
  description:
    "ThriftX - Your trusted sustainable fashion marketplace for buying and selling amazing pre-loved fashion pieces. Discover unique styles, connect with fashion lovers, and make sustainable choices.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <CartProvider>
              {/* <ClientLayout> */}
              <Header />
              {children}
              <FooterComponent />
              {/* </ClientLayout> */}
              <Toaster position="top-right" />
            </CartProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
