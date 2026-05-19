"use client";

import Link from "next/link";

const SERVICES = [
  {
    icon: "🛡️",
    name: "Digital Piracy Protection",
    desc: "Detect and remove unauthorized copies of your digital content across the web.",
  },
  {
    icon: "®️",
    name: "Brand Protection",
    desc: "Safeguard your brand identity from misuse, impersonation, and counterfeiting.",
  },
  {
    icon: "🔍",
    name: "Threat Intelligence",
    desc: "Stay ahead of cyber threats with real-time intelligence and actionable insights.",
  },
  {
    icon: "🪪",
    name: "Identity Theft Protection",
    desc: "Monitor and protect personal and business identities from theft and fraud.",
  },
  {
    icon: "📊",
    name: "Business Intelligence",
    desc: "Leverage data-driven insights to strengthen your competitive advantage.",
  },
  {
    icon: "🏷️",
    name: "Counterfeit Protection",
    desc: "Identify and eliminate counterfeit products affecting your brand and customers.",
  },
  {
    icon: "⭐",
    name: "Reputation Management",
    desc: "Monitor, manage, and improve your online reputation across all platforms.",
  },
  {
    icon: "⚖️",
    name: "Legal Add-ons",
    desc: "Access specialized legal support and enforcement services for IP disputes.",
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Nav */}
      <nav
        className="sticky top-0 z-50 shadow-md"
        style={{ background: "#001F3F" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center text-white font-bold text-lg"
              style={{ background: "#FFA500" }}
            >
              B
            </div>
            <span className="text-white font-bold text-xl tracking-tight">
              Bytescare
            </span>
          </div>
          <Link
            href="/onboarding"
            className="px-5 py-2 rounded-lg font-semibold text-sm transition-all duration-200 hover:opacity-90 active:scale-95"
            style={{ background: "#FFA500", color: "#001F3F" }}
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section
        className="relative overflow-hidden py-24 sm:py-32"
        style={{
          background:
            "linear-gradient(135deg, #001F3F 0%, #003366 60%, #004080 100%)",
        }}
      >
        <div
          className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-10 blur-3xl"
          style={{ background: "#FFA500" }}
        />
        <div
          className="absolute bottom-0 left-0 w-72 h-72 rounded-full opacity-10 blur-3xl"
          style={{ background: "#FFA500" }}
        />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium mb-6"
            style={{ background: "rgba(255,165,0,0.15)", color: "#FFA500" }}
          >
            <span className="w-2 h-2 rounded-full bg-orange-400 animate-pulse inline-block" />
            Trusted Digital Protection
          </div>
          <h1 className="text-5xl sm:text-6xl font-extrabold text-white leading-tight mb-4">
            Bytescare
          </h1>
          <p
            className="text-2xl sm:text-3xl font-semibold mb-6"
            style={{ color: "#FFA500" }}
          >
            You Create, We Protect
          </p>
          <p className="text-lg text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed">
            Comprehensive digital protection services for individuals and
            businesses. From piracy prevention to reputation management — we&apos;ve
            got you covered.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/onboarding"
              className="px-8 py-4 rounded-xl font-bold text-lg transition-all duration-200 hover:opacity-90 active:scale-95 shadow-xl"
              style={{ background: "#FFA500", color: "#001F3F" }}
            >
              Start Onboarding →
            </Link>
            <a
              href="#services"
              className="px-8 py-4 rounded-xl font-bold text-lg border-2 text-white transition-all duration-200 hover:bg-white/10"
              style={{ borderColor: "rgba(255,255,255,0.3)" }}
            >
              View Services
            </a>
          </div>

          <div className="mt-16 grid grid-cols-3 gap-6 max-w-xl mx-auto">
            {[
              { val: "10K+", label: "Clients Protected" },
              { val: "99.9%", label: "Uptime" },
              { val: "24/7", label: "Monitoring" },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <div
                  className="text-2xl font-extrabold"
                  style={{ color: "#FFA500" }}
                >
                  {s.val}
                </div>
                <div className="text-xs text-slate-400 mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section id="services" className="py-20 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2
              className="text-3xl sm:text-4xl font-extrabold mb-3"
              style={{ color: "#001F3F" }}
            >
              Our Protection Services
            </h2>
            <p className="text-slate-500 text-lg max-w-xl mx-auto">
              Choose from our comprehensive suite of digital protection services
              tailored for your needs.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {SERVICES.map((svc) => (
              <div
                key={svc.name}
                className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group"
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform duration-200"
                  style={{ background: "rgba(255,165,0,0.1)" }}
                >
                  {svc.icon}
                </div>
                <h3
                  className="font-bold text-base mb-2 leading-snug"
                  style={{ color: "#001F3F" }}
                >
                  {svc.name}
                </h3>
                <p className="text-slate-500 text-sm leading-relaxed">
                  {svc.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 sm:px-6">
        <div
          className="max-w-3xl mx-auto rounded-3xl p-12 text-center shadow-2xl"
          style={{
            background: "linear-gradient(135deg, #001F3F 0%, #003366 100%)",
          }}
        >
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
            Ready to protect what&apos;s yours?
          </h2>
          <p className="text-slate-300 text-lg mb-8 max-w-lg mx-auto">
            Join thousands of individuals and businesses who trust Bytescare to
            defend their digital presence.
          </p>
          <Link
            href="/onboarding"
            className="inline-flex items-center gap-2 px-10 py-4 rounded-xl font-bold text-lg transition-all duration-200 hover:opacity-90 active:scale-95 shadow-xl"
            style={{ background: "#FFA500", color: "#001F3F" }}
          >
            Start Your Onboarding →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer
        className="py-8 text-center text-sm text-slate-400"
        style={{ borderTop: "1px solid #e2e8f0" }}
      >
        <p>
          &copy; {new Date().getFullYear()} Bytescare. All rights reserved. |{" "}
          <span style={{ color: "#001F3F" }} className="font-medium">
            You Create, We Protect
          </span>
        </p>
      </footer>
    </div>
  );
}
