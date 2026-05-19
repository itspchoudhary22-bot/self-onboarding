"use client";
import { FormData } from "./formTypes";

interface Props {
  formData: FormData;
  onBack: () => void;
  onNext: () => void;
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

export default function Step4Review({ formData, onBack, onNext, goToStep }: Props) {
  const isCompany = formData.type === "company";

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-black text-gray-900">Review Your Details</h2>
        <p className="text-gray-500 mt-1 text-sm">Verify everything before proceeding to document signing</p>
      </div>

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

      <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 mb-6 flex items-start gap-3">
        <span className="text-amber-500 text-lg mt-0.5">📝</span>
        <div>
          <p className="text-sm font-semibold text-gray-800">Next: Sign your documents</p>
          <p className="text-xs text-gray-500 mt-0.5">Your Service Agreement and Letter of Authorization (LOA) will be prepared and shown for review and digital signing.</p>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="flex-1 py-3.5 rounded-xl font-semibold text-sm border-2 border-gray-200 text-gray-500 transition-all hover:bg-gray-50"
        >
          ← Back
        </button>
        <button
          onClick={onNext}
          className="flex-[2] py-3.5 rounded-xl font-bold text-sm transition-all hover:opacity-90 active:scale-95"
          style={{ background: "#FFA500", color: "#111827" }}
        >
          Proceed to Sign Documents →
        </button>
      </div>
    </div>
  );
}
