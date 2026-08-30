"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { 
  Compass, 
  Eye, 
  EyeOff, 
  Lock, 
  LogIn, 
  Mail, 
  ShieldCheck, 
  User, 
  UserPlus 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { setClientDemoSession } from "@/lib/auth";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      toast.error("Please enter your campus email address.");
      return;
    }

    if (!agreedTerms) {
      toast.error("Please agree to the Terms & Conditions and Privacy Policy to continue.");
      return;
    }

    if (authMode === "signup" && !name.trim()) {
      toast.error("Please enter your full name.");
      return;
    }

    if (!password) {
      toast.error("Please enter your password.");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    try {
      const supabase = createClient();

      if (authMode === "signin") {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim().toLowerCase(),
          password: password,
        });

        if (error) {
          toast.error(error.message || "Invalid email or password. Please try again.");
          return;
        }

        if (data.user) {
          const userName =
            data.user.user_metadata?.full_name ||
            data.user.user_metadata?.name ||
            email.split("@")[0];

          // Ensure profile exists in public.users
          try {
            await fetch("/api/auth/sync-profile", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                id: data.user.id,
                name: userName,
                email: data.user.email || email.trim().toLowerCase(),
                campus_id: "00000000-0000-0000-0000-000000000001",
              }),
            });
          } catch (syncErr) {
            console.warn("Profile sync warning:", syncErr);
          }

          const studentUser = {
            id: data.user.id,
            name: userName,
            email: data.user.email || email.trim().toLowerCase(),
            campus_id: "00000000-0000-0000-0000-000000000001",
            monthly_income: 15000,
            avatar: data.user.user_metadata?.avatar || null,
            initials: userName
              .split(" ")
              .map((n: string) => n[0])
              .join("")
              .substring(0, 2)
              .toUpperCase(),
            role_desc: "Student Account",
          };
          setClientDemoSession(studentUser);
          toast.success(`Welcome back, ${studentUser.name}!`);
          router.push("/");
          router.refresh();
          return;
        }
      } else {
        // Sign Up Flow via Server Endpoint (auto-confirmed + synced to public.users)
        const signupRes = await fetch("/api/auth/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: name.trim(),
            email: email.trim().toLowerCase(),
            password: password,
          }),
        });

        const signupData = await signupRes.json();

        if (!signupRes.ok || signupData.error) {
          toast.error(signupData.error || "Sign up failed. Please try again.");
          return;
        }

        // Immediately sign in with Supabase Auth to establish the active browser session
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: email.trim().toLowerCase(),
          password: password,
        });

        if (signInError) {
          toast.error(signInError.message || "Account created, but sign-in encountered an issue.");
          return;
        }

        const newStudentUser = {
          id: signInData.user.id,
          name: name.trim(),
          email: email.trim().toLowerCase(),
          campus_id: "00000000-0000-0000-0000-000000000001",
          monthly_income: 15000,
          avatar: null,
          initials: name
            .trim()
            .split(" ")
            .map((n) => n[0])
            .join("")
            .substring(0, 2)
            .toUpperCase(),
          role_desc: "Student Account",
        };
        setClientDemoSession(newStudentUser);
        toast.success(`Account created successfully! Welcome to CampusLoop, ${name}!`);
        router.push("/");
        router.refresh();
        return;
      }
    } catch (err: any) {
      toast.error(err?.message || "An unexpected authentication error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto flex min-h-[calc(100vh-8rem)] max-w-lg items-center justify-center px-4 py-8">
      <Card className="w-full border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-md">
        <CardHeader className="space-y-3 text-center pb-4">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-white shadow-xs">
            <Compass className="h-6 w-6" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              {authMode === "signin" ? "Sign In to CampusLoop" : "Join CampusLoop"}
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              One account for campus housing, roommates, rent splitting & marketplace.
            </CardDescription>
          </div>
          <div className="flex justify-center">
            <Badge variant="outline" className="gap-1.5 py-1 px-3 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs border-slate-200 dark:border-slate-700">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              LPU & CampusLoop Network
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-5 pt-1">
          {/* Sign In vs Sign Up Tab Switcher */}
          <div className="grid grid-cols-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200/80 dark:border-slate-700">
            <button
              type="button"
              onClick={() => setAuthMode("signin")}
              className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                authMode === "signin"
                  ? "bg-white dark:bg-slate-900 text-primary dark:text-teal-300 shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              <LogIn className="h-3.5 w-3.5" />
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setAuthMode("signup")}
              className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                authMode === "signup"
                  ? "bg-white dark:bg-slate-900 text-primary dark:text-teal-300 shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              <UserPlus className="h-3.5 w-3.5" />
              Create Account
            </button>
          </div>

          {/* Email / Password Form */}
          <form onSubmit={handleAuthSubmit} className="space-y-3.5">
            {/* Full Name for Sign Up */}
            {authMode === "signup" && (
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <Input
                    type="text"
                    placeholder="e.g. Bilal Ashiq"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="pl-9 h-10 text-xs border-slate-200 dark:border-slate-700"
                  />
                </div>
              </div>
            )}

            {/* Campus Email Address */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Campus / Student Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <Input
                  type="email"
                  placeholder="student@campus.edu or your.email@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="pl-9 h-10 text-xs border-slate-200 dark:border-slate-700"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Password
                </label>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="pl-9 pr-9 h-10 text-xs border-slate-200 dark:border-slate-700"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Terms & Privacy Policy Mandatory Agreement Checkbox */}
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 p-3 flex items-start gap-2.5">
              <input
                id="terms-checkbox"
                type="checkbox"
                checked={agreedTerms}
                onChange={(e) => setAgreedTerms(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary/20 accent-primary cursor-pointer shrink-0"
              />
              <label
                htmlFor="terms-checkbox"
                className="text-[11px] leading-snug text-slate-600 dark:text-slate-300 cursor-pointer select-none"
              >
                I agree to the{" "}
                <Link
                  href="/terms"
                  target="_blank"
                  className="font-bold text-primary dark:text-teal-400 hover:underline"
                >
                  Terms & Conditions
                </Link>{" "}
                and{" "}
                <Link
                  href="/privacy"
                  target="_blank"
                  className="font-bold text-primary dark:text-teal-400 hover:underline"
                >
                  Privacy Policy
                </Link>
                .
              </label>
            </div>

            <Button
              type="submit"
              className="w-full h-10 font-bold bg-primary hover:bg-primary/90 text-white shadow-xs"
              disabled={loading}
            >
              {loading ? (
                "Authenticating..."
              ) : authMode === "signin" ? (
                "Sign In"
              ) : (
                "Create Account & Get Started"
              )}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex flex-col space-y-2 border-t border-slate-100 dark:border-slate-800 p-4 text-center text-[11px] text-slate-400 dark:text-slate-500">
          <div className="flex items-center justify-center gap-1.5 text-slate-500 dark:text-slate-400">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
            <span>Encrypted Supabase Authentication & Row Level Security</span>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
