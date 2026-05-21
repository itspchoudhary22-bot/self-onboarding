"use client";
import { useState, useRef } from "react";
import { FormData } from "./formTypes";
import { validatePincode, validateSocialMedia, getPincodeHint } from "@/lib/validations";

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

type EK =
  | "companyName" | "companyRegNumber" | "regCert" | "gstin"
  | "companyRegisteredAddress" | "companyPincode" | "companyMailingAddress"
  | "companyDescription" | "companyOfficialEmail"
  | "signatoryName" | "signatoryDesignation" | "signatoryEmail"
  | "companySocialMedia";
type Errors = Partial<Record<EK, string>>;

const inp = "w-full px-4 py-3.5 rounded-xl border-2 text-sm transition-all duration-200 outline-none bg-white";
const tea = "w-full px-4 py-3.5 rounded-xl border-2 text-sm transition-all duration-200 outline-none bg-white resize-none";
const bs = (err?: string) => ({ style: { borderColor: err ? "#ef4444" : "#e5e7eb", color: "#111827" } });
const fo = (err?: string) => ({
  onFocus: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => (e.target.style.borderColor = err ? "#ef4444" : "#FFA500"),
  onBlur: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => (e.target.style.borderColor = err ? "#ef4444" : "#e5e7eb"),
});

export default function Step2Company({ formData, update, onNext, onBack }: Props) {
  const [errors, setErrors] = useState<Errors>({});

  const validate = (): boolean => {
    const errs: Errors = {};
    if (!formData.companyName.trim()) errs.companyName = "Company name is required.";
    if (!formData.companyRegNumber.trim()) errs.companyRegNumber = "Registration number is required.";
    if (!formData.regCertBase64) errs.regCert = "Please upload your registration certificate.";
    if (!formData.gstin.trim()) errs.gstin = "GSTIN is required (type NA if not applicable).";
    if (!formData.companyRegisteredAddress.trim()) errs.companyRegisteredAddress = "Registered address is required.";
    const pincodeErr = validatePincode(formData.companyPincode, formData.country);
    if (pincodeErr) errs.companyPincode = pincodeErr;
    if (!formData.companyMailingAddress.trim()) errs.companyMailingAddress = "Mailing address is required.";
    if (!formData.companyDescription.trim()) errs.companyDescription = "Nature of business is required.";
    if (!formData.companyOfficialEmail.trim()) errs.companyOfficialEmail = "Official email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.companyOfficialEmail)) errs.companyOfficialEmail = "Please enter a valid email.";
    if (!formData.signatoryName.trim()) errs.signatoryName = "Authorized signatory name is required.";
    if (!formData.signatoryDesignation.trim()) errs.signatoryDesignation = "Signatory designation is required.";
    if (!formData.signatoryEmail.trim()) errs.signatoryEmail = "Signatory email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.signatoryEmail)) errs.signatoryEmail = "Please enter a valid email.";
    const socialErr = validateSocialMedia(formData.companySocialMedia);
    if (socialErr) errs.companySocialMedia = socialErr;
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const clr = (k: EK) => setErrors((p) => ({ ...p, [k]: undefined }));

  return (
    <div>
      <div className="mb-7">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold mb-4"
          style={{ background: "#eff6ff", color: "#1e40af" }}>
          <span>🏢</span> Company
        </div>
        <h2 className="text-2xl sm:text-3xl font-black tracking-tight mb-2" style={{ color: "#111827", letterSpacing: "-0.02em" }}>
          Company Details
        </h2>
        <p className="text-sm sm:text-base" style={{ color: "#9ca3af" }}>Your company&apos;s official information for documentation.</p>
      </div>

      {/* Company Identity */}
      <SectionDivider>Company Identity</SectionDivider>
      <div className="flex flex-col gap-5">
        <div>
          <label className="block text-sm font-semibold mb-2" style={{ color: "#374151" }}>Company / Entity Name <span style={{ color: "#FFA500" }}>*</span></label>
          <input type="text" placeholder="Full legal name as per registration" value={formData.companyName}
            onChange={(e) => { update({ companyName: e.target.value }); clr("companyName"); }}
            className={inp} {...bs(errors.companyName)} {...fo(errors.companyName)} />
          <FieldError msg={errors.companyName} />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2" style={{ color: "#374151" }}>Company Registration Number <span style={{ color: "#FFA500" }}>*</span></label>
          <input type="text" placeholder="CIN, CRN, ACN, etc." value={formData.companyRegNumber}
            onChange={(e) => { update({ companyRegNumber: e.target.value }); clr("companyRegNumber"); }}
            className={inp} {...bs(errors.companyRegNumber)} {...fo(errors.companyRegNumber)} />
          <FieldHint>Include type: CIN, CRN, ACN, etc.</FieldHint>
          <FieldError msg={errors.companyRegNumber} />
        </div>

        <FileUpload label="Upload Company Registration Certificate" required
          fileBase64={formData.regCertBase64} fileName={formData.regCertName}
          onChange={(b, n) => { update({ regCertBase64: b, regCertName: n }); clr("regCert"); }}
          error={errors.regCert} />

        <div>
          <label className="block text-sm font-semibold mb-2" style={{ color: "#374151" }}>GSTIN <span style={{ color: "#FFA500" }}>*</span></label>
          <input type="text" placeholder="Enter GSTIN or type NA" value={formData.gstin}
            onChange={(e) => { update({ gstin: e.target.value }); clr("gstin"); }}
            className={inp} {...bs(errors.gstin)} {...fo(errors.gstin)} />
          <FieldHint>Type NA if not India or not GST registered</FieldHint>
          <FieldError msg={errors.gstin} />
        </div>
      </div>

      {/* Contact & Address */}
      <SectionDivider>Contact &amp; Address</SectionDivider>
      <div className="flex flex-col gap-5">
        <div>
          <label className="block text-sm font-semibold mb-2" style={{ color: "#374151" }}>
            Contact Number <span className="font-normal" style={{ color: "#9ca3af" }}>(optional)</span>
          </label>
          <input type="tel" placeholder="+91 22 1234 5678" value={formData.companyContact}
            onChange={(e) => update({ companyContact: e.target.value })}
            className={inp} style={{ borderColor: "#e5e7eb", color: "#111827" }}
            onFocus={(e) => (e.target.style.borderColor = "#FFA500")}
            onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")} />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2" style={{ color: "#374151" }}>Registered Address <span style={{ color: "#FFA500" }}>*</span></label>
          <textarea rows={3} placeholder="As per Company Registration Certificate"
            value={formData.companyRegisteredAddress}
            onChange={(e) => { update({ companyRegisteredAddress: e.target.value }); clr("companyRegisteredAddress"); }}
            className={tea} {...bs(errors.companyRegisteredAddress)} {...fo(errors.companyRegisteredAddress)} />
          <FieldHint>As per Company Registration Certificate</FieldHint>
          <FieldError msg={errors.companyRegisteredAddress} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: "#374151" }}>Pincode / ZIP <span style={{ color: "#FFA500" }}>*</span></label>
            <input type="text" placeholder={getPincodeHint(formData.country)} value={formData.companyPincode}
              onChange={(e) => { update({ companyPincode: e.target.value }); clr("companyPincode"); }}
              className={inp} {...bs(errors.companyPincode)}
              onFocus={(e) => (e.target.style.borderColor = errors.companyPincode ? "#ef4444" : "#FFA500")}
              onBlur={(e) => {
                const err = validatePincode(e.target.value, formData.country);
                e.target.style.borderColor = err ? "#ef4444" : "#e5e7eb";
                setErrors((p) => ({ ...p, companyPincode: err }));
              }} />
            {!errors.companyPincode && <FieldHint>{getPincodeHint(formData.country)}</FieldHint>}
            <FieldError msg={errors.companyPincode} />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: "#374151" }}>City</label>
            <input type="text" placeholder="Mumbai"
              className={inp} style={{ borderColor: "#e5e7eb", color: "#111827" }}
              onFocus={(e) => (e.target.style.borderColor = "#FFA500")}
              onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")} />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2" style={{ color: "#374151" }}>Mailing Address <span style={{ color: "#FFA500" }}>*</span></label>
          <textarea rows={2} placeholder="Type 'Same' if identical to registered address"
            value={formData.companyMailingAddress}
            onChange={(e) => { update({ companyMailingAddress: e.target.value }); clr("companyMailingAddress"); }}
            className={tea} {...bs(errors.companyMailingAddress)} {...fo(errors.companyMailingAddress)} />
          <FieldHint>Type &apos;Same&apos; if identical to registered address</FieldHint>
          <FieldError msg={errors.companyMailingAddress} />
        </div>
      </div>

      {/* Business */}
      <SectionDivider>Business</SectionDivider>
      <div className="flex flex-col gap-5">
        <div>
          <label className="block text-sm font-semibold mb-2" style={{ color: "#374151" }}>Nature of Business <span style={{ color: "#FFA500" }}>*</span></label>
          <textarea rows={4} placeholder="Brief description of your company's work, industry, and what you do…"
            value={formData.companyDescription}
            onChange={(e) => { update({ companyDescription: e.target.value }); clr("companyDescription"); }}
            className={tea} {...bs(errors.companyDescription)} {...fo(errors.companyDescription)} />
          <FieldError msg={errors.companyDescription} />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2" style={{ color: "#374151" }}>Official Email Address <span style={{ color: "#FFA500" }}>*</span></label>
          <input type="email" placeholder="official@company.com" value={formData.companyOfficialEmail}
            onChange={(e) => { update({ companyOfficialEmail: e.target.value }); clr("companyOfficialEmail"); }}
            className={inp} {...bs(errors.companyOfficialEmail)} {...fo(errors.companyOfficialEmail)} />
          <FieldError msg={errors.companyOfficialEmail} />
        </div>
      </div>

      {/* Authorized Signatory */}
      <SectionDivider>Authorized Signatory</SectionDivider>
      <div className="flex flex-col gap-5">
        <div>
          <label className="block text-sm font-semibold mb-2" style={{ color: "#374151" }}>Name of Authorized Signatory <span style={{ color: "#FFA500" }}>*</span></label>
          <input type="text" placeholder="Full name of the person who will sign documents"
            value={formData.signatoryName}
            onChange={(e) => { update({ signatoryName: e.target.value }); clr("signatoryName"); }}
            className={inp} {...bs(errors.signatoryName)} {...fo(errors.signatoryName)} />
          <FieldHint>Person who will sign the Service Agreement and LOA</FieldHint>
          <FieldError msg={errors.signatoryName} />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2" style={{ color: "#374151" }}>Designation <span style={{ color: "#FFA500" }}>*</span></label>
          <input type="text" placeholder="e.g. Director, CEO, Manager"
            value={formData.signatoryDesignation}
            onChange={(e) => { update({ signatoryDesignation: e.target.value }); clr("signatoryDesignation"); }}
            className={inp} {...bs(errors.signatoryDesignation)} {...fo(errors.signatoryDesignation)} />
          <FieldError msg={errors.signatoryDesignation} />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2" style={{ color: "#374151" }}>Signatory Email <span style={{ color: "#FFA500" }}>*</span></label>
          <input type="email" placeholder="signatory@company.com"
            value={formData.signatoryEmail}
            onChange={(e) => { update({ signatoryEmail: e.target.value }); clr("signatoryEmail"); }}
            className={inp} {...bs(errors.signatoryEmail)} {...fo(errors.signatoryEmail)} />
          <FieldError msg={errors.signatoryEmail} />
        </div>
      </div>

      {/* Online Presence */}
      <SectionDivider>Online Presence</SectionDivider>
      <div>
        <label className="block text-sm font-semibold mb-2" style={{ color: "#374151" }}>Website / Social Media <span style={{ color: "#FFA500" }}>*</span></label>
        <textarea rows={4}
          placeholder={"Website: https://www.yourcompany.com\n\nLinkedIn: https://linkedin.com/company/name\n\nTwitter: @handle"}
          value={formData.companySocialMedia}
          onChange={(e) => { update({ companySocialMedia: e.target.value }); clr("companySocialMedia"); }}
          className={tea} {...bs(errors.companySocialMedia)}
          onFocus={(e) => (e.target.style.borderColor = errors.companySocialMedia ? "#ef4444" : "#FFA500")}
          onBlur={(e) => {
            const err = validateSocialMedia(e.target.value);
            e.target.style.borderColor = err ? "#ef4444" : "#e5e7eb";
            setErrors((p) => ({ ...p, companySocialMedia: err }));
          }} />
        <FieldHint>Format — Platform: @handle | Link: https://…</FieldHint>
        <FieldError msg={errors.companySocialMedia} />
      </div>

      {/* Documents */}
      <SectionDivider>Documents</SectionDivider>
      <div>
        <FileUpload
          label="Upload Copyright / Trademark Certificate"
          fileBase64={formData.copyrightCertBase64} fileName={formData.copyrightCertName}
          onChange={(b, n) => update({ copyrightCertBase64: b, copyrightCertName: n })} />
        <FieldHint>Optional — upload if you have a copyright or trademark certificate</FieldHint>
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
