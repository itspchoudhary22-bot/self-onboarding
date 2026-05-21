"use client";
import Link from "next/link";

const STEPS = [
  { n: 1, title: "Basic Information", sub: "Email, type, country", time: "~1 min" },
  { n: 2, title: "Personal / Company Details", sub: "ID, address, documents", time: "~3 min" },
  { n: 3, title: "Select Services", sub: "Choose your protection plan", time: "~1 min" },
  { n: 4, title: "Review & Sign Documents", sub: "Verify and sign digitally", time: "~2 min" },
];

const CHECKLIST = [
  "Government-issued identity verification",
  "Registered business or personal address",
  "Contact number and official email",
  "Social media handles or website",
  "Digital signature on Service Agreement & LOA",
];

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: "linear-gradient(135deg, #fff8e6 0%, #fff 50%, #f5f3ff 100%)" }}>
      <nav style={{ background: "rgba(255,255,255,0.85)", backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(0,0,0,0.06)", position: "sticky", top: 0, zIndex: 40 }}>
        <div className="w-full px-6 sm:px-10 h-16 flex items-center justify-between">
          <img src="/logo.svg" alt="Bytescare" height={24} style={{ height: 24 }} />
          <a href="https://bytescare.com" target="_blank" rel="noopener noreferrer"
            className="text-sm font-medium hidden sm:block transition-colors"
            style={{ color: "#9ca3af" }}>
            ← Back to main site
          </a>
        </div>
      </nav>

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-14 sm:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">

          {/* Left */}
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium mb-7"
              style={{ background: "#fff", borderColor: "#e5e7eb", color: "#374151", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
              <span className="w-2 h-2 rounded-full bg-green-400 inline-block" />
              Takes 5–10 minutes to complete
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black leading-tight tracking-tight mb-5" style={{ color: "#111827", letterSpacing: "-0.03em" }}>
              Start Your{" "}
              <span style={{ background: "linear-gradient(135deg, #FFA500, #f97316)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                Bytescare
              </span>
              <br />Onboarding
            </h1>

            <p className="text-base sm:text-lg mb-7 leading-relaxed" style={{ color: "#6b7280", maxWidth: 420 }}>
              Complete your onboarding to access Bytescare&apos;s full suite of digital protection services. We&apos;ll prepare your legal documents for signing.
            </p>

            <Link href="/onboarding"
              className="inline-flex items-center justify-center gap-2 px-10 py-4 rounded-2xl font-extrabold text-base transition-all hover:opacity-90 active:scale-95 w-full sm:w-auto mb-8"
              style={{ background: "#FFA500", color: "#111827", boxShadow: "0 8px 24px rgba(255,165,0,0.35)" }}>
              Start Onboarding →
            </Link>

            <div style={{ borderTop: "1px solid #f3f4f6" }}>
              {CHECKLIST.map((item) => (
                <div key={item} className="flex items-center gap-3 py-3" style={{ borderBottom: "1px solid #f3f4f6" }}>
                  <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "#FFA500" }}>
                    <svg width="11" height="11" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-sm sm:text-base font-medium" style={{ color: "#374151" }}>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right – step timeline card */}
          <div className="hidden lg:block">
            <div className="rounded-3xl p-8" style={{ background: "#fff", boxShadow: "0 24px 64px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.04)" }}>
              <div className="flex items-center gap-4 mb-8">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0"
                  style={{ background: "#FFA500", boxShadow: "0 8px 20px rgba(255,165,0,0.35)" }}>
                  📋
                </div>
                <div>
                  <p className="font-extrabold text-lg" style={{ color: "#111827" }}>Customer Onboarding</p>
                  <p className="text-sm" style={{ color: "#9ca3af" }}>4 simple steps to get started</p>
                </div>
              </div>

              <div className="flex flex-col gap-0">
                {STEPS.map((s, i) => (
                  <div key={s.n}>
                    <div className="flex items-center gap-4">
                      <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                        style={{ background: i === 0 ? "#FFA500" : "#f3f4f6", color: i === 0 ? "#111827" : "#9ca3af" }}>
                        {s.n}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-sm" style={{ color: i === 0 ? "#111827" : "#374151" }}>{s.title}</p>
                        <p className="text-xs" style={{ color: "#9ca3af" }}>{s.sub}</p>
                      </div>
                      <span className="text-xs font-medium px-2.5 py-1 rounded-full" style={{ background: "#f3f4f6", color: "#9ca3af" }}>{s.time}</span>
                    </div>
                    {i < STEPS.length - 1 && (
                      <div className="ml-4 my-1" style={{ width: 2, height: 20, background: "#f3f4f6", borderRadius: 2 }} />
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-7 flex items-center gap-3 p-4 rounded-2xl" style={{ background: "#f9fafb" }}>
                <span className="text-xl">🔒</span>
                <p className="text-sm" style={{ color: "#6b7280" }}>Your data is encrypted and stored securely</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <div className="h-1" style={{ background: "linear-gradient(90deg, #FFA500, #7C3AED)" }} />
      <footer className="py-4 text-center text-xs" style={{ color: "#9ca3af", background: "#fff", borderTop: "1px solid #f3f4f6" }}>
        © {new Date().getFullYear()} Bytescare. All rights reserved.
      </footer>
    </div>
  );
}
