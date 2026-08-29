import React from "react";
import Link from "next/link";
import { 
  AlertCircle, 
  ArrowLeft, 
  Building2, 
  CheckCircle2, 
  Handshake, 
  HelpCircle, 
  Lock, 
  Scale, 
  ShieldAlert, 
  ShieldCheck, 
  ShoppingBag, 
  UserCheck 
} from "lucide-react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Terms & Conditions — CampusLoop",
  description: "Terms and guidelines governing student peer marketplace and housing on CampusLoop.",
};

export default function TermsPage() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-12 space-y-8">
      {/* Top Header */}
      <div className="space-y-3 border-b border-slate-200/80 dark:border-slate-800 pb-6">
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="sm" className="gap-1 text-slate-500 hover:text-slate-900 dark:hover:text-white -ml-2">
            <Link href="/">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Link>
          </Button>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 dark:bg-primary/20 text-primary dark:text-teal-300">
            <Scale className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              Terms & Conditions
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Last updated: August 2026 · Plain language student community agreement
            </p>
          </div>
        </div>
      </div>

      {/* Summary Highlight Box */}
      <div className="rounded-xl border border-teal-200/80 dark:border-teal-800/60 bg-teal-50/60 dark:bg-teal-950/30 p-4 sm:p-5 flex items-start gap-3.5 shadow-2xs">
        <ShieldCheck className="h-5 w-5 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
        <div className="space-y-1 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
          <strong className="text-slate-900 dark:text-white block font-semibold">
            In Plain Words: What CampusLoop Is and Isn&apos;t
          </strong>
          <p>
            CampusLoop is a <strong>free, verified peer-to-peer student connection tool</strong> built to help you find hostel flatmates, calculate rent splits, and buy or sell used study essentials directly with fellow students. We do not take broker fees, we do not store your money, and we do not act as a middleman in transactions.
          </p>
        </div>
      </div>

      {/* Section 1: Account Eligibility */}
      <Card className="border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2 text-primary dark:text-teal-400">
            <UserCheck className="h-4 w-4" />
            <CardTitle className="text-base font-bold text-slate-900 dark:text-white">
              1. Student Eligibility & Verification
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          <p>
            CampusLoop is strictly reserved for currently enrolled university and college students, faculty, or verified campus residents. By creating an account or posting on the platform:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-slate-600 dark:text-slate-300">
            <li>You agree to use your real student name and valid campus/college email credentials.</li>
            <li>Commercial brokers, external real estate agencies, and non-student commercial vendors are strictly prohibited from soliciting on CampusLoop.</li>
            <li>Accounts found misrepresenting student enrollment or creating fraudulent listings will be permanently deactivated.</li>
          </ul>
        </CardContent>
      </Card>

      {/* Section 2: Marketplace & Housing Listing Rules */}
      <Card className="border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2 text-primary dark:text-teal-400">
            <ShoppingBag className="h-4 w-4" />
            <CardTitle className="text-base font-bold text-slate-900 dark:text-white">
              2. Listing & Room Posting Guidelines
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          <p>
            When posting marketplace items, flat vacancies, or wanted requests, you agree to:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-slate-600 dark:text-slate-300">
            <li><strong>Provide accurate descriptions:</strong> Honestly state item conditions (e.g. scratches, battery health, missing accessories) and exact room dimensions / occupancy.</li>
            <li><strong>Fair student pricing:</strong> Post genuine asking prices or budget ceilings in Indian Rupees (₹ INR). Bait-and-switch pricing or inflated auction bidding is disallowed.</li>
            <li><strong>Keep listings up to date:</strong> Mark items as sold or fulfilled as soon as the deal is closed to respect other students&apos; time.</li>
            <li><strong>Zero spam:</strong> Do not post duplicate listings for the same item across categories.</li>
          </ul>
        </CardContent>
      </Card>

      {/* Section 3: Prohibited Items */}
      <Card className="border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
            <ShieldAlert className="h-4 w-4" />
            <CardTitle className="text-base font-bold text-slate-900 dark:text-white">
              3. Prohibited Items & Activities
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          <p>
            The following items and activities are strictly forbidden on CampusLoop:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
            <div className="p-2.5 rounded-lg bg-red-50/60 dark:bg-red-950/20 border border-red-200/60 dark:border-red-900/40 text-xs text-red-900 dark:text-red-300">
              ✕ Alcohol, tobacco, nicotine, or vape products
            </div>
            <div className="p-2.5 rounded-lg bg-red-50/60 dark:bg-red-950/20 border border-red-200/60 dark:border-red-900/40 text-xs text-red-900 dark:text-red-300">
              ✕ Illegal substances or prescription drugs
            </div>
            <div className="p-2.5 rounded-lg bg-red-50/60 dark:bg-red-950/20 border border-red-200/60 dark:border-red-900/40 text-xs text-red-900 dark:text-red-300">
              ✕ Weapons, fireworks, or hazardous chemical agents
            </div>
            <div className="p-2.5 rounded-lg bg-red-50/60 dark:bg-red-950/20 border border-red-200/60 dark:border-red-900/40 text-xs text-red-900 dark:text-red-300">
              ✕ Exam leaks, pirated question banks, academic dishonesty
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Section 4: User Conduct & Safety */}
      <Card className="border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2 text-primary dark:text-teal-400">
            <Handshake className="h-4 w-4" />
            <CardTitle className="text-base font-bold text-slate-900 dark:text-white">
              4. Student Safety & Meetup Etiquette
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          <p>
            We prioritize the physical safety and privacy of all students:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-slate-600 dark:text-slate-300">
            <li><strong>Meet in public campus areas:</strong> For marketplace exchanges, meet at well-lit campus spots (e.g. University Main Gate, Central Library, Campus Canteen, or Hostel Common Room).</li>
            <li><strong>Inspect before paying:</strong> Never send advance money to unverified numbers. Always test electronic devices, cycles, and study tables in person before completing the UPI or cash payment.</li>
            <li><strong>Respectful communication:</strong> Harassment, discriminatory language, stalking, or inappropriate messaging in 1:1 chats will result in immediate ban and campus administration reporting.</li>
          </ul>
        </CardContent>
      </Card>

      {/* Section 5: Connection Platform & Liability Framing */}
      <Card className="border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2 text-primary dark:text-teal-400">
            <Building2 className="h-4 w-4" />
            <CardTitle className="text-base font-bold text-slate-900 dark:text-white">
              5. Connection Platform & Limitation of Liability
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          <p>
            <strong>CampusLoop is a peer-to-peer venue and connection technology:</strong>
          </p>
          <p>
            We provide software tools to help students discover accommodation vacancies, find roommates, calculate fair rent proportions, and browse items. CampusLoop is <strong>not a party to any contract, lease, sale, or transfer</strong> between users.
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-slate-600 dark:text-slate-300">
            <li>We do not own, inspect, guarantee, warrant, or store listed marketplace items.</li>
            <li>We are not landlords or property managers; rental agreements and security deposits are executed directly between tenants and property owners.</li>
            <li>The Rent Health Engine provides algorithmic estimates based on 30%–50% financial benchmarks for informational budgeting assistance and is not certified financial advisory.</li>
          </ul>
        </CardContent>
      </Card>

      {/* Section 6: Dispute Resolution */}
      <Card className="border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2 text-primary dark:text-teal-400">
            <HelpCircle className="h-4 w-4" />
            <CardTitle className="text-base font-bold text-slate-900 dark:text-white">
              6. Dispute Handling & Community Reporting
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          <p>
            If a disagreement arises regarding an item condition or roommate arrangement, we encourage students to communicate politely and resolve the issue directly.
          </p>
          <p>
            For safety concerns, fraud, or violations of community rules, you can report the listing or user profile immediately. CampusLoop administrators will review chat logs and listing history to take appropriate moderation actions, including temporary restrictions or permanent blacklisting.
          </p>
        </CardContent>
      </Card>

      {/* Bottom CTA */}
      <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-200/80 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
        <p>Questions about these terms? Reach out to the campus team.</p>
        <div className="flex gap-3">
          <Button asChild variant="outline" size="sm">
            <Link href="/privacy">Read Privacy Policy</Link>
          </Button>
          <Button asChild size="sm" className="bg-primary hover:bg-primary/90 text-white">
            <Link href="/marketplace">Explore Marketplace</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
