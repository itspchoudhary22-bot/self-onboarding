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
import Step6Payment from "./Step6Payment";
import SuccessScreen from "./SuccessScreen";

const STEPS = (type: string) => [
  { key: 1, label: "Basic Info" },
  { key: 2, label: type === "company" ? "Company Details" : "Your Details" },
  { key: 3, label: "Services" },
  { key: 4, label: "Review" },
  { key: 5, label: "Sign" },
  { key: 6, label: "Payment" },
];

const LS_SESSION = "bytescare_session_id";
const LS_DATA = "bytescare_form_data";
const LS_STEP = "bytescare_step";
const LS_PANDADOC = "bytescare_pandadoc_id";

interface ResumeInfo {
  sessionId: string;
  step: number;
  email: string;
  formData: FormData;
  pandadocDocId: string;
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
  const [resumeLink, setResumeLink] = useState("");
  const [linkCopied, setLinkCopied] = useState(false);
  const [pandadocDocId, setPandadocDocId] = useState("");
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
            window.history.replaceState({}, '', '/onboarding');
            const docId = draft.pandadocDocumentId || '';
            const resumeStep = draft.step === 5 && !docId ? 4 : draft.step;
            localStorage.setItem(LS_SESSION, draft.sessionId);
            if (docId) localStorage.setItem(LS_PANDADOC, docId);
            setSessionId(draft.sessionId);
            setFormData({ ...draft.formData, sessionId: draft.sessionId });
            setPandadocDocId(docId);
            setStep(resumeStep);
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
            const savedDocId = localStorage.getItem(LS_PANDADOC) || '';
            const savedStepNum = parseInt(savedStep || "1");
            setResumeInfo({
              sessionId: savedId,
              step: savedStepNum,
              email: parsed.email,
              formData: parsed,
              pandadocDocId: savedDocId,
            });
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
      const res = await fetch("/api/draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: sid, step: currentStep, formData: data }),
      });
      const json = await res.json();
      if (json.resumeToken && !resumeLink) {
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin;
        setResumeLink(`${appUrl}/onboarding?session=${json.resumeToken}`);
      }
    } catch {}
  }, [resumeLink]);

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
    const { sessionId: sid, step: savedStep, formData: savedData, pandadocDocId: savedDocId } = resumeInfo;
    // If they were mid-signing (step 5) with no doc ID, drop back to review
    const resumeStep = savedStep === 5 && !savedDocId ? 4 : savedStep;
    localStorage.setItem(LS_SESSION, sid);
    setSessionId(sid);
    setFormData({ ...savedData, sessionId: sid });
    setPandadocDocId(savedDocId);
    setStep(resumeStep);
    setShowResumeBanner(false);
  };

  const handleStartFresh = () => {
    localStorage.removeItem(LS_SESSION);
    localStorage.removeItem(LS_DATA);
    localStorage.removeItem(LS_STEP);
    localStorage.removeItem(LS_PANDADOC);
    const newId = crypto.randomUUID();
    localStorage.setItem(LS_SESSION, newId);
    setSessionId(newId);
    setFormData({ ...INITIAL_FORM_DATA, sessionId: newId });
    setStep(1);
    setShowResumeBanner(false);
    setResumeInfo(null);
  };

  const handleStep5Complete = (docId: string) => {
    setPandadocDocId(docId);
    if (docId) localStorage.setItem(LS_PANDADOC, docId);
    goNext();
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmitError("");
    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, sessionId, pandadocDocumentId: pandadocDocId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setSubmitError(data.error || "Something went wrong. Please try again.");
      } else {
        localStorage.removeItem(LS_SESSION);
        localStorage.removeItem(LS_DATA);
        localStorage.removeItem(LS_STEP);
        localStorage.removeItem(LS_PANDADOC);
        setDocumentSigned(!!pandadocDocId);
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
      case 5: return <Step5Sign formData={formData} sessionId={sessionId} onBack={goBack} onComplete={handleStep5Complete} existingDocumentId={pandadocDocId || undefined} />;
      case 6: return <Step6Payment formData={formData} update={update} onBack={goBack} onSubmit={handleSubmit} isSubmitting={isSubmitting} submitError={submitError} />;
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
          <span className="text-sm font-medium" style={{ color: "#9ca3af" }}>Customer Onboarding</span>
        </div>
      </header>

      {/* Resume banner */}
      {showResumeBanner && resumeInfo && (
        <div style={{ background: "#fffbeb", borderBottom: "1px solid rgba(255,165,0,0.25)" }}>
          <div className="max-w-2xl mx-auto px-4 sm:px-6 py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold" style={{ color: "#111827" }}>Welcome back</p>
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
            {/* Step circles with connector line */}
            <div className="relative flex items-center justify-between mb-4">
              {/* Full-width connector line sitting behind circles */}
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

          {resumeLink ? (
            <div className="mt-4 px-4 py-3 rounded-2xl flex items-center gap-3"
              style={{ background: "#fff", border: "1.5px solid #e5e7eb", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
              <span className="text-base flex-shrink-0">🔗</span>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold mb-0.5" style={{ color: "#374151" }}>Your progress is saved</p>
                <p className="text-xs truncate" style={{ color: "#9ca3af" }}>Bookmark this link to resume from any device</p>
              </div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(resumeLink);
                  setLinkCopied(true);
                  setTimeout(() => setLinkCopied(false), 2000);
                }}
                className="flex-shrink-0 text-xs font-bold px-3 py-1.5 rounded-lg transition-all"
                style={{ background: linkCopied ? "#f0fdf4" : "#fff8e6", color: linkCopied ? "#166534" : "#92400e", border: `1.5px solid ${linkCopied ? "#86efac" : "rgba(255,165,0,0.3)"}` }}>
                {linkCopied ? "✓ Copied!" : "Copy link"}
              </button>
            </div>
          ) : formData.email ? (
            <p className="text-center text-xs mt-3" style={{ color: "#9ca3af" }}>💾 Progress saved automatically</p>
          ) : null}
        </div>
      </main>

      <div className="h-1" style={{ background: "linear-gradient(90deg, #FFA500, #7C3AED)" }} />
    </div>
  );
}
