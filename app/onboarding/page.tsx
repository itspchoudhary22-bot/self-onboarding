"use client";

import { useState } from "react";
import Link from "next/link";
import Step1 from "./Step1";
import Step2 from "./Step2";
import Step3 from "./Step3";
import Step4 from "./Step4";
import SuccessScreen from "./SuccessScreen";

export interface FormData {
  email: string;
  type: "individual" | "company" | "";
  name: string;
  phone: string;
  services: string[];
}

const STEPS = ["Basic Info", "Your Details", "Services", "Review"];

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState<"forward" | "back">("forward");
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    email: "",
    type: "",
    name: "",
    phone: "",
    services: [],
  });

  const update = (fields: Partial<FormData>) =>
    setFormData((prev) => ({ ...prev, ...fields }));

  const goNext = () => {
    setDirection("forward");
    setStep((s) => s + 1);
  };

  const goBack = () => {
    setDirection("back");
    setStep((s) => s - 1);
  };

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

  const animClass =
    direction === "forward" ? "animate-slide-in" : "animate-slide-back";

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header style={{ background: "#001F3F" }} className="shadow-md">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold"
              style={{ background: "#FFA500" }}
            >
              B
            </div>
            <span className="text-white font-bold text-lg tracking-tight">
              Bytescare
            </span>
          </Link>
          <span className="text-slate-400 text-sm">Customer Onboarding</span>
        </div>
      </header>

      <main className="flex-1 flex items-start justify-center px-4 py-10">
        <div className="w-full max-w-2xl">
          {/* Step Indicators */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-3">
              {STEPS.map((label, i) => {
                const num = i + 1;
                const done = step > num;
                const active = step === num;
                return (
                  <div key={label} className="flex-1 flex items-center">
                    <div className="flex flex-col items-center">
                      <div
                        className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300"
                        style={{
                          background: done
                            ? "#FFA500"
                            : active
                            ? "#001F3F"
                            : "#e2e8f0",
                          color: done || active ? "#fff" : "#94a3b8",
                          boxShadow:
                            active
                              ? "0 0 0 4px rgba(0,31,63,0.15)"
                              : done
                              ? "0 0 0 4px rgba(255,165,0,0.2)"
                              : "none",
                        }}
                      >
                        {done ? "✓" : num}
                      </div>
                      <span
                        className="text-xs mt-1.5 font-medium hidden sm:block"
                        style={{
                          color: active
                            ? "#001F3F"
                            : done
                            ? "#FFA500"
                            : "#94a3b8",
                        }}
                      >
                        {label}
                      </span>
                    </div>
                    {i < STEPS.length - 1 && (
                      <div
                        className="flex-1 h-0.5 mx-2 rounded transition-all duration-500"
                        style={{
                          background: done ? "#FFA500" : "#e2e8f0",
                        }}
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
                  width: `${((step - 1) / (STEPS.length - 1)) * 100}%`,
                }}
              />
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-xs text-slate-400">
                Step {step} of {STEPS.length}
              </span>
              <span className="text-xs text-slate-400">
                {Math.round(((step - 1) / (STEPS.length - 1)) * 100)}% complete
              </span>
            </div>
          </div>

          {/* Form Card */}
          <div
            key={step}
            className={`bg-white rounded-2xl shadow-lg border border-slate-100 p-6 sm:p-8 ${animClass}`}
          >
            {step === 1 && (
              <Step1 formData={formData} update={update} onNext={goNext} />
            )}
            {step === 2 && (
              <Step2
                formData={formData}
                update={update}
                onNext={goNext}
                onBack={goBack}
              />
            )}
            {step === 3 && (
              <Step3
                formData={formData}
                update={update}
                onNext={goNext}
                onBack={goBack}
              />
            )}
            {step === 4 && (
              <Step4
                formData={formData}
                onBack={goBack}
                onSubmit={handleSubmit}
                isSubmitting={isSubmitting}
                submitError={submitError}
                goToStep={(s) => {
                  setDirection("back");
                  setStep(s);
                }}
              />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
