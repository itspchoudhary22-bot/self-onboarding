"use client";

import Link from "next/link";

const SERVICES = [
  { icon: "🛡️", name: "Digital Piracy Protection", desc: "Detect and remove unauthorized copies of your digital content across the web." },
  { icon: "®️", name: "Brand Protection", desc: "Safeguard your brand identity from misuse, impersonation, and counterfeiting." },
  { icon: "🔍", name: "Threat Intelligence", desc: "Real-time cyber threat intelligence and actionable insights." },
  { icon: "🪪", name: "Identity Theft Protection", desc: "Monitor and protect identities from theft and fraud." },
  { icon: "📊", name: "Business Intelligence", desc: "Data-driven insights to strengthen your competitive advantage." },
  { icon: "🏷️", name: "Counterfeit Protection", desc: "Identify and eliminate counterfeit products affecting your brand." },
  { icon: "⭐", name: "Reputation Management", desc: "Monitor and improve your online reputation across all platforms." },
  { icon: "⚖️", name: "Legal Add-ons", desc: "Specialized legal support for IP disputes and enforcement." },
];

const FEATURES = [
  { icon: "⚡", title: "Fast Response", desc: "Our systems detect and respond to threats within hours, not days." },
  { icon: "🔒", title: "Legal Expertise", desc: "Backed by a team of IP lawyers and digital rights specialists." },
  { icon: "🌍", title: "Global Coverage", desc: "We operate across 50+ countries protecting your IP worldwide." },
];

const STATS = [
  { val: "10K+", label: "Clients" },
  { val: "99.9%", label: "Uptime" },
  { val: "24/7", label: "Monitoring" },
  { val: "50+", label: "Countries" },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Nav */}
      <nav className="sticky top-0 z-50 shadow-md" style={{ background: "#001F3F" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center font-bold text-lg"
              style={{ background: "#FFA500", color: "#001F3F" }}
            >
              B
            </div>
            <span className="text-white font-bold text-xl tracking-tight">Bytescare</span>
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
        className="relative overflow-hidden py-24 sm:py-36"
        style={{ background: "linear-gradient(135deg, #001F3F 0%, #003875 100%)" }}
      >
        {/* Decorative blobs */}
        <div
          className="absolute top-0 right-0 w-96 h-96 rounded-full blur-3xl pointer-events-none"
          style={{ background: "#FFA500", opacity: 0.1 }}
        />
        <div
          className="absolute bottom-0 left-0 w-72 h-72 rounded-full blur-3xl pointer-events-none"
          style={{ background: "#FFA500", opacity: 0.1 }}
        />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center">
          {/* Badge */}
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium mb-8"
            style={{ background: "rgba(255,165,0,0.15)", color: "#FFA500" }}
          >
            <span className="w-2 h-2 rounded-full inline-block animate-pulse" style={{ background: "#FFA500" }} />
            🔒 Trusted by 10,000+ Clients
          </div>

          <h1 className="text-5xl sm:text-7xl font-black text-white leading-none mb-4 tracking-tight">
            Bytescare
          </h1>
          <p className="text-2xl sm:text-3xl font-bold mb-6" style={{ color: "#FFA500" }}>
            You Create, We Protect
          </p>
          <p className="text-lg text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed">
            Comprehensive digital protection services for individuals and businesses — from
            piracy prevention to reputation management, we&apos;ve got you covered.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
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

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4 max-w-xl mx-auto">
            {STATS.map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-2xl sm:text-3xl font-extrabold" style={{ color: "#FFA500" }}>
                  {s.val}
                </div>
                <div className="text-xs text-slate-400 mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Bytescare */}
      <section className="py-20 px-4 sm:px-6" style={{ background: "#f8fafc" }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-extrabold mb-3" style={{ color: "#001F3F" }}>
              Why Bytescare?
            </h2>
            <p className="text-slate-500 text-lg max-w-xl mx-auto">
              Industry-leading protection built on expertise, speed, and global reach.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 text-center"
              >
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4"
                  style={{ background: "rgba(255,165,0,0.1)" }}
                >
                  {f.icon}
                </div>
                <h3 className="font-bold text-lg mb-2" style={{ color: "#001F3F" }}>
                  {f.title}
                </h3>
                <p className="text-slate-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services */}
      <section id="services" className="py-20 px-4 sm:px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-extrabold mb-3" style={{ color: "#001F3F" }}>
              Our Protection Services
            </h2>
            <p className="text-slate-500 text-lg max-w-xl mx-auto">
              Choose from our comprehensive suite of digital protection services tailored for
              your needs.
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
                <h3 className="font-bold text-base mb-2 leading-snug" style={{ color: "#001F3F" }}>
                  {svc.name}
                </h3>
                <p className="text-slate-500 text-sm leading-relaxed">{svc.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-20 px-4 sm:px-6" style={{ background: "#001F3F" }}>
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-3">
            How It Works
          </h2>
          <p className="text-slate-400 text-lg mb-12">
            Get started in three simple steps
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-0 relative">
            {[
              { num: "1", title: "Fill the Form", desc: "Complete the onboarding form with your details and choose services." },
              { num: "2", title: "We Review", desc: "Our team reviews your application within 24 hours." },
              { num: "3", title: "Services Activated", desc: "Your protection services go live after confirmation." },
            ].map((step, i) => (
              <div key={step.num} className="relative flex flex-col items-center px-6">
                {i < 2 && (
                  <div
                    className="hidden sm:block absolute top-6 left-1/2 w-full h-0.5"
                    style={{ background: "rgba(255,165,0,0.3)" }}
                  />
                )}
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-xl font-black mb-4 relative z-10"
                  style={{ background: "#FFA500", color: "#001F3F" }}
                >
                  {step.num}
                </div>
                <h3 className="text-white font-bold text-lg mb-2">{step.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 sm:px-6" style={{ background: "#f8fafc" }}>
        <div
          className="max-w-3xl mx-auto rounded-3xl p-12 text-center shadow-2xl"
          style={{ background: "linear-gradient(135deg, #001F3F 0%, #003875 100%)" }}
        >
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
            Ready to protect what&apos;s yours?
          </h2>
          <p className="text-slate-300 text-lg mb-8 max-w-lg mx-auto">
            Join thousands of individuals and businesses who trust Bytescare to defend their
            digital presence.
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
      <footer className="py-10 px-4 text-center" style={{ background: "#001428", borderTop: "1px solid #0a2540" }}>
        <div className="flex items-center justify-center gap-3 mb-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm"
            style={{ background: "#FFA500", color: "#001F3F" }}
          >
            B
          </div>
          <span className="text-white font-bold text-lg">Bytescare</span>
        </div>
        <p className="text-slate-500 text-sm mb-1">You Create, We Protect</p>
        <p className="text-slate-600 text-xs">
          &copy; {new Date().getFullYear()} Bytescare. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
