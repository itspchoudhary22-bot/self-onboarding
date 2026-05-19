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

const textareaCls = "w-full px-4 py-3 rounded-xl border-2 text-slate-800 placeholder-slate-400 text-sm outline-none transition-all duration-200 bg-white resize-none";

export default function Step4Individual({ formData, update, onNext, onBack }: Props) {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!formData.workDescription.trim()) e.workDescription = "Description of work is required.";
    if (!formData.socialMediaHandles.trim()) e.socialMediaHandles = "Social media handles are required.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = () => { if (validate()) onNext(); };

  const borderStyle = (key: string) => ({
    style: { borderColor: errors[key] ? "#ef4444" : "#e2e8f0" },
    onFocus: (e: React.FocusEvent<HTMLTextAreaElement>) => (e.target.style.borderColor = errors[key] ? "#ef4444" : "#001F3F"),
    onBlur: (e: React.FocusEvent<HTMLTextAreaElement>) => (e.target.style.borderColor = errors[key] ? "#ef4444" : "#e2e8f0"),
  });

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-extrabold" style={{ color: "#001F3F" }}>Work &amp; Social Presence</h2>
        <p className="text-slate-500 mt-1 text-sm">Help us understand your work and online presence</p>
      </div>

      <div className="space-y-5">
        <div>
          <label className="block text-sm font-semibold mb-1.5" style={{ color: "#001F3F" }}>
            Nature of Work <span style={{ color: "#FFA500" }}>*</span>
          </label>
          <textarea
            rows={4}
            placeholder="Describe what you do — content creation, photography, music production, writing, etc."
            value={formData.workDescription}
            onChange={e => { update({ workDescription: e.target.value }); setErrors(p => ({ ...p, workDescription: "" })); }}
            className={textareaCls}
            {...borderStyle("workDescription")}
          />
          <FieldError msg={errors.workDescription} />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1.5" style={{ color: "#001F3F" }}>
            Official Social Media Handles <span style={{ color: "#FFA500" }}>*</span>
          </label>
          <textarea
            rows={5}
            placeholder={`Instagram Handle: @yourhandle\nLink: https://instagram.com/yourhandle\n\nYouTube Handle: @yourhandle\nLink: https://youtube.com/yourchannel`}
            value={formData.socialMediaHandles}
            onChange={e => { update({ socialMediaHandles: e.target.value }); setErrors(p => ({ ...p, socialMediaHandles: "" })); }}
            className={textareaCls}
            {...borderStyle("socialMediaHandles")}
          />
          <div className="mt-2 p-3 rounded-lg text-xs text-slate-500" style={{ background: "#f8fafc", border: "1px solid #e2e8f0" }}>
            <p className="font-medium mb-1" style={{ color: "#001F3F" }}>Format example:</p>
            <p>Instagram Handle: @bytescare_official</p>
            <p>Link: https://instagram.com/bytescare_official</p>
          </div>
          <FieldError msg={errors.socialMediaHandles} />
        </div>
      </div>

      <div className="flex gap-3 mt-7">
        <button onClick={onBack} className="flex-1 py-3.5 rounded-xl font-semibold text-sm border-2 transition-all hover:bg-slate-50" style={{ borderColor: "#e2e8f0", color: "#64748b" }}>← Back</button>
        <button onClick={handleNext} className="flex-[2] py-3.5 rounded-xl font-bold text-sm transition-all hover:opacity-90 active:scale-95" style={{ background: "#001F3F", color: "#fff" }}>Continue →</button>
      </div>
    </div>
  );
}
