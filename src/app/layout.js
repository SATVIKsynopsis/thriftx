import "./globals.css";
import { Anton } from "next/font/google";
import AccessComponent from "./AccessComponent";

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
    <html lang="en" className={`${anton.className}`} suppressHydrationWarning>
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Sansation:ital,wght@0,300;0,400;0,700;1,300;1,400;1,700&display=swap"
        />
      </head>
      <body>
        <AccessComponent>
          {children}
        </AccessComponent>
      </body>
    </html>
  );
}
