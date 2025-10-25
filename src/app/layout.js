import "./globals.css";
import { Anton, Poppins } from "next/font/google";
import AccessComponent from "./AccessComponent";
import { sansation } from "./fonts/Sansation";

const anton = Anton({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

export const metadata = {
  title: "ThriftX",
  description:
    "ThriftX - Your trusted sustainable fashion marketplace for buying and selling amazing pre-loved fashion pieces. Discover unique styles, connect with fashion lovers, and make sustainable choices.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${anton.className} ${sansation.className}`} suppressHydrationWarning>
      <body>
        <AccessComponent>
          {children}
        </AccessComponent>
      </body>
    </html>
  );
}
