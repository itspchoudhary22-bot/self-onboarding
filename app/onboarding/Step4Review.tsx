"use client";
import { FormData } from "./formTypes";

interface Props {
  formData: FormData;
  onBack: () => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  submitError: string;
  goToStep: (s: number) => void;
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline gap-3 py-1.5 border-b border-gray-50 last:border-0">
      <span className="text-xs text-gray-400 flex-shrink-0 w-36">{label}</span>
      <span className="text-sm text-gray-700 break-words whitespace-pre-wrap flex-1">{value || "—"}</span>
    </div>
  );
}

function Section({ title, step, goToStep, children }: { title: string; step: number; goToStep: (s: number) => void; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-gray-100 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2.5 bg-gray-50">
        <span className="text-xs font-bold uppercase tracking-wider text-gray-500">{title}</span>
        <button onClick={() => goToStep(step)} className="text-xs font-semibold hover:underline" style={{ color: "#FFA500" }}>Edit</button>
      </div>
      <div className="px-4 py-2">{children}</div>
    </div>
  );
}

export default function Step4Review({ formData, onBack, onSubmit, isSubmitting, submitError, goToStep }: Props) {
  const isCompany = formData.type === "company";

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-black text-gray-900">Review &amp; Submit</h2>
        <p className="text-gray-500 mt-1 text-sm">Verify all information before submitting</p>
      </div>

      {submitError && (
        <div className="mb-5 flex items-start gap-2 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
          <span>⚠</span> <span>{submitError}</span>
        </div>
      )}

      <div className="space-y-3 mb-6">
        <Section title="Basic Information" step={1} goToStep={goToStep}>
          <Row label="Email" value={formData.email} />
          <Row label="Type" value={formData.type.charAt(0).toUpperCase() + formData.type.slice(1)} />
          <Row label="Country" value={formData.country} />
        </Section>

        {isCompany ? (
          <Section title="Company Details" step={2} goToStep={goToStep}>
            <Row label="Company Name" value={formData.companyName} />
            <Row label="Reg. Number" value={formData.companyRegNumber} />
            <Row label="Reg. Certificate" value={formData.regCertName || "Not uploaded"} />
            <Row label="GSTIN" value={formData.gstin} />
            <Row label="Contact" value={formData.companyContact || "Not provided"} />
            <Row label="Registered Address" value={formData.companyRegisteredAddress} />
            <Row label="Pincode" value={formData.companyPincode} />
            <Row label="Mailing Address" value={formData.companyMailingAddress} />
            <Row label="Nature of Business" value={formData.companyDescription} />
            <Row label="Signatory Name" value={formData.signatoryName} />
            <Row label="Signatory Designation" value={formData.signatoryDesignation} />
            <Row label="Signatory Email" value={formData.signatoryEmail} />
            <Row label="Social / Website" value={formData.companySocialMedia} />
            <Row label="Copyright Cert." value={formData.copyrightCertName || "Not provided"} />
          </Section>
        ) : (
          <Section title="Personal Details" step={2} goToStep={goToStep}>
            <Row label="Full Name" value={formData.individualName} />
            <Row label="National ID" value={formData.nationalIdNumber} />
            <Row label="ID Proof" value={formData.idProofName || "Not uploaded"} />
            <Row label="Contact" value={formData.contactNumber || "Not provided"} />
            <Row label="Registered Address" value={formData.registeredAddress} />
            <Row label="Pincode" value={formData.pincode} />
            <Row label="Mailing Address" value={formData.mailingAddress} />
            <Row label="Official Email" value={formData.officialEmail} />
            <Row label="Designation" value={formData.designation} />
            <Row label="Nature of Work" value={formData.workDescription} />
            <Row label="Social Media" value={formData.socialMediaHandles} />
          </Section>
        )}

        <Section title={`Services Selected (${formData.services.length})`} step={3} goToStep={goToStep}>
          <div className="flex flex-wrap gap-2 py-1">
            {formData.services.map((s) => (
              <span key={s} className="text-xs px-3 py-1.5 rounded-full font-medium" style={{ background: "#fffbeb", color: "#111827", border: "1px solid rgba(255,165,0,0.4)" }}>{s}</span>
            ))}
          </div>
        </Section>
      </div>

      <p className="text-xs text-gray-400 mb-5 text-center">
        By submitting, you agree to our{" "}
        <span className="underline cursor-pointer text-gray-600">Terms of Service</span> and{" "}
        <span className="underline cursor-pointer text-gray-600">Privacy Policy</span>.
      </p>

      <div className="flex gap-3">
        <button onClick={onBack} disabled={isSubmitting}
          className="flex-1 py-3.5 rounded-xl font-semibold text-sm border-2 border-gray-200 text-gray-500 transition-all hover:bg-gray-50 disabled:opacity-50">
          ← Back
        </button>
        <button onClick={onSubmit} disabled={isSubmitting}
          className="flex-[2] py-3.5 rounded-xl font-bold text-sm transition-all hover:opacity-90 active:scale-95 disabled:opacity-70 flex items-center justify-center gap-2"
          style={{ background: "#FFA500", color: "#111827" }}>
          {isSubmitting ? (
            <><svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>Submitting…</>
          ) : "Submit Application ✓"}
        </button>
      </div>
    </div>
  );
}
