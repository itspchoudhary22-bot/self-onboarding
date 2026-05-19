"use client";

import { useState } from "react";
import { FormData } from "./page";

interface Props {
  formData: FormData;
  update: (fields: Partial<FormData>) => void;
  onNext: () => void;
  onBack: () => void;
}

function isValidPhone(phone: string) {
  return /^[\+]?[\d\s\-\(\)]{7,15}$/.test(phone);
}

export default function Step2({ formData, update, onNext, onBack }: Props) {
  const [errors, setErrors] = useState<{ name?: string; phone?: string }>({});

  const isCompany = formData.type === "company";
  const nameLabel = isCompany ? "Company Name" : "Full Name";
  const namePlaceholder = isCompany
    ? "Acme Corporation"
    : "Jane Smith";

  const validate = () => {
    const errs: { name?: string; phone?: string } = {};
    if (!formData.name.trim()) {
      errs.name = `${nameLabel} is required.`;
    }
    if (formData.phone && !isValidPhone(formData.phone)) {
      errs.phone = "Please enter a valid phone number.";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    if (validate()) onNext();
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-extrabold" style={{ color: "#001F3F" }}>
          {isCompany ? "Company Details" : "Personal Details"}
        </h2>
        <p className="text-slate-500 mt-1">
          Tell us a bit more about{" "}
          {isCompany ? "your company" : "yourself"}.
        </p>
      </div>

      {/* Name */}
      <div className="mb-5">
        <label
          className="block text-sm font-semibold mb-1.5"
          style={{ color: "#001F3F" }}
        >
          {nameLabel} <span style={{ color: "#FFA500" }}>*</span>
        </label>
        <input
          type="text"
          placeholder={namePlaceholder}
          value={formData.name}
          onChange={(e) => {
            update({ name: e.target.value });
            if (errors.name) setErrors((p) => ({ ...p, name: undefined }));
          }}
          className="w-full px-4 py-3 rounded-xl border text-slate-800 placeholder-slate-400 text-sm transition-all duration-200 outline-none"
          style={{
            borderColor: errors.name ? "#ef4444" : "#e2e8f0",
            boxShadow: errors.name
              ? "0 0 0 3px rgba(239,68,68,0.1)"
              : "none",
          }}
          onFocus={(e) =>
            (e.target.style.borderColor = errors.name ? "#ef4444" : "#001F3F")
          }
          onBlur={(e) =>
            (e.target.style.borderColor = errors.name ? "#ef4444" : "#e2e8f0")
          }
        />
        {errors.name && (
          <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
            <span>⚠</span> {errors.name}
          </p>
        )}
      </div>

      {/* Phone */}
      <div className="mb-7">
        <label
          className="block text-sm font-semibold mb-1.5"
          style={{ color: "#001F3F" }}
        >
          Phone Number{" "}
          <span className="text-slate-400 font-normal">(optional)</span>
        </label>
        <input
          type="tel"
          placeholder="+1 (555) 000-0000"
          value={formData.phone}
          onChange={(e) => {
            update({ phone: e.target.value });
            if (errors.phone) setErrors((p) => ({ ...p, phone: undefined }));
          }}
          className="w-full px-4 py-3 rounded-xl border text-slate-800 placeholder-slate-400 text-sm transition-all duration-200 outline-none"
          style={{
            borderColor: errors.phone ? "#ef4444" : "#e2e8f0",
            boxShadow: errors.phone
              ? "0 0 0 3px rgba(239,68,68,0.1)"
              : "none",
          }}
          onFocus={(e) =>
            (e.target.style.borderColor = errors.phone ? "#ef4444" : "#001F3F")
          }
          onBlur={(e) =>
            (e.target.style.borderColor = errors.phone ? "#ef4444" : "#e2e8f0")
          }
        />
        {errors.phone && (
          <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
            <span>⚠</span> {errors.phone}
          </p>
        )}
        <p className="text-xs text-slate-400 mt-1.5">
          We&apos;ll only use this to contact you about your account.
        </p>
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
