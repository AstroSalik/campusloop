import type { Metadata } from "next";
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background text-foreground font-sans antialiased flex flex-col selection:bg-primary/15 selection:text-primary transition-colors duration-200">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
        <ScrollToTop />
        <BottomNav />
        <Toaster closeButton position="top-right" />
      </body>
    </html>
  );
}
