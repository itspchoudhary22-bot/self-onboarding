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

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return (
    <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
      <span>⚠</span> {msg}
    </p>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 mb-4 mt-6 first:mt-0">
      <span className="text-xs font-bold uppercase tracking-widest text-gray-400">{children}</span>
      <div className="flex-1 h-px bg-gray-100" />
    </div>
  );
}

type Errors = Partial<Record<
  "individualName" | "nationalIdNumber" | "officialEmail" | "designation" | "workDescription" | "socialMediaHandles",
  string
>>;

const inputCls = "w-full px-4 py-3 rounded-xl border-2 text-gray-800 placeholder-gray-400 text-sm transition-all duration-200 outline-none bg-white";
const textareaCls = "w-full px-4 py-3 rounded-xl border-2 text-gray-800 placeholder-gray-400 text-sm transition-all duration-200 outline-none bg-white resize-none";

export default function Step2Individual({ formData, update, onNext, onBack }: Props) {
  const [errors, setErrors] = useState<Errors>({});

  const validate = () => {
    const errs: Errors = {};
    if (!formData.individualName.trim()) errs.individualName = "Full legal name is required.";
    if (!formData.nationalIdNumber.trim()) errs.nationalIdNumber = "National ID number is required.";
    if (!formData.officialEmail.trim()) errs.officialEmail = "Official email is required.";
    else if (!isValidEmail(formData.officialEmail)) errs.officialEmail = "Please enter a valid email address.";
    if (!formData.designation.trim()) errs.designation = "Designation is required.";
    if (!formData.workDescription.trim()) errs.workDescription = "Description of your work is required.";
    if (!formData.socialMediaHandles.trim()) errs.socialMediaHandles = "At least one social media handle or website is required.";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => { if (validate()) onNext(); };

  const bs = (key: keyof Errors) => ({
    style: { borderColor: errors[key] ? "#ef4444" : "#e5e7eb" },
    onFocus: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      (e.target.style.borderColor = errors[key] ? "#ef4444" : "#FFA500"),
    onBlur: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      (e.target.style.borderColor = errors[key] ? "#ef4444" : "#e5e7eb"),
  });

  const clear = (key: keyof Errors) => setErrors((p) => ({ ...p, [key]: undefined }));

  return (
    <div>
      <div className="mb-5">
        <h2 className="text-2xl font-black text-gray-900">Personal Details</h2>
        <p className="text-gray-500 mt-1 text-sm">Your legal information required for documentation</p>
      </div>

      {/* Identity */}
      <SectionLabel>Identity</SectionLabel>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-semibold mb-1.5 text-gray-700">
            Full Legal Name <span style={{ color: "#FFA500" }}>*</span>
          </label>
          <input type="text" placeholder="As on Aadhaar / PAN / Passport"
            value={formData.individualName}
            onChange={e => { update({ individualName: e.target.value }); clear("individualName"); }}
            className={inputCls} {...bs("individualName")} />
          <FieldError msg={errors.individualName} />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1.5 text-gray-700">
            National ID Number <span style={{ color: "#FFA500" }}>*</span>
          </label>
          <input type="text" placeholder="Aadhaar, PAN, Passport number, etc."
            value={formData.nationalIdNumber}
            onChange={e => { update({ nationalIdNumber: e.target.value }); clear("nationalIdNumber"); }}
            className={inputCls} {...bs("nationalIdNumber")} />
          <FieldError msg={errors.nationalIdNumber} />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1.5 text-gray-700">
            Designation <span style={{ color: "#FFA500" }}>*</span>
          </label>
          <input type="text" placeholder="Content Creator, Proprietor, Social Media Influencer, Director..."
            value={formData.designation}
            onChange={e => { update({ designation: e.target.value }); clear("designation"); }}
            className={inputCls} {...bs("designation")} />
          <FieldError msg={errors.designation} />
        </div>
      </div>

      {/* Contact */}
      <SectionLabel>Contact</SectionLabel>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-semibold mb-1.5 text-gray-700">
            Official Email Address <span style={{ color: "#FFA500" }}>*</span>
          </label>
          <input type="email" placeholder="your@email.com"
            value={formData.officialEmail}
            onChange={e => { update({ officialEmail: e.target.value }); clear("officialEmail"); }}
            className={inputCls} {...bs("officialEmail")} />
          <FieldError msg={errors.officialEmail} />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1.5 text-gray-700">
            Contact Number <span className="font-normal text-gray-400">(optional)</span>
          </label>
          <input type="tel" placeholder="+91 98765 43210"
            value={formData.contactNumber}
            onChange={e => update({ contactNumber: e.target.value })}
            className={inputCls}
            style={{ borderColor: "#e5e7eb" }}
            onFocus={e => (e.target.style.borderColor = "#FFA500")}
            onBlur={e => (e.target.style.borderColor = "#e5e7eb")} />
        </div>
      </div>

      {/* Work & Social */}
      <SectionLabel>Work &amp; Online Presence</SectionLabel>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-semibold mb-1.5 text-gray-700">
            Nature of Work <span style={{ color: "#FFA500" }}>*</span>
          </label>
          <textarea rows={3} placeholder="Briefly describe what you do — content creation, photography, music, writing, influencing..."
            value={formData.workDescription}
            onChange={e => { update({ workDescription: e.target.value }); clear("workDescription"); }}
            className={textareaCls} {...bs("workDescription")} />
          <FieldError msg={errors.workDescription} />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1.5 text-gray-700">
            Official Social Media Handles <span style={{ color: "#FFA500" }}>*</span>
          </label>
          <textarea rows={4}
            placeholder={"Instagram Handle: @yourhandle\nLink: https://instagram.com/yourhandle\n\nYouTube: @yourhandle\nLink: https://youtube.com/yourchannel"}
            value={formData.socialMediaHandles}
            onChange={e => { update({ socialMediaHandles: e.target.value }); clear("socialMediaHandles"); }}
            className={textareaCls} {...bs("socialMediaHandles")} />
          <p className="text-xs text-gray-400 mt-1.5">
            Format — Platform Handle: @handle | Link: https://...
          </p>
          <FieldError msg={errors.socialMediaHandles} />
        </div>
      </div>

      <div className="flex gap-3 mt-7">
        <button onClick={onBack}
          className="flex-1 py-3.5 rounded-xl font-semibold text-sm border-2 border-gray-200 text-gray-500 transition-all hover:bg-gray-50">
          ← Back
        </button>
        <button onClick={handleNext}
          className="flex-[2] py-3.5 rounded-xl font-bold text-sm transition-all hover:opacity-90 active:scale-95"
          style={{ background: "#FFA500", color: "#111827" }}>
          Continue →
        </button>
      </div>
    </div>
  );
}
