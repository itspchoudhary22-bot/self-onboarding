"use client";

import { useState } from "react";
import { FormData } from "./formTypes";

interface Props {
  formData: FormData;
  update: (fields: Partial<FormData>) => void;
  onNext: () => void;
  onBack: () => void;
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
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
  individualName?: string;
  nationalIdNumber?: string;
  officialEmail?: string;
  designation?: string;
};

export default function Step2Individual({ formData, update, onNext, onBack }: Props) {
  const [errors, setErrors] = useState<Errors>({});

  const validate = () => {
    const errs: Errors = {};
    if (!formData.individualName.trim()) errs.individualName = "Full legal name is required.";
    if (!formData.nationalIdNumber.trim()) errs.nationalIdNumber = "National ID number is required.";
    if (!formData.officialEmail.trim()) {
      errs.officialEmail = "Official email is required.";
    } else if (!isValidEmail(formData.officialEmail)) {
      errs.officialEmail = "Please enter a valid email address.";
    }
    if (!formData.designation.trim()) errs.designation = "Designation is required.";
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

  const onFocus = (key: keyof Errors) => (e: React.FocusEvent<HTMLInputElement>) =>
    (e.target.style.borderColor = errors[key] ? "#ef4444" : "#001F3F");
  const onBlur = (key: keyof Errors) => (e: React.FocusEvent<HTMLInputElement>) =>
    (e.target.style.borderColor = errors[key] ? "#ef4444" : "#e2e8f0");

  const clearError = (key: keyof Errors) => setErrors((p) => ({ ...p, [key]: undefined }));

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-extrabold" style={{ color: "#001F3F" }}>
          Personal Details
        </h2>
        <p className="text-slate-500 mt-1">Your legal information for documentation</p>
      </div>

      <div className="space-y-5 mb-7">
        <InputField label="Full Legal Name" required error={errors.individualName}>
          <input
            type="text"
            placeholder="As on Aadhaar / PAN / Passport"
            value={formData.individualName}
            onChange={(e) => { update({ individualName: e.target.value }); clearError("individualName"); }}
            className={inputBase}
            style={fieldStyle("individualName")}
            onFocus={onFocus("individualName")}
            onBlur={onBlur("individualName")}
          />
        </InputField>

        <InputField label="National ID Number" required error={errors.nationalIdNumber}>
          <input
            type="text"
            placeholder="Aadhaar, PAN, etc."
            value={formData.nationalIdNumber}
            onChange={(e) => { update({ nationalIdNumber: e.target.value }); clearError("nationalIdNumber"); }}
            className={inputBase}
            style={fieldStyle("nationalIdNumber")}
            onFocus={onFocus("nationalIdNumber")}
            onBlur={onBlur("nationalIdNumber")}
          />
        </InputField>

        <InputField label="Contact Number" hint="We'll only use this to contact you about your account.">
          <input
            type="tel"
            placeholder="+91 98765 43210"
            value={formData.contactNumber}
            onChange={(e) => update({ contactNumber: e.target.value })}
            className={inputBase}
            style={{ borderColor: "#e2e8f0" }}
            onFocus={(e) => (e.target.style.borderColor = "#001F3F")}
            onBlur={(e) => (e.target.style.borderColor = "#e2e8f0")}
          />
        </InputField>

        <InputField label="Official Email Address" required error={errors.officialEmail}>
          <input
            type="email"
            placeholder="your@email.com"
            value={formData.officialEmail}
            onChange={(e) => { update({ officialEmail: e.target.value }); clearError("officialEmail"); }}
            className={inputBase}
            style={fieldStyle("officialEmail")}
            onFocus={onFocus("officialEmail")}
            onBlur={onBlur("officialEmail")}
          />
        </InputField>

        <InputField label="Designation" required error={errors.designation}>
          <input
            type="text"
            placeholder="Content Creator, Proprietor, Director, etc."
            value={formData.designation}
            onChange={(e) => { update({ designation: e.target.value }); clearError("designation"); }}
            className={inputBase}
            style={fieldStyle("designation")}
            onFocus={onFocus("designation")}
            onBlur={onBlur("designation")}
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
