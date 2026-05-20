"use client";
import { useState } from "react";
import { FormData } from "./formTypes";

interface Props {
  formData: FormData;
  update: (fields: Partial<FormData>) => void;
  onBack: () => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  submitError: string;
}

const PLANS = [
  {
    id: "standard" as const,
    name: "Standard",
    price: "$49",
    period: "/month",
    description: "Perfect for individuals and small teams getting started.",
    features: ["Up to 3 services", "Email support", "Monthly reports", "Basic dashboard access"],
    color: "#6b7280",
    highlight: false,
  },
  {
    id: "pro" as const,
    name: "Pro",
    price: "$99",
    period: "/month",
    description: "For growing businesses that need more power and flexibility.",
    features: ["Up to 8 services", "Priority email & chat support", "Weekly reports", "Advanced dashboard", "API access"],
    color: "#FFA500",
    highlight: true,
  },
  {
    id: "business" as const,
    name: "Business",
    price: "$199",
    period: "/month",
    description: "Full-featured solution for established businesses.",
    features: ["Unlimited services", "Dedicated account manager", "Daily reports", "Custom integrations", "SLA guarantee", "24/7 support"],
    color: "#7C3AED",
    highlight: false,
  },
  {
    id: "custom" as const,
    name: "Custom",
    price: "Let's talk",
    period: "",
    description: "Tailored solutions for enterprises with unique requirements.",
    features: ["Custom service scope", "Negotiated pricing", "Bespoke integrations", "Executive support", "On-site visits"],
    color: "#111827",
    highlight: false,
  },
];

export default function Step6Payment({ formData, update, onBack, onSubmit, isSubmitting, submitError }: Props) {
  const [selected, setSelected] = useState<typeof formData.paymentPlan>(formData.paymentPlan || "");
  const [method, setMethod] = useState<typeof formData.paymentMethod>(formData.paymentMethod || "");
  const [cardNum, setCardNum] = useState("");
  const [cardName, setCardName] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [accountName, setAccountName] = useState("");
  const [accountNum, setAccountNum] = useState("");
  const [ifsc, setIfsc] = useState("");
  const [bank, setBank] = useState("");

  const handleSelect = (planId: typeof selected) => {
    setSelected(planId);
    update({ paymentPlan: planId, paymentMethod: "" });
    setMethod("");
  };

  const handleMethod = (m: typeof method) => {
    setMethod(m);
    update({ paymentMethod: m });
  };

  const formatCard = (val: string) =>
    val.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();

  const formatExpiry = (val: string) => {
    const d = val.replace(/\D/g, "").slice(0, 4);
    return d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d;
  };

  const isCustom = selected === "custom";
  const isPaid = selected === "standard" || selected === "pro" || selected === "business";
  const canSubmitCustom = isCustom;
  const canSubmitPaid = isPaid && method !== "";

  return (
    <div>
      <div className="mb-7">
        <h2 className="text-2xl font-black text-gray-900">Choose Your Plan</h2>
        <p className="text-gray-500 mt-1 text-sm">Select a plan that fits your needs. You can upgrade anytime.</p>
      </div>

      {/* Plan cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-7">
        {PLANS.map((plan) => {
          const isActive = selected === plan.id;
          return (
            <button
              key={plan.id}
              onClick={() => handleSelect(plan.id)}
              className="text-left rounded-2xl p-5 transition-all border-2 relative"
              style={{
                borderColor: isActive ? plan.color : "#e5e7eb",
                background: isActive ? (plan.id === "pro" ? "#fffbeb" : plan.id === "business" ? "#f5f3ff" : plan.id === "custom" ? "#f9fafb" : "#f9fafb") : "#fff",
                boxShadow: isActive ? `0 0 0 3px ${plan.color}22` : "none",
              }}
            >
              {plan.highlight && (
                <span className="absolute -top-2.5 left-4 text-xs font-bold px-2.5 py-0.5 rounded-full" style={{ background: "#FFA500", color: "#111827" }}>
                  Most Popular
                </span>
              )}
              <div className="flex items-start justify-between mb-2">
                <div>
                  <span className="text-base font-black" style={{ color: plan.color }}>{plan.name}</span>
                </div>
                <div className="text-right">
                  <span className="text-xl font-black text-gray-900">{plan.price}</span>
                  {plan.period && <span className="text-xs text-gray-400">{plan.period}</span>}
                </div>
              </div>
              <p className="text-xs text-gray-500 mb-3">{plan.description}</p>
              <ul className="space-y-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-1.5 text-xs text-gray-600">
                    <span className="w-3.5 h-3.5 rounded-full flex-shrink-0 flex items-center justify-center text-white text-[8px] font-bold"
                      style={{ background: plan.color }}>✓</span>
                    {f}
                  </li>
                ))}
              </ul>
              {isActive && (
                <div className="mt-3 flex items-center gap-1.5 text-xs font-bold" style={{ color: plan.color }}>
                  <span className="w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center" style={{ borderColor: plan.color }}>
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: plan.color }} />
                  </span>
                  Selected
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Custom plan message */}
      {isCustom && (
        <div className="rounded-2xl border border-gray-200 bg-gray-50 px-6 py-6 mb-6 text-center">
          <div className="text-4xl mb-3">📞</div>
          <h3 className="text-lg font-black text-gray-900 mb-1">Our Sales Team Will Contact You</h3>
          <p className="text-sm text-gray-500 mb-1">
            Thank you for your interest in a Custom plan. One of our sales representatives will reach out within 1 business day to understand your requirements and prepare a tailored proposal.
          </p>
          <p className="text-xs text-gray-400 mt-3">
            You can also email us directly at <span className="text-orange-500 font-medium">sales@bytescare.com</span>
          </p>
        </div>
      )}

      {/* Payment method for paid plans */}
      {isPaid && (
        <div className="mb-6">
          <p className="text-sm font-bold text-gray-700 mb-3">Select Payment Method</p>
          <div className="grid grid-cols-2 gap-3 mb-5">
            {[
              { id: "card" as const, label: "Credit / Debit Card", icon: "💳" },
              { id: "bank" as const, label: "Bank Transfer", icon: "🏦" },
            ].map((m) => (
              <button
                key={m.id}
                onClick={() => handleMethod(m.id)}
                className="flex flex-col items-center gap-2 py-4 rounded-xl border-2 font-semibold text-sm transition-all"
                style={{
                  borderColor: method === m.id ? "#FFA500" : "#e5e7eb",
                  background: method === m.id ? "#fffbeb" : "#fff",
                  color: method === m.id ? "#92400e" : "#6b7280",
                  boxShadow: method === m.id ? "0 0 0 3px rgba(255,165,0,0.15)" : "none",
                }}
              >
                <span className="text-2xl">{m.icon}</span>
                {m.label}
              </button>
            ))}
          </div>

          {/* Card form */}
          {method === "card" && (
            <div className="rounded-2xl border border-gray-100 bg-gray-50 p-5 space-y-4">
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Card Details</p>
                <div className="flex gap-1.5 text-xs text-gray-300 font-bold">
                  <span className="bg-white border border-gray-200 px-2 py-0.5 rounded">VISA</span>
                  <span className="bg-white border border-gray-200 px-2 py-0.5 rounded">MC</span>
                  <span className="bg-white border border-gray-200 px-2 py-0.5 rounded">AMEX</span>
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1 block">Card Number</label>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="1234 5678 9012 3456"
                  value={cardNum}
                  onChange={(e) => setCardNum(formatCard(e.target.value))}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm font-mono focus:outline-none focus:ring-2"
                  style={{ focusRingColor: "#FFA500" } as React.CSSProperties}
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1 block">Name on Card</label>
                <input
                  type="text"
                  placeholder="John Doe"
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-500 mb-1 block">Expiry</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="MM/YY"
                    value={expiry}
                    onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm font-mono focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 mb-1 block">CVV</label>
                  <input
                    type="password"
                    inputMode="numeric"
                    placeholder="•••"
                    maxLength={4}
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value.replace(/\D/g, "").slice(0, 4))}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm font-mono focus:outline-none"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-400 pt-1">
                <span>🔒</span>
                <span>This is a demo screen. No payment will be processed.</span>
              </div>
            </div>
          )}

          {/* Bank transfer form */}
          {method === "bank" && (
            <div className="rounded-2xl border border-gray-100 bg-gray-50 p-5 space-y-4">
              <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">Bank Transfer Details</p>
              <div className="rounded-xl bg-blue-50 border border-blue-100 px-4 py-3 text-sm text-blue-700 mb-2">
                <p className="font-semibold mb-1">Transfer to our account:</p>
                <div className="space-y-1 text-xs font-mono">
                  <p>Bank: <span className="font-bold">Bytescare Finance Bank</span></p>
                  <p>Account: <span className="font-bold">XXXX-XXXX-1234</span></p>
                  <p>IFSC: <span className="font-bold">BCFB0001234</span></p>
                  <p>Ref: <span className="font-bold">{formData.email.split("@")[0].toUpperCase()}-BCRE</span></p>
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1 block">Your Account Name</label>
                <input type="text" placeholder="As per bank records" value={accountName} onChange={(e) => setAccountName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1 block">Your Account Number</label>
                <input type="text" inputMode="numeric" placeholder="Your account number" value={accountNum} onChange={(e) => setAccountNum(e.target.value.replace(/\D/g, ""))}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm font-mono focus:outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-500 mb-1 block">IFSC / Sort Code</label>
                  <input type="text" placeholder="IFSC0001234" value={ifsc} onChange={(e) => setIfsc(e.target.value.toUpperCase())}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm font-mono focus:outline-none" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 mb-1 block">Bank Name</label>
                  <input type="text" placeholder="Your bank" value={bank} onChange={(e) => setBank(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none" />
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-400 pt-1">
                <span>🔒</span>
                <span>This is a demo screen. No payment will be processed.</span>
              </div>
            </div>
          )}
        </div>
      )}

      {submitError && (
        <div className="mb-4 flex items-start gap-2 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
          <span>⚠</span> <span>{submitError}</span>
        </div>
      )}

      <div className="flex gap-3 mt-2">
        <button
          onClick={onBack}
          disabled={isSubmitting}
          className="flex-1 py-3.5 rounded-xl font-semibold text-sm border-2 border-gray-200 text-gray-500 transition-all hover:bg-gray-50 disabled:opacity-50"
        >
          ← Back
        </button>
        <button
          onClick={onSubmit}
          disabled={isSubmitting || (!canSubmitCustom && !canSubmitPaid)}
          className="flex-[2] py-3.5 rounded-xl font-bold text-sm transition-all hover:opacity-90 active:scale-95 disabled:opacity-40 flex items-center justify-center gap-2"
          style={{ background: "#FFA500", color: "#111827" }}
        >
          {isSubmitting ? (
            <>
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Submitting…
            </>
          ) : isCustom ? (
            "Complete Onboarding →"
          ) : (
            "Confirm & Complete →"
          )}
        </button>
      </div>
    </div>
  );
}
