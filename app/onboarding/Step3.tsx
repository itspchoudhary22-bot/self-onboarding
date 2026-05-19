"use client";

import { useState } from "react";
import { FormData } from "./page";

interface Props {
  formData: FormData;
  update: (fields: Partial<FormData>) => void;
  onNext: () => void;
  onBack: () => void;
}

const SERVICES = [
  {
    id: "Digital Piracy Protection",
    icon: "🛡️",
    desc: "Detect and remove unauthorized copies of your digital content across the web.",
  },
  {
    id: "Brand Protection",
    icon: "®️",
    desc: "Safeguard your brand identity from misuse, impersonation, and counterfeiting.",
  },
  {
    id: "Threat Intelligence",
    icon: "🔍",
    desc: "Stay ahead of cyber threats with real-time intelligence and actionable insights.",
  },
  {
    id: "Identity Theft Protection",
    icon: "🪪",
    desc: "Monitor and protect personal and business identities from theft and fraud.",
  },
  {
    id: "Business Intelligence",
    icon: "📊",
    desc: "Leverage data-driven insights to strengthen your competitive advantage.",
  },
  {
    id: "Counterfeit Protection",
    icon: "🏷️",
    desc: "Identify and eliminate counterfeit products affecting your brand and customers.",
  },
  {
    id: "Reputation Management",
    icon: "⭐",
    desc: "Monitor, manage, and improve your online reputation across all platforms.",
  },
  {
    id: "Legal Add-ons",
    icon: "⚖️",
    desc: "Access specialized legal support and enforcement services for IP disputes.",
  },
];

export default function Step3({ formData, update, onNext, onBack }: Props) {
  const [error, setError] = useState("");

  const toggle = (id: string) => {
    const curr = formData.services;
    const next = curr.includes(id) ? curr.filter((s) => s !== id) : [...curr, id];
    update({ services: next });
    if (error && next.length > 0) setError("");
  };

  const handleNext = () => {
    if (formData.services.length === 0) {
      setError("Please select at least one service.");
      return;
    }
    onNext();
  };

  return (
    <div>
      <div className="mb-5">
        <h2 className="text-2xl font-extrabold" style={{ color: "#001F3F" }}>
          Select Services
        </h2>
        <p className="text-slate-500 mt-1">
          Choose the protection services you need.{" "}
          <span className="font-medium" style={{ color: "#FFA500" }}>
            Select at least one.
          </span>
        </p>
      </div>

      {error && (
        <div className="mb-4 flex items-center gap-2 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
          <span>⚠</span> {error}
        </div>
      )}

      {/* Selection counter */}
      {formData.services.length > 0 && (
        <div
          className="mb-4 flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium"
          style={{ background: "rgba(255,165,0,0.1)", color: "#001F3F" }}
        >
          <span style={{ color: "#FFA500" }}>✓</span>
          {formData.services.length} service
          {formData.services.length !== 1 ? "s" : ""} selected
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-7">
        {SERVICES.map((svc) => {
          const selected = formData.services.includes(svc.id);
          return (
            <button
              key={svc.id}
              type="button"
              onClick={() => toggle(svc.id)}
              className="text-left flex items-start gap-3 p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer group"
              style={{
                borderColor: selected ? "#FFA500" : "#e2e8f0",
                background: selected ? "#fff8e6" : "#fff",
                boxShadow: selected
                  ? "0 0 0 3px rgba(255,165,0,0.12)"
                  : "none",
              }}
            >
              {/* Checkbox */}
              <div
                className="mt-0.5 flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-200"
                style={{
                  borderColor: selected ? "#FFA500" : "#cbd5e1",
                  background: selected ? "#FFA500" : "#fff",
                }}
              >
                {selected && (
                  <svg
                    className="w-3 h-3 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={3}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-base">{svc.icon}</span>
                  <span
                    className="font-semibold text-sm"
                    style={{ color: selected ? "#001F3F" : "#334155" }}
                  >
                    {svc.id}
                  </span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {svc.desc}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="flex-1 py-3.5 rounded-xl font-semibold text-base border-2 transition-all duration-200 hover:bg-slate-50"
          style={{ borderColor: "#e2e8f0", color: "#64748b" }}
        >
          ← Back
        </button>
        <button
          onClick={handleNext}
          className="flex-[2] py-3.5 rounded-xl font-bold text-base transition-all duration-200 hover:opacity-90 active:scale-95"
          style={{ background: "#001F3F", color: "#fff" }}
        >
          Review & Submit →
        </button>
      </div>
    </div>
  );
}
