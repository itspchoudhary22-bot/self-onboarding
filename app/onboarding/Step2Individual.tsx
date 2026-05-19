"use client";
import { useState, useRef } from "react";
import { FormData } from "./formTypes";

interface Props {
  formData: FormData;
  update: (fields: Partial<FormData>) => void;
  onNext: () => void;
  onBack: () => void;
}

function SectionDivider({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 mt-8 mb-5">
      <span className="text-xs font-bold uppercase tracking-widest flex-shrink-0" style={{ color: "#9ca3af" }}>{children}</span>
      <div className="flex-1" style={{ height: 1, background: "#f0f0f0" }} />
    </div>
  );
}

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return <p className="text-xs mt-1.5 flex items-center gap-1" style={{ color: "#ef4444" }}><span>⚠</span> {msg}</p>;
}

function FieldHint({ children }: { children: React.ReactNode }) {
  return <p className="text-xs mt-1.5" style={{ color: "#9ca3af" }}>{children}</p>;
}

interface FileUploadProps {
  label: string;
  required?: boolean;
  fileBase64: string;
  fileName: string;
  onChange: (base64: string, name: string) => void;
  error?: string;
}

function FileUpload({ label, required, fileBase64, fileName, onChange, error }: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => onChange(reader.result as string, file.name);
    reader.readAsDataURL(file);
  };
  return (
    <div>
      <label className="block text-sm font-semibold mb-2" style={{ color: "#374151" }}>
        {label} {required && <span style={{ color: "#FFA500" }}>*</span>}
      </label>
      {fileBase64 ? (
        <div className="flex items-center gap-3 px-4 py-4 rounded-2xl" style={{ border: "2px solid #86efac", background: "#f0fdf4" }}>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "#22c55e" }}>
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate" style={{ color: "#166534" }}>{fileName}</p>
            <p className="text-xs" style={{ color: "#4ade80" }}>Uploaded successfully</p>
          </div>
          <button type="button" onClick={() => { onChange("", ""); if (inputRef.current) inputRef.current.value = ""; }}
            className="text-xs font-semibold flex-shrink-0 px-3 py-1.5 rounded-lg transition-all hover:bg-red-50"
            style={{ color: "#ef4444" }}>Remove</button>
        </div>
      ) : (
        <button type="button" onClick={() => inputRef.current?.click()}
          className="w-full flex flex-col items-center gap-2 px-4 py-7 rounded-2xl border-2 border-dashed transition-all hover:bg-amber-50"
          style={{ borderColor: error ? "#ef4444" : "#e5e7eb" }}
          onMouseEnter={(e) => { if (!error) (e.currentTarget as HTMLElement).style.borderColor = "#FFA500"; }}
          onMouseLeave={(e) => { if (!error) (e.currentTarget as HTMLElement).style.borderColor = "#e5e7eb"; }}>
          <span className="text-3xl">📎</span>
          <span className="text-sm font-semibold" style={{ color: "#374151" }}>
            Drop file here or <span style={{ color: "#FFA500" }}>Browse files</span>
          </span>
          <span className="text-xs" style={{ color: "#9ca3af" }}>PDF or image accepted</span>
        </button>
      )}
      <input ref={inputRef} type="file" accept="application/pdf,image/*" onChange={handleFile} className="hidden" />
      {error && <FieldError msg={error} />}
    </div>
  );
}

type EK = "individualName"|"nationalIdNumber"|"idProof"|"registeredAddress"|"pincode"|"mailingAddress"|"officialEmail"|"designation"|"workDescription"|"socialMediaHandles";
type Errors = Partial<Record<EK, string>>;

const inp = "w-full px-4 py-3.5 rounded-xl border-2 text-sm transition-all duration-200 outline-none bg-white";
const tea = "w-full px-4 py-3.5 rounded-xl border-2 text-sm transition-all duration-200 outline-none bg-white resize-none";
const bs = (err?: string) => ({ style: { borderColor: err ? "#ef4444" : "#e5e7eb", color: "#111827" } });
const fo = (err?: string) => ({
  onFocus: (e: React.FocusEvent<HTMLInputElement|HTMLTextAreaElement>) => (e.target.style.borderColor = err ? "#ef4444" : "#FFA500"),
  onBlur: (e: React.FocusEvent<HTMLInputElement|HTMLTextAreaElement>) => (e.target.style.borderColor = err ? "#ef4444" : "#e5e7eb"),
});

export default function Step2Individual({ formData, update, onNext, onBack }: Props) {
  const [errors, setErrors] = useState<Errors>({});

  const validate = (): boolean => {
    const errs: Errors = {};
    if (!formData.individualName.trim()) errs.individualName = "Full legal name is required.";
    if (!formData.nationalIdNumber.trim()) errs.nationalIdNumber = "National ID number is required.";
    if (!formData.idProofBase64) errs.idProof = "Please upload your National ID proof.";
    if (!formData.registeredAddress.trim()) errs.registeredAddress = "Registered address is required.";
    if (!formData.pincode.trim()) errs.pincode = "Pincode / ZIP is required.";
    if (!formData.mailingAddress.trim()) errs.mailingAddress = "Mailing address is required.";
    if (!formData.officialEmail.trim()) errs.officialEmail = "Official email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.officialEmail)) errs.officialEmail = "Please enter a valid email.";
    if (!formData.designation.trim()) errs.designation = "Designation is required.";
    if (!formData.workDescription.trim()) errs.workDescription = "Nature of work is required.";
    if (!formData.socialMediaHandles.trim()) errs.socialMediaHandles = "At least one social media handle or website is required.";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const clr = (k: EK) => setErrors((p) => ({ ...p, [k]: undefined }));

  return (
    <div>
      <div className="mb-7">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold mb-4"
          style={{ background: "#fff8e6", color: "#92400e" }}>
          <span>👤</span> Individual
        </div>
        <h2 className="text-2xl sm:text-3xl font-black tracking-tight mb-2" style={{ color: "#111827", letterSpacing: "-0.02em" }}>
          Personal Details
        </h2>
        <p className="text-sm sm:text-base" style={{ color: "#9ca3af" }}>Your legal information required for documentation.</p>
      </div>

      {/* Identity & Legal */}
      <SectionDivider>Identity &amp; Legal</SectionDivider>
      <div className="flex flex-col gap-5">
        <div>
          <label className="block text-sm font-semibold mb-2" style={{ color: "#374151" }}>Full Legal Name <span style={{ color: "#FFA500" }}>*</span></label>
          <input type="text" placeholder="As on Aadhaar / PAN / Passport" value={formData.individualName}
            onChange={(e) => { update({ individualName: e.target.value }); clr("individualName"); }}
            className={inp} {...bs(errors.individualName)} {...fo(errors.individualName)} />
          <FieldError msg={errors.individualName} />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2" style={{ color: "#374151" }}>National ID Number <span style={{ color: "#FFA500" }}>*</span></label>
          <input type="text" placeholder="Aadhaar, PAN, Passport No." value={formData.nationalIdNumber}
            onChange={(e) => { update({ nationalIdNumber: e.target.value }); clr("nationalIdNumber"); }}
            className={inp} {...bs(errors.nationalIdNumber)} {...fo(errors.nationalIdNumber)} />
          <FieldError msg={errors.nationalIdNumber} />
        </div>

        <FileUpload label="Upload National ID Proof" required
          fileBase64={formData.idProofBase64} fileName={formData.idProofName}
          onChange={(b, n) => { update({ idProofBase64: b, idProofName: n }); clr("idProof"); }}
          error={errors.idProof} />
      </div>

      {/* Contact & Address */}
      <SectionDivider>Contact &amp; Address</SectionDivider>
      <div className="flex flex-col gap-5">
        <div>
          <label className="block text-sm font-semibold mb-2" style={{ color: "#374151" }}>
            Contact Number <span className="font-normal" style={{ color: "#9ca3af" }}>(optional)</span>
          </label>
          <input type="tel" placeholder="+91 98765 43210" value={formData.contactNumber}
            onChange={(e) => update({ contactNumber: e.target.value })}
            className={inp} style={{ borderColor: "#e5e7eb", color: "#111827" }}
            onFocus={(e) => (e.target.style.borderColor = "#FFA500")}
            onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")} />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2" style={{ color: "#374151" }}>Registered Address <span style={{ color: "#FFA500" }}>*</span></label>
          <textarea rows={3} placeholder="House No., Building, Street, City, District, State, Pincode, Country"
            value={formData.registeredAddress}
            onChange={(e) => { update({ registeredAddress: e.target.value }); clr("registeredAddress"); }}
            className={tea} {...bs(errors.registeredAddress)} {...fo(errors.registeredAddress)} />
          <FieldHint>Format: House No., Building, Street, City, District, State, Pincode, Country</FieldHint>
          <FieldError msg={errors.registeredAddress} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: "#374151" }}>Pincode / ZIP <span style={{ color: "#FFA500" }}>*</span></label>
            <input type="text" placeholder="110001" value={formData.pincode}
              onChange={(e) => { update({ pincode: e.target.value }); clr("pincode"); }}
              className={inp} {...bs(errors.pincode)} {...fo(errors.pincode)} />
            <FieldError msg={errors.pincode} />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: "#374151" }}>City</label>
            <input type="text" placeholder="Mumbai" value=""
              onChange={() => {}}
              className={inp} style={{ borderColor: "#e5e7eb", color: "#111827" }}
              onFocus={(e) => (e.target.style.borderColor = "#FFA500")}
              onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")} />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2" style={{ color: "#374151" }}>Mailing Address <span style={{ color: "#FFA500" }}>*</span></label>
          <textarea rows={2} placeholder="Type 'Same' if identical to registered address"
            value={formData.mailingAddress}
            onChange={(e) => { update({ mailingAddress: e.target.value }); clr("mailingAddress"); }}
            className={tea} {...bs(errors.mailingAddress)} {...fo(errors.mailingAddress)} />
          <FieldHint>Type &apos;Same&apos; if identical to registered address</FieldHint>
          <FieldError msg={errors.mailingAddress} />
        </div>
      </div>

      {/* Professional Information */}
      <SectionDivider>Professional Information</SectionDivider>
      <div className="flex flex-col gap-5">
        <div>
          <label className="block text-sm font-semibold mb-2" style={{ color: "#374151" }}>Official Email Address <span style={{ color: "#FFA500" }}>*</span></label>
          <input type="email" placeholder="your@email.com" value={formData.officialEmail}
            onChange={(e) => { update({ officialEmail: e.target.value }); clr("officialEmail"); }}
            className={inp} {...bs(errors.officialEmail)} {...fo(errors.officialEmail)} />
          <FieldError msg={errors.officialEmail} />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2" style={{ color: "#374151" }}>Designation <span style={{ color: "#FFA500" }}>*</span></label>
          <input type="text" placeholder="Content Creator, Proprietor, Director…" value={formData.designation}
            onChange={(e) => { update({ designation: e.target.value }); clr("designation"); }}
            className={inp} {...bs(errors.designation)} {...fo(errors.designation)} />
          <FieldError msg={errors.designation} />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2" style={{ color: "#374151" }}>Nature of Work <span style={{ color: "#FFA500" }}>*</span></label>
          <textarea rows={3} placeholder="Describe your work briefly…"
            value={formData.workDescription}
            onChange={(e) => { update({ workDescription: e.target.value }); clr("workDescription"); }}
            className={tea} {...bs(errors.workDescription)} {...fo(errors.workDescription)} />
          <FieldError msg={errors.workDescription} />
        </div>
      </div>

      {/* Online Presence */}
      <SectionDivider>Online Presence</SectionDivider>
      <div>
        <label className="block text-sm font-semibold mb-2" style={{ color: "#374151" }}>
          Social Media Handles <span style={{ color: "#FFA500" }}>*</span>
        </label>
        <textarea rows={5}
          placeholder={"Instagram: @handle\nLink: https://instagram.com/handle\n\nYouTube: @handle\nLink: https://youtube.com/channel"}
          value={formData.socialMediaHandles}
          onChange={(e) => { update({ socialMediaHandles: e.target.value }); clr("socialMediaHandles"); }}
          className={tea} {...bs(errors.socialMediaHandles)} {...fo(errors.socialMediaHandles)} />
        <FieldHint>Format — Platform: @handle | Link: https://…</FieldHint>
        <FieldError msg={errors.socialMediaHandles} />
      </div>

      <div className="flex gap-3 mt-9">
        <button onClick={onBack}
          className="flex-1 py-4 rounded-2xl font-semibold text-sm transition-all hover:bg-gray-50"
          style={{ border: "2px solid #e5e7eb", color: "#6b7280" }}>
          ← Back
        </button>
        <button onClick={() => { if (validate()) onNext(); }}
          className="py-4 rounded-2xl font-extrabold text-sm transition-all hover:opacity-90 active:scale-95"
          style={{ flex: 2, background: "#FFA500", color: "#111827", boxShadow: "0 4px 14px rgba(255,165,0,0.3)" }}>
          Continue →
        </button>
      </div>
    </div>
  );
}
