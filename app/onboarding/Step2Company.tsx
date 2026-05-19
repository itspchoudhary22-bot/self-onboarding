"use client";

import { useState } from "react";
import { FormData } from "./formTypes";

interface Props {
  formData: FormData;
  update: (fields: Partial<FormData>) => void;
  onNext: () => void;
  onBack: () => void;
}

function InputField({
  label,
  required,
  error,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-semibold mb-1.5" style={{ color: "#001F3F" }}>
        {label} {required && <span style={{ color: "#FFA500" }}>*</span>}
      </label>
      {children}
      {hint && !error && <p className="text-xs text-slate-400 mt-1.5">{hint}</p>}
      {error && (
        <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
          <span>⚠</span> {error}
        </p>
      )}
    </div>
  );
}

type Errors = {
  companyName?: string;
  companyRegNumber?: string;
  gstin?: string;
  companyDescription?: string;
};

export default function Step2Company({ formData, update, onNext, onBack }: Props) {
  const [errors, setErrors] = useState<Errors>({});

  const validate = () => {
    const errs: Errors = {};
    if (!formData.companyName.trim()) errs.companyName = "Company name is required.";
    if (!formData.companyRegNumber.trim()) errs.companyRegNumber = "Registration number is required.";
    if (!formData.gstin.trim()) errs.gstin = "GSTIN is required (type NA if not applicable).";
    if (!formData.companyDescription.trim()) errs.companyDescription = "Nature of business is required.";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    if (validate()) onNext();
  };

  const inputBase =
    "w-full px-4 py-3 rounded-xl border-2 text-slate-800 placeholder-slate-400 text-sm transition-all duration-200 outline-none bg-white";

  const fieldStyle = (key: keyof Errors) => ({
    borderColor: errors[key] ? "#ef4444" : "#e2e8f0",
    boxShadow: errors[key] ? "0 0 0 3px rgba(239,68,68,0.1)" : "none",
  });

  const clearError = (key: keyof Errors) => setErrors((p) => ({ ...p, [key]: undefined }));

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-extrabold" style={{ color: "#001F3F" }}>
          Company Details
        </h2>
        <p className="text-slate-500 mt-1">Your company&apos;s official information</p>
      </div>

      <div className="space-y-5 mb-7">
        <InputField label="Company / Entity Name" required error={errors.companyName}>
          <input
            type="text"
            placeholder="Full legal name as per registration certificate"
            value={formData.companyName}
            onChange={(e) => { update({ companyName: e.target.value }); clearError("companyName"); }}
            className={inputBase}
            style={fieldStyle("companyName")}
            onFocus={(e) => (e.target.style.borderColor = errors.companyName ? "#ef4444" : "#001F3F")}
            onBlur={(e) => (e.target.style.borderColor = errors.companyName ? "#ef4444" : "#e2e8f0")}
          />
        </InputField>

        <InputField
          label="Company Registration Number"
          required
          error={errors.companyRegNumber}
          hint="Please include the type (e.g. CIN: U12345...)"
        >
          <input
            type="text"
            placeholder="CIN, CRN, ACN, etc."
            value={formData.companyRegNumber}
            onChange={(e) => { update({ companyRegNumber: e.target.value }); clearError("companyRegNumber"); }}
            className={inputBase}
            style={fieldStyle("companyRegNumber")}
            onFocus={(e) => (e.target.style.borderColor = errors.companyRegNumber ? "#ef4444" : "#001F3F")}
            onBlur={(e) => (e.target.style.borderColor = errors.companyRegNumber ? "#ef4444" : "#e2e8f0")}
          />
        </InputField>

        <InputField
          label="GSTIN"
          required
          error={errors.gstin}
          hint="Type 'NA' if country is not India or GST is not registered"
        >
          <input
            type="text"
            placeholder="Enter GSTIN or type NA"
            value={formData.gstin}
            onChange={(e) => { update({ gstin: e.target.value }); clearError("gstin"); }}
            className={inputBase}
            style={fieldStyle("gstin")}
            onFocus={(e) => (e.target.style.borderColor = errors.gstin ? "#ef4444" : "#001F3F")}
            onBlur={(e) => (e.target.style.borderColor = errors.gstin ? "#ef4444" : "#e2e8f0")}
          />
        </InputField>

        <InputField label="Contact Information" hint="We'll only use this to contact you about your account.">
          <input
            type="text"
            placeholder="Phone number or contact details"
            value={formData.companyContact}
            onChange={(e) => update({ companyContact: e.target.value })}
            className={inputBase}
            style={{ borderColor: "#e2e8f0" }}
            onFocus={(e) => (e.target.style.borderColor = "#001F3F")}
            onBlur={(e) => (e.target.style.borderColor = "#e2e8f0")}
          />
        </InputField>

        <InputField label="Nature of Business" required error={errors.companyDescription}>
          <textarea
            rows={3}
            placeholder="Brief description of your company's work..."
            value={formData.companyDescription}
            onChange={(e) => { update({ companyDescription: e.target.value }); clearError("companyDescription"); }}
            className={inputBase}
            style={fieldStyle("companyDescription")}
            onFocus={(e) => (e.target.style.borderColor = errors.companyDescription ? "#ef4444" : "#001F3F")}
            onBlur={(e) => (e.target.style.borderColor = errors.companyDescription ? "#ef4444" : "#e2e8f0")}
          />
        </InputField>
      </div>

      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="flex-1 py-3.5 rounded-xl font-semibold text-base border-2 transition-all duration-200 hover:bg-slate-50"
          style={{ borderColor: "#e2e8f0", color: "#64748b" }}
        >
          ← Back
        </button>
        <button
          onClick={handleNext}
          className="flex-[2] py-3.5 rounded-xl font-bold text-base transition-all duration-200 hover:opacity-90 active:scale-95"
          style={{ background: "#001F3F", color: "#fff" }}
        >
          Continue →
        </button>
      </div>
    </div>
  );
}
