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
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header style={{ background: "#001F3F" }} className="shadow-md">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm"
              style={{ background: "#FFA500", color: "#001F3F" }}
            >
              B
            </div>
            <span className="text-white font-bold text-lg tracking-tight">Bytescare</span>
          </Link>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-lg">
          <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-8 sm:p-10 text-center">
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

            <h2 className="text-2xl sm:text-3xl font-extrabold mb-2" style={{ color: "#001F3F" }}>
              Application Submitted!
            </h2>
            <p className="text-slate-500 mb-6">
              Thank you,{" "}
              <span className="font-semibold text-slate-700">{displayName || "there"}</span>! Your
              onboarding application has been received.
            </p>

            {/* Summary card */}
            <div
              className="rounded-xl p-4 mb-6 text-left space-y-2"
              style={{ background: "#f8fafc", border: "1px solid #e2e8f0" }}
            >
              <div className="flex gap-3 text-sm">
                <span className="text-slate-400 font-medium min-w-[80px]">Email</span>
                <span className="text-slate-700 font-semibold" style={{ color: "#001F3F" }}>
                  {formData.email}
                </span>
              </div>
              <div className="flex gap-3 text-sm">
                <span className="text-slate-400 font-medium min-w-[80px]">Type</span>
                <span className="text-slate-700 capitalize">{formData.type}</span>
              </div>
              <div className="flex gap-3 text-sm">
                <span className="text-slate-400 font-medium min-w-[80px]">Country</span>
                <span className="text-slate-700">{formData.country}</span>
              </div>
            </div>

            {/* Services summary */}
            <div
              className="rounded-xl p-4 mb-8 text-left"
              style={{ background: "#fff8e6", border: "1px solid rgba(255,165,0,0.2)" }}
            >
              <p
                className="text-xs font-bold uppercase tracking-wider mb-3"
                style={{ color: "#001F3F" }}
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
                      color: "#001F3F",
                      border: "1px solid rgba(255,165,0,0.4)",
                    }}
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>

            {/* Next steps */}
            <div className="space-y-3 mb-8 text-left">
              {[
                "Application review within 24 hours",
                "Onboarding call scheduled via email",
                "Services activated upon confirmation",
              ].map((step, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                    style={{ background: "#001F3F", color: "#FFA500" }}
                  >
                    {i + 1}
                  </div>
                  <span className="text-sm text-slate-600">{step}</span>
                </div>
              ))}
            </div>

            <Link
              href="/"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-bold text-base transition-all duration-200 hover:opacity-90 active:scale-95"
              style={{ background: "#001F3F", color: "#fff" }}
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
