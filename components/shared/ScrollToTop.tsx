"use client";

import React, { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";

export function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;

      // Show button when scrolled past 300px or when nearing page bottom
      if (scrollTop > 280) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }

      if (docHeight > 0) {
        setScrollProgress(Math.min(100, Math.round((scrollTop / docHeight) * 100)));
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <div
      className={`fixed bottom-20 sm:bottom-8 right-4 sm:right-6 z-50 transition-all duration-300 transform ${
        isVisible
          ? "opacity-100 translate-y-0 scale-100 pointer-events-auto"
          : "opacity-0 translate-y-4 scale-95 pointer-events-none"
      }`}
    >
      <button
        type="button"
        onClick={scrollToTop}
        aria-label="Back to top"
        title="Scroll back to top"
        className="group flex items-center justify-center h-10 w-10 sm:h-auto sm:w-auto sm:gap-1.5 sm:px-3.5 sm:py-2.5 rounded-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-md text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700/80 shadow-lg hover:shadow-xl hover:border-primary/50 hover:bg-primary hover:text-white dark:hover:bg-primary dark:hover:text-white transition-all duration-200 active:scale-95"
      >
        <ArrowUp className="h-4 w-4 transition-transform group-hover:-translate-y-0.5" />
        <span className="text-xs font-semibold hidden sm:inline">Top</span>
      </button>
    </div>
  );
}
