"use client";

import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Nav - matches bytescare.com white nav */}
      <nav className="border-b border-gray-100 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-1 font-black text-2xl tracking-tight select-none">
            <span style={{ color: "#111827" }}>BYTES</span>
            <span style={{ color: "#FFA500" }}>CARE</span>
          </div>
          <a
            href="https://bytescare.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-slate-500 hover:text-slate-700 transition-colors hidden sm:block"
          >
            ← Back to main site
          </a>
        </div>
      </nav>

      {/* Main content - clean and minimal */}
      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="max-w-lg w-full text-center">
          {/* Icon */}
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-6 shadow-md"
            style={{ background: "#FFA500" }}
          >
            📋
          </div>

          <h1 className="text-3xl sm:text-4xl font-black text-gray-900 mb-3">
            Customer Onboarding
          </h1>
          <p className="text-gray-500 text-base leading-relaxed mb-8 max-w-md mx-auto">
            The following information is required to prepare legal documents such as
            the <strong className="text-gray-700">Authorisation Letter</strong> and{" "}
            <strong className="text-gray-700">Service Agreement</strong> for your
            official onboarding with Bytescare.
          </p>

          {/* Info checklist */}
          <div className="bg-gray-50 rounded-2xl p-5 mb-8 text-left border border-gray-100">
            <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">
              You will need to provide
            </p>
            <div className="space-y-2">
              {[
                "Valid email address",
                "Government-issued ID details",
                "Registered address",
                "Contact information",
                "Business / work description",
                "Social media handles or website",
              ].map((item) => (
                <div key={item} className="flex items-center gap-2.5 text-sm text-gray-600">
                  <span
                    className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 text-white text-xs font-bold"
                    style={{ background: "#FFA500" }}
                  >
                    ✓
                  </span>
                  {item}
                </div>
              ))}
            </div>
          </div>

          <Link
            href="/onboarding"
            className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-10 py-4 rounded-xl font-bold text-base transition-all duration-200 hover:opacity-90 active:scale-95 shadow-lg"
            style={{ background: "#FFA500", color: "#111827" }}
          >
            Start Onboarding →
          </Link>

          <p className="text-xs text-gray-400 mt-4">
            Takes approximately 5–10 minutes to complete
          </p>
        </div>
      </main>

      {/* Minimal gradient footer strip - matches bytescare.com */}
      <div
        className="h-2"
        style={{ background: "linear-gradient(90deg, #FFA500, #7C3AED)" }}
      />

      <footer className="bg-white py-4 text-center text-xs text-gray-400 border-t border-gray-100">
        &copy; {new Date().getFullYear()} Bytescare. All rights reserved.
      </footer>
    </div>
  );
}
