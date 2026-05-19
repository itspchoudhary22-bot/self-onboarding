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
  | "individualName"
  | "nationalIdNumber"
  | "idProof"
  | "registeredAddress"
  | "pincode"
  | "mailingAddress"
  | "officialEmail"
  | "designation"
  | "workDescription"
  | "socialMediaHandles";

type Errors = Partial<Record<ErrorKeys, string>>;

const inputCls =
  "w-full px-4 py-3 rounded-xl border-2 text-gray-800 placeholder-gray-400 text-sm transition-all duration-200 outline-none bg-white";
const textareaCls =
  "w-full px-4 py-3 rounded-xl border-2 text-gray-800 placeholder-gray-400 text-sm transition-all duration-200 outline-none bg-white resize-none";

function isValidEmail(e: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
}

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
    else if (!isValidEmail(formData.officialEmail)) errs.officialEmail = "Please enter a valid email.";
    if (!formData.designation.trim()) errs.designation = "Designation is required.";
    if (!formData.workDescription.trim()) errs.workDescription = "Nature of work is required.";
    if (!formData.socialMediaHandles.trim()) errs.socialMediaHandles = "At least one social media handle or website is required.";
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
        <h2 className="text-2xl font-black text-gray-900">Personal Details</h2>
        <p className="text-gray-500 mt-1 text-sm">Your legal information required for documentation</p>
      </div>

      {/* Identity & Legal */}
      <SectionLabel>Identity &amp; Legal</SectionLabel>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-semibold mb-1.5 text-gray-700">
            Full Legal Name <span style={{ color: "#FFA500" }}>*</span>
          </label>
          <input
            type="text"
            placeholder="As on Aadhaar / PAN / Passport"
            value={formData.individualName}
            onChange={(e) => { update({ individualName: e.target.value }); clear("individualName"); }}
            className={inputCls}
            {...bs("individualName")}
          />
          <FieldError msg={errors.individualName} />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1.5 text-gray-700">
            National ID Number <span style={{ color: "#FFA500" }}>*</span>
          </label>
          <input
            type="text"
            placeholder="Aadhaar Number, PAN, etc."
            value={formData.nationalIdNumber}
            onChange={(e) => { update({ nationalIdNumber: e.target.value }); clear("nationalIdNumber"); }}
            className={inputCls}
            {...bs("nationalIdNumber")}
          />
          <FieldError msg={errors.nationalIdNumber} />
        </div>

        <FileUpload
          label="Upload National ID Proof"
          required
          fileBase64={formData.idProofBase64}
          fileName={formData.idProofName}
          onChange={(base64, name) => { update({ idProofBase64: base64, idProofName: name }); clear("idProof"); }}
          error={errors.idProof}
        />
      </div>

      {/* Contact & Address */}
      <SectionLabel>Contact &amp; Address</SectionLabel>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-semibold mb-1.5 text-gray-700">
            Contact Number <span className="font-normal text-gray-400">(optional)</span>
          </label>
          <input
            type="tel"
            placeholder="+91 98765 43210"
            value={formData.contactNumber}
            onChange={(e) => update({ contactNumber: e.target.value })}
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
            placeholder="House No., Building, Street, City, District, State, Pincode, Country"
            value={formData.registeredAddress}
            onChange={(e) => { update({ registeredAddress: e.target.value }); clear("registeredAddress"); }}
            className={textareaCls}
            {...bs("registeredAddress")}
          />
          <p className="text-xs text-gray-400 mt-1">Format: House No., Building, Street, City, District, State, Pincode, Country</p>
          <FieldError msg={errors.registeredAddress} />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1.5 text-gray-700">
            Pincode / ZIP <span style={{ color: "#FFA500" }}>*</span>
          </label>
          <input
            type="text"
            placeholder="110001"
            value={formData.pincode}
            onChange={(e) => { update({ pincode: e.target.value }); clear("pincode"); }}
            className={inputCls}
            {...bs("pincode")}
          />
          <FieldError msg={errors.pincode} />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1.5 text-gray-700">
            Mailing Address <span style={{ color: "#FFA500" }}>*</span>
          </label>
          <textarea
            rows={3}
            placeholder="Type 'Same' if identical to registered address"
            value={formData.mailingAddress}
            onChange={(e) => { update({ mailingAddress: e.target.value }); clear("mailingAddress"); }}
            className={textareaCls}
            {...bs("mailingAddress")}
          />
          <p className="text-xs text-gray-400 mt-1">Type &apos;Same&apos; if identical to registered address</p>
          <FieldError msg={errors.mailingAddress} />
        </div>
      </div>

      {/* Professional Information */}
      <SectionLabel>Professional Information</SectionLabel>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-semibold mb-1.5 text-gray-700">
            Official Email Address <span style={{ color: "#FFA500" }}>*</span>
          </label>
          <input
            type="email"
            placeholder="your@email.com"
            value={formData.officialEmail}
            onChange={(e) => { update({ officialEmail: e.target.value }); clear("officialEmail"); }}
            className={inputCls}
            {...bs("officialEmail")}
          />
          <FieldError msg={errors.officialEmail} />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1.5 text-gray-700">
            Designation <span style={{ color: "#FFA500" }}>*</span>
          </label>
          <input
            type="text"
            placeholder="Content Creator, Proprietor, Social Media Influencer, Director, etc."
            value={formData.designation}
            onChange={(e) => { update({ designation: e.target.value }); clear("designation"); }}
            className={inputCls}
            {...bs("designation")}
          />
          <FieldError msg={errors.designation} />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1.5 text-gray-700">
            Nature of Work <span style={{ color: "#FFA500" }}>*</span>
          </label>
          <textarea
            rows={3}
            placeholder="Describe your work briefly"
            value={formData.workDescription}
            onChange={(e) => { update({ workDescription: e.target.value }); clear("workDescription"); }}
            className={textareaCls}
            {...bs("workDescription")}
          />
          <FieldError msg={errors.workDescription} />
        </div>
      </div>

      {/* Online Presence */}
      <SectionLabel>Online Presence</SectionLabel>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-semibold mb-1.5 text-gray-700">
            Official Social Media Handles <span style={{ color: "#FFA500" }}>*</span>
          </label>
          <textarea
            rows={5}
            placeholder={"Instagram Handle: @handle\nLink: https://instagram.com/handle\n\nYouTube: @handle\nLink: https://youtube.com/channel"}
            value={formData.socialMediaHandles}
            onChange={(e) => { update({ socialMediaHandles: e.target.value }); clear("socialMediaHandles"); }}
            className={textareaCls}
            {...bs("socialMediaHandles")}
          />
          <p className="text-xs text-gray-400 mt-1">
            Format — Instagram Handle: @handle | Link: https://instagram.com/handle
          </p>
          <FieldError msg={errors.socialMediaHandles} />
        </div>
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
