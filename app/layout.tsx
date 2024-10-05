import type { Metadata } from "next";
import "./globals.css";
import { inter } from "./fonts";
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: "NASA Space Apps Challenge",
  description: "NASA Space Apps Challenge",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.className} antialiased`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
