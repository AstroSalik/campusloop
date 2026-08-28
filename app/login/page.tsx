"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { 
  ArrowRight, 
  CheckCircle2, 
  Compass, 
  Mail, 
  Sparkles, 
  UserCheck, 
  Users 
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
import { DEMO_USERS, PRIMARY_DEMO_USER, setClientDemoSession } from "@/lib/auth";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedDemoId, setSelectedDemoId] = useState(PRIMARY_DEMO_USER.id);

  const handleMagicLinkLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your campus email");
      return;
    }

    setLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
        },
      });

      if (error) {
        // If Supabase is unconfigured in local demo, sign in with demo user matching email or create mock session
        const matchingDemo = DEMO_USERS.find(
          (u) => u.email.toLowerCase() === email.toLowerCase()
        );
        if (matchingDemo) {
          setClientDemoSession(matchingDemo);
          toast.success(`Welcome back, ${matchingDemo.name}!`);
          router.push("/");
          return;
        }
        toast.info("Magic link sent (or demo login activated for demo emails)");
      } else {
        toast.success("Check your email for the magic login link!");
      }
    } catch (err) {
      toast.error("Error signing in. Try demo login.");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoLogin = (userId: string) => {
    const user = DEMO_USERS.find((u) => u.id === userId) || PRIMARY_DEMO_USER;
    setClientDemoSession(user);
    toast.success(`Logged in as ${user.name} (${user.role_desc})`);
    router.push("/");
  };

  return (
    <div className="container mx-auto flex min-h-[calc(100vh-8rem)] max-w-lg items-center justify-center px-4 py-8">
      <Card className="w-full border-slate-200/80 bg-white shadow-md">
        <CardHeader className="space-y-3 text-center pb-4">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-white shadow-sm">
            <Compass className="h-6 w-6" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold tracking-tight text-slate-900">
              Welcome to CampusLoop
            </CardTitle>
            <CardDescription className="text-sm text-slate-500 mt-1">
              One account for campus housing, roommates, rent splitting & student marketplace.
            </CardDescription>
          </div>
          <div className="flex justify-center">
            <Badge variant="outline" className="gap-1.5 py-1 px-3 bg-slate-50 text-slate-600 text-xs">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Demo Campus — Sopore
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-6 pt-2">
          {/* Quick Demo Login CTA (Judge Friendly) */}
          <div className="rounded-xl border border-primary/20 bg-primary/[0.03] p-4.5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-primary flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5" />
                Judge & Demo Fast Access
              </span>
              <span className="text-[11px] text-slate-500">No OTP required</span>
            </div>

            <Button
              className="w-full font-semibold shadow-sm h-10"
              onClick={() => handleQuickDemoLogin(selectedDemoId)}
            >
              <UserCheck className="mr-2 h-4 w-4" />
              Continue as Demo Student ({DEMO_USERS.find((u) => u.id === selectedDemoId)?.name})
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>

            {/* Demo Student Switcher */}
            <div className="space-y-1.5 pt-1">
              <label className="text-[11px] font-medium text-slate-500">
                Or select another demo student:
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {DEMO_USERS.map((user) => {
                  const isSelected = user.id === selectedDemoId;
                  return (
                    <button
                      key={user.id}
                      type="button"
                      onClick={() => setSelectedDemoId(user.id)}
                      className={`flex flex-col items-start p-2 rounded-lg text-left text-xs border transition-all ${
                        isSelected
                          ? "border-primary bg-primary/10 text-primary font-medium shadow-2xs"
                          : "border-slate-200 bg-white hover:bg-slate-50 text-slate-700"
                      }`}
                    >
                      <span className="font-semibold truncate w-full">{user.name}</span>
                      <span className="text-[10px] text-slate-500 truncate w-full">
                        {user.role_desc.split("(")[0]}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="relative flex items-center justify-center">
            <div className="w-full border-t border-slate-200" />
            <span className="absolute bg-white px-3 text-xs font-medium text-slate-400">
              Or sign in with email
            </span>
          </div>

          {/* Email / Magic Link Form */}
          <form onSubmit={handleMagicLinkLogin} className="space-y-3.5">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-700">
                Campus Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <Input
                  type="email"
                  placeholder="student@campusloop.app"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="outline"
              className="w-full border-slate-200"
              disabled={loading}
            >
              {loading ? "Sending link..." : "Send Magic Login Link"}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex flex-col space-y-2 border-t border-slate-100 p-4 text-center text-xs text-slate-400">
          <p>
            CampusLoop Demo Environment. Protected by Row Level Security and Supabase Auth.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
