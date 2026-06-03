"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { FormData } from "./formTypes";
import {
  IconLock,
  IconCheckCircle,
  IconCog,
  IconKey,
  IconWarning,
} from "./Icons";

interface Props {
  sessionId: string;
  applicationId: string;
  formData: FormData;
}

type AppStatus =
  | "pending_review"
  | "agreement_pending"
  | "payment_pending"
  | "ops_setup"
  | "active";

interface AgreementEntry {
  agreementType: string;
  label?: string;
  pandadocSigningUrl?: string;
  uploadedFileName?: string;
  downloadUrl?: string;
  signed?: boolean;
  signedAt?: string;
}

interface StatusData {
  status: AppStatus;
  submittedAt?: string;
  createdAt?: string;
  agreements?: AgreementEntry[];
  paymentDetails?: {
    razorpayKeyId?: string;
    razorpayOrderId?: string;
    amount?: number;
    currency?: string;
    plan?: string;
    frequency?: string;
    duration?: string;
  };
}

// ---- small helpers ----

function formatDate(iso?: string) {
  if (!iso) return new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function StatusBadge({ status }: { status: AppStatus }) {
  const map: Record<string, { label: string; bg: string; color: string }> = {
    pending_review:   { label: "Under Review",         bg: "#fff8e6", color: "#92400e" },
    agreement_pending:{ label: "Action Required",       bg: "#eff6ff", color: "#1d4ed8" },
    payment_pending:  { label: "Payment Required",      bg: "#fff8e6", color: "#92400e" },
    ops_setup:        { label: "Setup in Progress",     bg: "#f0fdfa", color: "#0f766e" },
    active:           { label: "Active",                bg: "#f0fdf4", color: "#166534" },
  };
  const { label, bg, color } = map[status] ?? { label: "Pending", bg: "#f3f4f6", color: "#6b7280" };
  return (
    <span className="text-xs font-bold px-3 py-1 rounded-full"
      style={{ background: bg, color }}>
      {label}
    </span>
  );
}

// ---- Timeline ----

const TIMELINE_STEPS = [
  { key: "submitted",  label: "Application Submitted" },
  { key: "review",     label: "Under Sales Review" },
  { key: "agreement",  label: "Agreement & Payment" },
  { key: "ops",        label: "Operations Setup" },
  { key: "active",     label: "Account Activated" },
];

function statusToTimelineIdx(s: AppStatus): number {
  return { pending_review: 1, agreement_pending: 2, payment_pending: 2, ops_setup: 3, active: 4 }[s];
}

function Timeline({ status }: { status: AppStatus }) {
  const activeIdx = statusToTimelineIdx(status);
  return (
    <div className="flex flex-col gap-0">
      {TIMELINE_STEPS.map((ts, i) => {
        const done   = i < activeIdx;
        const active = i === activeIdx;
        return (
          <div key={ts.key} className="flex items-start gap-3">
            {/* dot + connector */}
            <div className="flex flex-col items-center" style={{ width: 28, flexShrink: 0 }}>
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all"
                style={{
                  background: done ? "#FFA500" : active ? "#FFA500" : "#e5e7eb",
                  color: done || active ? "#111827" : "#9ca3af",
                  boxShadow: active ? "0 0 0 5px rgba(255,165,0,0.18)" : "none",
                }}
              >
                {done ? (
                  <svg width={14} height={14} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 13l4 4L19 7" />
                  </svg>
                ) : active ? (
                  <span style={{ display: "block", width: 8, height: 8, borderRadius: "50%", background: "#111827" }} />
                ) : (
                  <span style={{ display: "block", width: 8, height: 8, borderRadius: "50%", background: "#9ca3af" }} />
                )}
              </div>
              {i < TIMELINE_STEPS.length - 1 && (
                <div style={{ width: 2, flex: 1, minHeight: 24, background: done ? "#FFA500" : "#e5e7eb", borderRadius: 2 }} />
              )}
            </div>
            {/* label */}
            <div className="pb-5 pt-0.5">
              <p className="text-sm font-semibold" style={{ color: done ? "#111827" : active ? "#FFA500" : "#9ca3af" }}>
                {ts.label}
              </p>
              {active && (
                <p className="text-xs mt-0.5" style={{ color: "#9ca3af" }}>In progress…</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ---- Chip row ----
function Chip({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5 px-4 py-3 rounded-xl"
      style={{ background: "#f9fafb", border: "1px solid #f3f4f6" }}>
      <span className="text-xs" style={{ color: "#9ca3af" }}>{label}</span>
      <span className="text-sm font-semibold" style={{ color: "#111827" }}>{value}</span>
    </div>
  );
}

// ---- Spinner ----
function Spinner({ size = 16 }: { size?: number }) {
  return (
    <svg className="animate-spin" width={size} height={size} fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

// ---- Razorpay types ----
declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Razorpay: any;
  }
}

// ---- Main component ----

export default function LockedStatus({ sessionId, applicationId, formData }: Props) {
  const [appStatus, setAppStatus] = useState<AppStatus>("pending_review");
  const [statusData, setStatusData] = useState<StatusData | null>(null);
  const [checking, setChecking] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncMsg, setSyncMsg] = useState("");
  const [payError, setPayError] = useState("");
  const [payLoading, setPayLoading] = useState(false);
  const pollRef = useRef<NodeJS.Timeout>();

  const displayName = formData.type === "company" ? formData.companyName : formData.individualName;
  const submittedAt = formatDate(statusData?.createdAt || statusData?.submittedAt);

  // Load Razorpay script
  useEffect(() => {
    if (document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]')) return;
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.async = true;
    document.body.appendChild(s);
  }, []);

  // Poll /api/status — works for both sessionId flow and email-lookup flow
  useEffect(() => {
    const pollParam = sessionId
      ? `sessionId=${encodeURIComponent(sessionId)}`
      : formData.email
      ? `email=${encodeURIComponent(formData.email)}`
      : null;

    if (!pollParam) return;

    const poll = async () => {
      setChecking(true);
      try {
        const res = await fetch(`/api/status?${pollParam}`);
        if (res.ok) {
          const data: StatusData = await res.json();
          const knownStatuses: string[] = ["pending_review", "agreement_pending", "payment_pending", "ops_setup", "active"];
          if (knownStatuses.includes(data.status as string)) {
            setStatusData(data);
            setAppStatus(data.status);
            if (data.status === "active") {
              clearInterval(pollRef.current);
            }
          }
        }
      } catch {
        // silent — polling errors shouldn't surface to user
      } finally {
        setChecking(false);
      }
    };

    poll();
    pollRef.current = setInterval(poll, 5000);
    return () => clearInterval(pollRef.current);
  }, [sessionId, formData.email]);

  // Razorpay payment
  const handleRazorpayPay = async () => {
    if (!statusData?.paymentDetails?.razorpayKeyId) return;
    setPayLoading(true);
    setPayError("");
    try {
      const orderRes = await fetch("/api/razorpay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      });
      const order = await orderRes.json();
      if (!orderRes.ok) {
        setPayError(order.error || "Could not create payment order.");
        return;
      }

      const { razorpayKeyId, currency, plan } = statusData.paymentDetails!;
      const options = {
        key: razorpayKeyId,
        amount: order.amount,
        currency: order.currency || currency || "INR",
        name: "Bytescare",
        description: plan || "Subscription",
        order_id: order.id,
        prefill: {
          name: displayName,
          email: formData.type === "company"
            ? formData.signatoryEmail || formData.email
            : formData.officialEmail || formData.email,
        },
        theme: { color: "#FFA500" },
        handler: async (response: { razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string }) => {
          try {
            const verRes = await fetch("/api/razorpay/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ sessionId, ...response }),
            });
            if (verRes.ok) {
              setAppStatus("active");
            } else {
              const ve = await verRes.json();
              setPayError(ve.error || "Payment verification failed.");
            }
          } catch {
            setPayError("Verification failed. Please contact support.");
          }
        },
        modal: {
          ondismiss: () => setPayLoading(false),
        },
      };

      if (!window.Razorpay) {
        setPayError("Payment gateway not loaded. Please refresh and try again.");
        return;
      }
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch {
      setPayError("Network error. Please try again.");
    } finally {
      setPayLoading(false);
    }
  };

  // Manually trigger a PandaDoc status sync (for when webhook didn't fire)
  const handleSyncSigned = async () => {
    setSyncing(true);
    setSyncMsg("");
    try {
      const payload = sessionId
        ? { sessionId }
        : formData.email
        ? { email: formData.email }
        : null;
      if (!payload) return;
      const res = await fetch("/api/pandadoc/sync-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok && data.changed) {
        setAppStatus(data.status);
        setSyncMsg("Status updated!");
      } else if (res.ok) {
        setSyncMsg("Documents not yet marked as complete in PandaDoc. Please wait a moment and try again.");
      } else {
        setSyncMsg(data.error || "Sync failed. Please try again.");
      }
    } catch {
      setSyncMsg("Network error. Please try again.");
    } finally {
      setSyncing(false);
    }
  };

  // ---- Render status-specific content ----

  const renderContent = () => {
    switch (appStatus) {
      case "pending_review":
        return (
          <>
            {/* Banner */}
            <div className="flex items-start gap-4 px-5 py-5 rounded-2xl mb-6"
              style={{ background: "linear-gradient(135deg, #fff8e6, #fffdf5)", border: "1.5px solid #fed7aa" }}>
              <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: "#FFA500" }}>
                <IconLock size={18} color="#111827" />
              </div>
              <div>
                <p className="font-bold text-base mb-1" style={{ color: "#111827" }}>Application Submitted!</p>
                <p className="text-sm leading-relaxed" style={{ color: "#6b7280" }}>
                  Your application is being reviewed by our sales team. You&apos;ll receive an email when action is required.
                </p>
              </div>
            </div>

            {/* Timeline */}
            <div className="rounded-2xl px-5 py-5"
              style={{ background: "#fff", border: "1.5px solid #f3f4f6", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
              <p className="text-xs font-bold uppercase tracking-wider mb-5" style={{ color: "#9ca3af" }}>Progress</p>
              <Timeline status="pending_review" />
            </div>
          </>
        );

      case "agreement_pending":
        return (
          <>
            {/* Action banner */}
            <div className="flex items-start gap-4 px-5 py-5 rounded-2xl mb-4"
              style={{ background: "linear-gradient(135deg, #eff6ff, #f8faff)", border: "1.5px solid #bfdbfe" }}>
              <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: "#3b82f6" }}>
                <IconKey size={18} color="#fff" />
              </div>
              <div>
                <p className="font-bold text-base mb-1" style={{ color: "#1d4ed8" }}>Action Required: Sign your agreement</p>
                <p className="text-sm" style={{ color: "#4b5563" }}>
                  Your sales review is complete. Please sign the agreement below to proceed.
                </p>
              </div>
            </div>

            {/* Sales review done pill */}
            <div className="flex items-center gap-2 mb-5 px-4 py-2.5 rounded-xl w-fit"
              style={{ background: "#f0fdf4", border: "1px solid #bbf7d0" }}>
              <IconCheckCircle size={16} color="#16a34a" />
              <span className="text-xs font-semibold" style={{ color: "#166534" }}>Sales review complete</span>
            </div>

            {/* Agreements list */}
            {statusData?.agreements?.length ? (
              <div className="flex flex-col gap-4 mb-4">
                {(statusData?.agreements ?? []).map((a, i) => (
                  <div key={i} className="rounded-2xl overflow-hidden"
                    style={{ border: `1.5px solid ${a.signed ? "#bbf7d0" : "#e5e7eb"}`, boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
                    <div className="px-4 py-3 flex items-center justify-between"
                      style={{ background: a.signed ? "#f0fdf4" : "#f9fafb", borderBottom: "1px solid #f3f4f6" }}>
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-bold uppercase tracking-wider" style={{ color: "#6b7280" }}>
                          {a.label || `Agreement ${i + 1}`}
                        </p>
                        {a.signed
                          ? <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: "#dcfce7", color: "#16a34a" }}>✓ Signed</span>
                          : <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: "#fef9c3", color: "#d97706" }}>Pending your signature</span>
                        }
                      </div>
                      {a.pandadocSigningUrl && !a.signed && (
                        <a href={a.pandadocSigningUrl} target="_blank" rel="noopener noreferrer"
                          className="text-xs font-bold px-3 py-1.5 rounded-lg"
                          style={{ background: "#eff6ff", color: "#1d4ed8" }}>
                          Open in new tab
                        </a>
                      )}
                    </div>
                    {a.signed ? (
                      <div className="px-5 py-4 text-center">
                        <p className="text-sm font-semibold" style={{ color: "#16a34a" }}>Document signed ✓</p>
                      </div>
                    ) : a.pandadocSigningUrl ? (
                      <iframe
                        src={a.pandadocSigningUrl}
                        title={a.label || `Agreement ${i + 1}`}
                        style={{ width: "100%", height: 500, border: "none", display: "block" }}
                      />
                    ) : a.downloadUrl ? (
                      <div className="px-5 py-5 text-center">
                        <p className="text-sm mb-3" style={{ color: "#374151" }}>
                          Please download, sign, and return this document to your account manager.
                        </p>
                        <a href={a.downloadUrl} download={a.uploadedFileName || "agreement"}
                          className="inline-flex items-center gap-2 font-bold text-sm px-5 py-3 rounded-xl"
                          style={{ background: "#FFA500", color: "#111827", textDecoration: "none" }}>
                          ⬇ Download {a.uploadedFileName || "Document"}
                        </a>
                      </div>
                    ) : (
                      <div className="px-5 py-4 text-center">
                        <p className="text-sm" style={{ color: "#6b7280" }}>
                          {a.uploadedFileName ? `📎 ${a.uploadedFileName}` : "Document prepared — your account manager will share the signing link."}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="px-5 py-5 rounded-2xl mb-4 text-center"
                style={{ background: "#f9fafb", border: "1.5px dashed #e5e7eb" }}>
                <p className="text-sm font-semibold mb-1" style={{ color: "#374151" }}>Agreement link will appear here shortly</p>
                <p className="text-xs" style={{ color: "#9ca3af" }}>You will also receive an email with the signing link.</p>
              </div>
            )}

            {/* Signed but status not updated yet? Let customer trigger a sync */}
            {statusData?.agreements?.some(a => !a.signed && a.pandadocSigningUrl) && (
              <div className="mt-4 text-center">
                <button
                  onClick={handleSyncSigned}
                  disabled={syncing}
                  className="text-sm font-semibold px-5 py-2.5 rounded-xl transition-all"
                  style={{ background: syncing ? "#e5e7eb" : "#eff6ff", color: syncing ? "#9ca3af" : "#1d4ed8", border: "1.5px solid #bfdbfe", cursor: syncing ? "not-allowed" : "pointer" }}>
                  {syncing ? "Checking…" : "I've signed all documents — check my status"}
                </button>
                {syncMsg && (
                  <p className="text-xs mt-2" style={{ color: syncMsg === "Status updated!" ? "#16a34a" : "#6b7280" }}>
                    {syncMsg}
                  </p>
                )}
              </div>
            )}

            <p className="text-xs text-center mt-3" style={{ color: "#9ca3af" }}>
              Once signed, our team will activate your payment step.
            </p>
          </>
        );

      case "payment_pending": {
        const pd = statusData?.paymentDetails;
        return (
          <>
            {/* Action banner */}
            <div className="flex items-start gap-4 px-5 py-5 rounded-2xl mb-4"
              style={{ background: "linear-gradient(135deg, #fff8e6, #fffdf5)", border: "1.5px solid #fed7aa" }}>
              <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: "#FFA500" }}>
                <IconKey size={18} color="#111827" />
              </div>
              <div>
                <p className="font-bold text-base mb-1" style={{ color: "#92400e" }}>Action Required: Complete your payment</p>
                <p className="text-sm" style={{ color: "#78350f" }}>
                  Your agreement has been signed. Please complete the payment to activate your account.
                </p>
              </div>
            </div>

            {/* Agreement done pill */}
            <div className="flex items-center gap-2 mb-5 px-4 py-2.5 rounded-xl w-fit"
              style={{ background: "#f0fdf4", border: "1px solid #bbf7d0" }}>
              <IconCheckCircle size={16} color="#16a34a" />
              <span className="text-xs font-semibold" style={{ color: "#166534" }}>Agreement Complete</span>
            </div>

            {/* Plan chips */}
            {pd && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
                {pd.plan      && <Chip label="Plan"      value={pd.plan} />}
                {pd.amount    && <Chip label="Amount"    value={`${pd.currency || "INR"} ${pd.amount}`} />}
                {pd.frequency && <Chip label="Frequency" value={pd.frequency} />}
                {pd.duration  && <Chip label="Duration"  value={pd.duration} />}
              </div>
            )}

            {/* Payment */}
            {pd?.razorpayKeyId ? (
              <div className="rounded-2xl px-5 py-5 mb-4"
                style={{ background: "#fff", border: "1.5px solid #f3f4f6", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
                {payError && (
                  <div className="flex items-start gap-2 mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
                    <IconWarning size={14} color="#b91c1c" />
                    <span>{payError}</span>
                  </div>
                )}
                <button
                  onClick={handleRazorpayPay}
                  disabled={payLoading}
                  className="w-full py-4 rounded-2xl font-extrabold text-sm transition-all hover:opacity-90 active:scale-95 disabled:opacity-60 flex items-center justify-center gap-2"
                  style={{ background: "#FFA500", color: "#111827", boxShadow: "0 4px 14px rgba(255,165,0,0.3)" }}>
                  {payLoading ? (
                    <><Spinner size={16} /> Processing…</>
                  ) : (
                    `Pay ${pd.currency || "INR"} ${pd.amount} →`
                  )}
                </button>
                <div className="flex items-center justify-center gap-1.5 mt-3">
                  <IconLock size={12} color="#9ca3af" />
                  <span className="text-xs" style={{ color: "#9ca3af" }}>Secured payment via Razorpay</span>
                </div>
              </div>
            ) : (
              <div className="px-5 py-5 rounded-2xl mb-4 text-center"
                style={{ background: "#f9fafb", border: "1.5px dashed #e5e7eb" }}>
                <p className="text-sm font-semibold mb-1" style={{ color: "#374151" }}>Payment link will be sent to your email</p>
                <p className="text-xs" style={{ color: "#9ca3af" }}>
                  Contact{" "}
                  <a href="mailto:support@bytescare.com" className="underline" style={{ color: "#6b7280" }}>
                    support@bytescare.com
                  </a>{" "}
                  for assistance.
                </p>
              </div>
            )}
          </>
        );
      }

      case "ops_setup":
        return (
          <>
            {/* Banner */}
            <div className="flex items-start gap-4 px-5 py-5 rounded-2xl mb-6"
              style={{ background: "linear-gradient(135deg, #f0fdfa, #f8fffd)", border: "1.5px solid #99f6e4" }}>
              <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: "#0d9488" }}>
                <IconCog size={18} color="#fff" />
              </div>
              <div>
                <p className="font-bold text-base mb-1" style={{ color: "#0f766e" }}>Operations Setup in Progress</p>
                <p className="text-sm" style={{ color: "#4b5563" }}>
                  Our operations team is setting up your account. You&apos;ll receive your dashboard credentials within 1–2 business days.
                </p>
              </div>
            </div>

            {/* Timeline */}
            <div className="rounded-2xl px-5 py-5"
              style={{ background: "#fff", border: "1.5px solid #f3f4f6", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
              <p className="text-xs font-bold uppercase tracking-wider mb-5" style={{ color: "#9ca3af" }}>Progress</p>
              <Timeline status="ops_setup" />
            </div>
          </>
        );

      case "active":
        return (
          <>
            {/* Banner */}
            <div className="flex items-start gap-4 px-5 py-5 rounded-2xl mb-6"
              style={{ background: "linear-gradient(135deg, #f0fdf4, #f8fff9)", border: "1.5px solid #86efac" }}>
              <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: "#16a34a" }}>
                <IconCheckCircle size={18} color="#fff" />
              </div>
              <div>
                <p className="font-bold text-base mb-1" style={{ color: "#166534" }}>Account Activated!</p>
                <p className="text-sm" style={{ color: "#4b5563" }}>
                  You&apos;ll receive your dashboard credentials by email shortly.
                </p>
              </div>
            </div>

            {/* Services */}
            {(formData.services ?? []).length > 0 && (
              <div className="rounded-2xl px-5 py-5 mb-5"
                style={{ background: "#fff", border: "1.5px solid #f3f4f6", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
                <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: "#9ca3af" }}>Services Enrolled</p>
                <div className="flex flex-wrap gap-2">
                  {(formData.services ?? []).map((s) => (
                    <span key={s} className="text-xs px-3 py-1.5 rounded-full font-medium"
                      style={{ background: "#fff8e6", color: "#92400e", border: "1px solid rgba(255,165,0,0.3)" }}>
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Timeline */}
            <div className="rounded-2xl px-5 py-5"
              style={{ background: "#fff", border: "1.5px solid #f3f4f6", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
              <p className="text-xs font-bold uppercase tracking-wider mb-5" style={{ color: "#9ca3af" }}>Progress</p>
              <Timeline status="active" />
            </div>

            <p className="text-center text-sm mt-5">
              Need help?{" "}
              <a href="mailto:support@bytescare.com" className="underline font-semibold" style={{ color: "#FFA500" }}>
                support@bytescare.com
              </a>
            </p>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#f9fafb" }}>
      {/* Header */}
      <header className="bg-white sticky top-0 z-50" style={{ borderBottom: "1px solid #f3f4f6" }}>
        <div className="w-full px-6 sm:px-10 h-16 flex items-center justify-between">
          <Link href="/">
            <img src="/logo.svg" alt="Bytescare" height={22} style={{ height: 22 }} />
          </Link>
          <span className="text-sm font-medium" style={{ color: "#9ca3af" }}>Application Status</span>
        </div>
      </header>

      <main className="flex-1 py-8 px-4">
        <div className="max-w-2xl mx-auto">

          {/* Info row: Application ID, Submitted On, Status */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
            <div className="px-4 py-3 rounded-xl" style={{ background: "#fff", border: "1.5px solid #f3f4f6", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
              <p className="text-xs mb-1" style={{ color: "#9ca3af" }}>Application ID</p>
              <p className="text-sm font-bold font-mono" style={{ color: "#111827" }}>
                #{applicationId || "—"}
              </p>
            </div>
            <div className="px-4 py-3 rounded-xl" style={{ background: "#fff", border: "1.5px solid #f3f4f6", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
              <p className="text-xs mb-1" style={{ color: "#9ca3af" }}>Submitted On</p>
              <p className="text-sm font-semibold" style={{ color: "#111827" }}>{submittedAt}</p>
            </div>
            <div className="px-4 py-3 rounded-xl flex flex-col gap-1" style={{ background: "#fff", border: "1.5px solid #f3f4f6", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
              <p className="text-xs" style={{ color: "#9ca3af" }}>Status</p>
              <StatusBadge status={appStatus} />
            </div>
          </div>

          {/* Greeting */}
          <div className="mb-5">
            <h1 className="text-xl sm:text-2xl font-black tracking-tight" style={{ color: "#111827", letterSpacing: "-0.01em" }}>
              Hi, {displayName || "there"}
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-sm" style={{ color: "#9ca3af" }}>Here&apos;s the latest status of your application.</p>
              {checking && (
                <span className="flex items-center gap-1 text-xs" style={{ color: "#9ca3af" }}>
                  <Spinner size={12} /> Checking…
                </span>
              )}
            </div>
          </div>

          {/* Card */}
          <div className="rounded-3xl p-6 sm:p-9"
            style={{ background: "#fff", boxShadow: "0 2px 12px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.04)" }}>
            {renderContent()}
          </div>

          {/* Footer note */}
          <p className="text-center text-xs mt-5" style={{ color: "#9ca3af" }}>
            Questions?{" "}
            <a href="mailto:support@bytescare.com" className="underline" style={{ color: "#6b7280" }}>
              support@bytescare.com
            </a>
          </p>
        </div>
      </main>

      <div className="h-1" style={{ background: "linear-gradient(90deg, #FFA500, #7C3AED)" }} />
    </div>
  );
}
