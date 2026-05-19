"use client";
import { useState } from "react";
import { FormData } from "./formTypes";

interface Props {
  formData: FormData;
  update: (f: Partial<FormData>) => void;
  onNext: () => void;
  onBack: () => void;
}

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1"><span>⚠</span>{msg}</p>;
}

function isValidEmail(e: string) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e); }

const inputCls = "w-full px-4 py-3 rounded-xl border-2 text-slate-800 placeholder-slate-400 text-sm outline-none transition-all duration-200 bg-white";
const textareaCls = "w-full px-4 py-3 rounded-xl border-2 text-slate-800 placeholder-slate-400 text-sm outline-none transition-all duration-200 bg-white resize-none";

export default function Step4Company({ formData, update, onNext, onBack }: Props) {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!formData.signatoryName.trim()) e.signatoryName = "Signatory name is required.";
    if (!formData.signatoryDesignation.trim()) e.signatoryDesignation = "Designation is required.";
    if (!formData.signatoryEmail.trim()) e.signatoryEmail = "Email is required.";
    else if (!isValidEmail(formData.signatoryEmail)) e.signatoryEmail = "Enter a valid email address.";
    if (!formData.companySocialMedia.trim()) e.companySocialMedia = "Social media / website is required.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = () => { if (validate()) onNext(); };

  const bs = (key: string) => ({
    style: { borderColor: errors[key] ? "#ef4444" : "#e2e8f0" },
    onFocus: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => (e.target.style.borderColor = errors[key] ? "#ef4444" : "#FFA500"),
    onBlur: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => (e.target.style.borderColor = errors[key] ? "#ef4444" : "#e2e8f0"),
  });

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-extrabold" style={{ color: "#111827" }}>Authorized Signatory</h2>
        <p className="text-slate-500 mt-1 text-sm">Person authorized to sign official documents on behalf of the company</p>
      </div>

      <div className="space-y-5">
        <div>
          <label className="block text-sm font-semibold mb-1.5" style={{ color: "#111827" }}>Name of Authorized Signatory <span style={{ color: "#FFA500" }}>*</span></label>
          <input type="text" placeholder="Full name of the person who will sign" value={formData.signatoryName}
            onChange={e => { update({ signatoryName: e.target.value }); setErrors(p => ({ ...p, signatoryName: "" })); }}
            className={inputCls} {...bs("signatoryName")} />
          <p className="text-xs text-slate-400 mt-1.5">This person will sign the Authorisation Letter and Service Agreement</p>
          <FieldError msg={errors.signatoryName} />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1.5" style={{ color: "#111827" }}>Designation <span style={{ color: "#FFA500" }}>*</span></label>
          <input type="text" placeholder="e.g. CEO, Director, Managing Director" value={formData.signatoryDesignation}
            onChange={e => { update({ signatoryDesignation: e.target.value }); setErrors(p => ({ ...p, signatoryDesignation: "" })); }}
            className={inputCls} {...bs("signatoryDesignation")} />
          <FieldError msg={errors.signatoryDesignation} />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1.5" style={{ color: "#111827" }}>Official Email Address <span style={{ color: "#FFA500" }}>*</span></label>
          <input type="email" placeholder="signatory@company.com" value={formData.signatoryEmail}
            onChange={e => { update({ signatoryEmail: e.target.value }); setErrors(p => ({ ...p, signatoryEmail: "" })); }}
            className={inputCls} {...bs("signatoryEmail")} />
          <FieldError msg={errors.signatoryEmail} />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1.5" style={{ color: "#111827" }}>Social Media / Website <span style={{ color: "#FFA500" }}>*</span></label>
          <textarea rows={4}
            placeholder={`Instagram Handle: @yourcompany\nLink: https://instagram.com/yourcompany\n\nWebsite: https://yourcompany.com`}
            value={formData.companySocialMedia}
            onChange={e => { update({ companySocialMedia: e.target.value }); setErrors(p => ({ ...p, companySocialMedia: "" })); }}
            className={textareaCls} {...bs("companySocialMedia")} />
          <FieldError msg={errors.companySocialMedia} />
        </div>
      </div>

      <div className="flex gap-3 mt-7">
        <button onClick={onBack} className="flex-1 py-3.5 rounded-xl font-semibold text-sm border-2 transition-all hover:bg-slate-50" style={{ borderColor: "#e2e8f0", color: "#64748b" }}>← Back</button>
        <button onClick={handleNext} className="flex-[2] py-3.5 rounded-xl font-bold text-sm transition-all hover:opacity-90 active:scale-95" style={{ background: "#FFA500", color: "#111827" }}>Continue →</button>
      </div>
    </div>
  );
}
