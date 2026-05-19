"use client";
import { useState } from "react";
import Link from "next/link";
import { FormData, INITIAL_FORM_DATA } from "./formTypes";
import Step1Basic from "./Step1Basic";
import Step2Individual from "./Step2Individual";
import Step2Company from "./Step2Company";
import Step3Address from "./Step3Address";
import Step4Company from "./Step4Company";
import Step5Services from "./Step5Services";
import Step6Review from "./Step6Review";
import SuccessScreen from "./SuccessScreen";

// Individual: 5 steps (no signatory step)
// Company:    6 steps
const IND_STEPS = [
  { key: 1, label: "Basic Info" },
  { key: 2, label: "Personal Details" },
  { key: 3, label: "Address" },
  { key: 5, label: "Services" },
  { key: 6, label: "Review" },
];

const CO_STEPS = [
  { key: 1, label: "Basic Info" },
  { key: 2, label: "Company Details" },
  { key: 3, label: "Address" },
  { key: 4, label: "Signatory" },
  { key: 5, label: "Services" },
  { key: 6, label: "Review" },
];

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM_DATA);

  const update = (fields: Partial<FormData>) =>
    setFormData((prev) => ({ ...prev, ...fields }));

  const steps = formData.type === "company" ? CO_STEPS : IND_STEPS;
  const currentIdx = steps.findIndex((s) => s.key === step);

  const goNext = () => {
    const next = steps[currentIdx + 1];
    if (next) setStep(next.key);
  };

  const goBack = () => {
    const prev = steps[currentIdx - 1];
    if (prev) setStep(prev.key);
  };

  const goToStep = (key: number) => setStep(key);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmitError("");
    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) {
        setSubmitError(data.error || "Something went wrong. Please try again.");
      } else {
        setSubmitted(true);
      }
    } catch {
      setSubmitError("Network error. Please check your connection.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) return <SuccessScreen formData={formData} />;

  const totalSteps = steps.length;
  const stepPosition = currentIdx + 1; // 1-based position in current path

  const renderStep = () => {
    const common = { formData, update, onNext: goNext, onBack: goBack };
    switch (step) {
      case 1: return <Step1Basic {...common} />;
      case 2: return formData.type === "company" ? <Step2Company {...common} /> : <Step2Individual {...common} />;
      case 3: return <Step3Address {...common} />;
      case 4: return <Step4Company {...common} />;
      case 5: return <Step5Services {...common} />;
      case 6: return <Step6Review formData={formData} onBack={goBack} onSubmit={handleSubmit} isSubmitting={isSubmitting} submitError={submitError} goToStep={goToStep} />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#f9fafb" }}>
      {/* Header - white, matching bytescare.com */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-1 font-black text-xl tracking-tight">
            <span style={{ color: "#111827" }}>BYTES</span>
            <span style={{ color: "#FFA500" }}>CARE</span>
          </Link>
          <span className="text-gray-400 text-sm">Customer Onboarding</span>
        </div>
      </header>

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
          <div key={step} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 animate-fade-in">
            {renderStep()}
          </div>
        </div>
      </main>

      <div className="h-1.5" style={{ background: "linear-gradient(90deg, #FFA500, #7C3AED)" }} />
    </div>
  );
}
