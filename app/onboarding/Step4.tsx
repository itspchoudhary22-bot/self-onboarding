"use client";

import { FormData } from "./page";

interface Props {
  formData: FormData;
  onBack: () => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  submitError: string;
  goToStep: (step: number) => void;
}

export default function Step4({
  formData,
  onBack,
  onSubmit,
  isSubmitting,
  submitError,
  goToStep,
}: Props) {
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-extrabold" style={{ color: "#001F3F" }}>
          Review Your Details
        </h2>
        <p className="text-slate-500 mt-1">
          Please confirm everything looks correct before submitting.
        </p>
      </div>

      {submitError && (
        <div className="mb-5 flex items-start gap-2 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
          <span className="mt-0.5">⚠</span>
          <span>{submitError}</span>
        </div>
      )}

      {/* Summary cards */}
      <div className="space-y-4 mb-7">
        {/* Basic Info */}
        <div className="rounded-xl border border-slate-200 overflow-hidden">
          <div
            className="flex items-center justify-between px-4 py-3"
            style={{ background: "#f8fafc" }}
          >
            <span
              className="text-xs font-bold uppercase tracking-wider"
              style={{ color: "#001F3F" }}
            >
              Basic Information
            </span>
            <button
              onClick={() => goToStep(1)}
              className="text-xs font-semibold px-3 py-1 rounded-lg transition-colors"
              style={{ color: "#FFA500" }}
            >
              Edit
            </button>
          </div>
          <div className="px-4 py-3 space-y-2">
            <Row label="Email" value={formData.email} />
            <Row
              label="Type"
              value={
                formData.type.charAt(0).toUpperCase() + formData.type.slice(1)
              }
            />
          </div>
        </div>

        {/* Details */}
        <div className="rounded-xl border border-slate-200 overflow-hidden">
          <div
            className="flex items-center justify-between px-4 py-3"
            style={{ background: "#f8fafc" }}
          >
            <span
              className="text-xs font-bold uppercase tracking-wider"
              style={{ color: "#001F3F" }}
            >
              {formData.type === "company" ? "Company" : "Personal"} Details
            </span>
            <button
              onClick={() => goToStep(2)}
              className="text-xs font-semibold px-3 py-1 rounded-lg transition-colors"
              style={{ color: "#FFA500" }}
            >
              Edit
            </button>
          </div>
          <div className="px-4 py-3 space-y-2">
            <Row
              label={formData.type === "company" ? "Company Name" : "Full Name"}
              value={formData.name}
            />
            <Row label="Phone" value={formData.phone || "Not provided"} />
          </div>
        </div>

        {/* Services */}
        <div className="rounded-xl border border-slate-200 overflow-hidden">
          <div
            className="flex items-center justify-between px-4 py-3"
            style={{ background: "#f8fafc" }}
          >
            <span
              className="text-xs font-bold uppercase tracking-wider"
              style={{ color: "#001F3F" }}
            >
              Selected Services ({formData.services.length})
            </span>
            <button
              onClick={() => goToStep(3)}
              className="text-xs font-semibold px-3 py-1 rounded-lg transition-colors"
              style={{ color: "#FFA500" }}
            >
              Edit
            </button>
          </div>
          <div className="px-4 py-3">
            <div className="flex flex-wrap gap-2">
              {formData.services.map((s) => (
                <span
                  key={s}
                  className="text-xs px-3 py-1.5 rounded-full font-medium"
                  style={{ background: "#fff8e6", color: "#001F3F", border: "1px solid rgba(255,165,0,0.3)" }}
                >
                  {s}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Agreement */}
      <p className="text-xs text-slate-400 mb-5 text-center">
        By submitting, you agree to our{" "}
        <span className="underline cursor-pointer" style={{ color: "#001F3F" }}>
          Terms of Service
        </span>{" "}
        and{" "}
        <span className="underline cursor-pointer" style={{ color: "#001F3F" }}>
          Privacy Policy
        </span>
        .
      </p>

      <div className="flex gap-3">
        <button
          onClick={onBack}
          disabled={isSubmitting}
          className="flex-1 py-3.5 rounded-xl font-semibold text-base border-2 transition-all duration-200 hover:bg-slate-50 disabled:opacity-50"
          style={{ borderColor: "#e2e8f0", color: "#64748b" }}
        >
          ← Back
        </button>
        <button
          onClick={onSubmit}
          disabled={isSubmitting}
          className="flex-[2] py-3.5 rounded-xl font-bold text-base transition-all duration-200 hover:opacity-90 active:scale-95 disabled:opacity-70 flex items-center justify-center gap-2"
          style={{ background: "#001F3F", color: "#fff" }}
        >
          {isSubmitting ? (
            <>
              <svg
                className="animate-spin w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              Submitting…
            </>
          ) : (
            "Submit Application ✓"
          )}
        </button>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <span className="text-xs text-slate-400 flex-shrink-0">{label}</span>
      <span className="text-sm font-medium text-slate-700 text-right truncate">
        {value}
      </span>
    </div>
  );
}
