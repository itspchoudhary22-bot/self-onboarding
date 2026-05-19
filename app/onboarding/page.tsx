"use client";
import { useState } from "react";
import Link from "next/link";
import { FormData, INITIAL_FORM_DATA } from "./formTypes";
import Step1Basic from "./Step1Basic";
import Step2Individual from "./Step2Individual";
import Step2Company from "./Step2Company";
import Step3Address from "./Step3Address";
import Step4Individual from "./Step4Individual";
import Step4Company from "./Step4Company";
import Step5Services from "./Step5Services";
import Step6Review from "./Step6Review";
import SuccessScreen from "./SuccessScreen";

const getStepLabels = (type: string) => {
  if (type === "company")
    return ["Basic Info", "Company Details", "Address", "Signatory", "Services", "Review"];
  return ["Basic Info", "Personal Details", "Address", "Work & Social", "Services", "Review"];
};

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM_DATA);

  const update = (fields: Partial<FormData>) =>
    setFormData((prev) => ({ ...prev, ...fields }));
  const goNext = () => { setStep((s) => s + 1); };
  const goBack = () => { setStep((s) => s - 1); };
  const goToStep = (s: number) => { setStep(s); };

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

  const TOTAL_STEPS = 6;
  const stepLabels = getStepLabels(formData.type);

  const renderStep = () => {
    const common = { formData, update, onNext: goNext, onBack: goBack };
    switch (step) {
      case 1: return <Step1Basic {...common} />;
      case 2: return formData.type === "company" ? <Step2Company {...common} /> : <Step2Individual {...common} />;
      case 3: return <Step3Address {...common} />;
      case 4: return formData.type === "company" ? <Step4Company {...common} /> : <Step4Individual {...common} />;
      case 5: return <Step5Services {...common} />;
      case 6: return <Step6Review formData={formData} onBack={goBack} onSubmit={handleSubmit} isSubmitting={isSubmitting} submitError={submitError} goToStep={goToStep} />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header style={{ background: "#001F3F" }} className="shadow-md sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm"
              style={{ background: "#FFA500", color: "#001F3F" }}
            >
              B
            </div>
            <span className="text-white font-bold text-lg">Bytescare</span>
          </Link>
          <div className="text-slate-400 text-sm hidden sm:block">Customer Onboarding</div>
        </div>
      </header>

      <main className="flex-1 py-8 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Step Progress */}
          <div className="mb-8">
            <div className="flex items-center mb-4">
              {stepLabels.map((label, i) => {
                const num = i + 1;
                const done = step > num;
                const active = step === num;
                return (
                  <div key={label} className="flex-1 flex items-center">
                    <div className="flex flex-col items-center flex-shrink-0">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300"
                        style={{
                          background: done ? "#FFA500" : active ? "#001F3F" : "#e2e8f0",
                          color: done || active ? "#fff" : "#94a3b8",
                          boxShadow: active
                            ? "0 0 0 4px rgba(0,31,63,0.15)"
                            : done
                            ? "0 0 0 4px rgba(255,165,0,0.2)"
                            : "none",
                        }}
                      >
                        {done ? "✓" : num}
                      </div>
                      <span
                        className="text-xs mt-1 font-medium hidden sm:block whitespace-nowrap"
                        style={{ color: active ? "#001F3F" : done ? "#FFA500" : "#94a3b8" }}
                      >
                        {label}
                      </span>
                    </div>
                    {i < stepLabels.length - 1 && (
                      <div
                        className="flex-1 h-0.5 mx-1 rounded transition-all duration-500"
                        style={{ background: done ? "#FFA500" : "#e2e8f0" }}
                      />
                    )}
                  </div>
                );
              })}
            </div>
            {/* Progress bar */}
            <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  background: "linear-gradient(90deg, #001F3F, #FFA500)",
                  width: `${((step - 1) / (TOTAL_STEPS - 1)) * 100}%`,
                }}
              />
            </div>
            <div className="flex justify-between mt-1.5 text-xs text-slate-400">
              <span>Step {step} of {TOTAL_STEPS}</span>
              <span>{Math.round(((step - 1) / (TOTAL_STEPS - 1)) * 100)}% complete</span>
            </div>
          </div>

          {/* Form Card */}
          <div key={step} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 sm:p-8">
            {renderStep()}
          </div>
        </div>
      </main>
    </div>
  );
}
