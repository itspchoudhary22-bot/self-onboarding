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

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return (
    <p className="text-xs mt-1.5 flex items-center gap-1" style={{ color: "#ef4444" }}>
      <span>⚠</span> {msg}
    </p>
  );
}

const inputCls = "w-full px-4 py-3.5 rounded-xl border-2 text-sm transition-all duration-200 outline-none bg-white";
const inputStyle = (err?: string) => ({ borderColor: err ? "#ef4444" : "#e5e7eb", color: "#111827" });
const focusAmber = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>, err?: string) =>
  (e.target.style.borderColor = err ? "#ef4444" : "#FFA500");
const blurGray = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>, err?: string) =>
  (e.target.style.borderColor = err ? "#ef4444" : "#e5e7eb");

export default function Step1Basic({ formData, update, onNext }: Props) {
  const [errors, setErrors] = useState<{ email?: string; type?: string; country?: string }>({});

  const validate = () => {
    const errs: typeof errors = {};
    if (!formData.email) errs.email = "Email address is required.";
    else if (!isValidEmail(formData.email)) errs.email = "Please enter a valid email address.";
    if (!formData.type) errs.type = "Please select a registration type.";
    if (!formData.country) errs.country = "Please select your country.";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const clr = (k: keyof typeof errors) => setErrors((p) => ({ ...p, [k]: undefined }));

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl sm:text-3xl font-black tracking-tight mb-2" style={{ color: "#111827", letterSpacing: "-0.02em" }}>
          Let&apos;s get started
        </h2>
        <p className="text-sm sm:text-base" style={{ color: "#9ca3af" }}>
          Enter your basic information to begin your onboarding journey.
        </p>
      </div>

      <div className="flex flex-col gap-6 mb-8">
        {/* Email */}
        <div>
          <label className="block text-sm font-semibold mb-2" style={{ color: "#374151" }}>
            Email Address <span style={{ color: "#FFA500" }}>*</span>
          </label>
          <input
            type="email"
            placeholder="your@email.com"
            value={formData.email}
            onChange={(e) => { update({ email: e.target.value }); clr("email"); }}
            className={inputCls}
            style={inputStyle(errors.email)}
            onFocus={(e) => focusAmber(e, errors.email)}
            onBlur={(e) => blurGray(e, errors.email)}
          />
          {errors.email
            ? <FieldError msg={errors.email} />
            : <p className="text-xs mt-1.5" style={{ color: "#9ca3af" }}>We&apos;ll send your confirmation and documents here.</p>
          }
        </div>

        {/* Registration Type */}
        <div>
          <label className="block text-sm font-semibold mb-3" style={{ color: "#374151" }}>
            Registration Type <span style={{ color: "#FFA500" }}>*</span>
          </label>
          <div className="grid grid-cols-2 gap-4">
            {(["individual", "company"] as const).map((t) => {
              const sel = formData.type === t;
              return (
                <button key={t} type="button"
                  onClick={() => { update({ type: t }); clr("type"); }}
                  className="relative flex flex-col items-center gap-3 py-6 px-4 rounded-2xl border-2 font-semibold text-sm transition-all duration-200 cursor-pointer"
                  style={{
                    borderColor: sel ? "#FFA500" : "#e5e7eb",
                    background: sel ? "linear-gradient(135deg, #fffbeb, #fff8e6)" : "#fff",
                    color: sel ? "#111827" : "#6b7280",
                    boxShadow: sel ? "0 0 0 4px rgba(255,165,0,0.12)" : "none",
                  }}>
                  {sel && (
                    <div className="absolute top-3 right-3 w-5 h-5 rounded-full flex items-center justify-center"
                      style={{ background: "#FFA500" }}>
                      <svg width="10" height="10" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={3.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                  <span className="text-4xl">{t === "individual" ? "👤" : "🏢"}</span>
                  <div className="text-center">
                    <p className="font-bold text-sm capitalize" style={{ color: sel ? "#111827" : "#374151" }}>{t}</p>
                    <p className="text-xs mt-0.5" style={{ color: "#9ca3af" }}>
                      {t === "individual" ? "Creator, freelancer" : "Business, brand"}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
          <FieldError msg={errors.type} />
        </div>

        {/* Country */}
        <div>
          <label className="block text-sm font-semibold mb-2" style={{ color: "#374151" }}>
            Country <span style={{ color: "#FFA500" }}>*</span>
          </label>
          <select
            value={formData.country}
            onChange={(e) => { update({ country: e.target.value }); clr("country"); }}
            className={inputCls}
            style={{ ...inputStyle(errors.country), cursor: "pointer" }}
            onFocus={(e) => focusAmber(e, errors.country)}
            onBlur={(e) => blurGray(e, errors.country)}
          >
            <option value="">Select your country</option>
            {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <FieldError msg={errors.country} />
        </div>
      </div>

      <button
        onClick={() => { if (validate()) onNext(); }}
        className="w-full py-4 rounded-2xl font-extrabold text-base transition-all duration-200 hover:opacity-90 active:scale-95"
        style={{ background: "#FFA500", color: "#111827", boxShadow: "0 4px 14px rgba(255,165,0,0.3)" }}>
        Continue →
      </button>
    </div>
  );
}
