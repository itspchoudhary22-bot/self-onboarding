"use client";
import { useState, useRef } from "react";
import { FormData } from "./formTypes";

interface Props {
  formData: FormData;
  update: (fields: Partial<FormData>) => void;
  onNext: () => void;
  onBack: () => void;
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 mb-4 mt-7 first:mt-0">
      <span className="text-xs font-bold uppercase tracking-widest text-gray-400">{children}</span>
      <div className="flex-1 h-px bg-gray-100" />
    </div>
  );
}

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return (
    <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
      <span>⚠</span> {msg}
    </p>
  );
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
    reader.onload = () => {
      onChange(reader.result as string, file.name);
    };
    reader.readAsDataURL(file);
  };

  const handleRemove = () => {
    onChange("", "");
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div>
      <label className="block text-sm font-semibold mb-1.5 text-gray-700">
        {label} {required && <span style={{ color: "#FFA500" }}>*</span>}
      </label>
      {fileBase64 ? (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl border-2 border-green-300 bg-green-50">
          <span className="text-green-600 text-base">✓</span>
          <span className="text-sm text-green-700 font-medium flex-1 truncate">{fileName}</span>
          <button
            type="button"
            onClick={handleRemove}
            className="text-xs text-red-500 hover:text-red-700 font-semibold flex-shrink-0"
          >
            Remove
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="w-full flex flex-col items-center gap-2 px-4 py-5 rounded-xl border-2 border-dashed transition-all hover:border-amber-400 hover:bg-amber-50"
          style={{ borderColor: error ? "#ef4444" : "#d1d5db" }}
        >
          <span className="text-2xl">📎</span>
          <span className="text-sm font-medium text-gray-500">
            Drop file here or <span style={{ color: "#FFA500" }} className="font-semibold">Browse files</span>
          </span>
          <span className="text-xs text-gray-400">PDF or image files accepted</span>
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf,image/*"
        onChange={handleFile}
        className="hidden"
      />
      {error && <FieldError msg={error} />}
    </div>
  );
}

type ErrorKeys =
  | "companyName"
  | "companyRegNumber"
  | "regCert"
  | "gstin"
  | "companyRegisteredAddress"
  | "companyPincode"
  | "companyMailingAddress"
  | "companyDescription"
  | "signatoryName"
  | "signatoryDesignation"
  | "signatoryEmail"
  | "companySocialMedia";

type Errors = Partial<Record<ErrorKeys, string>>;

const inputCls =
  "w-full px-4 py-3 rounded-xl border-2 text-gray-800 placeholder-gray-400 text-sm transition-all duration-200 outline-none bg-white";
const textareaCls =
  "w-full px-4 py-3 rounded-xl border-2 text-gray-800 placeholder-gray-400 text-sm transition-all duration-200 outline-none bg-white resize-none";

function isValidEmail(e: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
}

export default function Step2Company({ formData, update, onNext, onBack }: Props) {
  const [errors, setErrors] = useState<Errors>({});

  const validate = (): boolean => {
    const errs: Errors = {};
    if (!formData.companyName.trim()) errs.companyName = "Company name is required.";
    if (!formData.companyRegNumber.trim()) errs.companyRegNumber = "Registration number is required.";
    if (!formData.regCertBase64) errs.regCert = "Please upload your registration / GSTIN certificate.";
    if (!formData.gstin.trim()) errs.gstin = "GSTIN is required (type NA if not applicable).";
    if (!formData.companyRegisteredAddress.trim()) errs.companyRegisteredAddress = "Registered address is required.";
    if (!formData.companyPincode.trim()) errs.companyPincode = "Pincode / ZIP is required.";
    if (!formData.companyMailingAddress.trim()) errs.companyMailingAddress = "Mailing address is required.";
    if (!formData.companyDescription.trim()) errs.companyDescription = "Nature of business is required.";
    if (!formData.signatoryName.trim()) errs.signatoryName = "Authorized signatory name is required.";
    if (!formData.signatoryDesignation.trim()) errs.signatoryDesignation = "Signatory designation is required.";
    if (!formData.signatoryEmail.trim()) errs.signatoryEmail = "Signatory email is required.";
    else if (!isValidEmail(formData.signatoryEmail)) errs.signatoryEmail = "Please enter a valid email.";
    if (!formData.companySocialMedia.trim()) errs.companySocialMedia = "Social media / website info is required.";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => { if (validate()) onNext(); };

  const bs = (key: ErrorKeys) => ({
    style: { borderColor: errors[key] ? "#ef4444" : "#e5e7eb" },
    onFocus: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      (e.target.style.borderColor = errors[key] ? "#ef4444" : "#FFA500"),
    onBlur: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      (e.target.style.borderColor = errors[key] ? "#ef4444" : "#e5e7eb"),
  });

  const clear = (key: ErrorKeys) => setErrors((p) => ({ ...p, [key]: undefined }));

  return (
    <div>
      <div className="mb-5">
        <h2 className="text-2xl font-black text-gray-900">Company Details</h2>
        <p className="text-gray-500 mt-1 text-sm">Your company&apos;s official information for documentation</p>
      </div>

      {/* Company Identity */}
      <SectionLabel>Company Identity</SectionLabel>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-semibold mb-1.5 text-gray-700">
            Company / Entity Name <span style={{ color: "#FFA500" }}>*</span>
          </label>
          <input
            type="text"
            placeholder="Full legal name as per registration"
            value={formData.companyName}
            onChange={(e) => { update({ companyName: e.target.value }); clear("companyName"); }}
            className={inputCls}
            {...bs("companyName")}
          />
          <FieldError msg={errors.companyName} />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1.5 text-gray-700">
            Company Registration Number <span style={{ color: "#FFA500" }}>*</span>
          </label>
          <input
            type="text"
            placeholder="CIN, CRN, ACN, etc."
            value={formData.companyRegNumber}
            onChange={(e) => { update({ companyRegNumber: e.target.value }); clear("companyRegNumber"); }}
            className={inputCls}
            {...bs("companyRegNumber")}
          />
          <p className="text-xs text-gray-400 mt-1">Include type: CIN, CRN, ACN, etc.</p>
          <FieldError msg={errors.companyRegNumber} />
        </div>

        <FileUpload
          label="Upload Company Registration / GSTIN Certificate"
          required
          fileBase64={formData.regCertBase64}
          fileName={formData.regCertName}
          onChange={(base64, name) => { update({ regCertBase64: base64, regCertName: name }); clear("regCert"); }}
          error={errors.regCert}
        />

        <div>
          <label className="block text-sm font-semibold mb-1.5 text-gray-700">
            GSTIN <span style={{ color: "#FFA500" }}>*</span>
          </label>
          <input
            type="text"
            placeholder="Enter GSTIN or type NA"
            value={formData.gstin}
            onChange={(e) => { update({ gstin: e.target.value }); clear("gstin"); }}
            className={inputCls}
            {...bs("gstin")}
          />
          <p className="text-xs text-gray-400 mt-1">Type NA if not India or not registered</p>
          <FieldError msg={errors.gstin} />
        </div>
      </div>

      {/* Contact & Address */}
      <SectionLabel>Contact &amp; Address</SectionLabel>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-semibold mb-1.5 text-gray-700">
            Contact Information <span className="font-normal text-gray-400">(optional)</span>
          </label>
          <input
            type="text"
            placeholder="Phone number or contact details"
            value={formData.companyContact}
            onChange={(e) => update({ companyContact: e.target.value })}
            className={inputCls}
            style={{ borderColor: "#e5e7eb" }}
            onFocus={(e) => (e.target.style.borderColor = "#FFA500")}
            onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1.5 text-gray-700">
            Registered Address <span style={{ color: "#FFA500" }}>*</span>
          </label>
          <textarea
            rows={3}
            placeholder="As per Company Registration Certificate"
            value={formData.companyRegisteredAddress}
            onChange={(e) => { update({ companyRegisteredAddress: e.target.value }); clear("companyRegisteredAddress"); }}
            className={textareaCls}
            {...bs("companyRegisteredAddress")}
          />
          <p className="text-xs text-gray-400 mt-1">As per Company Registration Certificate</p>
          <FieldError msg={errors.companyRegisteredAddress} />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1.5 text-gray-700">
            Pincode / ZIP <span style={{ color: "#FFA500" }}>*</span>
          </label>
          <input
            type="text"
            placeholder="110001"
            value={formData.companyPincode}
            onChange={(e) => { update({ companyPincode: e.target.value }); clear("companyPincode"); }}
            className={inputCls}
            {...bs("companyPincode")}
          />
          <FieldError msg={errors.companyPincode} />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1.5 text-gray-700">
            Mailing Address <span style={{ color: "#FFA500" }}>*</span>
          </label>
          <textarea
            rows={3}
            placeholder="Type 'Same' if identical to registered address"
            value={formData.companyMailingAddress}
            onChange={(e) => { update({ companyMailingAddress: e.target.value }); clear("companyMailingAddress"); }}
            className={textareaCls}
            {...bs("companyMailingAddress")}
          />
          <p className="text-xs text-gray-400 mt-1">Type &apos;Same&apos; if identical to registered address</p>
          <FieldError msg={errors.companyMailingAddress} />
        </div>
      </div>

      {/* Business */}
      <SectionLabel>Business</SectionLabel>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-semibold mb-1.5 text-gray-700">
            Nature of Business <span style={{ color: "#FFA500" }}>*</span>
          </label>
          <textarea
            rows={3}
            placeholder="Brief description of your company's work and industry"
            value={formData.companyDescription}
            onChange={(e) => { update({ companyDescription: e.target.value }); clear("companyDescription"); }}
            className={textareaCls}
            {...bs("companyDescription")}
          />
          <FieldError msg={errors.companyDescription} />
        </div>
      </div>

      {/* Authorized Signatory */}
      <SectionLabel>Authorized Signatory</SectionLabel>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-semibold mb-1.5 text-gray-700">
            Name of Authorized Signatory <span style={{ color: "#FFA500" }}>*</span>
          </label>
          <input
            type="text"
            placeholder="Full name of the person who will sign documents"
            value={formData.signatoryName}
            onChange={(e) => { update({ signatoryName: e.target.value }); clear("signatoryName"); }}
            className={inputCls}
            {...bs("signatoryName")}
          />
          <p className="text-xs text-gray-400 mt-1">Person who will sign the documents</p>
          <FieldError msg={errors.signatoryName} />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1.5 text-gray-700">
            Designation of Authorized Signatory <span style={{ color: "#FFA500" }}>*</span>
          </label>
          <input
            type="text"
            placeholder="e.g. Director, CEO, Manager"
            value={formData.signatoryDesignation}
            onChange={(e) => { update({ signatoryDesignation: e.target.value }); clear("signatoryDesignation"); }}
            className={inputCls}
            {...bs("signatoryDesignation")}
          />
          <FieldError msg={errors.signatoryDesignation} />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1.5 text-gray-700">
            Official Email of Authorized Signatory <span style={{ color: "#FFA500" }}>*</span>
          </label>
          <input
            type="email"
            placeholder="signatory@company.com"
            value={formData.signatoryEmail}
            onChange={(e) => { update({ signatoryEmail: e.target.value }); clear("signatoryEmail"); }}
            className={inputCls}
            {...bs("signatoryEmail")}
          />
          <FieldError msg={errors.signatoryEmail} />
        </div>
      </div>

      {/* Online Presence */}
      <SectionLabel>Online Presence</SectionLabel>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-semibold mb-1.5 text-gray-700">
            Official Social Media / Website <span style={{ color: "#FFA500" }}>*</span>
          </label>
          <textarea
            rows={4}
            placeholder={"Website: https://www.yourcompany.com\n\nLinkedIn: https://linkedin.com/company/yourcompany\n\nTwitter: @yourhandle"}
            value={formData.companySocialMedia}
            onChange={(e) => { update({ companySocialMedia: e.target.value }); clear("companySocialMedia"); }}
            className={textareaCls}
            {...bs("companySocialMedia")}
          />
          <p className="text-xs text-gray-400 mt-1">
            Format — Platform: @handle | Link: https://...
          </p>
          <FieldError msg={errors.companySocialMedia} />
        </div>
      </div>

      {/* Documents */}
      <SectionLabel>Documents</SectionLabel>
      <div className="space-y-4">
        <FileUpload
          label="Upload Copyright / Trademark Registration Certificate"
          fileBase64={formData.copyrightCertBase64}
          fileName={formData.copyrightCertName}
          onChange={(base64, name) => update({ copyrightCertBase64: base64, copyrightCertName: name })}
        />
        <p className="text-xs text-gray-400 -mt-2">Optional — upload if you have a copyright or trademark certificate</p>
      </div>

      <div className="flex gap-3 mt-8">
        <button
          onClick={onBack}
          className="flex-1 py-3.5 rounded-xl font-semibold text-sm border-2 border-gray-200 text-gray-500 transition-all hover:bg-gray-50"
        >
          ← Back
        </button>
        <button
          onClick={handleNext}
          className="flex-[2] py-3.5 rounded-xl font-bold text-sm transition-all hover:opacity-90 active:scale-95"
          style={{ background: "#FFA500", color: "#111827" }}
        >
          Continue →
        </button>
      </div>
    </div>
  );
}
