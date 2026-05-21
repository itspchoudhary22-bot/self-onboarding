"use client";

import Link from "next/link";
import { FormData } from "./formTypes";
import { IconEnvelope, IconCog, IconKey, IconUserCircle, IconCheckCircle, IconLink } from "./Icons";

interface Props {
  formData: FormData;
  documentSigned: boolean;
}

export default function SuccessScreen({ formData, documentSigned }: Props) {
  const displayName = formData.type === "company" ? formData.companyName : formData.individualName;
  const recipientEmail = formData.type === "company"
    ? formData.signatoryEmail || formData.email
    : formData.officialEmail || formData.email;

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#f9fafb" }}>
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="w-full px-6 sm:px-10 h-14 flex items-center justify-between">
          <Link href="/">
            <img src="/logo.svg" alt="Bytescare" height={22} style={{ height: 22 }} />
          </Link>
          <span className="text-gray-400 text-sm">Customer Onboarding</span>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-lg">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 sm:p-10">
            {/* Checkmark */}
            <div className="text-center mb-6">
              <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5" style={{ background: "rgba(255,165,0,0.1)" }}>
                <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: "#FFA500" }}>
                  <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold mb-2" style={{ color: "#111827" }}>
                You&apos;re All Set!
              </h2>
              <p className="text-gray-500">
                Thank you, <span className="font-semibold text-gray-700">{displayName || "there"}</span>. Your onboarding is complete.
              </p>
            </div>

            {/* What happens next */}
            <div className="rounded-xl border border-amber-200 bg-amber-50 px-5 py-4 mb-5">
              <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">What happens next</p>
              <div className="space-y-3">
                {[
                  { icon: <IconEnvelope size={16} color="#FFA500" />, text: `A confirmation email has been sent to ${recipientEmail}` },
                  { icon: <IconCog size={16} color="#FFA500" />, text: "Our operations team will begin setting up your account" },
                  { icon: <IconKey size={16} color="#FFA500" />, text: "You will receive your client dashboard credentials within 1–2 business days" },
                  { icon: <IconUserCircle size={16} color="#FFA500" />, text: "Your account manager will reach out shortly to guide you" },
                ].map((item) => (
                  <div key={item.text} className="flex items-start gap-3">
                    <span className="flex-shrink-0 mt-0.5">{item.icon}</span>
                    <span className="text-sm text-gray-600">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Documents signed indicator */}
            {documentSigned && (
              <div className="rounded-xl border border-green-200 bg-green-50 px-5 py-3 mb-5 flex items-center gap-3">
                <IconCheckCircle size={20} color="#16a34a" />
                <div>
                  <p className="text-sm font-semibold text-green-800">Documents Signed</p>
                  <p className="text-xs text-green-600">Your Service Agreement and LOA have been successfully signed and recorded.</p>
                </div>
              </div>
            )}

            {/* Services */}
            {formData.services.length > 0 && (
              <div className="rounded-xl border border-gray-100 bg-gray-50 px-5 py-4 mb-6">
                <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">Services Enrolled</p>
                <div className="flex flex-wrap gap-2">
                  {formData.services.map((s) => (
                    <span key={s} className="text-xs px-3 py-1.5 rounded-full font-medium" style={{ background: "#fff", color: "#111827", border: "1px solid rgba(255,165,0,0.4)" }}>
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <Link
              href="/"
              className="flex items-center justify-center gap-2 w-full px-8 py-3.5 rounded-xl font-bold text-base transition-all hover:opacity-90 active:scale-95"
              style={{ background: "#FFA500", color: "#111827" }}
            >
              ← Back to Home
            </Link>

            <p className="text-center text-xs text-gray-400 mt-4">
              Questions? <a href="mailto:support@bytescare.com" className="underline text-gray-500">support@bytescare.com</a>
            </p>
          </div>
        </div>
      </main>

      <div className="h-1.5" style={{ background: "linear-gradient(90deg, #FFA500, #7C3AED)" }} />
    </div>
  );
}
