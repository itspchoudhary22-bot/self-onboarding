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

const inputCls = "w-full px-4 py-3 rounded-xl border-2 text-slate-800 placeholder-slate-400 text-sm outline-none transition-all duration-200 bg-white";
const textareaCls = "w-full px-4 py-3 rounded-xl border-2 text-slate-800 placeholder-slate-400 text-sm outline-none transition-all duration-200 bg-white resize-none";

export default function Step3Address({ formData, update, onNext, onBack }: Props) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const isCompany = formData.type === "company";

  const validate = () => {
    const e: Record<string, string> = {};
    if (!formData.registeredAddress.trim()) e.registeredAddress = "Registered address is required.";
    if (!formData.pincode.trim()) e.pincode = "Pincode / ZIP is required.";
    if (!formData.mailingAddress.trim()) e.mailingAddress = "Mailing address is required.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = () => { if (validate()) onNext(); };

  const borderStyle = (key: string) => ({
    style: { borderColor: errors[key] ? "#ef4444" : "#e2e8f0" },
    onFocus: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => (e.target.style.borderColor = errors[key] ? "#ef4444" : "#001F3F"),
    onBlur: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => (e.target.style.borderColor = errors[key] ? "#ef4444" : "#e2e8f0"),
  });

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-extrabold" style={{ color: "#001F3F" }}>
          {isCompany ? "Company Address" : "Your Address"}
        </h2>
        <p className="text-slate-500 mt-1 text-sm">
          {isCompany
            ? "Address as provided in the Company Registration Certificate"
            : "Address as provided in your National Identification document"}
        </p>
      </div>

      <div className="space-y-5">
        <div>
          <label className="block text-sm font-semibold mb-1.5" style={{ color: "#001F3F" }}>
            Registered Address <span style={{ color: "#FFA500" }}>*</span>
          </label>
          <textarea
            rows={4}
            placeholder="House No., Building/Locality, Street Name, Town/City, District, State, Pincode, Country"
            value={formData.registeredAddress}
            onChange={e => { update({ registeredAddress: e.target.value }); setErrors(p => ({ ...p, registeredAddress: "" })); }}
            className={textareaCls}
            {...borderStyle("registeredAddress")}
          />
          <p className="text-xs text-slate-400 mt-1.5">Format: House Number, Building/Locality, Street, City, District, State, Pincode, Country</p>
          <FieldError msg={errors.registeredAddress} />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1.5" style={{ color: "#001F3F" }}>
            Pincode / ZIP Code <span style={{ color: "#FFA500" }}>*</span>
          </label>
          <input
            type="text"
            placeholder="e.g. 400001 or 10001"
            value={formData.pincode}
            onChange={e => { update({ pincode: e.target.value }); setErrors(p => ({ ...p, pincode: "" })); }}
            className={inputCls}
            {...borderStyle("pincode")}
          />
          <FieldError msg={errors.pincode} />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1.5" style={{ color: "#001F3F" }}>
            Mailing Address <span style={{ color: "#FFA500" }}>*</span>
          </label>
          <textarea
            rows={3}
            placeholder="Enter mailing address, or type 'Same' if identical to registered address"
            value={formData.mailingAddress}
            onChange={e => { update({ mailingAddress: e.target.value }); setErrors(p => ({ ...p, mailingAddress: "" })); }}
            className={textareaCls}
            {...borderStyle("mailingAddress")}
          />
          <p className="text-xs text-slate-400 mt-1.5">If same as registered address, type &quot;Same&quot;</p>
          <FieldError msg={errors.mailingAddress} />
        </div>
      </div>

      <div className="flex gap-3 mt-7">
        <button onClick={onBack} className="flex-1 py-3.5 rounded-xl font-semibold text-sm border-2 transition-all hover:bg-slate-50" style={{ borderColor: "#e2e8f0", color: "#64748b" }}>← Back</button>
        <button onClick={handleNext} className="flex-[2] py-3.5 rounded-xl font-bold text-sm transition-all hover:opacity-90 active:scale-95" style={{ background: "#001F3F", color: "#fff" }}>Continue →</button>
      </div>
    </div>
  );
}
