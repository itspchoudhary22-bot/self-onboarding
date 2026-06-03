"use client";
import { FormData } from "./formTypes";
import { IconClipboard, IconBuilding, IconUser, IconShieldCheck, IconDocument, IconWarning } from "./Icons";

interface Props {
  formData: FormData;
  onBack: () => void;
  onNext: () => void;
  goToStep: (s: number) => void;
  isSubmitting?: boolean;
  submitError?: string;
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-4 py-2.5" style={{ borderBottom: "1px solid #f5f5f5" }}>
      <span className="text-xs flex-shrink-0 w-36 pt-0.5" style={{ color: "#9ca3af" }}>{label}</span>
      <span className="text-sm flex-1 break-words whitespace-pre-wrap" style={{ color: "#111827" }}>{value || "—"}</span>
    </div>
  );
}

function Section({ icon, title, step, goToStep, children }: {
  icon: React.ReactNode; title: string; step: number; goToStep: (s: number) => void; children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl overflow-hidden" style={{ border: "1.5px solid #f3f4f6" }}>
      <div className="flex items-center justify-between px-5 py-3.5" style={{ background: "#f9fafb", borderBottom: "1px solid #f3f4f6" }}>
        <div className="flex items-center gap-2">
          <span style={{ color: "#FFA500" }}>{icon}</span>
          <span className="text-xs font-bold uppercase tracking-wider" style={{ color: "#6b7280" }}>{title}</span>
        </div>
        <button onClick={() => goToStep(step)}
          className="text-xs font-bold px-3 py-1.5 rounded-lg transition-all hover:opacity-80"
          style={{ color: "#FFA500", background: "#fff8e6" }}>
          Edit
        </button>
      </div>
      <div className="px-5 py-2">{children}</div>
    </div>
  );
}

export default function Step4Review({ formData, onBack, onNext, goToStep, isSubmitting, submitError }: Props) {
  const isCompany = formData.type === "company";
  const hasServiceDetails = Object.values(formData.serviceDetails || {}).some(Boolean);

  return (
    <div>
      <div className="mb-7">
        <h2 className="text-2xl sm:text-3xl font-black tracking-tight mb-2" style={{ color: "#111827", letterSpacing: "-0.02em" }}>
          Review Your Details
        </h2>
        <p className="text-sm sm:text-base" style={{ color: "#9ca3af" }}>
          Check everything before submitting your application.
        </p>
      </div>

      <div className="flex flex-col gap-3 mb-7">
        <Section icon={<IconClipboard size={16} />} title="Basic Information" step={1} goToStep={goToStep}>
          <Row label="Email" value={formData.email} />
          <Row label="Type" value={formData.type.charAt(0).toUpperCase() + formData.type.slice(1)} />
          <Row label="Country" value={formData.country} />
        </Section>

        {isCompany ? (
          <Section icon={<IconBuilding size={16} />} title="Company Details" step={2} goToStep={goToStep}>
            <Row label="Company Name" value={formData.companyName} />
            <Row label="Reg. Number" value={formData.companyRegNumber} />
            <Row label="Reg. Certificate" value={formData.regCertName || "Not uploaded"} />
            <Row label="GSTIN" value={formData.gstin} />
            <Row label="Contact" value={formData.companyContact || "Not provided"} />
            <Row label="Registered Address" value={formData.companyRegisteredAddress} />
            <Row label="Pincode" value={formData.companyPincode} />
            <Row label="Mailing Address" value={formData.companyMailingAddress} />
            <Row label="Nature of Business" value={formData.companyDescription} />
            <Row label="Official Email" value={formData.companyOfficialEmail} />
            <Row label="Signatory Name" value={formData.signatoryName} />
            <Row label="Signatory Designation" value={formData.signatoryDesignation} />
            <Row label="Signatory Email" value={formData.signatoryEmail} />
            <Row label="Social / Website" value={formData.companySocialMedia} />
            <Row label="Copyright Cert." value={formData.copyrightCertName || "Not provided"} />
          </Section>
        ) : (
          <Section icon={<IconUser size={16} />} title="Personal Details" step={2} goToStep={goToStep}>
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

        <Section icon={<IconShieldCheck size={16} />} title={`Services Selected (${formData.services.length})`} step={3} goToStep={goToStep}>
          <div className="flex flex-wrap gap-2 py-2">
            {formData.services.map((s) => (
              <span key={s} className="text-xs px-3 py-1.5 rounded-full font-medium"
                style={{ background: "#fff8e6", color: "#92400e", border: "1px solid rgba(255,165,0,0.3)" }}>
                {s}
              </span>
            ))}
          </div>
          {hasServiceDetails && (
            <div className="mt-2 flex flex-col gap-2 pb-1">
              {formData.services.map((s) => {
                const detail = formData.serviceDetails?.[s];
                if (!detail) return null;
                return (
                  <div key={s} className="rounded-xl px-3 py-2.5" style={{ background: "#f9fafb" }}>
                    <p className="text-xs font-semibold mb-1" style={{ color: "#374151" }}>{s}</p>
                    <p className="text-xs leading-relaxed" style={{ color: "#6b7280" }}>{detail}</p>
                  </div>
                );
              })}
            </div>
          )}
        </Section>
      </div>

      {/* Next step notice */}
      <div className="flex items-start gap-4 px-5 py-4 rounded-2xl mb-7"
        style={{ border: "1.5px solid #fed7aa", background: "linear-gradient(135deg, #fff8f0, #fff)" }}>
        <IconDocument size={22} color="#FFA500" className="flex-shrink-0" />
        <div>
          <p className="font-bold text-sm mb-1" style={{ color: "#111827" }}>Ready to submit</p>
          <p className="text-xs leading-relaxed" style={{ color: "#6b7280" }}>
            Once submitted, this form will be locked. Our sales team will review and contact you about agreement signing and payment.
          </p>
        </div>
      </div>

      {submitError && (
        <div className="mb-4 flex items-start gap-2 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
          <IconWarning size={14} color="#b91c1c" /> <span>{submitError}</span>
        </div>
      )}

      <div className="flex gap-3">
        <button onClick={onBack}
          disabled={isSubmitting}
          className="flex-1 py-4 rounded-2xl font-semibold text-sm transition-all hover:bg-gray-50 disabled:opacity-50"
          style={{ border: "2px solid #e5e7eb", color: "#6b7280" }}>
          ← Back
        </button>
        <button onClick={onNext}
          disabled={isSubmitting}
          className="py-4 rounded-2xl font-extrabold text-sm transition-all hover:opacity-90 active:scale-95 disabled:opacity-60 flex items-center justify-center gap-2"
          style={{ flex: 2, background: "#FFA500", color: "#111827", boxShadow: "0 4px 14px rgba(255,165,0,0.3)" }}>
          {isSubmitting ? (
            <>
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Submitting…
            </>
          ) : (
            "Submit Application →"
          )}
        </button>
      </div>
    </div>
  );
}
