"use client";

import Link from "next/link";
import { FormData } from "./formTypes";

interface Props {
  formData: FormData;
}

export default function SuccessScreen({ formData }: Props) {
  const displayName =
    formData.type === "company" ? formData.companyName : formData.individualName;

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#f9fafb" }}>
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-1 font-black text-xl tracking-tight">
            <span style={{ color: "#111827" }}>BYTES</span>
            <span style={{ color: "#FFA500" }}>CARE</span>
          </Link>
          <span className="text-gray-400 text-sm">Customer Onboarding</span>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-lg">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 sm:p-10 text-center">
            {/* Checkmark */}
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
              style={{ background: "rgba(255,165,0,0.1)" }}
            >
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center"
                style={{ background: "#FFA500" }}
              >
                <svg
                  className="w-7 h-7 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>

            <h2
              className="text-2xl sm:text-3xl font-extrabold mb-2"
              style={{ color: "#111827" }}
            >
              Application Submitted!
            </h2>
            <p className="text-slate-500 mb-6">
              Thank you,{" "}
              <span className="font-semibold text-slate-700">{displayName || "there"}</span>! Your
              onboarding application has been received.
            </p>
            <p className="text-sm text-slate-500 mb-6">
              A confirmation will be sent to{" "}
              <span className="font-semibold text-slate-700">{formData.email}</span>.
            </p>

            {/* PandaDoc signing placeholder */}
            <div
              className="rounded-xl p-5 mb-6 text-left"
              style={{ border: "2px solid #FFA500", background: "#fffbeb" }}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">📄</span>
                <span
                  className="text-sm font-bold uppercase tracking-wide"
                  style={{ color: "#111827" }}
                >
                  Next Step: Document Signing
                </span>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed">
                We will prepare your <strong>Service Agreement</strong> and{" "}
                <strong>Letter of Authorization (LOA)</strong> and send them to your email for
                digital signing via <strong>PandaDoc</strong>. Please check your inbox and sign
                the documents to complete your onboarding.
              </p>
            </div>

            {/* Services selected */}
            {formData.services.length > 0 && (
              <div
                className="rounded-xl p-4 mb-8 text-left"
                style={{ background: "#f8fafc", border: "1px solid #e2e8f0" }}
              >
                <p
                  className="text-xs font-bold uppercase tracking-wider mb-3"
                  style={{ color: "#111827" }}
                >
                  Services You Selected
                </p>
                <div className="flex flex-wrap gap-2">
                  {formData.services.map((s) => (
                    <span
                      key={s}
                      className="text-xs px-3 py-1.5 rounded-full font-medium"
                      style={{
                        background: "#fff",
                        color: "#111827",
                        border: "1px solid rgba(255,165,0,0.4)",
                      }}
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <Link
              href="/"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-bold text-base transition-all duration-200 hover:opacity-90 active:scale-95"
              style={{ background: "#FFA500", color: "#111827" }}
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </main>

      <div
        className="h-1.5"
        style={{ background: "linear-gradient(90deg, #FFA500, #7C3AED)" }}
      />
    </div>
  );
}
