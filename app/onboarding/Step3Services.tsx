"use client";
import { useState } from "react";
import { FormData } from "./formTypes";

interface Props {
  formData: FormData;
  update: (f: Partial<FormData>) => void;
  onNext: () => void;
  onBack: () => void;
}

const SERVICES = [
  { icon: "🛡️", name: "Digital Piracy Protection", desc: "Detect and remove unauthorized copies of your digital content.", prompt: "What content needs protection? (e.g. YouTube videos, Instagram reels, music, courses, eBooks)" },
  { icon: "®️", name: "Brand Protection", desc: "Safeguard your brand identity from misuse and impersonation.", prompt: "What brand issues are you facing? (e.g. fake accounts, counterfeit products, impersonation)" },
  { icon: "🔍", name: "Threat Intelligence", desc: "Real-time cyber threat intelligence and actionable insights.", prompt: "What threats are you concerned about? (e.g. data breaches, phishing, cyber attacks)" },
  { icon: "🪪", name: "Identity Theft Protection", desc: "Monitor and protect identities from theft and fraud.", prompt: "Whose identity needs protection and what risks are you facing?" },
  { icon: "📊", name: "Business Intelligence", desc: "Data-driven insights to strengthen your competitive advantage.", prompt: "What insights are you looking for? (e.g. competitor analysis, market trends, brand sentiment)" },
  { icon: "🏷️", name: "Counterfeit Protection", desc: "Identify and eliminate counterfeit products affecting your brand.", prompt: "What products are being counterfeited? Where are you seeing them?" },
  { icon: "⭐", name: "Reputation Management", desc: "Monitor and improve your online reputation across platforms.", prompt: "What reputation issues are you facing? (e.g. negative reviews, false news, defamation)" },
  { icon: "⚖️", name: "Legal Add-ons", desc: "Specialized legal support for IP disputes and enforcement.", prompt: "What legal assistance do you need? (e.g. takedown notices, IP registration, dispute resolution)" },
];

export default function Step3Services({ formData, update, onNext, onBack }: Props) {
  const [error, setError] = useState("");

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
            <button key={svc.name} type="button" onClick={() => toggle(svc.name)}
              className="text-left flex items-start gap-3 p-4 rounded-2xl border-2 transition-all duration-200 w-full"
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
