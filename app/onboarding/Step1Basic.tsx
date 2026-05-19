"use client";

import { useState } from "react";
import { FormData } from "./formTypes";
import { COUNTRIES } from "@/lib/countries";

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
      <label className="block text-sm font-semibold mb-1.5" style={{ color: "#111827" }}>
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

export default function Step1Basic({ formData, update, onNext }: Props) {
  const [errors, setErrors] = useState<{ email?: string; type?: string; country?: string }>({});

  const validate = () => {
    const errs: { email?: string; type?: string; country?: string } = {};
    if (!formData.email) {
      errs.email = "Email address is required.";
    } else if (!isValidEmail(formData.email)) {
      errs.email = "Please enter a valid email address.";
    }
    if (!formData.type) {
      errs.type = "Please select a registration type.";
    }
    if (!formData.country) {
      errs.country = "Please select your country.";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    if (validate()) onNext();
  };

  const inputBase =
    "w-full px-4 py-3 rounded-xl border-2 text-slate-800 placeholder-slate-400 text-sm transition-all duration-200 outline-none bg-white";

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-extrabold" style={{ color: "#111827" }}>
          Let&apos;s get started
        </h2>
        <p className="text-slate-500 mt-1">Basic information to set up your account</p>
      </div>

      <div className="space-y-5 mb-7">
        {/* Email */}
        <InputField label="Email Address" required error={errors.email}>
          <input
            type="email"
            placeholder="you@example.com"
            value={formData.email}
            onChange={(e) => {
              update({ email: e.target.value });
              if (errors.email) setErrors((p) => ({ ...p, email: undefined }));
            }}
            className={inputBase}
            style={{
              borderColor: errors.email ? "#ef4444" : "#e2e8f0",
              boxShadow: errors.email ? "0 0 0 3px rgba(239,68,68,0.1)" : "none",
            }}
            onFocus={(e) => (e.target.style.borderColor = errors.email ? "#ef4444" : "#001F3F")}
            onBlur={(e) => (e.target.style.borderColor = errors.email ? "#ef4444" : "#e2e8f0")}
          />
        </InputField>

        {/* Registration Type */}
        <div>
          <label className="block text-sm font-semibold mb-2" style={{ color: "#111827" }}>
            Registration Type <span style={{ color: "#FFA500" }}>*</span>
          </label>
          <div className="grid grid-cols-2 gap-3">
            {(["individual", "company"] as const).map((t) => {
              const selected = formData.type === t;
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => {
                    update({ type: t });
                    if (errors.type) setErrors((p) => ({ ...p, type: undefined }));
                  }}
                  className="flex flex-col items-center gap-2 py-5 px-4 rounded-xl border-2 font-semibold text-sm transition-all duration-200 cursor-pointer"
                  style={{
                    borderColor: selected ? "#FFA500" : "#e2e8f0",
                    background: selected ? "#fff8e6" : "#fff",
                    color: selected ? "#001F3F" : "#64748b",
                    boxShadow: selected ? "0 0 0 3px rgba(255,165,0,0.15)" : "none",
                  }}
                >
                  <span className="text-3xl">{t === "individual" ? "👤" : "🏢"}</span>
                  <span className="capitalize">{t}</span>
                  {selected && (
                    <span
                      className="text-xs px-2 py-0.5 rounded-full"
                      style={{ background: "#FFA500", color: "#fff" }}
                    >
                      Selected
                    </span>
                  )}
                </button>
              );
            })}
          </div>
          {errors.type && (
            <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
              <span>⚠</span> {errors.type}
            </p>
          )}
        </div>

        {/* Country */}
        <InputField label="Country" required error={errors.country}>
          <select
            value={formData.country}
            onChange={(e) => {
              update({ country: e.target.value });
              if (errors.country) setErrors((p) => ({ ...p, country: undefined }));
            }}
            className={inputBase}
            style={{
              borderColor: errors.country ? "#ef4444" : "#e2e8f0",
              boxShadow: errors.country ? "0 0 0 3px rgba(239,68,68,0.1)" : "none",
            }}
            onFocus={(e) =>
              (e.target.style.borderColor = errors.country ? "#ef4444" : "#001F3F")
            }
            onBlur={(e) =>
              (e.target.style.borderColor = errors.country ? "#ef4444" : "#e2e8f0")
            }
          >
            <option value="">Select your country</option>
            {COUNTRIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </InputField>
      </div>

      <button
        onClick={handleNext}
        className="w-full py-3.5 rounded-xl font-bold text-base transition-all duration-200 hover:opacity-90 active:scale-95"
        style={{ background: "#FFA500", color: "#111827" }}
      >
        Continue →
      </button>
    </div>
  );
}
