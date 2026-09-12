"use client";

import React, { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { 
  Building2,
  Compass, 
  Eye, 
  EyeOff, 
  GraduationCap,
  Lock, 
  LogIn, 
  Mail, 
  Phone,
  ShieldCheck, 
  User, 
  UserPlus, 
  Wallet
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
import { DemoUser, setClientDemoSession } from "@/lib/auth";
import { createClient } from "@/lib/supabase/client";
import { MAJOR_CAMPUSES, POPULAR_DEPARTMENTS, STUDY_YEAR_OPTIONS } from "@/lib/campuses";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get("redirect") || "/";
  const modeParam = searchParams.get("mode");

  const [authMode, setAuthMode] = useState<"signin" | "signup">(() => 
    modeParam === "signup" ? "signup" : "signin"
  );

  useEffect(() => {
    if (modeParam === "signup") {
      setAuthMode("signup");
    } else if (modeParam === "signin") {
      setAuthMode("signin");
    }
  }, [modeParam]);

  // Basic Account Credentials
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [loading, setLoading] = useState(false);

  // Student & Campus Details for Signup
  const [campusSelect, setCampusSelect] = useState(MAJOR_CAMPUSES[0].id);
  const [isCustomCampus, setIsCustomCampus] = useState(false);
  const [customCampusName, setCustomCampusName] = useState("");
  const [city, setCity] = useState(MAJOR_CAMPUSES[0].city + ", " + MAJOR_CAMPUSES[0].state);
  const [department, setDepartment] = useState(POPULAR_DEPARTMENTS[0]);
  const [isCustomDept, setIsCustomDept] = useState(false);
  const [customDept, setCustomDept] = useState("");
  const [yearOfStudy, setYearOfStudy] = useState(STUDY_YEAR_OPTIONS[0]);
  const [phone, setPhone] = useState("");
  const [monthlyAllowance, setMonthlyAllowance] = useState("15000");

  const handleCampusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setCampusSelect(val);
    if (val === "OTHER") {
      setIsCustomCampus(true);
      setCustomCampusName("");
      setCity("");
    } else {
      setIsCustomCampus(false);
      const found = MAJOR_CAMPUSES.find((c) => c.id === val);
      if (found) {
        setCity(`${found.city}, ${found.state}`);
      }
    }
  };

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

    if (authMode === "signup") {
      if (password.length < 8) {
        toast.error("Password must be at least 8 characters long.");
        return;
      }

      const hasLetter = /[a-zA-Z]/.test(password);
      const hasNumberOrSymbol = /[0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

      if (!hasLetter || !hasNumberOrSymbol) {
        toast.error("Password must contain both letters and at least one number or symbol.");
        return;
      }

      if (password !== confirmPassword) {
        toast.error("Passwords do not match. Please re-check.");
        return;
      }

      if (isCustomCampus && !customCampusName.trim()) {
        toast.error("Please enter your college or university campus name.");
        return;
      }
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
          let cloudUser: any = null;
          try {
            const { data: dbUser } = await supabase
              .from("users")
              .select("name, monthly_income, campus_name, city, department, year_of_study, phone, verification_status, aadhaar_last4, avatar")
              .eq("id", data.user.id)
              .maybeSingle();
            cloudUser = dbUser;
          } catch (e) {}

          const meta = data.user.user_metadata || {};
          const userName =
            cloudUser?.name ||
            meta.full_name ||
            meta.name ||
            email.split("@")[0];

          const resolvedCampus = cloudUser?.campus_name || meta.campus_name || "Lovely Professional University (LPU)";
          const resolvedCity = cloudUser?.city || meta.city || "Phagwara, Punjab";
          const resolvedDept = cloudUser?.department || meta.department;
          const resolvedYear = cloudUser?.year_of_study || meta.year_of_study;
          const resolvedPhone = cloudUser?.phone || meta.phone;
          const resolvedVerification = cloudUser?.verification_status || meta.verification_status || (data.user.email === "astrosalikriyaz@gmail.com" ? "verified" : "unverified");
          const resolvedIncome = cloudUser?.monthly_income != null ? Number(cloudUser.monthly_income) : (meta.monthly_income != null ? Number(meta.monthly_income) : 15000);

          const studentUser: DemoUser = {
            id: data.user.id,
            name: userName,
            email: data.user.email || email.trim().toLowerCase(),
            campus_id: "00000000-0000-0000-0000-000000000001",
            campus_name: resolvedCampus,
            city: resolvedCity,
            department: resolvedDept,
            year_of_study: resolvedYear,
            phone: resolvedPhone,
            verification_status: resolvedVerification,
            aadhaar_last4: cloudUser?.aadhaar_last4 || meta.aadhaar_last4,
            monthly_income: resolvedIncome,
            avatar: cloudUser?.avatar || meta.avatar || null,
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
          router.push(redirectParam);
          router.refresh();
          return;
        }
      } else {
        // Sign Up Flow with Comprehensive Onboarding
        const resolvedCampusName = isCustomCampus
          ? customCampusName.trim()
          : MAJOR_CAMPUSES.find((c) => c.id === campusSelect)?.name || "Lovely Professional University (LPU)";
        
        const resolvedDept = isCustomDept ? customDept.trim() : department;
        const resolvedIncome = Number(monthlyAllowance) || 15000;

        const signupRes = await fetch("/api/auth/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: name.trim(),
            email: email.trim().toLowerCase(),
            password: password,
            campus_name: resolvedCampusName,
            city: city.trim(),
            department: resolvedDept,
            year_of_study: yearOfStudy,
            phone: phone.trim(),
            monthly_income: resolvedIncome,
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

        const newStudentUser: DemoUser = {
          id: signInData.user.id,
          name: name.trim(),
          email: email.trim().toLowerCase(),
          campus_id: "00000000-0000-0000-0000-000000000001",
          campus_name: resolvedCampusName,
          city: city.trim(),
          department: resolvedDept,
          year_of_study: yearOfStudy,
          phone: phone.trim(),
          verification_status: "unverified",
          monthly_income: resolvedIncome,
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
        toast.success(`Welcome to CampusLoop, ${name}! Your account is created.`);
        router.push(redirectParam);
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
              {authMode === "signin" 
                ? "Sign in to manage your campus housing, marketplace listings & roommate requests." 
                : "Create your student account with your actual campus & academic profile."}
            </CardDescription>
          </div>
          <div className="flex justify-center">
            <Badge variant="outline" className="gap-1.5 py-1 px-3 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs border-slate-200 dark:border-slate-700">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Verified Campus Network
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

          {/* Form */}
          <form onSubmit={handleAuthSubmit} className="space-y-3.5">
            {/* Full Name for Sign Up */}
            {authMode === "signup" && (
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Full Name *
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
                Student Email Address *
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <Input
                  type="email"
                  placeholder="student@campus.edu or personal@gmail.com"
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
                  Password *
                </label>
                {authMode === "signup" && (
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">
                    Min. 8 chars (letters & numbers)
                  </span>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder={
                    authMode === "signup"
                      ? "Min. 8 chars with letters & numbers"
                      : "Enter your password"
                  }
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

            {/* Confirm Password (only in signup mode) */}
            {authMode === "signup" && (
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Confirm Password *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <Input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Re-enter your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="pl-9 pr-9 h-10 text-xs border-slate-200 dark:border-slate-700"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Extended Student Information (Only shown on Signup) */}
            {authMode === "signup" && (
              <div className="pt-2 space-y-3.5 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-primary dark:text-teal-400" />
                  <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[10px]">
                    Campus & Academic Profile
                  </span>
                </div>

                {/* Campus Selection */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Your Campus / University *
                  </label>
                  <select
                    value={campusSelect}
                    onChange={handleCampusChange}
                    className="w-full h-10 px-3 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-slate-100"
                  >
                    {MAJOR_CAMPUSES.map((camp) => (
                      <option key={camp.id} value={camp.id}>
                        {camp.name} ({camp.city})
                      </option>
                    ))}
                    <option value="OTHER">Other / Custom University or College...</option>
                  </select>
                </div>

                {/* If Custom Campus */}
                {isCustomCampus && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Enter College / Campus Name *
                    </label>
                    <Input
                      type="text"
                      placeholder="e.g. SRM University or IIT Madras"
                      value={customCampusName}
                      onChange={(e) => setCustomCampusName(e.target.value)}
                      required
                      className="h-10 text-xs border-slate-200 dark:border-slate-700"
                    />
                  </div>
                )}

                {/* Campus City / State */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Campus City & State *
                  </label>
                  <Input
                    type="text"
                    placeholder="e.g. Phagwara, Punjab"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    required
                    className="h-10 text-xs border-slate-200 dark:border-slate-700"
                  />
                </div>

                {/* Department & Year of Study Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Department / Course
                    </label>
                    <select
                      value={isCustomDept ? "OTHER" : department}
                      onChange={(e) => {
                        if (e.target.value === "OTHER") {
                          setIsCustomDept(true);
                          setCustomDept("");
                        } else {
                          setIsCustomDept(false);
                          setDepartment(e.target.value);
                        }
                      }}
                      className="w-full h-10 px-3 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-slate-100"
                    >
                      {POPULAR_DEPARTMENTS.map((dept) => (
                        <option key={dept} value={dept}>
                          {dept}
                        </option>
                      ))}
                      <option value="OTHER">Other Department...</option>
                    </select>
                    {isCustomDept && (
                      <Input
                        type="text"
                        placeholder="e.g. B.Sc Physics"
                        value={customDept}
                        onChange={(e) => setCustomDept(e.target.value)}
                        className="mt-1 h-9 text-xs"
                      />
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Year of Study
                    </label>
                    <select
                      value={yearOfStudy}
                      onChange={(e) => setYearOfStudy(e.target.value)}
                      className="w-full h-10 px-3 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-slate-100"
                    >
                      {STUDY_YEAR_OPTIONS.map((yr) => (
                        <option key={yr} value={yr}>
                          {yr}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Phone Number */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Phone / WhatsApp Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <Input
                      type="tel"
                      placeholder="+91 98765 43210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="pl-9 h-10 text-xs border-slate-200 dark:border-slate-700"
                    />
                  </div>
                </div>

                {/* Monthly Allowance */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                    <span>Monthly Allowance / Budget (₹ INR)</span>
                    <span className="text-[10px] text-slate-400">For Rent Health calculations</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-sm font-semibold text-slate-400">
                      ₹
                    </span>
                    <Input
                      type="number"
                      placeholder="15000"
                      value={monthlyAllowance}
                      onChange={(e) => setMonthlyAllowance(e.target.value)}
                      className="pl-7 h-10 text-xs border-slate-200 dark:border-slate-700 font-semibold"
                    />
                  </div>
                </div>
              </div>
            )}

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
                "Create Account & Join Campus"
              )}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex flex-col space-y-2 border-t border-slate-100 dark:border-slate-800 p-4 text-center text-[11px] text-slate-400 dark:text-slate-500">
          <div className="flex items-center justify-center gap-1.5 text-slate-500 dark:text-slate-400">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
            <span>Encrypted Authentication & Row Level Security</span>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-8">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
