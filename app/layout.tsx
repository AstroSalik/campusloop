import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Navbar } from "@/components/shared/Navbar";
import { BottomNav } from "@/components/shared/BottomNav";
import { Footer } from "@/components/shared/Footer";
import { ScrollToTop } from "@/components/shared/ScrollToTop";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: "CampusLoop — Campus Living & Marketplace",
  description:
    "Students don't have an e-commerce problem or a rent-splitting problem — they have a campus-living problem. Find housing, roommates, split rent, and buy/sell essentials.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="overflow-x-hidden">
      <body className="min-h-screen bg-background text-foreground font-sans antialiased flex flex-col selection:bg-primary/15 selection:text-primary transition-colors duration-200 overflow-x-hidden">
        <Navbar />
        <main className="flex-1 w-full min-w-0 pb-16 lg:pb-0">{children}</main>
        <Footer />
        <ScrollToTop />
        <BottomNav />
        <Toaster closeButton position="top-right" />
      </body>
    </html>
  );
}
