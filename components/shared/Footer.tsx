import Link from "next/link";
import { 
  Building2, 
  Compass, 
  Heart, 
  Lock, 
  Mail,
  MessageSquare, 
  Percent, 
  ShieldCheck, 
  ShoppingBag, 
  Sparkles, 
  Users2 
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function Footer() {
  return (
    <footer className="w-full border-t border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 mt-auto transition-colors">
      <div className="container mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12">
          {/* Col 1: Brand & Trust Statement */}
          <div className="md:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2.5 group w-fit">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-white shadow-xs transition-transform group-hover:scale-105">
                <Compass className="h-5 w-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white leading-none">
                  Campus<span className="text-primary">Loop</span>
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Student Living & Marketplace
                </span>
              </div>
            </Link>

            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md leading-relaxed">
              The verified peer-to-peer campus ecosystem connecting students for dorm essentials, bicycles, study books, verified PG accommodations, and split-rent calculations.
            </p>

            {/* Trust Statement Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-teal-200/80 dark:border-teal-800/60 bg-teal-50/70 dark:bg-teal-950/40 px-3.5 py-1.5 text-xs font-semibold text-teal-800 dark:text-teal-300 shadow-2xs">
              <ShieldCheck className="h-4 w-4 text-teal-600 dark:text-teal-400" />
              <span>100% Student Verified · 0% Brokerage Fees</span>
            </div>
          </div>

          {/* Col 2: Platform Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              Platform
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link
                  href="/marketplace"
                  className="hover:text-primary dark:hover:text-teal-300 transition-colors flex items-center gap-1.5"
                >
                  <ShoppingBag className="h-3.5 w-3.5 text-slate-400" />
                  Marketplace
                </Link>
              </li>
              <li>
                <Link
                  href="/marketplace?type=buy"
                  className="hover:text-primary dark:hover:text-teal-300 transition-colors flex items-center gap-1.5"
                >
                  <Sparkles className="h-3.5 w-3.5 text-slate-400" />
                  Wanted Requests
                </Link>
              </li>
              <li>
                <Link
                  href="/housing"
                  className="hover:text-primary dark:hover:text-teal-300 transition-colors flex items-center gap-1.5"
                >
                  <Building2 className="h-3.5 w-3.5 text-slate-400" />
                  Hostels & PGs
                </Link>
              </li>
              <li>
                <Link
                  href="/roommates"
                  className="hover:text-primary dark:hover:text-teal-300 transition-colors flex items-center gap-1.5"
                >
                  <Users2 className="h-3.5 w-3.5 text-slate-400" />
                  Find Roommates
                </Link>
              </li>
              <li>
                <Link
                  href="/rent"
                  className="hover:text-primary dark:hover:text-teal-300 transition-colors flex items-center gap-1.5"
                >
                  <Percent className="h-3.5 w-3.5 text-slate-400" />
                  Rent Health Engine
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Trust & Legal Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              Trust & Legal
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link
                  href="/contact"
                  className="hover:text-primary dark:hover:text-teal-300 transition-colors flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-200"
                >
                  <Mail className="h-3.5 w-3.5 text-primary dark:text-teal-400" />
                  Contact Support
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="hover:text-primary dark:hover:text-teal-300 transition-colors flex items-center gap-1.5 font-medium"
                >
                  <ShieldCheck className="h-3.5 w-3.5 text-slate-400" />
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="hover:text-primary dark:hover:text-teal-300 transition-colors flex items-center gap-1.5 font-medium"
                >
                  <Lock className="h-3.5 w-3.5 text-slate-400" />
                  Privacy Policy
                </Link>
              </li>
              <li className="pt-2">
                <span className="text-[11px] text-slate-400 dark:text-slate-500 block leading-tight">
                  LPU Student Welfare Dept. &bull; astrosalikriyaz@gmail.com
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar: Copyright */}
        <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400 dark:text-slate-500">
          <p>© {new Date().getFullYear()} CampusLoop. Built for students, by students.</p>
          <div className="flex items-center gap-4">
            <Link href="/contact" className="hover:underline hover:text-slate-600 dark:hover:text-slate-300">
              Contact
            </Link>
            <span>•</span>
            <Link href="/terms" className="hover:underline hover:text-slate-600 dark:hover:text-slate-300">
              Terms
            </Link>
            <span>•</span>
            <Link href="/privacy" className="hover:underline hover:text-slate-600 dark:hover:text-slate-300">
              Privacy
            </Link>
            <span>•</span>
            <Link href="/messages" className="hover:underline hover:text-slate-600 dark:hover:text-slate-300">
              Support Chat
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
