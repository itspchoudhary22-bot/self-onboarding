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

function SectionCard({ title, step, goToStep, rows }: { title: string; step: number; goToStep: (s: number) => void; rows: [string, string][] }) {
  return (
    <div className="rounded-xl border border-slate-200 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3" style={{ background: "#f8fafc" }}>
        <span className="text-xs font-bold uppercase tracking-wider" style={{ color: "#001F3F" }}>{title}</span>
        <button onClick={() => goToStep(step)} className="text-xs font-semibold px-3 py-1 rounded-lg transition-colors hover:underline" style={{ color: "#FFA500" }}>Edit</button>
      </div>
      <div className="px-4 py-3 space-y-2">
        {rows.map(([label, value]) => (
          <div key={label} className="flex items-baseline justify-between gap-4">
            <span className="text-xs text-slate-400 flex-shrink-0">{label}</span>
            <span className="text-sm font-medium text-slate-700 text-right break-words max-w-xs whitespace-pre-wrap">{value || "—"}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Step6Review({ formData, onBack, onSubmit, isSubmitting, submitError, goToStep }: Props) {
  const isCompany = formData.type === "company";

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-extrabold" style={{ color: "#001F3F" }}>Review &amp; Submit</h2>
        <p className="text-slate-500 mt-1 text-sm">Please verify all information before submitting</p>
      </div>

      {submitError && (
        <div className="mb-5 flex items-start gap-2 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
          <span className="mt-0.5">⚠</span><span>{submitError}</span>
        </div>
      )}

      <div className="space-y-4 mb-6">
        <SectionCard title="Basic Information" step={1} goToStep={goToStep} rows={[
          ["Email", formData.email],
          ["Type", formData.type.charAt(0).toUpperCase() + formData.type.slice(1)],
          ["Country", formData.country],
        ]} />

        {isCompany ? (
          <SectionCard title="Company Details" step={2} goToStep={goToStep} rows={[
            ["Company Name", formData.companyName],
            ["Reg. Number", formData.companyRegNumber],
            ["GSTIN", formData.gstin],
            ["Contact", formData.companyContact || "Not provided"],
            ["Nature of Business", formData.companyDescription],
          ]} />
        ) : (
          <SectionCard title="Personal Details" step={2} goToStep={goToStep} rows={[
            ["Full Name", formData.individualName],
            ["National ID", formData.nationalIdNumber],
            ["Contact", formData.contactNumber || "Not provided"],
            ["Official Email", formData.officialEmail],
            ["Designation", formData.designation],
          ]} />
        )}

        <SectionCard title="Address" step={3} goToStep={goToStep} rows={[
          ["Registered", formData.registeredAddress],
          ["Pincode", formData.pincode],
          ["Mailing", formData.mailingAddress],
        ]} />

        {isCompany ? (
          <SectionCard title="Authorized Signatory" step={4} goToStep={goToStep} rows={[
            ["Name", formData.signatoryName],
            ["Designation", formData.signatoryDesignation],
            ["Email", formData.signatoryEmail],
            ["Social / Website", formData.companySocialMedia],
          ]} />
        ) : (
          <SectionCard title="Work & Social" step={4} goToStep={goToStep} rows={[
            ["Nature of Work", formData.workDescription],
            ["Social Media", formData.socialMediaHandles],
          ]} />
        )}

        <div className="rounded-xl border border-slate-200 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3" style={{ background: "#f8fafc" }}>
            <span className="text-xs font-bold uppercase tracking-wider" style={{ color: "#001F3F" }}>
              Services Selected ({formData.services.length})
            </span>
            <button onClick={() => goToStep(5)} className="text-xs font-semibold px-3 py-1 rounded-lg hover:underline" style={{ color: "#FFA500" }}>Edit</button>
          </div>
          <div className="px-4 py-3">
            <div className="flex flex-wrap gap-2">
              {formData.services.map(s => (
                <span key={s} className="text-xs px-3 py-1.5 rounded-full font-medium" style={{ background: "#fff8e6", color: "#001F3F", border: "1px solid rgba(255,165,0,0.3)" }}>{s}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <p className="text-xs text-slate-400 mb-5 text-center">
        By submitting, you agree to our <span className="underline cursor-pointer" style={{ color: "#001F3F" }}>Terms of Service</span> and <span className="underline cursor-pointer" style={{ color: "#001F3F" }}>Privacy Policy</span>.
      </p>

      <div className="flex gap-3">
        <button onClick={onBack} disabled={isSubmitting}
          className="flex-1 py-3.5 rounded-xl font-semibold text-sm border-2 transition-all hover:bg-slate-50 disabled:opacity-50"
          style={{ borderColor: "#e2e8f0", color: "#64748b" }}>
          ← Back
        </button>
        <button onClick={onSubmit} disabled={isSubmitting}
          className="flex-[2] py-3.5 rounded-xl font-bold text-sm transition-all hover:opacity-90 active:scale-95 disabled:opacity-70 flex items-center justify-center gap-2"
          style={{ background: "#001F3F", color: "#fff" }}>
          {isSubmitting ? (
            <><svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>Submitting…</>
          ) : "Submit Application ✓"}
        </button>
      </div>
    </div>
  );
}
