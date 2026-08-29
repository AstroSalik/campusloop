"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  AlertCircle, 
  ArrowLeft, 
  Building, 
  CheckCircle2, 
  Clock, 
  Copy, 
  ExternalLink, 
  HelpCircle, 
  Mail, 
  MapPin, 
  MessageSquare, 
  Phone, 
  Send, 
  ShieldAlert, 
  ShieldCheck, 
  Sparkles, 
  User 
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { getClientDemoSession, PRIMARY_DEMO_USER } from "@/lib/auth";

interface SupportTicket {
  id: string;
  category: string;
  subject: string;
  message: string;
  name: string;
  email: string;
  priority: "normal" | "urgent";
  status: "open" | "in_review" | "resolved";
  created_at: string;
}

const FAQ_ITEMS = [
  {
    q: "How does the Razorpay Test Payment Gateway work?",
    a: "CampusLoop operates in Razorpay Test / Sandbox mode. You can test transactions using test UPI VPAs (e.g. success@razorpay) or pre-loaded test cards (4111 1111 1111 1111) with zero real money deducted.",
  },
  {
    q: "What should I do if a marketplace seller doesn't show up for pickup?",
    a: "Always use the 4-digit Pickup OTP provided on your digital receipt. If the seller does not arrive, select 'Marketplace Dispute' in this form or message support, and the escrow hold will be refunded.",
  },
  {
    q: "How does PG booking cancellation and refund work?",
    a: "When you cancel an accommodation spot through the 'Cancel Booking' modal on the housing detail page, a 100% refund is initiated and logged in your Payments ledger.",
  },
  {
    q: "Where is the physical helpdesk located on campus?",
    a: "You can visit the LPU Student Welfare Department desk for in-person verification, student dispute resolution, and lost-and-found items.",
  },
];

export default function ContactPage() {
  const currentUser = getClientDemoSession() || PRIMARY_DEMO_USER;

  const [name, setName] = useState(currentUser.name || "");
  const [email, setEmail] = useState(currentUser.email || "astrosalikriyaz@gmail.com");
  const [category, setCategory] = useState("marketplace");
  const [priority, setPriority] = useState<"normal" | "urgent">("normal");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedTicket, setSubmittedTicket] = useState<SupportTicket | null>(null);

  const handleCopyEmail = () => {
    navigator.clipboard?.writeText?.("astrosalikriyaz@gmail.com");
    toast.success("Email copied to clipboard: astrosalikriyaz@gmail.com");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) {
      toast.error("Please fill in both the subject and message.");
      return;
    }

    setIsSubmitting(true);
    const ticketId = `LOOP-${Math.floor(10000 + Math.random() * 90000)}`;

    try {
      // 1. Dispatch real email notification directly to astrosalikriyaz@gmail.com
      const res = await fetch("https://formsubmit.co/ajax/astrosalikriyaz@gmail.com", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          ticket_id: ticketId,
          student_name: name,
          student_email: email,
          inquiry_category: category,
          priority_level: priority,
          _subject: `[CampusLoop Support Ticket #${ticketId}] ${subject}`,
          message_body: message,
          _template: "table",
        }),
      });
    } catch (err) {
      console.warn("Email API note:", err);
    }

    const ticket: SupportTicket = {
      id: ticketId,
      category,
      subject,
      message,
      name,
      email,
      priority,
      status: "open",
      created_at: new Date().toISOString(),
    };

    try {
      const existingRaw = localStorage.getItem("campusloop_support_tickets");
      const existing = existingRaw ? JSON.parse(existingRaw) : [];
      localStorage.setItem("campusloop_support_tickets", JSON.stringify([ticket, ...existing]));
    } catch {}

    setSubmittedTicket(ticket);
    setIsSubmitting(false);
    toast.success(`Support ticket ${ticketId} submitted & dispatched to astrosalikriyaz@gmail.com!`);
    setSubject("");
    setMessage("");
  };

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-6">
        <div>
          <Button asChild variant="ghost" size="sm" className="h-8 -ml-2 text-slate-500 gap-1 mb-1">
            <Link href="/">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Link>
          </Button>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <MessageSquare className="h-7 w-7 text-primary" />
            Support
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Have questions about marketplace orders, PG accommodation bookings, or payments? We are here to help.
          </p>
        </div>

        <Badge variant="outline" className="bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 border-teal-200 dark:border-teal-800 text-xs px-3 py-1.5 font-bold self-start sm:self-auto">
          <ShieldCheck className="h-4 w-4 mr-1 text-teal-600" />
          Verified Student Helpdesk
        </Badge>
      </div>

      {/* 3 Contact Channel Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Email Card */}
        <Card className="border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs hover:border-primary/40 transition-all">
          <CardHeader className="p-4 pb-2">
            <div className="flex items-center justify-between">
              <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <Mail className="h-5 w-5" />
              </div>
              <button
                type="button"
                onClick={handleCopyEmail}
                className="text-xs text-slate-400 hover:text-primary transition-colors flex items-center gap-1 font-semibold"
                title="Copy Email"
              >
                <Copy className="h-3 w-3" /> Copy
              </button>
            </div>
            <CardTitle className="text-base font-bold text-slate-900 dark:text-white pt-2">
              Official Email
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-1 text-xs text-slate-600 dark:text-slate-300 space-y-1">
            <a 
              href="mailto:astrosalikriyaz@gmail.com" 
              className="font-bold text-primary dark:text-teal-400 hover:underline block truncate text-sm"
            >
              astrosalikriyaz@gmail.com
            </a>
            <p className="text-[11px] text-slate-400 dark:text-slate-500">
              Direct response within 24 hours on all student inquiries.
            </p>
          </CardContent>
        </Card>

        {/* Physical Address Card */}
        <Card className="border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs hover:border-primary/40 transition-all">
          <CardHeader className="p-4 pb-2">
            <div className="flex items-center justify-between">
              <div className="h-9 w-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <MapPin className="h-5 w-5" />
              </div>
              <Badge variant="secondary" className="text-[10px] bg-slate-100 dark:bg-slate-800 font-bold">
                In-Person Desk
              </Badge>
            </div>
            <CardTitle className="text-base font-bold text-slate-900 dark:text-white pt-2">
              Campus Helpdesk
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-1 text-xs text-slate-600 dark:text-slate-300 space-y-1">
            <p className="font-bold text-slate-800 dark:text-slate-100 text-sm">
              LPU Student Welfare Department
            </p>
            <p className="text-[11px] text-slate-400 dark:text-slate-500">
              Lovely Professional University, Phagwara, Punjab
            </p>
          </CardContent>
        </Card>

        {/* Operating Hours & Safety */}
        <Card className="border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs hover:border-primary/40 transition-all">
          <CardHeader className="p-4 pb-2">
            <div className="flex items-center justify-between">
              <div className="h-9 w-9 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <Clock className="h-5 w-5" />
              </div>
              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> Active
              </span>
            </div>
            <CardTitle className="text-base font-bold text-slate-900 dark:text-white pt-2">
              Operating Hours
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-1 text-xs text-slate-600 dark:text-slate-300 space-y-1">
            <p className="font-bold text-slate-800 dark:text-slate-100 text-sm">
              Mon – Sat: 9:00 AM – 8:00 PM
            </p>
            <p className="text-[11px] text-slate-400 dark:text-slate-500">
              Urgent trust & safety disputes reviewed round-the-clock.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Grid: Contact Form + FAQ Accordion */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Interactive Support Form */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
            <CardHeader className="pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-bold text-slate-900 dark:text-white">
                    Submit a Support Ticket
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    We will respond to your email and log your ticket status in real-time.
                  </CardDescription>
                </div>
                <Badge variant="outline" className="text-[10px] font-semibold">
                  Ticket Response &lt; 24h
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="p-6">
              {submittedTicket ? (
                <div className="rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/60 dark:bg-emerald-950/40 p-5 text-center space-y-3">
                  <div className="h-12 w-12 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-xs">
                    <CheckCircle2 className="h-6 w-6" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-bold text-slate-900 dark:text-white text-base">
                      Ticket #{submittedTicket.id} Received & Dispatched!
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-300 max-w-md mx-auto">
                      Thank you, <strong>{submittedTicket.name}</strong>. Your inquiry regarding <strong>&quot;{submittedTicket.subject}&quot;</strong> has been dispatched directly to <strong>astrosalikriyaz@gmail.com</strong> at the LPU Student Welfare team.
                    </p>
                  </div>
                  <div className="pt-2 flex flex-wrap justify-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSubmittedTicket(null)}
                      className="text-xs font-semibold"
                    >
                      Submit Another Ticket
                    </Button>
                    <Button asChild size="sm" variant="secondary" className="text-xs font-semibold">
                      <a
                        href={`mailto:astrosalikriyaz@gmail.com?subject=${encodeURIComponent(`[Ticket #${submittedTicket.id}] ${submittedTicket.subject}`)}&body=${encodeURIComponent(`Student Name: ${submittedTicket.name}\nEmail: ${submittedTicket.email}\nCategory: ${submittedTicket.category}\n\nMessage:\n${submittedTicket.message}`)}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <Mail className="h-3.5 w-3.5 mr-1" />
                        Open in Mail App
                      </a>
                    </Button>
                    <Button asChild size="sm" className="text-xs font-semibold">
                      <Link href="/messages">
                        Open Support Chat
                      </Link>
                    </Button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Name and Email Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        Student Name
                      </label>
                      <Input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Your Full Name"
                        required
                        className="h-10 text-xs border-slate-200 dark:border-slate-700"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        Contact Email
                      </label>
                      <Input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="yourname@campus.edu"
                        required
                        className="h-10 text-xs border-slate-200 dark:border-slate-700"
                      />
                    </div>
                  </div>

                  {/* Category and Priority Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        Inquiry Category
                      </label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium text-slate-900 dark:text-white"
                      >
                        <option value="marketplace">Marketplace & Order Issue</option>
                        <option value="housing">PG / Hostel Booking Support</option>
                        <option value="payments">Razorpay Payment & Receipt</option>
                        <option value="safety">Trust & Safety / Report a User</option>
                        <option value="general">General Inquiry & Feedback</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        Priority Level
                      </label>
                      <div className="grid grid-cols-2 gap-2 h-10">
                        <button
                          type="button"
                          onClick={() => setPriority("normal")}
                          className={`rounded-lg border text-xs font-semibold transition-all ${
                            priority === "normal"
                              ? "border-primary bg-primary/10 text-primary dark:text-teal-300"
                              : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400"
                          }`}
                        >
                          Standard Inquiry
                        </button>
                        <button
                          type="button"
                          onClick={() => setPriority("urgent")}
                          className={`rounded-lg border text-xs font-semibold transition-all ${
                            priority === "urgent"
                              ? "border-red-500 bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-300"
                              : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400"
                          }`}
                        >
                          Urgent Dispute
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Subject */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Subject
                    </label>
                    <Input
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="e.g. Issue regarding PG spot reservation or pickup schedule"
                      required
                      className="h-10 text-xs border-slate-200 dark:border-slate-700"
                    />
                  </div>

                  {/* Message Body */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Message Details
                    </label>
                    <textarea
                      rows={5}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Please provide details (listing title, order ID, or room details) to help us resolve your request quickly..."
                      required
                      className="w-full p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full h-11 text-sm font-bold bg-primary hover:bg-primary/90 text-white shadow-xs gap-2"
                  >
                    <Send className="h-4 w-4" />
                    {isSubmitting ? "Submitting Ticket..." : "Submit Support Ticket"}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right 1 Col: FAQ & Quick Answers */}
        <div className="space-y-6">
          <Card className="border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
            <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
              <CardTitle className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <HelpCircle className="h-4 w-4 text-primary" />
                Frequently Asked Questions
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              {FAQ_ITEMS.map((item, idx) => (
                <div key={idx} className="space-y-1 text-xs">
                  <p className="font-bold text-slate-800 dark:text-slate-200 flex items-start gap-1.5">
                    <span className="text-primary font-extrabold">Q:</span>
                    <span>{item.q}</span>
                  </p>
                  <p className="text-slate-600 dark:text-slate-400 pl-4 leading-relaxed text-[11px]">
                    {item.a}
                  </p>
                </div>
              ))}
            </CardContent>
            <CardFooter className="bg-slate-50 dark:bg-slate-800/50 p-4 border-t border-slate-100 dark:border-slate-800">
              <div className="w-full text-center text-xs text-slate-500 dark:text-slate-400">
                <span>Need immediate peer assistance? </span>
                <Link href="/messages" className="font-bold text-primary hover:underline">
                  Open Support Chat
                </Link>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
