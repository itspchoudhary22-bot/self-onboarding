"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { FormData, INITIAL_FORM_DATA } from "./formTypes";
import Step1Basic from "./Step1Basic";
import Step2Individual from "./Step2Individual";
import Step2Company from "./Step2Company";
import Step3Services from "./Step3Services";
import Step4Review from "./Step4Review";
import Step5Sign from "./Step5Sign";
import SuccessScreen from "./SuccessScreen";

const STEPS = (type: string) => [
  { key: 1, label: "Basic Info" },
  { key: 2, label: type === "company" ? "Company Details" : "Your Details" },
  { key: 3, label: "Services" },
  { key: 4, label: "Review" },
  { key: 5, label: "Sign" },
];

const LS_SESSION = "bytescare_session_id";
const LS_DATA = "bytescare_form_data";
const LS_STEP = "bytescare_step";

interface ResumeInfo {
  sessionId: string;
  step: number;
  email: string;
  formData: FormData;
}

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [documentSigned, setDocumentSigned] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM_DATA);
  const [sessionId, setSessionId] = useState("");
  const [resumeInfo, setResumeInfo] = useState<ResumeInfo | null>(null);
  const [showResumeBanner, setShowResumeBanner] = useState(false);
  const draftTimer = useRef<NodeJS.Timeout>();

  useEffect(() => {
    const init = async () => {
      // Check for ?session=TOKEN in URL (resume link from email)
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get('session');
      if (token) {
        try {
          const res = await fetch(`/api/resume?token=${token}`);
          const { draft } = await res.json();
          if (draft?.formData?.email) {
            // Clear the token from URL without reload
            window.history.replaceState({}, '', '/onboarding');
            localStorage.setItem(LS_SESSION, draft.sessionId);
            setSessionId(draft.sessionId);
            setFormData({ ...draft.formData, sessionId: draft.sessionId });
            setStep(Math.min(draft.step, 4));
            return;
          }
        } catch {}
      }

      // Fall back to localStorage session
      const savedId = localStorage.getItem(LS_SESSION);
      const savedStep = localStorage.getItem(LS_STEP);
      const savedData = localStorage.getItem(LS_DATA);
      if (savedId && savedData) {
        try {
          const parsed: FormData = JSON.parse(savedData);
          if (parsed.email) {
            setResumeInfo({ sessionId: savedId, step: parseInt(savedStep || "1"), email: parsed.email, formData: parsed });
            setShowResumeBanner(true);
            return;
          }
        } catch {}
      }

      const newId = crypto.randomUUID();
      localStorage.setItem(LS_SESSION, newId);
      setSessionId(newId);
      setFormData((p) => ({ ...p, sessionId: newId }));
    };
    init();
  }, []);

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
      if (typeof window !== "undefined") localStorage.setItem(LS_DATA, JSON.stringify(next));
      clearTimeout(draftTimer.current);
      draftTimer.current = setTimeout(() => {
        setStep((s) => { saveDraftToServer(next, s, sessionId); return s; });
      }, 3000);
      return next;
    });
  }, [saveDraftToServer, sessionId]);

  const goNext = () => {
    setStep((prev) => {
      const nextStep = prev + 1;
      if (typeof window !== "undefined") localStorage.setItem(LS_STEP, String(nextStep));
      saveDraftToServer(formData, nextStep, sessionId);
      return nextStep;
    });
  };

  const goBack = () => setStep((p) => Math.max(1, p - 1));

  const goToStep = (key: number) => {
    setStep(key);
    if (typeof window !== "undefined") localStorage.setItem(LS_STEP, String(key));
  };

  const handleResume = () => {
    if (!resumeInfo) return;
    const { sessionId: sid, step: savedStep, formData: savedData } = resumeInfo;
    localStorage.setItem(LS_SESSION, sid);
    setSessionId(sid);
    setFormData({ ...savedData, sessionId: sid });
    setStep(Math.min(savedStep, 4));
    setShowResumeBanner(false);
  };

  const handleStartFresh = () => {
    localStorage.removeItem(LS_SESSION);
    localStorage.removeItem(LS_DATA);
    localStorage.removeItem(LS_STEP);
    const newId = crypto.randomUUID();
    localStorage.setItem(LS_SESSION, newId);
    setSessionId(newId);
    setFormData({ ...INITIAL_FORM_DATA, sessionId: newId });
    setStep(1);
    setShowResumeBanner(false);
    setResumeInfo(null);
  };

  const handleSubmit = async (pandadocDocumentId: string) => {
    setIsSubmitting(true);
    setSubmitError("");
    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, sessionId, pandadocDocumentId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setSubmitError(data.error || "Something went wrong. Please try again.");
      } else {
        localStorage.removeItem(LS_SESSION);
        localStorage.removeItem(LS_DATA);
        localStorage.removeItem(LS_STEP);
        setDocumentSigned(!!pandadocDocumentId);
        setSubmitted(true);
      }
    } catch {
      setSubmitError("Network error. Please check your connection.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) return <SuccessScreen formData={formData} documentSigned={documentSigned} />;

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
      case 4: return <Step4Review formData={formData} onBack={goBack} onNext={goNext} goToStep={goToStep} />;
      case 5: return <Step5Sign formData={formData} sessionId={sessionId} onBack={goBack} onSubmit={handleSubmit} isSubmitting={isSubmitting} submitError={submitError} />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#f9fafb" }}>
      {/* Header */}
      <header className="bg-white sticky top-0 z-50" style={{ borderBottom: "1px solid #f3f4f6" }}>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-0.5 font-black text-xl tracking-tight" style={{ letterSpacing: "-0.02em" }}>
            <span style={{ color: "#111827" }}>BYTES</span>
            <span style={{ color: "#FFA500" }}>CARE</span>
          </Link>
          <span className="text-sm font-medium" style={{ color: "#9ca3af" }}>Customer Onboarding</span>
        </div>
      </header>

      {/* Resume banner */}
      {showResumeBanner && resumeInfo && (
        <div style={{ background: "#fffbeb", borderBottom: "1px solid rgba(255,165,0,0.25)" }}>
          <div className="max-w-2xl mx-auto px-4 sm:px-6 py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold" style={{ color: "#111827" }}>Welcome back — you have an unfinished application</p>
              <p className="text-xs mt-0.5" style={{ color: "#9ca3af" }}>
                {resumeInfo.email} · Left at Step {resumeInfo.step}
              </p>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <button onClick={handleStartFresh}
                className="text-xs px-3 py-2 rounded-xl font-semibold transition-all hover:bg-white"
                style={{ border: "1.5px solid #e5e7eb", color: "#6b7280" }}>
                Start Fresh
              </button>
              <button onClick={handleResume}
                className="text-xs px-4 py-2 rounded-xl font-bold transition-all hover:opacity-90"
                style={{ background: "#FFA500", color: "#111827" }}>
                Resume →
              </button>
            </div>
          </div>
        </div>
      )}

      <main className="flex-1 py-8 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Progress */}
          <div className="mb-7">
            <div className="flex items-start mb-4">
              {steps.map((s, i) => {
                const done = stepPosition > i + 1;
                const active = stepPosition === i + 1;
                return (
                  <div key={s.key} className="flex-1 flex items-start">
                    <div className="flex flex-col items-center flex-shrink-0">
                      <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300"
                        style={{
                          background: done || active ? "#FFA500" : "#e5e7eb",
                          color: done || active ? "#111827" : "#9ca3af",
                          boxShadow: active ? "0 0 0 5px rgba(255,165,0,0.18)" : "none",
                        }}>
                        {done ? "✓" : i + 1}
                      </div>
                      <span className="text-xs mt-1.5 font-semibold hidden sm:block whitespace-nowrap"
                        style={{ color: active ? "#FFA500" : done ? "#111827" : "#9ca3af" }}>
                        {s.label}
                      </span>
                    </div>
                    {i < steps.length - 1 && (
                      <div className="flex-1 rounded transition-all duration-500 mt-4 mx-1"
                        style={{ height: 2, background: done ? "#FFA500" : "#e5e7eb" }} />
                    )}
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
            <p className="text-center text-xs mt-3" style={{ color: "#9ca3af" }}>💾 Progress saved automatically</p>
          )}
        </div>
      </main>

      <div className="h-1" style={{ background: "linear-gradient(90deg, #FFA500, #7C3AED)" }} />
    </div>
  );
}
