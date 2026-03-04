import type { Metadata } from "next";
import { Hanken_Grotesk, Public_Sans } from "next/font/google";
import "./globals.css";

const hanken = Hanken_Grotesk({ 
  variable: "--font-hanken",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

const publicSans = Public_Sans({ 
  variable: "--font-public-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "MoveIn | Premium Student Housing Pune",
  description: "Find your safe, verified home near Pune's top colleges. Built for parents' peace of mind and students' success.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${hanken.variable} ${publicSans.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
