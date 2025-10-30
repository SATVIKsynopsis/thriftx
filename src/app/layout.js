import "./globals.css";
import localFont from "next/font/local";
import AccessComponent from "./AccessComponent";

const anton = localFont({
  src: "../app/fonts/Anton/Anton-Regular.ttf",
  weight: "400",
  style: "normal",
  display: "swap",
});

const poppins = localFont({
  src: [
    { path: "../app/fonts/Poppins/Poppins-Regular.ttf", weight: "400", style: "normal" },
    { path: "../app/fonts/Poppins/Poppins-Bold.ttf", weight: "700", style: "normal" },
  ],
  display: "swap",
});

const sansation = localFont({
  src: "../app/fonts/Sansation/Sansation-Regular.ttf",
  weight: "400",
  style: "normal",
  display: "swap",
});

export const metadata = {
  title: "ThriftX",
  description:
    "ThriftX - Your trusted sustainable fashion marketplace for buying and selling amazing pre-loved fashion pieces.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${anton.className} ${sansation.className}`} suppressHydrationWarning>
      <body>
        <AccessComponent>{children}</AccessComponent>
      </body>
    </html>
  );
}
