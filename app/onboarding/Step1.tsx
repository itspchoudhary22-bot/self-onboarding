"use client";

import { useState } from "react";
import { FormData } from "./page";

interface Props {
  formData: FormData;
  update: (fields: Partial<FormData>) => void;
  onNext: () => void;
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function Step1({ formData, update, onNext }: Props) {
  const [errors, setErrors] = useState<{ email?: string; type?: string }>({});

  const validate = () => {
    const errs: { email?: string; type?: string } = {};
    if (!formData.email) {
      errs.email = "Email address is required.";
    } else if (!isValidEmail(formData.email)) {
      errs.email = "Please enter a valid email address.";
    }
    if (!formData.type) {
      errs.type = "Please select a registration type.";
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
          Welcome to Bytescare
        </h2>
        <p className="text-slate-500 mt-1">
          Let&apos;s start with some basic information to get you set up.
        </p>
      </div>

      {/* Email */}
      <div className="mb-5">
        <label
          className="block text-sm font-semibold mb-1.5"
          style={{ color: "#001F3F" }}
        >
          Email Address <span style={{ color: "#FFA500" }}>*</span>
        </label>
        <input
          type="email"
          placeholder="you@example.com"
          value={formData.email}
          onChange={(e) => {
            update({ email: e.target.value });
            if (errors.email) setErrors((p) => ({ ...p, email: undefined }));
          }}
          className="w-full px-4 py-3 rounded-xl border text-slate-800 placeholder-slate-400 text-sm transition-all duration-200 outline-none"
          style={{
            borderColor: errors.email ? "#ef4444" : "#e2e8f0",
            boxShadow: errors.email
              ? "0 0 0 3px rgba(239,68,68,0.1)"
              : "none",
          }}
          onFocus={(e) =>
            (e.target.style.borderColor = errors.email ? "#ef4444" : "#001F3F")
          }
          onBlur={(e) =>
            (e.target.style.borderColor = errors.email ? "#ef4444" : "#e2e8f0")
          }
        />
        {errors.email && (
          <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
            <span>⚠</span> {errors.email}
          </p>
        )}
      </div>

      {/* Registration Type */}
      <div className="mb-7">
        <label
          className="block text-sm font-semibold mb-2"
          style={{ color: "#001F3F" }}
        >
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
                  boxShadow: selected
                    ? "0 0 0 3px rgba(255,165,0,0.15)"
                    : "none",
                }}
              >
                <span className="text-3xl">
                  {t === "individual" ? "👤" : "🏢"}
                </span>
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

      <button
        onClick={handleNext}
        className="w-full py-3.5 rounded-xl font-bold text-base transition-all duration-200 hover:opacity-90 active:scale-95"
        style={{ background: "#001F3F", color: "#fff" }}
      >
        Continue →
      </button>
    </div>
  );
}
