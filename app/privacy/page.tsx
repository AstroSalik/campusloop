import React from "react";
import Link from "next/link";
import { 
  ArrowLeft, 
  Database, 
  EyeOff, 
  FileText, 
  Lock, 
  Mail, 
  MessageSquare, 
  Server, 
  ShieldCheck, 
  Trash2, 
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
  title: "Privacy Policy — CampusLoop",
  description: "How CampusLoop protects student data with Row Level Security (RLS) and zero third-party monetization.",
};

export default function PrivacyPage() {
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
            <Lock className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              Privacy Policy
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Last updated: August 2026 · Committed to student privacy & data protection
            </p>
          </div>
        </div>
      </div>

      {/* Trust Highlights Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border border-teal-200/80 dark:border-teal-800/60 bg-teal-50/60 dark:bg-teal-950/30 p-4 space-y-1.5 shadow-2xs">
          <div className="flex items-center gap-2 text-teal-700 dark:text-teal-300 font-bold text-xs">
            <EyeOff className="h-4 w-4" />
            <span>Zero Data Selling</span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            We never sell, rent, or trade your student information to advertisers, landlords, or external commercial agencies.
          </p>
        </div>

        <div className="rounded-xl border border-teal-200/80 dark:border-teal-800/60 bg-teal-50/60 dark:bg-teal-950/30 p-4 space-y-1.5 shadow-2xs">
          <div className="flex items-center gap-2 text-teal-700 dark:text-teal-300 font-bold text-xs">
            <Database className="h-4 w-4" />
            <span>Row Level Security (RLS)</span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            Database-level security rules strictly protect private conversations and only expose listings you choose to publish.
          </p>
        </div>

        <div className="rounded-xl border border-teal-200/80 dark:border-teal-800/60 bg-teal-50/60 dark:bg-teal-950/30 p-4 space-y-1.5 shadow-2xs">
          <div className="flex items-center gap-2 text-teal-700 dark:text-teal-300 font-bold text-xs">
            <Trash2 className="h-4 w-4" />
            <span>Full User Control</span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            You can modify or delete your marketplace items, wanted requests, and roommate profiles at any time.
          </p>
        </div>
      </div>

      {/* Section 1: What Data Is Collected */}
      <Card className="border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2 text-primary dark:text-teal-400">
            <UserCheck className="h-4 w-4" />
            <CardTitle className="text-base font-bold text-slate-900 dark:text-white">
              1. Information We Collect
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          <p>
            To provide a seamless campus experience, we collect only the minimal necessary data:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-slate-600 dark:text-slate-300">
            <li><strong>Account & Profile:</strong> Your name, university email address, campus ID, and selected hostel / PG neighborhood.</li>
            <li><strong>Listings & Requests:</strong> Item titles, descriptions, categories, asking prices / budget ceilings, condition ratings, and photos you upload.</li>
            <li><strong>Roommate Preferences:</strong> Lifestyle habits (sleep schedule, study environment, cleanliness level, budget ranges) when you choose to publish a roommate profile.</li>
            <li><strong>Messages:</strong> In-app chat messages exchanged between buyers, sellers, and flatmate groups to facilitate transparent communication.</li>
          </ul>
        </CardContent>
      </Card>

      {/* Section 2: How Information Is Used */}
      <Card className="border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2 text-primary dark:text-teal-400">
            <FileText className="h-4 w-4" />
            <CardTitle className="text-base font-bold text-slate-900 dark:text-white">
              2. How Your Information Is Used
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          <p>We process your data strictly to operate and improve CampusLoop functionality:</p>
          <ul className="list-disc pl-5 space-y-1.5 text-slate-600 dark:text-slate-300">
            <li>Displaying active listings to students on your specific campus.</li>
            <li>Enabling real-time 1:1 chat conversations between students for item pickup coordination and roommate matching.</li>
            <li>Powering the Rent Health Engine to calculate personal split shares and affordability ratios.</li>
            <li>Protecting the campus community by moderating prohibited goods and preventing non-student spam.</li>
          </ul>
        </CardContent>
      </Card>

      {/* Section 3: Row Level Security & Technical Protection */}
      <Card className="border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2 text-primary dark:text-teal-400">
            <Server className="h-4 w-4" />
            <CardTitle className="text-base font-bold text-slate-900 dark:text-white">
              3. Database Security & Row Level Security (RLS)
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          <p>
            CampusLoop uses Postgres databases with granular <strong>Row Level Security (RLS)</strong> policies:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-slate-600 dark:text-slate-300">
            <li><strong>Private Messages:</strong> Messages and conversations can only be read and sent by verified members of that specific thread. Other students or unauthenticated visitors cannot access your private chats.</li>
            <li><strong>Ownership Controls:</strong> Only you have the cryptographic permission to update or delete your own marketplace listings, accommodation posts, and wanted requests.</li>
            <li><strong>Encrypted Transport:</strong> All data in transit between your browser and our backend is encrypted using industry-standard TLS/HTTPS protocols.</li>
          </ul>
        </CardContent>
      </Card>

      {/* Section 4: No Third-Party Selling */}
      <Card className="border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2 text-primary dark:text-teal-400">
            <ShieldCheck className="h-4 w-4" />
            <CardTitle className="text-base font-bold text-slate-900 dark:text-white">
              4. No Third-Party Data Selling or Ad Tracking
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          <p>
            Unlike commercial classifieds that sell user data or flood students with targeted loan and broker ads, CampusLoop has a strict anti-monetization privacy pledge:
          </p>
          <p>
            We do <strong>not</strong> share your phone number, email address, or conversation history with real estate brokers, property agents, financial institutions, or external ad networks.
          </p>
        </CardContent>
      </Card>

      {/* Section 5: Data Retention & Rights */}
      <Card className="border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2 text-primary dark:text-teal-400">
            <Trash2 className="h-4 w-4" />
            <CardTitle className="text-base font-bold text-slate-900 dark:text-white">
              5. Your Rights & Data Retention
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          <p>
            You have full autonomy over your posted content:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-slate-600 dark:text-slate-300">
            <li>You can edit or delete any active listing or request instantly from the detail page.</li>
            <li>When an item is sold or a room is filled, you can change the status to &quot;sold&quot; or &quot;fulfilled&quot; to archive it from public discovery.</li>
            <li>You may request complete account data deletion at any time by contacting our campus support team.</li>
          </ul>
        </CardContent>
      </Card>

      {/* Section 6: Contact Line */}
      <Card className="border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2 text-primary dark:text-teal-400">
            <Mail className="h-4 w-4" />
            <CardTitle className="text-base font-bold text-slate-900 dark:text-white">
              6. Privacy Questions & Contact
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          <p>
            If you have questions regarding this Privacy Policy, security practices, or want to report a privacy concern, please contact our student safety team at:
          </p>
          <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-800 dark:text-slate-200 flex items-center justify-between">
            <span>support@campusloop.internal</span>
            <Badge variant="outline" className="text-[10px]">Student Support Desk</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Bottom Actions */}
      <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-200/80 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
        <p>Your trust is the foundation of our campus community.</p>
        <div className="flex gap-3">
          <Button asChild variant="outline" size="sm">
            <Link href="/terms">View Terms & Conditions</Link>
          </Button>
          <Button asChild size="sm" className="bg-primary hover:bg-primary/90 text-white">
            <Link href="/marketplace">Return to Marketplace</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
