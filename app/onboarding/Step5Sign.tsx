"use client";
import { useEffect, useRef, useState } from "react";
import { FormData } from "./formTypes";

interface Props {
  formData: FormData;
  sessionId: string;
  onBack: () => void;
  onComplete: (pandadocDocumentId: string) => void;
  isSubmitting?: boolean;
  submitError?: string;
  existingDocumentId?: string;
}

type SignStatus = "creating" | "ready" | "signing" | "completed" | "already_signed" | "error" | "not_configured";

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
  const [signingUrl, setSigningUrl] = useState("");
  const [documentId, setDocumentId] = useState(existingDocumentId || "");
  const [error, setError] = useState("");
  const pollRef = useRef<NodeJS.Timeout>();
  const docIdRef = useRef(existingDocumentId || "");

  useEffect(() => {
    if (existingDocumentId) return;

    createDocuments();

    // Listen for PandaDoc postMessage — fires when client signs, no need to wait for Bytescare
    const handleMessage = (e: MessageEvent) => {
      if (typeof e.data !== "object") return;
      const event = e.data?.event;
      if (event === "session_view.document.completed" || event === "session_view.document.exception") {
        if (event === "session_view.document.completed") {
          clearInterval(pollRef.current);
          setStatus("completed");
          onComplete(docIdRef.current);
        }
      }
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

      if (data.notConfigured) {
        setStatus("not_configured");
        return;
      }
      if (!res.ok) throw new Error(data.error || "Failed to prepare documents");

      docIdRef.current = data.documentId;
      setDocumentId(data.documentId);
      setSigningUrl(data.signingUrl);
      setStatus("ready");
      // Fallback poll in case postMessage doesn't fire
      startPolling(data.documentId);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to prepare documents");
      setStatus("error");
    }
  };

  const startPolling = (docId: string) => {
    pollRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/pandadoc/status?documentId=${docId}`);
        const { status: docStatus, recipients } = await res.json();
        // Move forward once the client recipient has signed (not waiting for Bytescare)
        const clientSigned = recipients?.some(
          (r: { role: string; signing_status?: string }) =>
            r.role?.toLowerCase() === "client" && r.signing_status === "signed"
        );
        if (clientSigned || docStatus === "document.completed") {
          clearInterval(pollRef.current);
          setStatus("completed");
          onComplete(docId);
        }
      } catch {}
    }, 5000);
  };

  const handleDownload = () => {
    if (!documentId) return;
    window.open(`https://api.pandadoc.com/public/v1/documents/${documentId}/download`, "_blank");
  };

  if (status === "creating") {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4">
        <svg className="animate-spin w-8 h-8" fill="none" viewBox="0 0 24 24" style={{ color: "#FFA500" }}>
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        <p className="text-sm text-gray-500 font-medium">Preparing your documents…</p>
        <p className="text-xs text-gray-400">This may take a few seconds</p>
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
            <span className="text-2xl">⚙️</span>
            <div>
              <p className="font-bold text-gray-800 mb-1">PandaDoc Not Yet Configured</p>
              <p className="text-sm text-gray-600 mb-3">
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
          <span className="text-2xl">✅</span>
          <div>
            <p className="font-bold text-gray-800 mb-1">Documents Already Signed</p>
            <p className="text-sm text-gray-600">You have already signed the Service Agreement. You can continue to the payment step.</p>
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

  if (status === "completed") {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4">
        <div className="w-16 h-16 rounded-full flex items-center justify-center text-3xl" style={{ background: "rgba(255,165,0,0.1)" }}>✅</div>
        <p className="text-lg font-bold text-gray-800">Documents Signed!</p>
        <p className="text-sm text-gray-500">Moving to payment plan selection…</p>
        <svg className="animate-spin w-5 h-5 mt-2" fill="none" viewBox="0 0 24 24" style={{ color: "#FFA500" }}>
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    );
  }

  // status === "ready" | "signing"
  return (
    <div>
      {/* Header + action bar — always visible at the top */}
      <div className="mb-4">
        <h2 className="text-2xl font-black text-gray-900">Sign Your Documents</h2>
        <p className="text-gray-500 mt-1 text-sm">Review and digitally sign your Service Agreement &amp; LOA</p>
      </div>

      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          Document ready for signing
        </div>
        <button onClick={handleDownload}
          className="text-xs font-semibold flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 transition-all"
          style={{ color: "#FFA500" }}>
          ⬇ Download PDF
        </button>
      </div>

      {/* Buttons ABOVE iframe so they're always visible */}
      <div className="flex flex-col gap-2 mb-4">
        <SalesContactButton formData={formData} />
        <button onClick={onBack}
          className="w-full py-3 rounded-xl font-semibold text-sm border-2 border-gray-200 text-gray-500 transition-all hover:bg-gray-50">
          ← Back to Review
        </button>
      </div>

      <div className="rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 mb-4 text-sm text-gray-600">
        <span className="font-semibold text-gray-700">💡 Tip: </span>
        Scroll through the document, fill any required fields, then click <strong>Sign</strong>. You&apos;ll automatically move to the next step.
      </div>

      {submitError && (
        <div className="mb-4 flex items-start gap-2 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
          <span>⚠</span> <span>{submitError}</span>
        </div>
      )}

      {/* Iframe below — scrollable */}
      <div className="rounded-xl overflow-hidden border border-gray-200" style={{ height: "600px" }}>
        <iframe src={signingUrl} className="w-full h-full" title="Document Signing" allow="camera" />
      </div>
    </div>
  );
}
