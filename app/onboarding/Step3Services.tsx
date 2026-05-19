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
  { icon: "🛡️", name: "Digital Piracy Protection", desc: "Detect and remove unauthorized copies of your digital content." },
  { icon: "®️", name: "Brand Protection", desc: "Safeguard your brand identity from misuse and impersonation." },
  { icon: "🔍", name: "Threat Intelligence", desc: "Real-time cyber threat intelligence and actionable insights." },
  { icon: "🪪", name: "Identity Theft Protection", desc: "Monitor and protect identities from theft and fraud." },
  { icon: "📊", name: "Business Intelligence", desc: "Data-driven insights to strengthen your competitive advantage." },
  { icon: "🏷️", name: "Counterfeit Protection", desc: "Identify and eliminate counterfeit products affecting your brand." },
  { icon: "⭐", name: "Reputation Management", desc: "Monitor and improve your online reputation across platforms." },
  { icon: "⚖️", name: "Legal Add-ons", desc: "Specialized legal support for IP disputes and enforcement." },
];

export default function Step3Services({ formData, update, onNext, onBack }: Props) {
  const [error, setError] = useState("");

  const toggle = (name: string) => {
    const curr = formData.services;
    const next = curr.includes(name) ? curr.filter((s) => s !== name) : [...curr, name];
    update({ services: next });
    if (error && next.length > 0) setError("");
  };

  const handleNext = () => {
    if (formData.services.length === 0) { setError("Please select at least one service."); return; }
    onNext();
  };

  return (
    <div>
      <div className="mb-5">
        <h2 className="text-2xl font-black text-gray-900">Select Services</h2>
        <p className="text-gray-500 mt-1 text-sm">
          Choose the protection services you need.{" "}
          <span style={{ color: "#FFA500" }} className="font-semibold">Select at least one.</span>
        </p>
      </div>

      {error && (
        <div className="mb-4 flex items-center gap-2 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
          <span>⚠</span> {error}
        </div>
      )}

      {formData.services.length > 0 && (
        <div className="mb-4 px-4 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2" style={{ background: "rgba(255,165,0,0.1)" }}>
          <span style={{ color: "#FFA500" }}>✓</span>
          <span className="text-gray-700">{formData.services.length} service{formData.services.length !== 1 ? "s" : ""} selected</span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-7">
        {SERVICES.map((svc) => {
          const sel = formData.services.includes(svc.name);
          return (
            <button key={svc.name} type="button" onClick={() => toggle(svc.name)}
              className="text-left flex items-start gap-3 p-4 rounded-xl border-2 transition-all duration-200 w-full"
              style={{ borderColor: sel ? "#FFA500" : "#e5e7eb", background: sel ? "#fffbeb" : "#fff", boxShadow: sel ? "0 0 0 3px rgba(255,165,0,0.12)" : "none" }}>
              <div className="mt-0.5 flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-200"
                style={{ borderColor: sel ? "#FFA500" : "#d1d5db", background: sel ? "#FFA500" : "#fff" }}>
                {sel && (
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="#111827" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="text-base">{svc.icon}</span>
                  <span className="font-semibold text-sm text-gray-800">{svc.name}</span>
                </div>
                <p className="text-xs text-gray-500 leading-relaxed">{svc.desc}</p>
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex gap-3">
        <button onClick={onBack} className="flex-1 py-3.5 rounded-xl font-semibold text-sm border-2 border-gray-200 text-gray-500 transition-all hover:bg-gray-50">← Back</button>
        <button onClick={handleNext} className="flex-[2] py-3.5 rounded-xl font-bold text-sm transition-all hover:opacity-90 active:scale-95" style={{ background: "#FFA500", color: "#111827" }}>Continue to Review →</button>
      </div>
    </div>
  );
}
