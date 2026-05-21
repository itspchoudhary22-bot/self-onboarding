"use client";
import { useState } from "react";
import { FormData } from "./formTypes";

interface Props {
  formData: FormData;
  update: (f: Partial<FormData>) => void;
  onNext: () => void;
  onBack: () => void;
}

interface ServiceInfo {
  icon: string;
  name: string;
  desc: string;
  prompt: string;
  fullDesc: string;
  covers: string[];
  benefits: string[];
  note?: string;
}

const SERVICES: ServiceInfo[] = [
  {
    icon: "🛡️",
    name: "Digital Piracy Protection",
    desc: "Detect and remove unauthorized copies of your digital content.",
    prompt: "What content needs protection? (e.g. YouTube videos, Instagram reels, music, courses, eBooks)",
    fullDesc: "Protects your digital assets by detecting and removing unauthorized sharing, leaks, and illegal distributions across all major platforms.",
    covers: ["Unauthorized Video Sharing", "Article Piracy", "Unauthorized Image Usage", "Social Media Piracy Posts", "Audio & Music Piracy", "APK Piracy"],
    benefits: ["Protects revenue", "Secures digital assets", "Preserves creator rights"],
  },
  {
    icon: "®️",
    name: "Brand Protection",
    desc: "Safeguard your brand identity from misuse and impersonation.",
    prompt: "What brand issues are you facing? (e.g. fake accounts, counterfeit products, impersonation)",
    fullDesc: "Shields your brand end-to-end by monitoring, detecting, and eliminating threats across digital platforms.",
    covers: ["Brand Impersonation", "Social Media Fake Ads", "Fake Websites & Apps", "Logo Misuse", "Clickbait Content", "Google Fake Ads", "Fake Google Business Listings", "Unauthorized Listing"],
    benefits: ["Keeps brand presence clean", "Reduces major risks", "Boosts consumer confidence"],
  },
  {
    icon: "🔍",
    name: "Threat Intelligence",
    desc: "Real-time cyber threat intelligence and actionable insights.",
    prompt: "What threats are you concerned about? (e.g. data breaches, phishing, cyber attacks)",
    fullDesc: "Continuously monitors your brand online to detect misuse, threats, and emerging risks before they escalate.",
    covers: ["Tech Stack Vulnerability", "Git & Public Code Exposure", "Read-alike Domains / Typosquatting", "Fake Executive Profiles", "OSINT / Web Intelligence", "Fake Apps", "Human Intelligence", "Deep & Dark Web Leaked Data"],
    benefits: ["Keeps brand presence clean", "Reduces major risks", "Boosts consumer confidence"],
  },
  {
    icon: "🪪",
    name: "Identity Theft Protection",
    desc: "Monitor and protect identities from theft and fraud.",
    prompt: "Whose identity needs protection and what risks are you facing?",
    fullDesc: "Protect your digital identity from data leaks and fraud through fake profiles and unauthorized use of personal information.",
    covers: ["Fake Social Profiles", "Revenge Porn & Harassment", "Leaked Contact Details", "Personal Photo Misuse", "Deep Fakes", "Financial Data Leak"],
    benefits: ["Fraud Risk Prevention", "Stronger User Trust", "Improved Identity Control"],
  },
  {
    icon: "📊",
    name: "Business Intelligence",
    desc: "Data-driven insights to strengthen your competitive advantage.",
    prompt: "What insights are you looking for? (e.g. competitor analysis, market trends, brand sentiment)",
    fullDesc: "Continuously monitors your competition to provide deep insights on their operations, helping you evaluate gaps and opportunities.",
    covers: ["Competitors Analysis", "New Initiative Monitoring", "Region of Operations", "Search & Social Analysis", "Brand and IP Strategies", "Acquisitions"],
    benefits: ["Visibility", "Control Narrative", "Builds audience trust"],
  },
  {
    icon: "🏷️",
    name: "Counterfeit Protection",
    desc: "Identify and eliminate counterfeit products affecting your brand.",
    prompt: "What products are being counterfeited? Where are you seeing them?",
    fullDesc: "Identifies and takes down fake products, listings, and sellers to safeguard your brand's authenticity and customer trust.",
    covers: ["Marketplace Monitoring", "Fake Seller Tracking", "Counterfeit Removals", "Test Buy"],
    benefits: ["Stops Customer Misleading", "Ensures product authenticity", "Stops Revenue Loss"],
  },
  {
    icon: "⭐",
    name: "Reputation Management",
    desc: "Monitor and improve your online reputation across platforms.",
    prompt: "What reputation issues are you facing? (e.g. negative reviews, false news, defamation)",
    fullDesc: "Maintains your brand's digital integrity through continuous monitoring and rapid action on reputation-impacting content.",
    covers: ["Negative Review Removal", "Defamatory Content Removal", "Misleading Information Correction", "Parody Content Removal", "Online Credibility Improvement (OCI)", "Defamatory Reels & Memes"],
    benefits: ["Boosts positive brand image", "Minimizes negative content impact", "Strengthens customer trust"],
    note: "This service is not applicable to remove content that is protected by freedom of speech laws.",
  },
  {
    icon: "⚖️",
    name: "Legal Add-ons",
    desc: "Specialized legal support for IP disputes and enforcement.",
    prompt: "What legal assistance do you need? (e.g. takedown notices, IP registration, dispute resolution)",
    fullDesc: "Specialized legal support for IP disputes and enforcement, backed by partnerships with experienced litigation firms.",
    covers: ["Copyright / Defamation Litigation (District Court)", "Copyright / Defamation Litigation (High Court)", "Trademark Registration (Word Mark / Logo)", "Raids – Fast (Via Complaint)", "Raids – Slow (Via Court)", "Personality Rights (District & High Court)", "FIR Filing", "Cyber Investigation"],
    benefits: ["Expert legal backing", "Rapid turnaround on cases", "End-to-end enforcement support"],
  },
];

function InfoModal({ svc, onClose }: { svc: ServiceInfo; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)" }}
      onClick={onClose}>
      <div className="w-full max-w-md rounded-3xl overflow-hidden shadow-2xl"
        style={{ background: "#fff", maxHeight: "85vh", display: "flex", flexDirection: "column" }}
        onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className="px-6 pt-6 pb-4 flex items-start justify-between gap-3 flex-shrink-0"
          style={{ borderBottom: "1px solid #f3f4f6" }}>
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center text-xl flex-shrink-0"
              style={{ background: "#fff8e6" }}>
              {svc.icon}
            </div>
            <div>
              <h3 className="font-black text-base leading-tight" style={{ color: "#111827" }}>{svc.name}</h3>
              <p className="text-xs mt-0.5" style={{ color: "#9ca3af" }}>Service Overview</p>
            </div>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-gray-400 hover:bg-gray-100 transition-all flex-shrink-0 mt-0.5"
            style={{ fontSize: 18 }}>
            ×
          </button>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto px-6 py-5 flex flex-col gap-5">

          {/* Description */}
          <p className="text-sm leading-relaxed" style={{ color: "#374151" }}>{svc.fullDesc}</p>

          {/* What we cover */}
          <div>
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "#9ca3af" }}>What We Cover</p>
            <div className="grid grid-cols-1 gap-2">
              {svc.covers.map((item) => (
                <div key={item} className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl"
                  style={{ background: "#f9fafb", border: "1px solid #f3f4f6" }}>
                  <div className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: "#FFA500" }}>
                    <svg width="8" height="8" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-sm font-medium" style={{ color: "#374151" }}>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Benefits */}
          <div>
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "#9ca3af" }}>Key Benefits</p>
            <div className="flex flex-wrap gap-2">
              {svc.benefits.map((b) => (
                <span key={b} className="px-3 py-1.5 rounded-full text-xs font-semibold"
                  style={{ background: "rgba(255,165,0,0.1)", color: "#92400e", border: "1.5px solid rgba(255,165,0,0.25)" }}>
                  ✦ {b}
                </span>
              ))}
            </div>
          </div>

          {/* Note */}
          {svc.note && (
            <div className="flex items-start gap-2 px-4 py-3 rounded-xl text-xs"
              style={{ background: "#fefce8", border: "1px solid #fde68a", color: "#92400e" }}>
              <span className="flex-shrink-0 mt-0.5">ℹ️</span>
              <span>{svc.note}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 flex-shrink-0" style={{ borderTop: "1px solid #f3f4f6" }}>
          <button onClick={onClose}
            className="w-full py-3 rounded-2xl font-bold text-sm transition-all hover:opacity-90 active:scale-95"
            style={{ background: "#FFA500", color: "#111827" }}>
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Step3Services({ formData, update, onNext, onBack }: Props) {
  const [error, setError] = useState("");
  const [activeInfo, setActiveInfo] = useState<ServiceInfo | null>(null);

  const toggle = (name: string) => {
    const next = formData.services.includes(name)
      ? formData.services.filter((s) => s !== name)
      : [...formData.services, name];
    const details = { ...formData.serviceDetails };
    if (!next.includes(name)) delete details[name];
    update({ services: next, serviceDetails: details });
    if (error && next.length > 0) setError("");
  };

  const updateDetail = (name: string, value: string) => {
    update({ serviceDetails: { ...formData.serviceDetails, [name]: value } });
  };

  const handleNext = () => {
    if (formData.services.length === 0) { setError("Please select at least one service."); return; }
    onNext();
  };

  const selectedServices = SERVICES.filter((s) => formData.services.includes(s.name));

  return (
    <div>
      {activeInfo && <InfoModal svc={activeInfo} onClose={() => setActiveInfo(null)} />}

      <div className="mb-7">
        <h2 className="text-2xl sm:text-3xl font-black tracking-tight mb-2" style={{ color: "#111827", letterSpacing: "-0.02em" }}>
          Select Services
        </h2>
        <p className="text-sm sm:text-base" style={{ color: "#9ca3af" }}>
          Choose the protection services you need.{" "}
          <span className="font-semibold" style={{ color: "#FFA500" }}>Select at least one.</span>
        </p>
      </div>

      {error && (
        <div className="mb-5 flex items-center gap-2 px-4 py-3 rounded-2xl text-sm"
          style={{ background: "#fef2f2", border: "1.5px solid #fecaca", color: "#dc2626" }}>
          <span>⚠</span> {error}
        </div>
      )}

      {formData.services.length > 0 && (
        <div className="mb-5 flex items-center justify-between px-4 py-3 rounded-2xl"
          style={{ background: "rgba(255,165,0,0.08)", border: "1.5px solid rgba(255,165,0,0.2)" }}>
          <div className="flex items-center gap-2">
            <span>✅</span>
            <span className="text-sm font-semibold" style={{ color: "#92400e" }}>
              {formData.services.length} service{formData.services.length !== 1 ? "s" : ""} selected
            </span>
          </div>
          <button onClick={() => update({ services: [], serviceDetails: {} })}
            className="text-xs font-medium" style={{ color: "#9ca3af" }}>
            Clear all
          </button>
        </div>
      )}

      {/* Service grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-7">
        {SERVICES.map((svc) => {
          const sel = formData.services.includes(svc.name);
          return (
            <div key={svc.name} className="relative">
              <button type="button" onClick={() => toggle(svc.name)}
                className="text-left flex items-start gap-3 p-4 rounded-2xl border-2 transition-all duration-200 w-full pr-10"
                style={{
                  borderColor: sel ? "#FFA500" : "#e5e7eb",
                  background: sel ? "#fffbeb" : "#fff",
                  boxShadow: sel ? "0 0 0 4px rgba(255,165,0,0.1)" : "none",
                }}>
                <div className="w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all duration-200 flex-shrink-0 mt-0.5"
                  style={{ borderColor: sel ? "#FFA500" : "#d1d5db", background: sel ? "#FFA500" : "#fff" }}>
                  {sel && (
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="#111827" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-base">{svc.icon}</span>
                    <span className="font-bold text-sm" style={{ color: sel ? "#111827" : "#374151" }}>{svc.name}</span>
                  </div>
                  <p className="text-xs leading-relaxed" style={{ color: "#9ca3af" }}>{svc.desc}</p>
                </div>
              </button>

              {/* Info button — absolutely positioned so it doesn't trigger toggle */}
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setActiveInfo(svc); }}
                title="Learn more"
                className="absolute top-3 right-3 w-6 h-6 rounded-full flex items-center justify-center transition-all hover:scale-110"
                style={{ background: sel ? "rgba(255,165,0,0.15)" : "#f3f4f6", color: sel ? "#92400e" : "#9ca3af", fontSize: 11, fontWeight: 700 }}>
                i
              </button>
            </div>
          );
        })}
      </div>

      {/* Per-service detail textareas */}
      {selectedServices.length > 0 && (
        <div className="mb-7">
          <div className="flex items-start gap-3 px-5 py-4 rounded-2xl mb-5"
            style={{ background: "linear-gradient(135deg, #fff8e6, #fff)", border: "1.5px solid rgba(255,165,0,0.2)" }}>
            <span className="text-xl flex-shrink-0 mt-0.5">📝</span>
            <div>
              <p className="font-bold text-sm mb-1" style={{ color: "#111827" }}>Tell us more about your needs</p>
              <p className="text-xs leading-relaxed" style={{ color: "#9ca3af" }}>
                For each selected service, briefly describe what you&apos;re looking to protect or achieve. This helps us tailor our approach.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {selectedServices.map((svc) => (
              <div key={svc.name} className="rounded-2xl overflow-hidden"
                style={{ border: "1.5px solid #FFA500", background: "#fffbeb" }}>
                <div className="flex items-center gap-3 px-5 py-3.5"
                  style={{ borderBottom: "1px solid rgba(255,165,0,0.2)" }}>
                  <span className="text-lg">{svc.icon}</span>
                  <span className="font-bold text-sm flex-1" style={{ color: "#111827" }}>{svc.name}</span>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full"
                    style={{ background: "rgba(255,165,0,0.15)", color: "#92400e" }}>
                    Selected
                  </span>
                </div>
                <div className="px-5 py-4">
                  <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: "#9ca3af" }}>
                    {svc.prompt}
                  </label>
                  <textarea
                    rows={3}
                    placeholder={`Describe what you need for ${svc.name.toLowerCase()}…`}
                    value={formData.serviceDetails[svc.name] || ""}
                    onChange={(e) => updateDetail(svc.name, e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border-2 text-sm outline-none resize-none transition-all bg-white"
                    style={{ borderColor: "#e5e7eb", color: "#111827" }}
                    onFocus={(e) => (e.target.style.borderColor = "#FFA500")}
                    onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-3">
        <button onClick={onBack}
          className="flex-1 py-4 rounded-2xl font-semibold text-sm transition-all hover:bg-gray-50"
          style={{ border: "2px solid #e5e7eb", color: "#6b7280" }}>
          ← Back
        </button>
        <button onClick={handleNext}
          className="py-4 rounded-2xl font-extrabold text-sm transition-all hover:opacity-90 active:scale-95"
          style={{ flex: 2, background: "#FFA500", color: "#111827", boxShadow: "0 4px 14px rgba(255,165,0,0.3)" }}>
          Continue to Review →
        </button>
      </div>
    </div>
  );
}
