"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { FormData, INITIAL_FORM_DATA } from "./formTypes";
import Step1Basic from "./Step1Basic";
import Step2Individual from "./Step2Individual";
import Step2Company from "./Step2Company";
import Step3Services from "./Step3Services";
import Step4Review from "./Step4Review";
import LockedStatus from "./LockedStatus";

const STEPS = (type: string) => [
  { key: 1, label: "Basic Info" },
  { key: 2, label: type === "company" ? "Company Details" : "Your Details" },
  { key: 3, label: "Services" },
  { key: 4, label: "Review" },
];

type AuthState = "checking" | "email-entry" | "otp-entry" | "authenticated";

export default function OnboardingPage() {
  const [authState, setAuthState] = useState<AuthState>("checking");
  const [authEmail, setAuthEmail] = useState("");
  const [emailInput, setEmailInput] = useState("");
  const [emailError, setEmailError] = useState("");
  const [emailLoading, setEmailLoading] = useState(false);
  const [otpInput, setOtpInput] = useState("");
  const [otpError, setOtpError] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM_DATA);
  const [sessionId, setSessionId] = useState("");
  const [submittedAppId, setSubmittedAppId] = useState("");
  const draftTimer = useRef<NodeJS.Timeout>();
  const otpInputRef = useRef<HTMLInputElement>(null);
  const cooldownRef = useRef<NodeJS.Timeout>();

  // Check existing session cookie on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await fetch("/api/auth/session");
        const data = await res.json();
        if (data.valid) {
          if (data.hasApplication) {
            setSessionId(data.sessionId || "");
            setSubmittedAppId(data.applicationId || "");
            setFormData(data.formData ? { ...INITIAL_FORM_DATA, ...data.formData } : INITIAL_FORM_DATA);
            setSubmitted(true);
          } else if (data.hasDraft) {
            setSessionId(data.sessionId || "");
            setFormData(data.formData ? { ...INITIAL_FORM_DATA, ...data.formData } : INITIAL_FORM_DATA);
            setStep(Math.min(data.step || 1, 4));
          }
          setAuthEmail(data.email || "");
          setAuthState("authenticated");
        } else {
          setAuthState("email-entry");
        }
      } catch {
        setAuthState("email-entry");
      }
    };
    checkSession();
  }, []);

  // Focus OTP input when entering otp-entry state
  useEffect(() => {
    if (authState === "otp-entry") {
      setTimeout(() => otpInputRef.current?.focus(), 100);
    }
  }, [authState]);

  // Resend cooldown countdown
  const startCooldown = () => {
    setResendCooldown(60);
    const tick = () => {
      setResendCooldown((v) => {
        if (v <= 1) return 0;
        cooldownRef.current = setTimeout(tick, 1000);
        return v - 1;
      });
    };
    cooldownRef.current = setTimeout(tick, 1000);
  };

  const handleSendOTP = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const email = emailInput.trim();
    if (!email || !email.includes("@")) {
      setEmailError("Please enter a valid email address.");
      return;
    }
    setEmailLoading(true);
    setEmailError("");
    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setEmailError(data.error || "Failed to send OTP. Please try again.");
      } else {
        setAuthEmail(email.toLowerCase().trim());
        setOtpInput("");
        setOtpError("");
        setAuthState("otp-entry");
        startCooldown();
      }
    } catch {
      setEmailError("Network error. Please check your connection.");
    } finally {
      setEmailLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (resendCooldown > 0) return;
    setOtpError("");
    setOtpInput("");
    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: authEmail }),
      });
      const data = await res.json();
      if (!res.ok) {
        setOtpError(data.error || "Failed to resend. Please try again.");
      } else {
        startCooldown();
      }
    } catch {
      setOtpError("Network error. Please try again.");
    }
  };

  const handleVerifyOTP = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const otp = otpInput.trim();
    if (!otp || otp.length !== 6) {
      setOtpError("Please enter the 6-digit code.");
      return;
    }
    setOtpLoading(true);
    setOtpError("");
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: authEmail, otp }),
      });
      const data = await res.json();
      if (!res.ok) {
        setOtpError(data.error || "Invalid code. Please try again.");
        setOtpInput("");
        otpInputRef.current?.focus();
      } else {
        // Cookie is now set — load session state
        const sessionRes = await fetch("/api/auth/session");
        const sessionData = await sessionRes.json();
        if (sessionData.valid) {
          if (sessionData.hasApplication) {
            setSessionId(sessionData.sessionId || "");
            setSubmittedAppId(sessionData.applicationId || "");
            setFormData(sessionData.formData ? { ...INITIAL_FORM_DATA, ...sessionData.formData } : INITIAL_FORM_DATA);
            setSubmitted(true);
          } else if (sessionData.hasDraft) {
            setSessionId(sessionData.sessionId || "");
            setFormData(sessionData.formData ? { ...INITIAL_FORM_DATA, ...sessionData.formData } : INITIAL_FORM_DATA);
            setStep(Math.min(sessionData.step || 1, 4));
          }
        }
        setAuthState("authenticated");
      }
    } catch {
      setOtpError("Network error. Please try again.");
    } finally {
      setOtpLoading(false);
    }
  };

  const saveDraftToServer = useCallback(async (data: FormData, currentStep: number, sid: string) => {
    if (!sid || !data.email) return;
    try {
      await fetch("/api/draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: sid, step: currentStep, formData: data }),
      });
    } catch {}
  }, []);

  const update = useCallback((fields: Partial<FormData>) => {
    setFormData((prev) => {
      const next = { ...prev, ...fields };
      clearTimeout(draftTimer.current);
      draftTimer.current = setTimeout(() => {
        setStep((s) => { saveDraftToServer(next, s, sessionId); return s; });
      }, 3000);
      return next;
    });
  }, [saveDraftToServer, sessionId]);

  // When authenticated and no session yet, initialise a fresh session
  useEffect(() => {
    if (authState === "authenticated" && !sessionId && !submitted) {
      const newId = crypto.randomUUID();
      setSessionId(newId);
      setFormData((p) => ({ ...p, email: authEmail || p.email, sessionId: newId }));
    }
  }, [authState, sessionId, submitted, authEmail]);

  const goNext = () => {
    setStep((prev) => {
      const nextStep = prev + 1;
      saveDraftToServer(formData, nextStep, sessionId);
      return nextStep;
    });
  };

  const goBack = () => setStep((p) => Math.max(1, p - 1));

  const goToStep = (key: number) => setStep(key);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmitError("");
    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, sessionId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setSubmitError(data.error || "Something went wrong. Please try again.");
      } else {
        const appId = data.applicationId || "";
        setSubmittedAppId(appId);
        setSubmitted(true);
      }
    } catch {
      setSubmitError("Network error. Please check your connection.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Auth screens ──────────────────────────────────────────────────────────

  if (authState === "checking") {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#f9fafb" }}>
        <div className="text-center">
          <div className="w-10 h-10 rounded-full border-2 border-t-transparent animate-spin mx-auto mb-4"
            style={{ borderColor: "#FFA500", borderTopColor: "transparent" }} />
          <p className="text-sm font-medium" style={{ color: "#9ca3af" }}>Loading…</p>
        </div>
      </div>
    );
  }

  if (authState === "email-entry") {
    return (
      <div className="min-h-screen flex flex-col" style={{ background: "#f9fafb" }}>
        <header className="bg-white sticky top-0 z-50" style={{ borderBottom: "1px solid #f3f4f6" }}>
          <div className="w-full px-6 sm:px-10 h-16 flex items-center justify-between">
            <Link href="/">
              <img src="/logo.svg" alt="Bytescare" height={22} style={{ height: 22 }} />
            </Link>
            <span className="text-sm font-medium" style={{ color: "#9ca3af" }}>Customer Onboarding</span>
          </div>
        </header>

        <main className="flex-1 flex items-center justify-center py-12 px-4">
          <div className="w-full max-w-md">
            <div className="rounded-3xl p-8 sm:p-10"
              style={{ background: "#fff", boxShadow: "0 2px 12px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.04)" }}>
              <div className="mb-8 text-center">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
                  style={{ background: "#fff8e6", border: "2px solid rgba(255,165,0,0.2)" }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#FFA500" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                  </svg>
                </div>
                <h1 className="text-2xl font-black mb-2" style={{ color: "#111827" }}>Enter your email</h1>
                <p className="text-sm leading-relaxed" style={{ color: "#6b7280" }}>
                  We&apos;ll send a 6-digit code to verify it&apos;s you. No password needed.
                </p>
              </div>

              <form onSubmit={handleSendOTP} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-1.5" style={{ color: "#374151" }}>
                    Email address
                  </label>
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={emailInput}
                    onChange={(e) => { setEmailInput(e.target.value); setEmailError(""); }}
                    autoFocus
                    className="w-full px-4 py-3 rounded-xl border-2 text-sm outline-none transition-colors"
                    style={{ borderColor: emailError ? "#dc2626" : "#e5e7eb", color: "#111827" }}
                    onFocus={(e) => { if (!emailError) e.target.style.borderColor = "#FFA500"; }}
                    onBlur={(e) => { if (!emailError) e.target.style.borderColor = "#e5e7eb"; }}
                  />
                  {emailError && <p className="text-xs mt-1.5 font-medium" style={{ color: "#dc2626" }}>{emailError}</p>}
                </div>

                <button
                  type="submit"
                  disabled={emailLoading}
                  className="w-full py-3.5 rounded-xl font-bold text-sm transition-all hover:opacity-90 disabled:opacity-60"
                  style={{ background: "#FFA500", color: "#111827" }}>
                  {emailLoading ? "Sending…" : "Send Verification Code →"}
                </button>
              </form>

              <p className="text-xs text-center mt-6 leading-relaxed" style={{ color: "#9ca3af" }}>
                Your progress is always saved. Enter the same email to resume from any device.
              </p>
            </div>
          </div>
        </main>

        <div className="h-1" style={{ background: "linear-gradient(90deg, #FFA500, #7C3AED)" }} />
      </div>
    );
  }

  if (authState === "otp-entry") {
    const maskedEmail = authEmail.replace(/(.{2})[^@]+(@.+)/, "$1***$2");
    return (
      <div className="min-h-screen flex flex-col" style={{ background: "#f9fafb" }}>
        <header className="bg-white sticky top-0 z-50" style={{ borderBottom: "1px solid #f3f4f6" }}>
          <div className="w-full px-6 sm:px-10 h-16 flex items-center justify-between">
            <Link href="/">
              <img src="/logo.svg" alt="Bytescare" height={22} style={{ height: 22 }} />
            </Link>
            <span className="text-sm font-medium" style={{ color: "#9ca3af" }}>Customer Onboarding</span>
          </div>
        </header>

        <main className="flex-1 flex items-center justify-center py-12 px-4">
          <div className="w-full max-w-md">
            <div className="rounded-3xl p-8 sm:p-10"
              style={{ background: "#fff", boxShadow: "0 2px 12px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.04)" }}>
              <div className="mb-8 text-center">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
                  style={{ background: "#f0fdf4", border: "2px solid #bbf7d0" }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.95 14a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.9 3.12h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 10a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
                  </svg>
                </div>
                <h1 className="text-2xl font-black mb-2" style={{ color: "#111827" }}>Check your email</h1>
                <p className="text-sm leading-relaxed" style={{ color: "#6b7280" }}>
                  We sent a 6-digit code to <strong style={{ color: "#111827" }}>{maskedEmail}</strong>
                </p>
              </div>

              <form onSubmit={handleVerifyOTP} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-1.5" style={{ color: "#374151" }}>
                    Verification code
                  </label>
                  <input
                    ref={otpInputRef}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    placeholder="000000"
                    value={otpInput}
                    maxLength={6}
                    onChange={(e) => {
                      const v = e.target.value.replace(/\D/g, "").slice(0, 6);
                      setOtpInput(v);
                      setOtpError("");
                    }}
                    className="w-full px-4 py-3 rounded-xl border-2 text-center text-2xl font-black tracking-widest outline-none transition-colors"
                    style={{
                      borderColor: otpError ? "#dc2626" : "#e5e7eb",
                      color: "#111827",
                      letterSpacing: "0.4em",
                      fontFamily: "monospace",
                    }}
                    onFocus={(e) => { if (!otpError) e.target.style.borderColor = "#FFA500"; }}
                    onBlur={(e) => { if (!otpError) e.target.style.borderColor = "#e5e7eb"; }}
                  />
                  {otpError && <p className="text-xs mt-1.5 font-medium" style={{ color: "#dc2626" }}>{otpError}</p>}
                </div>

                <button
                  type="submit"
                  disabled={otpLoading || otpInput.length !== 6}
                  className="w-full py-3.5 rounded-xl font-bold text-sm transition-all hover:opacity-90 disabled:opacity-60"
                  style={{ background: "#FFA500", color: "#111827" }}>
                  {otpLoading ? "Verifying…" : "Verify & Continue →"}
                </button>
              </form>

              <div className="mt-5 flex flex-col sm:flex-row items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={handleResendOTP}
                  disabled={resendCooldown > 0}
                  className="text-sm font-semibold disabled:opacity-50"
                  style={{ color: resendCooldown > 0 ? "#9ca3af" : "#FFA500" }}>
                  {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend code"}
                </button>
                <button
                  type="button"
                  onClick={() => { setAuthState("email-entry"); setOtpInput(""); setOtpError(""); }}
                  className="text-sm font-medium"
                  style={{ color: "#6b7280" }}>
                  ← Change email
                </button>
              </div>
            </div>
          </div>
        </main>

        <div className="h-1" style={{ background: "linear-gradient(90deg, #FFA500, #7C3AED)" }} />
      </div>
    );
  }

  // ── Authenticated ─────────────────────────────────────────────────────────

  if (submitted) return <LockedStatus sessionId={sessionId} applicationId={submittedAppId} formData={formData} />;

  const steps = STEPS(formData.type);
  const currentIdx = steps.findIndex((s) => s.key === step);
  const totalSteps = steps.length;
  const stepPosition = currentIdx + 1;
  const pct = Math.round(((stepPosition - 1) / (totalSteps - 1)) * 100);

  const renderStep = () => {
    const common = { formData, update, onNext: goNext, onBack: goBack };
    switch (step) {
      case 1: return <Step1Basic {...common} />;
      case 2: return formData.type === "company" ? <Step2Company {...common} /> : <Step2Individual {...common} />;
      case 3: return <Step3Services {...common} />;
      case 4: return <Step4Review formData={formData} onBack={goBack} onNext={handleSubmit} goToStep={goToStep} isSubmitting={isSubmitting} submitError={submitError} />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#f9fafb" }}>
      {/* Header */}
      <header className="bg-white sticky top-0 z-50" style={{ borderBottom: "1px solid #f3f4f6" }}>
        <div className="w-full px-6 sm:px-10 h-16 flex items-center justify-between">
          <Link href="/">
            <img src="/logo.svg" alt="Bytescare" height={22} style={{ height: 22 }} />
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-xs font-medium hidden sm:block" style={{ color: "#9ca3af" }}>
              {authEmail}
            </span>
            <span className="text-sm font-medium" style={{ color: "#9ca3af" }}>Customer Onboarding</span>
          </div>
        </div>
      </header>

      <main className="flex-1 py-8 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Progress */}
          <div className="mb-7">
            <div className="relative flex items-center justify-between mb-4">
              <div className="absolute h-0.5 rounded-full" style={{ background: "#e5e7eb", left: 16, right: 16, top: 16, zIndex: 0 }} />
              <div className="absolute h-0.5 rounded-full transition-all duration-500"
                style={{ background: "#FFA500", left: 16, width: `calc(${pct}% * (100% - 32px) / 100)`, top: 16, zIndex: 0 }} />

              {steps.map((s, i) => {
                const done = stepPosition > i + 1;
                const active = stepPosition === i + 1;
                return (
                  <div key={s.key} className="relative z-10 flex flex-col items-center gap-1.5">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300"
                      style={{
                        background: done || active ? "#FFA500" : "#e5e7eb",
                        color: done || active ? "#111827" : "#9ca3af",
                        boxShadow: active ? "0 0 0 4px rgba(255,165,0,0.18)" : "none",
                      }}>
                      {done ? "✓" : i + 1}
                    </div>
                    <span className="text-xs font-semibold hidden sm:block whitespace-nowrap"
                      style={{ color: active ? "#FFA500" : done ? "#111827" : "#9ca3af" }}>
                      {s.label}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "#e5e7eb" }}>
              <div className="h-full rounded-full transition-all duration-500"
                style={{ background: "linear-gradient(90deg, #FFA500, #7C3AED)", width: `${pct}%` }} />
            </div>
            <div className="flex justify-between mt-2">
              <span className="text-xs font-medium" style={{ color: "#9ca3af" }}>Step {stepPosition} of {totalSteps}</span>
              <span className="text-xs font-medium" style={{ color: "#9ca3af" }}>{pct}% complete</span>
            </div>
          </div>

          {/* Form card */}
          <div key={step} className="rounded-3xl p-6 sm:p-9"
            style={{ background: "#fff", boxShadow: "0 2px 12px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.04)" }}>
            {renderStep()}
          </div>

          {formData.email && (
            <p className="text-center text-xs mt-3" style={{ color: "#9ca3af" }}>
              Progress saved — sign in from any device to continue
            </p>
          )}
        </div>
      </main>

      <div className="h-1" style={{ background: "linear-gradient(90deg, #FFA500, #7C3AED)" }} />
    </div>
  );
}
