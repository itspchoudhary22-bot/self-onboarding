"use client";
import { useEffect, useRef, useState } from "react";
import { FormData } from "./formTypes";
import { IconCheckCircle, IconCog, IconWarning, IconInfo } from "./Icons";

interface Props {
  formData: FormData;
  sessionId: string;
  onBack: () => void;
  onComplete: (pandadocDocumentId: string) => void;
  isSubmitting?: boolean;
  submitError?: string;
  existingDocumentId?: string;
}

type SignStatus = "creating" | "ready" | "verifying" | "completed" | "already_signed" | "error" | "not_configured";
type SignPhase = "sa" | "loa";

function Spinner({ size = 8, color = "#FFA500" }: { size?: number; color?: string }) {
  return (
    <svg className={`animate-spin w-${size} h-${size}`} fill="none" viewBox="0 0 24 24" style={{ color }}>
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

function SalesContactButton({ formData }: { formData: FormData }) {
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  const handleContact = async () => {
    setSending(true);
    try {
      await fetch("/api/contact-sales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      setSent(true);
    } catch {}
    finally { setSending(false); }
  };

  if (sent) {
    return (
      <div className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold" style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", color: "#166534" }}>
        <span>✅</span> Our sales team will reach out to you shortly.
      </div>
    );
  }

  return (
    <button onClick={handleContact} disabled={sending}
      className="w-full py-3 rounded-xl text-sm font-semibold transition-all hover:bg-gray-50 disabled:opacity-50 flex items-center justify-center gap-2"
      style={{ border: "1.5px solid #e5e7eb", color: "#6b7280" }}>
      {sending ? "Sending…" : "💬 Questions about the agreement? Contact our sales team"}
    </button>
  );
}

export default function Step5Sign({ formData, sessionId, onBack, onComplete, isSubmitting, submitError, existingDocumentId }: Props) {
  const [status, setStatus] = useState<SignStatus>(existingDocumentId ? "already_signed" : "creating");
  const [phase, setPhase] = useState<SignPhase>("sa");
  const [verifyingLabel, setVerifyingLabel] = useState("");
  const [signingUrl, setSigningUrl] = useState("");
  const [documentId, setDocumentId] = useState(existingDocumentId || "");
  const [error, setError] = useState("");

  const pollRef = useRef<NodeJS.Timeout>();
  const docIdRef = useRef(existingDocumentId || "");
  const phaseRef = useRef<SignPhase>("sa");
  const loaUrlRef = useRef("");
  const loaDocIdRef = useRef("");
  // Guard: prevent handling the same signing event twice
  const handledRef = useRef(false);

  // Called the moment signing is detected (postMessage OR poll).
  // Shows the loader instantly, then advances after confirming with API.
  const onSigningDetected = () => {
    if (handledRef.current) return;
    handledRef.current = true;
    clearInterval(pollRef.current);

    if (phaseRef.current === "sa" && loaDocIdRef.current) {
      // SA signed — show loader, then load LOA iframe
      setVerifyingLabel("Service Agreement signed! Loading Letter of Authorization…");
      setStatus("verifying");
      setTimeout(() => {
        handledRef.current = false; // reset for LOA phase
        phaseRef.current = "loa";
        setPhase("loa");
        setSigningUrl(loaUrlRef.current);
        setStatus("ready");
        startPolling(loaDocIdRef.current);
      }, 1200);
    } else {
      // LOA (or only) doc signed — show loader, then advance to payment
      setVerifyingLabel("Processing your signature… please wait");
      setStatus("verifying");
      setTimeout(() => {
        setStatus("completed");
        onComplete(docIdRef.current);
      }, 1500);
    }
  };

  const startPolling = (docId: string) => {
    clearInterval(pollRef.current);
    pollRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/pandadoc/status?documentId=${docId}`);
        const { status: docStatus, recipients } = await res.json();
        const clientSigned = recipients?.some(
          (r: { role: string; signing_status?: string }) =>
            r.role?.toLowerCase() === "client" && r.signing_status === "signed"
        );
        if (clientSigned || docStatus === "document.completed") {
          onSigningDetected();
        }
      } catch {}
    }, 1500);
  };

  useEffect(() => {
    if (existingDocumentId) return;

    createDocuments();

    // PandaDoc fires this when the current signer completes signing
    const handleMessage = (e: MessageEvent) => {
      if (typeof e.data !== "object") return;
      if (e.data?.event !== "session_view.document.completed") return;
      onSigningDetected();
    };
    window.addEventListener("message", handleMessage);
    return () => {
      clearInterval(pollRef.current);
      window.removeEventListener("message", handleMessage);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const createDocuments = async () => {
    setStatus("creating");
    setError("");
    try {
      const res = await fetch("/api/pandadoc/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, formData }),
      });
      const data = await res.json();

      if (data.notConfigured) { setStatus("not_configured"); return; }
      if (!res.ok) throw new Error(data.error || "Failed to prepare documents");

      docIdRef.current = data.documentId;
      loaDocIdRef.current = data.loaDocumentId || "";
      loaUrlRef.current = data.loaSigningUrl || "";

      setDocumentId(data.documentId);
      setSigningUrl(data.signingUrl);
      setStatus("ready");
      startPolling(data.documentId);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to prepare documents");
      setStatus("error");
    }
  };

  const handleDownload = () => {
    if (!documentId) return;
    window.open(`https://api.pandadoc.com/public/v1/documents/${documentId}/download`, "_blank");
  };

  // ── Loading screens ──────────────────────────────────────────────

  if (status === "creating") {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4">
        <Spinner size={8} />
        <p className="text-sm text-gray-500 font-medium">Preparing your documents…</p>
        <p className="text-xs text-gray-400">This may take a few seconds</p>
      </div>
    );
  }

  // Shown immediately when signing is detected — before API confirmation
  if (status === "verifying") {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-5">
        <div className="relative">
          <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ background: "rgba(255,165,0,0.08)" }}>
            <Spinner size={8} />
          </div>
        </div>
        <div className="text-center">
          <p className="text-base font-bold text-gray-800 mb-1">
            {verifyingLabel || "Processing your signature…"}
          </p>
          <p className="text-sm text-gray-400">Please don&apos;t close this window</p>
        </div>
        <div className="flex gap-1.5 mt-2">
          {[0, 1, 2].map((i) => (
            <div key={i} className="w-2 h-2 rounded-full animate-bounce" style={{ background: "#FFA500", animationDelay: `${i * 0.15}s` }} />
          ))}
        </div>
      </div>
    );
  }

  if (status === "completed") {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4">
        <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: "rgba(255,165,0,0.1)" }}><IconCheckCircle size={32} color="#FFA500" /></div>
        <p className="text-lg font-bold text-gray-800">Documents Signed!</p>
        <p className="text-sm text-gray-500">Moving to payment plan selection…</p>
        <Spinner size={5} />
      </div>
    );
  }

  if (status === "not_configured") {
    return (
      <div>
        <div className="mb-6">
          <h2 className="text-2xl font-black text-gray-900">Sign Documents</h2>
          <p className="text-gray-500 mt-1 text-sm">Service Agreement &amp; Letter of Authorization</p>
        </div>
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-5 py-5 mb-6">
          <div className="flex items-start gap-3">
            <IconCog size={22} color="#92400e" />
            <div>
              <p className="font-bold text-gray-800 mb-1">PandaDoc Not Yet Configured</p>
              <p className="text-sm text-gray-600">
                The document signing integration requires PandaDoc API credentials. Once configured, your Service Agreement and LOA will appear here for review and digital signing.
              </p>
            </div>
          </div>
        </div>
        <div className="flex gap-3 mb-3">
          <button onClick={onBack} disabled={isSubmitting}
            className="flex-1 py-3.5 rounded-xl font-semibold text-sm border-2 border-gray-200 text-gray-500 transition-all hover:bg-gray-50 disabled:opacity-50">
            ← Back
          </button>
          <button onClick={() => onComplete("")} disabled={isSubmitting}
            className="flex-[2] py-3.5 rounded-xl font-bold text-sm transition-all hover:opacity-90 active:scale-95 disabled:opacity-70 flex items-center justify-center gap-2"
            style={{ background: "#FFA500", color: "#111827" }}>
            {isSubmitting ? "Submitting…" : "Submit Application →"}
          </button>
        </div>
        <SalesContactButton formData={formData} />
      </div>
    );
  }

  if (status === "already_signed") {
    return (
      <div>
        <div className="mb-6">
          <h2 className="text-2xl font-black text-gray-900">Sign Documents</h2>
          <p className="text-gray-500 mt-1 text-sm">Service Agreement &amp; Letter of Authorization</p>
        </div>
        <div className="rounded-xl border border-green-200 bg-green-50 px-5 py-5 mb-6 flex items-start gap-3">
          <IconCheckCircle size={22} color="#16a34a" />
          <div>
            <p className="font-bold text-gray-800 mb-1">Documents Already Signed</p>
            <p className="text-sm text-gray-600">You have already signed your documents. You can continue to the payment step.</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={onBack}
            className="flex-1 py-3.5 rounded-xl font-semibold text-sm border-2 border-gray-200 text-gray-500 hover:bg-gray-50 transition-all">
            ← Back
          </button>
          <button onClick={() => onComplete(documentId)}
            className="flex-[2] py-3.5 rounded-xl font-bold text-sm hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-2"
            style={{ background: "#FFA500", color: "#111827" }}>
            Continue to Payment →
          </button>
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div>
        <div className="mb-6">
          <h2 className="text-2xl font-black text-gray-900">Sign Documents</h2>
        </div>
        <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 mb-6">
          <p className="font-semibold text-red-700 mb-1">Failed to prepare documents</p>
          <p className="text-sm text-red-600">{error}</p>
        </div>
        <div className="flex gap-3">
          <button onClick={onBack} className="flex-1 py-3.5 rounded-xl font-semibold text-sm border-2 border-gray-200 text-gray-500 hover:bg-gray-50">← Back</button>
          <button onClick={createDocuments} className="flex-[2] py-3.5 rounded-xl font-bold text-sm hover:opacity-90" style={{ background: "#FFA500", color: "#111827" }}>Retry</button>
        </div>
      </div>
    );
  }

  // status === "ready" — show SA or LOA iframe
  const docLabel = phase === "sa" ? "Service Agreement" : "Letter of Authorization";
  const docStep = phase === "sa" ? "1 of 2" : "2 of 2";

  return (
    <div>
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <h2 className="text-2xl font-black text-gray-900">Sign Your Documents</h2>
          <p className="text-gray-500 mt-1 text-sm">Review and digitally sign your Service Agreement &amp; LOA</p>
        </div>
        <button onClick={onBack}
          className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border-2 border-gray-200 text-gray-500 transition-all hover:bg-gray-50 mt-1">
          ← Back
        </button>
      </div>

      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span><strong style={{ color: "#111827" }}>{docLabel}</strong> — document {docStep}</span>
        </div>
        <button onClick={handleDownload}
          className="text-xs font-semibold flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 transition-all"
          style={{ color: "#FFA500" }}>
          ⬇ Download PDF
        </button>
      </div>

      <div className="flex gap-2 mb-4">
        {["Service Agreement", "Letter of Authorization"].map((label, i) => {
          const isActive = (i === 0 && phase === "sa") || (i === 1 && phase === "loa");
          const isDone = i === 0 && phase === "loa";
          return (
            <div key={label} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
              style={{
                background: isDone ? "#f0fdf4" : isActive ? "#fff8e6" : "#f3f4f6",
                color: isDone ? "#166534" : isActive ? "#92400e" : "#9ca3af",
                border: `1.5px solid ${isDone ? "#86efac" : isActive ? "rgba(255,165,0,0.4)" : "#e5e7eb"}`,
              }}>
              {isDone ? "✓" : isActive ? "●" : `${i + 1}`} {label}
            </div>
          );
        })}
      </div>

      <div className="mb-4">
        <SalesContactButton formData={formData} />
      </div>

      <div className="rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 mb-4 text-sm text-gray-600">
        <span className="font-semibold text-gray-700 inline-flex items-center gap-1"><IconInfo size={13} color="#374151" /> Tip: </span>
        Scroll through the document, fill any required fields, then click <strong>Sign</strong>.{" "}
        {phase === "sa" ? "After signing, your LOA will load automatically." : "This is your last document — you'll move to payment after signing."}
      </div>

      {submitError && (
        <div className="mb-4 flex items-start gap-2 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
          <IconWarning size={14} color="#b91c1c" /> <span>{submitError}</span>
        </div>
      )}

      <div className="rounded-xl overflow-hidden border border-gray-200" style={{ height: "600px" }}>
        <iframe src={signingUrl} className="w-full h-full" title={docLabel} allow="camera" />
      </div>
    </div>
  );
}
