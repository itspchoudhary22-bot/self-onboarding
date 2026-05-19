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

  // Initialize session on mount
  useEffect(() => {
    const savedId = localStorage.getItem(LS_SESSION);
    const savedStep = localStorage.getItem(LS_STEP);
    const savedData = localStorage.getItem(LS_DATA);

    if (savedId && savedData) {
      try {
        const parsed: FormData = JSON.parse(savedData);
        if (parsed.email) {
          setResumeInfo({
            sessionId: savedId,
            step: parseInt(savedStep || "1"),
            email: parsed.email,
            formData: parsed,
          });
          setShowResumeBanner(true);
          return;
        }
      } catch {}
    }

    // No saved session — create new
    const newId = crypto.randomUUID();
    localStorage.setItem(LS_SESSION, newId);
    setSessionId(newId);
    setFormData((p) => ({ ...p, sessionId: newId }));
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
      if (typeof window !== "undefined") {
        localStorage.setItem(LS_DATA, JSON.stringify(next));
      }
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
      if (typeof window !== "undefined") {
        localStorage.setItem(LS_STEP, String(nextStep));
      }
      saveDraftToServer(formData, nextStep, sessionId);
      return nextStep;
    });
  };

  const goBack = () => setStep((p) => Math.max(1, p - 1));

  const goToStep = (key: number) => {
    setStep(key);
    localStorage.setItem(LS_STEP, String(key));
  };

  const handleResume = () => {
    if (!resumeInfo) return;
    const { sessionId: sid, step: savedStep, formData: savedData } = resumeInfo;
    localStorage.setItem(LS_SESSION, sid);
    setSessionId(sid);
    setFormData({ ...savedData, sessionId: sid });
    setStep(Math.min(savedStep, 4)); // Don't resume into signing step
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
    const sid = sessionId;
    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, sessionId: sid, pandadocDocumentId }),
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

  const renderStep = () => {
    const common = { formData, update, onNext: goNext, onBack: goBack };
    switch (step) {
      case 1: return <Step1Basic {...common} />;
      case 2:
        return formData.type === "company"
          ? <Step2Company {...common} />
          : <Step2Individual {...common} />;
      case 3: return <Step3Services {...common} />;
      case 4:
        return <Step4Review formData={formData} onBack={goBack} onNext={goNext} goToStep={goToStep} />;
      case 5:
        return (
          <Step5Sign
            formData={formData}
            sessionId={sessionId}
            onBack={goBack}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            submitError={submitError}
          />
        );
      default: return null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#f9fafb" }}>
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-1 font-black text-xl tracking-tight">
            <span style={{ color: "#111827" }}>BYTES</span>
            <span style={{ color: "#FFA500" }}>CARE</span>
          </Link>
          <span className="text-gray-400 text-sm">Customer Onboarding</span>
        </div>
      </header>

      {/* Resume banner */}
      {showResumeBanner && resumeInfo && (
        <div className="bg-amber-50 border-b border-amber-200">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-gray-800">
                Welcome back! You have an unfinished application.
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                Email: <span className="font-medium">{resumeInfo.email}</span> · Last at Step {resumeInfo.step}
              </p>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <button
                onClick={handleStartFresh}
                className="text-xs px-3 py-2 rounded-lg border border-gray-300 text-gray-500 hover:bg-white transition-all font-medium"
              >
                Start Fresh
              </button>
              <button
                onClick={handleResume}
                className="text-xs px-4 py-2 rounded-lg font-bold transition-all hover:opacity-90"
                style={{ background: "#FFA500", color: "#111827" }}
              >
                Resume →
              </button>
            </div>
          </div>
        </div>
      )}

      <main className="flex-1 py-8 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Step Progress */}
          <div className="mb-6">
            <div className="flex items-center mb-3">
              {steps.map((s, i) => {
                const done = stepPosition > i + 1;
                const active = stepPosition === i + 1;
                return (
                  <div key={s.key} className="flex-1 flex items-center">
                    <div className="flex flex-col items-center flex-shrink-0">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300"
                        style={{
                          background: done || active ? "#FFA500" : "#e5e7eb",
                          color: done || active ? "#111827" : "#9ca3af",
                          boxShadow: active ? "0 0 0 4px rgba(255,165,0,0.2)" : "none",
                        }}
                      >
                        {done ? "✓" : i + 1}
                      </div>
                      <span
                        className="text-xs mt-1 font-medium hidden sm:block whitespace-nowrap"
                        style={{ color: active || done ? "#111827" : "#9ca3af" }}
                      >
                        {s.label}
                      </span>
                    </div>
                    {i < steps.length - 1 && (
                      <div
                        className="flex-1 h-0.5 mx-1 rounded transition-all duration-500"
                        style={{ background: done ? "#FFA500" : "#e5e7eb" }}
                      />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Progress bar */}
            <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  background: "linear-gradient(90deg, #FFA500, #7C3AED)",
                  width: `${((stepPosition - 1) / (totalSteps - 1)) * 100}%`,
                }}
              />
            </div>
            <div className="flex justify-between mt-1.5 text-xs text-gray-400">
              <span>Step {stepPosition} of {totalSteps}</span>
              <span>{Math.round(((stepPosition - 1) / (totalSteps - 1)) * 100)}% complete</span>
            </div>
          </div>

          {/* Form Card */}
          <div key={step} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
            {renderStep()}
          </div>

          {/* Auto-save indicator */}
          {formData.email && (
            <p className="text-center text-xs text-gray-400 mt-3">
              💾 Progress saved automatically
            </p>
          )}
        </div>
      </main>

      <div className="h-1.5" style={{ background: "linear-gradient(90deg, #FFA500, #7C3AED)" }} />
    </div>
  );
}
