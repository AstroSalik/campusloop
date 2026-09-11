"use client";

import React from "react";
import Link from "next/link";
import { 
  ArrowLeft, 
  Compass, 
  Lock, 
  LogIn, 
  MessageSquare, 
  ShieldCheck, 
  Sparkles, 
  UserCheck, 
  UserPlus 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface AuthRequiredGuardProps {
  title?: string;
  description?: string;
  featureName?: string;
  redirectUrl: string;
  backUrl?: string;
  backLabel?: string;
}

export function AuthRequiredGuard({
  title = "Student Sign In Required",
  description,
  featureName = "this campus feature",
  redirectUrl,
  backUrl = "/marketplace",
  backLabel = "Browse Public Catalog",
}: AuthRequiredGuardProps) {
  const loginUrl = `/login?redirect=${encodeURIComponent(redirectUrl)}`;
  const signupUrl = `/login?mode=signup&redirect=${encodeURIComponent(redirectUrl)}`;

  return (
    <div className="container mx-auto max-w-xl px-4 py-12 sm:py-16">
      <Card className="border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-lg overflow-hidden">
        {/* Top Header Glow */}
        <div className="bg-gradient-to-r from-primary/15 via-teal-500/10 to-primary/5 dark:from-primary/20 dark:via-slate-900 dark:to-slate-900 p-6 sm:p-8 text-center border-b border-slate-100 dark:border-slate-800">
          <div className="relative mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-white shadow-md ring-4 ring-primary/10">
            <Lock className="h-7 w-7" />
            <div className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-white shadow-xs">
              <ShieldCheck className="h-3.5 w-3.5" />
            </div>
          </div>

          <Badge variant="outline" className="mb-2.5 bg-white/80 dark:bg-slate-900/90 text-primary dark:text-teal-300 border-primary/30 text-xs font-semibold">
            Campus Verification Required
          </Badge>

          <CardTitle className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            {title}
          </CardTitle>

          <CardDescription className="text-xs sm:text-sm text-slate-600 dark:text-slate-200 max-w-md mx-auto mt-2 leading-relaxed">
            {description || `To access ${featureName}, contact fellow students, or view verified campus specifications, please log in to your student account.`}
          </CardDescription>
        </div>

        <CardContent className="p-6 sm:p-8 space-y-5">
          {/* Trust Guarantees */}
          <div className="rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/80 p-4 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Why do we require sign-in?
            </h4>
            <div className="grid gap-2.5 text-xs text-slate-700 dark:text-slate-200">
              <div className="flex items-start gap-2.5">
                <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <span><strong className="text-slate-900 dark:text-white">Verified Campus Peer Network:</strong> Only authenticated university students can list, view full details, and transact.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <MessageSquare className="h-4 w-4 text-primary dark:text-teal-400 shrink-0 mt-0.5" />
                <span><strong className="text-slate-900 dark:text-white">Spam-Free Direct Messaging:</strong> Keeps student communications private and prevents external advertising bots.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <Sparkles className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                <span><strong className="text-slate-900 dark:text-white">Personalized Budget & History:</strong> Automatically syncs your rent split history, allowances, and active reservations.</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2.5 pt-2">
            <Button 
              asChild 
              className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-sm shadow-sm gap-2"
            >
              <Link href={loginUrl}>
                <LogIn className="h-4 w-4" />
                Sign In to Access {featureName}
              </Link>
            </Button>

            <Button 
              asChild 
              variant="outline"
              className="w-full h-11 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-700 font-semibold text-sm gap-2"
            >
              <Link href={signupUrl}>
                <UserPlus className="h-4 w-4 text-primary dark:text-teal-400" />
                Create New Student Account
              </Link>
            </Button>
          </div>
        </CardContent>

        <CardFooter className="px-6 py-4 bg-slate-50/50 dark:bg-slate-900/80 border-t border-slate-100 dark:border-slate-800 flex justify-center">
          <Button asChild variant="ghost" size="sm" className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white gap-1.5">
            <Link href={backUrl}>
              <ArrowLeft className="h-3.5 w-3.5" />
              {backLabel}
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
