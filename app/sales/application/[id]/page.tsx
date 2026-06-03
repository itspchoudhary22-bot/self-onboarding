"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useParams } from "next/navigation";

// ─── Types ───────────────────────────────────────────────────────────────────

interface AgreementEntry {
  agreementType: "template" | "unsigned" | "signed";
  label?: string;
  pandadocDocumentId?: string;
  pandadocSigningUrl?: string;
  uploadedFileName?: string;
  sentToCustomerAt?: string;
  signed?: boolean;
  signedAt?: string;
}

interface PaymentDetails {
  planName: string;
  currency: string;
  amount: number;
  frequency: string;
  serviceDuration: string;
  startDate?: string;
  endDate?: string;
  method: string;
  enabledAt?: string;
}

interface OperationalRequirements {
  websites?: string;
  youtubeChannels?: string;
  socialHandles?: string;
  brandNames?: string;
  platforms?: string[];
  priority?: string;
  instructions?: string;
  slaStartDate?: string;
  sentToOpsAt?: string;
}

interface Application {
  _id: string;
  applicationId: string;
  email: string;
  type: "individual" | "company";
  status: string;
  services: string[];
  createdAt: string;
  country: string;
  individualName?: string;
  companyName?: string;
  agreements?: AgreementEntry[];
  paymentDetails?: PaymentDetails;
  operationalRequirements?: OperationalRequirements;
  sessionId?: string;
  officialEmail?: string;
  companyOfficialEmail?: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function Logo() {
  return (
    <span style={{ fontWeight: 900, fontSize: 20, letterSpacing: -0.5 }}>
      <span style={{ color: "#111827" }}>BYTES</span>
      <span style={{ color: "#FFA500" }}>CARE</span>
    </span>
  );
}

const STATUS_BADGE: Record<string, { bg: string; color: string; label: string }> = {
  pending_review: { bg: "#fef3c7", color: "#d97706", label: "Pending Review" },
  agreement_pending: { bg: "#dbeafe", color: "#1d4ed8", label: "Agreement Pending" },
  payment_pending: { bg: "#ede9fe", color: "#7c3aed", label: "Payment Pending" },
  ops_setup: { bg: "#ccfbf1", color: "#0d9488", label: "Ops Setup" },
  active: { bg: "#dcfce7", color: "#16a34a", label: "Active" },
};

function StatusBadge({ status }: { status: string }) {
  const badge = STATUS_BADGE[status] || { bg: "#f3f4f6", color: "#6b7280", label: status };
  return (
    <span
      style={{
        display: "inline-block",
        background: badge.bg,
        color: badge.color,
        fontSize: 11,
        fontWeight: 700,
        borderRadius: 999,
        padding: "3px 10px",
      }}
    >
      {badge.label}
    </span>
  );
}

// ─── Agreement Tab ────────────────────────────────────────────────────────────

function AgreementTab({
  app,
  onSaved,
}: {
  app: Application;
  onSaved: () => void;
}) {
  const agreements = app.agreements || [];
  const [showAddForm, setShowAddForm] = useState(agreements.length === 0);
  const [selectedType, setSelectedType] = useState<"template" | "unsigned" | "signed" | null>(null);
  const [label, setLabel] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [removing, setRemoving] = useState<number | null>(null);
  const [refreshingIdx, setRefreshingIdx] = useState<number | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [markingIdx, setMarkingIdx] = useState<number | null>(null);

  async function markSigned(idx: number) {
    setMarkingIdx(idx);
    try {
      const res = await fetch(`/api/sales/applications/${app._id}/agreement?index=${idx}`, { method: "PATCH" });
      if (res.ok) onSaved();
      else setError("Failed to mark as signed");
    } catch {
      setError("Network error");
    } finally {
      setMarkingIdx(null);
    }
  }

  async function addAgreement(body: Record<string, string>) {
    const res = await fetch(`/api/sales/applications/${app._id}/agreement`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || `Save failed (${res.status})`);
    return data;
  }

  async function removeAgreement(idx: number) {
    if (!confirm(`Remove agreement #${idx + 1}?`)) return;
    setRemoving(idx);
    try {
      const res = await fetch(`/api/sales/applications/${app._id}/agreement?index=${idx}`, { method: "DELETE" });
      if (res.ok) onSaved();
      else setError("Failed to remove");
    } catch {
      setError("Network error");
    } finally {
      setRemoving(null);
    }
  }

  async function refreshSigningUrl(idx: number) {
    setRefreshingIdx(idx);
    setError("");
    try {
      const res = await fetch("/api/pandadoc/refresh-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applicationId: app._id, agreementIdx: idx }),
      });
      const data = await res.json();
      if (res.ok) onSaved();
      else setError(data.error || "Failed to refresh link");
    } catch {
      setError("Network error");
    } finally {
      setRefreshingIdx(null);
    }
  }

  async function resetAll() {
    if (!confirm("Remove all agreements and reset status to pending_review?")) return;
    setRemoving(-1);
    try {
      const res = await fetch(`/api/sales/applications/${app._id}/agreement`, { method: "DELETE" });
      if (res.ok) onSaved();
      else setError("Failed to reset");
    } catch {
      setError("Network error");
    } finally {
      setRemoving(null);
    }
  }

  async function handleSubmit() {
    if (!selectedType) return;
    setUploading(true);
    setError("");
    try {
      if (selectedType === "template") {
        const pandaRes = await fetch("/api/pandadoc/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId: app.sessionId, formData: app, useTemplate: true }),
        });
        const pandaData = await pandaRes.json();
        if (!pandaRes.ok) throw new Error(pandaData?.error || `PandaDoc failed (${pandaRes.status})`);
        if (!pandaData?.signingUrl) throw new Error("PandaDoc did not return a signing URL. Check template configuration.");

        // Add Service Agreement
        await addAgreement({
          agreementType: "template",
          label: "Service Agreement",
          pandadocDocumentId: pandaData?.documentId || "",
          pandadocSigningUrl: pandaData.signingUrl,
        });

        // Add LOA if returned
        if (pandaData?.loaSigningUrl) {
          await addAgreement({
            agreementType: "template",
            label: "Letter of Authorization",
            pandadocDocumentId: pandaData?.loaDocumentId || "",
            pandadocSigningUrl: pandaData.loaSigningUrl,
          });
        }
      } else if (selectedType === "unsigned") {
        if (!files.length) { setError("Please select at least one PDF file"); setUploading(false); return; }
        for (const f of files) {
          const base64 = await fileToBase64(f);
          const uploadRes = await fetch("/api/pandadoc/upload-for-signing", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ applicationId: app._id, fileBase64: base64, fileName: f.name, label: files.length === 1 ? (label || f.name) : f.name }),
          });
          const uploadData = await uploadRes.json();
          if (!uploadRes.ok) throw new Error(uploadData?.error || `Upload failed for ${f.name}`);
          // File was saved directly in upload-for-signing — no separate addAgreement call needed
        }
      } else {
        if (!files.length) { setError("Please select at least one PDF file"); setUploading(false); return; }
        for (const f of files) {
          await addAgreement({
            agreementType: "signed",
            label: files.length === 1 ? (label || f.name) : f.name,
            uploadedFileName: f.name,
          });
        }
      }
      setSelectedType(null);
      setLabel("");
      setFiles([]);
      setShowAddForm(false);
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  function fileToBase64(f: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve((reader.result as string).split(",")[1]);
      reader.onerror = reject;
      reader.readAsDataURL(f);
    });
  }

  const typeLabel = (t: string) =>
    t === "template" ? "Standard Template" : t === "unsigned" ? "Unsigned (sent for signing)" : "Pre-signed";

  const cardStyle = (type: string) => ({
    border: selectedType === type ? "2px solid #FFA500" : "2px solid #e5e7eb",
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    cursor: "pointer",
    background: selectedType === type ? "#fff7ed" : "#fff",
    transition: "border-color 0.15s, background 0.15s",
  });

  return (
    <div>
      {/* Existing agreements list */}
      {agreements.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: "#374151" }}>
              Agreements sent ({agreements.length})
            </span>
            <button onClick={resetAll} disabled={removing === -1}
              style={{ fontSize: 12, color: "#dc2626", background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}>
              Reset all
            </button>
          </div>
          {agreements.map((a, i) => {
            const isSigned = a.signed || a.agreementType === "signed";
            return (
              <div key={i} style={{
                padding: "10px 14px", marginBottom: 8, borderRadius: 10,
                background: isSigned ? "#f0fdf4" : "#f9fafb",
                border: `1.5px solid ${isSigned ? "#bbf7d0" : "#e5e7eb"}`,
              }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#111827", display: "flex", alignItems: "center", gap: 6 }}>
                      {a.label || `Agreement ${i + 1}`}
                      {isSigned
                        ? <span style={{ fontSize: 11, fontWeight: 700, color: "#16a34a", background: "#dcfce7", borderRadius: 999, padding: "2px 8px" }}>✓ Signed</span>
                        : <span style={{ fontSize: 11, fontWeight: 600, color: "#d97706", background: "#fef9c3", borderRadius: 999, padding: "2px 8px" }}>Pending</span>
                      }
                    </div>
                    <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 2 }}>
                      {typeLabel(a.agreementType)}
                      {a.sentToCustomerAt && ` · sent ${new Date(a.sentToCustomerAt).toLocaleDateString()}`}
                      {a.signedAt && ` · signed ${new Date(a.signedAt).toLocaleDateString()}`}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                    {!isSigned && a.pandadocDocumentId && (
                      <button onClick={() => refreshSigningUrl(i)} disabled={refreshingIdx === i}
                        style={{ fontSize: 12, color: "#2563eb", background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 6, padding: "4px 10px", cursor: "pointer", fontWeight: 600 }}>
                        {refreshingIdx === i ? "…" : "Refresh Link"}
                      </button>
                    )}
                    {!isSigned && (
                      <button onClick={() => markSigned(i)} disabled={markingIdx === i}
                        style={{ fontSize: 12, color: "#16a34a", background: "#dcfce7", border: "1px solid #bbf7d0", borderRadius: 6, padding: "4px 10px", cursor: "pointer", fontWeight: 600 }}>
                        {markingIdx === i ? "…" : "Mark Signed"}
                      </button>
                    )}
                    <button onClick={() => removeAgreement(i)} disabled={removing === i}
                      style={{ fontSize: 12, color: "#dc2626", background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}>
                      {removing === i ? "…" : "Remove"}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add new agreement — toggle */}
      {agreements.length > 0 && !showAddForm ? (
        <button
          onClick={() => setShowAddForm(true)}
          style={{
            width: "100%", padding: "10px", marginTop: 4,
            background: "#f9fafb", border: "2px dashed #e5e7eb", borderRadius: 10,
            fontSize: 13, fontWeight: 600, color: "#6b7280", cursor: "pointer",
          }}
        >
          + Add Another Agreement
        </button>
      ) : (
        <>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
            <h3 style={{ fontWeight: 700, color: "#111827", fontSize: 15, margin: 0 }}>
              {agreements.length > 0 ? "Add Another Agreement" : "Send Agreement"}
            </h3>
            {agreements.length > 0 && (
              <button onClick={() => { setShowAddForm(false); setSelectedType(null); setFiles([]); setError(""); }}
                style={{ fontSize: 12, color: "#9ca3af", background: "none", border: "none", cursor: "pointer" }}>
                Cancel
              </button>
            )}
          </div>
          <p style={{ fontSize: 13, color: "#9ca3af", marginBottom: 16 }}>
            You can send multiple documents — e.g. Service Agreement + LOA.
          </p>

      {/* Label input */}
      <div style={{ marginBottom: 14 }}>
        <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 6 }}>
          Document Label (optional)
        </label>
        <input
          type="text"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="e.g. Service Agreement, Letter of Authorization"
          style={{
            width: "100%", padding: "9px 12px", borderRadius: 10,
            border: "1.5px solid #e5e7eb", fontSize: 13, color: "#111827",
            background: "#f9fafb", boxSizing: "border-box",
          }}
        />
      </div>

      {/* Card 1: Template */}
      <div onClick={() => setSelectedType("template")} style={cardStyle("template")}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
          <div style={{
            width: 20, height: 20, borderRadius: "50%", border: "2px solid", flexShrink: 0, marginTop: 2,
            borderColor: selectedType === "template" ? "#FFA500" : "#d1d5db",
            background: selectedType === "template" ? "#FFA500" : "transparent",
          }} />
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontWeight: 700, fontSize: 14, color: "#111827" }}>📄 Use Standard Template</span>
              <span style={{ fontSize: 11, color: "#9ca3af", fontWeight: 500 }}>No upload needed</span>
            </div>
            <p style={{ fontSize: 13, color: "#6b7280", marginTop: 6, lineHeight: 1.5 }}>
              Send the standard Bytescare service agreement via PandaDoc. Customer signs on their portal.
            </p>
          </div>
        </div>
      </div>

      {/* Card 2: Unsigned Draft */}
      <div onClick={() => setSelectedType("unsigned")} style={cardStyle("unsigned")}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
          <div style={{
            width: 20, height: 20, borderRadius: "50%", border: "2px solid", flexShrink: 0, marginTop: 2,
            borderColor: selectedType === "unsigned" ? "#FFA500" : "#d1d5db",
            background: selectedType === "unsigned" ? "#FFA500" : "transparent",
          }} />
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontWeight: 700, fontSize: 14, color: "#111827" }}>⬆️ Upload Unsigned Draft</span>
              <span style={{ fontSize: 11, color: "#9ca3af", fontWeight: 500 }}>Customer will sign</span>
            </div>
            <p style={{ fontSize: 13, color: "#6b7280", marginTop: 6, lineHeight: 1.5 }}>
              Upload a PDF or DOCX — customer signs it via PandaDoc on their portal.
            </p>
            {selectedType === "unsigned" && (
              <div
                style={{ marginTop: 10, border: "2px dashed #fed7aa", borderRadius: 10, padding: 16, textAlign: "center", background: "#fffbf5", cursor: "pointer" }}
                onClick={(e) => { e.stopPropagation(); fileRef.current?.click(); }}
              >
                <input ref={fileRef} type="file" accept=".pdf,.docx" multiple style={{ display: "none" }}
                  onChange={(e) => setFiles(Array.from(e.target.files || []))} />
                {files.length > 0
                  ? <span style={{ fontSize: 13, color: "#374151" }}>📎 {files.map(f => f.name).join(", ")}</span>
                  : <span style={{ fontSize: 13, color: "#9ca3af" }}>Click to upload PDF or DOCX — select multiple at once</span>}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Card 3: Signed */}
      <div onClick={() => setSelectedType("signed")} style={cardStyle("signed")}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
          <div style={{
            width: 20, height: 20, borderRadius: "50%", border: "2px solid", flexShrink: 0, marginTop: 2,
            borderColor: selectedType === "signed" ? "#FFA500" : "#d1d5db",
            background: selectedType === "signed" ? "#FFA500" : "transparent",
          }} />
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontWeight: 700, fontSize: 14, color: "#111827" }}>✅ Upload Signed Document</span>
              <span style={{ fontSize: 11, color: "#9ca3af", fontWeight: 500 }}>Already complete</span>
            </div>
            <p style={{ fontSize: 13, color: "#6b7280", marginTop: 6, lineHeight: 1.5 }}>
              Upload an already-signed document. No customer action needed.
            </p>
            {selectedType === "signed" && (
              <div
                style={{ marginTop: 10, border: "2px dashed #d1d5db", borderRadius: 10, padding: 16, textAlign: "center", background: "#f9fafb", cursor: "pointer" }}
                onClick={(e) => { e.stopPropagation(); fileRef.current?.click(); }}
              >
                <input ref={fileRef} type="file" accept=".pdf,.docx" multiple style={{ display: "none" }}
                  onChange={(e) => setFiles(Array.from(e.target.files || []))} />
                {files.length > 0
                  ? <span style={{ fontSize: 13, color: "#374151" }}>📎 {files.map(f => f.name).join(", ")}</span>
                  : <span style={{ fontSize: 13, color: "#9ca3af" }}>Click to upload PDF or DOCX — select multiple at once</span>}
              </div>
            )}
          </div>
        </div>
      </div>

      {error && <p style={{ color: "#dc2626", fontSize: 13, marginBottom: 12 }}>{error}</p>}

      {selectedType && (
        <button onClick={handleSubmit} disabled={uploading}
          style={{
            marginTop: 8, width: "100%", padding: "12px",
            background: uploading ? "#fbbf24" : "#FFA500",
            color: "#fff", fontWeight: 700, fontSize: 15, border: "none", borderRadius: 10,
            cursor: uploading ? "not-allowed" : "pointer",
          }}>
          {uploading ? "Processing…"
            : selectedType === "template" ? "Send Template for Signing →"
            : selectedType === "unsigned" ? `Upload & Send for Signing${files.length > 1 ? ` (${files.length} files)` : ""} →`
            : `Upload & Mark Complete${files.length > 1 ? ` (${files.length} files)` : ""} →`}
        </button>
      )}
        </>
      )}
    </div>
  );
}

// ─── Payment Tab ──────────────────────────────────────────────────────────────

function PaymentTab({
  app,
  agreementDone,
  onSaved,
}: {
  app: Application;
  agreementDone: boolean;
  onSaved: () => void;
}) {
  const existing = app.paymentDetails;

  const [currency, setCurrency] = useState(existing?.currency || "INR");
  const [planName, setPlanName] = useState(existing?.planName || "");
  const [amount, setAmount] = useState(existing?.amount?.toString() || "");
  const [frequency, setFrequency] = useState(existing?.frequency || "monthly");
  const [duration, setDuration] = useState(existing?.serviceDuration || "1year");
  const [startDate, setStartDate] = useState(
    existing?.startDate ? existing.startDate.slice(0, 10) : ""
  );
  const [method, setMethod] = useState(existing?.method || "portal");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  function calcEndDate() {
    if (!startDate) return "";
    const d = new Date(startDate);
    if (duration === "3months") d.setMonth(d.getMonth() + 3);
    else if (duration === "6months") d.setMonth(d.getMonth() + 6);
    else if (duration === "1year") d.setFullYear(d.getFullYear() + 1);
    else return "Custom";
    return d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`/api/sales/applications/${app._id}/payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planName,
          currency,
          amount: parseFloat(amount) || 0,
          frequency,
          serviceDuration: duration,
          startDate,
          endDate: calcEndDate(),
          method,
        }),
      });
      if (!res.ok) {
        const d = await res.json();
        setError(d.error || "Failed to save");
      } else {
        setSaved(true);
        onSaved();
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  if (!agreementDone) {
    return (
      <div
        style={{
          padding: 40,
          textAlign: "center",
          color: "#9ca3af",
          border: "2px dashed #e5e7eb",
          borderRadius: 12,
        }}
      >
        <div style={{ fontSize: 32, marginBottom: 8 }}>🔒</div>
        <div style={{ fontWeight: 600, marginBottom: 4 }}>Complete Agreement step first</div>
        <div style={{ fontSize: 13 }}>
          Payment details can only be set after the agreement is configured.
        </div>
      </div>
    );
  }

  if (saved) {
    return (
      <div style={{ padding: 32, textAlign: "center" }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>✅</div>
        <div style={{ fontWeight: 700, fontSize: 18, color: "#16a34a", marginBottom: 8 }}>
          Payment details saved
        </div>
        <div style={{ color: "#6b7280", fontSize: 14 }}>
          {method === "portal"
            ? "Customer has been notified to complete payment on their portal."
            : "Payment marked as offline / manual."}
        </div>
      </div>
    );
  }

  const pillBtn = (val: string, label: string, current: string, setter: (v: string) => void) => (
    <button
      type="button"
      onClick={() => setter(val)}
      style={{
        padding: "7px 16px",
        borderRadius: 999,
        border: "1.5px solid",
        borderColor: current === val ? "#FFA500" : "#e5e7eb",
        background: current === val ? "#fff7ed" : "#fff",
        color: current === val ? "#FFA500" : "#6b7280",
        fontWeight: current === val ? 700 : 500,
        fontSize: 13,
        cursor: "pointer",
      }}
    >
      {label}
    </button>
  );

  return (
    <form onSubmit={handleSave}>
      {/* Row 1: Currency + Plan Name */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 12, marginBottom: 16 }}>
        <div>
          <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 6 }}>
            Currency
          </label>
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            style={{
              width: "100%",
              padding: "10px 12px",
              borderRadius: 10,
              border: "1.5px solid #e5e7eb",
              fontSize: 14,
              color: "#111827",
              background: "#f9fafb",
            }}
          >
            {["INR", "USD", "GBP", "EUR"].map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div>
          <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 6 }}>
            Plan Name
          </label>
          <input
            type="text"
            value={planName}
            onChange={(e) => setPlanName(e.target.value)}
            placeholder="e.g. Pro Protection Plan"
            style={{
              width: "100%",
              padding: "10px 12px",
              borderRadius: 10,
              border: "1.5px solid #e5e7eb",
              fontSize: 14,
              color: "#111827",
              background: "#f9fafb",
              boxSizing: "border-box",
            }}
          />
        </div>
      </div>

      {/* Row 2: Amount */}
      <div style={{ marginBottom: 16 }}>
        <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 6 }}>
          Amount ({currency})
        </label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0"
          min="0"
          step="0.01"
          style={{
            width: "100%",
            padding: "10px 12px",
            borderRadius: 10,
            border: "1.5px solid #e5e7eb",
            fontSize: 14,
            color: "#111827",
            background: "#f9fafb",
            boxSizing: "border-box",
          }}
        />
      </div>

      {/* Row 3: Billing Frequency */}
      <div style={{ marginBottom: 16 }}>
        <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 8 }}>
          Billing Frequency
        </label>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {pillBtn("monthly", "Monthly", frequency, setFrequency)}
          {pillBtn("quarterly", "Quarterly", frequency, setFrequency)}
          {pillBtn("biannually", "Bi-annually", frequency, setFrequency)}
          {pillBtn("annually", "Annually", frequency, setFrequency)}
        </div>
      </div>

      {/* Row 4: Service Duration */}
      <div style={{ marginBottom: 16 }}>
        <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 8 }}>
          Service Duration
        </label>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {pillBtn("3months", "3 Months", duration, setDuration)}
          {pillBtn("6months", "6 Months", duration, setDuration)}
          {pillBtn("1year", "1 Year", duration, setDuration)}
          {pillBtn("custom", "Custom", duration, setDuration)}
        </div>
      </div>

      {/* Row 5: Start Date + End Date */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
        <div>
          <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 6 }}>
            Start Date
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            style={{
              width: "100%",
              padding: "10px 12px",
              borderRadius: 10,
              border: "1.5px solid #e5e7eb",
              fontSize: 14,
              color: "#111827",
              background: "#f9fafb",
              boxSizing: "border-box",
            }}
          />
        </div>
        <div>
          <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 6 }}>
            End Date (auto)
          </label>
          <div
            style={{
              padding: "10px 12px",
              borderRadius: 10,
              border: "1.5px solid #e5e7eb",
              fontSize: 14,
              color: "#9ca3af",
              background: "#f3f4f6",
              minHeight: 42,
            }}
          >
            {calcEndDate() || "—"}
          </div>
        </div>
      </div>

      {/* Row 6: Payment Method */}
      <div style={{ marginBottom: 20 }}>
        <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 10 }}>
          Payment Method
        </label>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {[
            { val: "portal", icon: "💳", title: "Via Onboarding Portal", desc: "Customer pays on their status page (Razorpay)" },
            { val: "offline", icon: "🤝", title: "Offline / Manual", desc: "Payment handled outside the portal" },
          ].map(({ val, icon, title, desc }) => (
            <div
              key={val}
              onClick={() => setMethod(val)}
              style={{
                border: method === val ? "2px solid #FFA500" : "2px solid #e5e7eb",
                borderRadius: 12,
                padding: 16,
                cursor: "pointer",
                background: method === val ? "#fff7ed" : "#fff",
                transition: "border-color 0.15s",
              }}
            >
              <div style={{ fontSize: 22, marginBottom: 6 }}>{icon}</div>
              <div style={{ fontWeight: 700, fontSize: 13, color: "#111827", marginBottom: 4 }}>{title}</div>
              <div style={{ fontSize: 12, color: "#9ca3af" }}>{desc}</div>
            </div>
          ))}
        </div>
        {method === "portal" && (
          <div
            style={{
              marginTop: 10,
              padding: "10px 14px",
              background: "#fffbeb",
              border: "1px solid #fde68a",
              borderRadius: 8,
              fontSize: 12,
              color: "#92400e",
            }}
          >
            ⚠️ Customer will receive an email notification when you save.
          </div>
        )}
      </div>

      {error && (
        <p style={{ color: "#dc2626", fontSize: 13, marginBottom: 12 }}>{error}</p>
      )}

      <button
        type="submit"
        disabled={saving}
        style={{
          width: "100%",
          padding: "12px",
          background: saving ? "#fbbf24" : "#FFA500",
          color: "#fff",
          fontWeight: 700,
          fontSize: 15,
          border: "none",
          borderRadius: 10,
          cursor: saving ? "not-allowed" : "pointer",
        }}
      >
        {saving ? "Saving..." : "Save & Notify Customer →"}
      </button>
    </form>
  );
}

// ─── Ops Tab ──────────────────────────────────────────────────────────────────

const PLATFORMS = [
  "YouTube",
  "Instagram",
  "Facebook",
  "Twitter/X",
  "TikTok",
  "Amazon",
  "Flipkart",
  "Google Search",
  "App Stores",
  "Dark Web",
  "LinkedIn",
  "Pinterest",
];

function OpsTab({
  app,
  onSaved,
}: {
  app: Application;
  onSaved: () => void;
}) {
  const existing = app.operationalRequirements;

  const [websites, setWebsites] = useState(existing?.websites || "");
  const [youtube, setYoutube] = useState(existing?.youtubeChannels || "");
  const [social, setSocial] = useState(existing?.socialHandles || "");
  const [brands, setBrands] = useState(existing?.brandNames || "");
  const [platforms, setPlatforms] = useState<string[]>(existing?.platforms || []);
  const [priority, setPriority] = useState(existing?.priority || "standard");
  const [instructions, setInstructions] = useState(existing?.instructions || "");
  const [slaDate, setSlaDate] = useState(
    existing?.slaStartDate ? existing.slaStartDate.slice(0, 10) : ""
  );
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  function togglePlatform(p: string) {
    setPlatforms((prev) =>
      prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]
    );
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`/api/sales/applications/${app._id}/ops`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          websites,
          youtubeChannels: youtube,
          socialHandles: social,
          brandNames: brands,
          platforms,
          priority,
          instructions,
          slaStartDate: slaDate,
        }),
      });
      if (!res.ok) {
        const d = await res.json();
        setError(d.error || "Failed to save");
      } else {
        setSaved(true);
        onSaved();
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  const contactEmail =
    app.type === "company" ? app.companyOfficialEmail || app.email : app.officialEmail || app.email;

  const pillBtn = (val: string, label: string, current: string, setter: (v: string) => void) => (
    <button
      type="button"
      key={val}
      onClick={() => setter(val)}
      style={{
        padding: "7px 16px",
        borderRadius: 999,
        border: "1.5px solid",
        borderColor: current === val ? "#FFA500" : "#e5e7eb",
        background: current === val ? "#fff7ed" : "#fff",
        color: current === val ? "#FFA500" : "#6b7280",
        fontWeight: current === val ? 700 : 500,
        fontSize: 13,
        cursor: "pointer",
      }}
    >
      {label}
    </button>
  );

  if (saved) {
    return (
      <div style={{ padding: 32, textAlign: "center" }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>✅</div>
        <div style={{ fontWeight: 700, fontSize: 18, color: "#16a34a", marginBottom: 8 }}>
          Ops requirements saved
        </div>
        <div style={{ color: "#6b7280", fontSize: 14 }}>
          You can now send to the Operations Team from the action bar below.
        </div>
      </div>
    );
  }

  const ta = (
    value: string,
    setter: (v: string) => void,
    placeholder: string,
    rows = 3
  ) => (
    <textarea
      value={value}
      onChange={(e) => setter(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      style={{
        width: "100%",
        padding: "10px 12px",
        borderRadius: 10,
        border: "1.5px solid #e5e7eb",
        fontSize: 13,
        color: "#111827",
        background: "#f9fafb",
        resize: "vertical",
        boxSizing: "border-box",
        fontFamily: "inherit",
      }}
    />
  );

  return (
    <form onSubmit={handleSave}>
      {/* Client Contact */}
      <div style={{ marginBottom: 20 }}>
        <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#374151", marginBottom: 8 }}>
          Client Contact
        </label>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <input
            type="text"
            readOnly
            value={
              app.type === "company"
                ? app.companyName || ""
                : app.individualName || ""
            }
            placeholder="Name"
            style={{
              padding: "10px 12px",
              borderRadius: 10,
              border: "1.5px solid #e5e7eb",
              fontSize: 14,
              color: "#6b7280",
              background: "#f3f4f6",
              boxSizing: "border-box",
            }}
          />
          <input
            type="text"
            readOnly
            value={contactEmail}
            placeholder="Email"
            style={{
              padding: "10px 12px",
              borderRadius: 10,
              border: "1.5px solid #e5e7eb",
              fontSize: 14,
              color: "#6b7280",
              background: "#f3f4f6",
              boxSizing: "border-box",
            }}
          />
        </div>
      </div>

      {/* Assets Grid */}
      <div style={{ marginBottom: 20 }}>
        <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#374151", marginBottom: 8 }}>
          Assets
        </label>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div>
            <label style={{ fontSize: 12, color: "#6b7280", display: "block", marginBottom: 4 }}>
              Websites / URLs
            </label>
            {ta(websites, setWebsites, "https://example.com\nhttps://brand.com")}
          </div>
          <div>
            <label style={{ fontSize: 12, color: "#6b7280", display: "block", marginBottom: 4 }}>
              YouTube Channels
            </label>
            {ta(youtube, setYoutube, "Channel name or URL")}
          </div>
          <div>
            <label style={{ fontSize: 12, color: "#6b7280", display: "block", marginBottom: 4 }}>
              Social Media Handles
            </label>
            {ta(social, setSocial, "@handle or profile URL")}
          </div>
          <div>
            <label style={{ fontSize: 12, color: "#6b7280", display: "block", marginBottom: 4 }}>
              Brand Names / Keywords
            </label>
            {ta(brands, setBrands, "Brand name, trademark, keywords")}
          </div>
        </div>
      </div>

      {/* Monitoring Platforms */}
      <div style={{ marginBottom: 20 }}>
        <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#374151", marginBottom: 8 }}>
          Monitoring Platforms
        </label>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {PLATFORMS.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => togglePlatform(p)}
              style={{
                padding: "6px 14px",
                borderRadius: 999,
                border: "1.5px solid",
                borderColor: platforms.includes(p) ? "#FFA500" : "#e5e7eb",
                background: platforms.includes(p) ? "#fff7ed" : "#fff",
                color: platforms.includes(p) ? "#FFA500" : "#6b7280",
                fontWeight: platforms.includes(p) ? 700 : 500,
                fontSize: 12,
                cursor: "pointer",
              }}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Priority */}
      <div style={{ marginBottom: 16 }}>
        <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#374151", marginBottom: 8 }}>
          Priority Level
        </label>
        <div style={{ display: "flex", gap: 8 }}>
          {pillBtn("standard", "Standard", priority, setPriority)}
          {pillBtn("high", "High", priority, setPriority)}
          {pillBtn("critical", "Critical", priority, setPriority)}
        </div>
      </div>

      {/* Special Instructions */}
      <div style={{ marginBottom: 16 }}>
        <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#374151", marginBottom: 6 }}>
          Special Instructions
        </label>
        {ta(instructions, setInstructions, "Any specific notes or requirements for the ops team...", 5)}
      </div>

      {/* SLA Start Date */}
      <div style={{ marginBottom: 20 }}>
        <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#374151", marginBottom: 6 }}>
          SLA Start Date
        </label>
        <input
          type="date"
          value={slaDate}
          onChange={(e) => setSlaDate(e.target.value)}
          style={{
            padding: "10px 12px",
            borderRadius: 10,
            border: "1.5px solid #e5e7eb",
            fontSize: 14,
            color: "#111827",
            background: "#f9fafb",
            boxSizing: "border-box",
          }}
        />
      </div>

      {error && (
        <p style={{ color: "#dc2626", fontSize: 13, marginBottom: 12 }}>{error}</p>
      )}

      <button
        type="submit"
        disabled={saving}
        style={{
          width: "100%",
          padding: "12px",
          background: saving ? "#fbbf24" : "#FFA500",
          color: "#fff",
          fontWeight: 700,
          fontSize: 15,
          border: "none",
          borderRadius: 10,
          cursor: saving ? "not-allowed" : "pointer",
        }}
      >
        {saving ? "Saving..." : "Save Ops Requirements"}
      </button>
    </form>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

type TabType = "agreement" | "payment" | "ops";

export default function ApplicationDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [app, setApp] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<TabType>("agreement");
  const [sendingToOps, setSendingToOps] = useState(false);
  const [sentToOps, setSentToOps] = useState(false);
  const [opsError, setOpsError] = useState("");

  function loadApp() {
    fetch(`/api/sales/applications/${id}`)
      .then((r) => {
        if (r.status === 401) { router.push("/sales"); return null; }
        if (r.status === 404) { setError("Application not found"); return null; }
        return r.json();
      })
      .then((data) => {
        if (data) setApp(data.application);
      })
      .catch(() => setError("Failed to load application"))
      .finally(() => setLoading(false));
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { loadApp(); }, [id]);

  async function handleSignOut() {
    await fetch("/api/sales/logout", { method: "POST" });
    router.push("/sales");
  }

  async function handleSendToOps() {
    setSendingToOps(true);
    setOpsError("");
    try {
      const res = await fetch(`/api/sales/applications/${id}/send-to-ops`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) {
        setOpsError(data.error || "Failed to send to ops");
      } else {
        setSentToOps(true);
        loadApp();
      }
    } catch {
      setOpsError("Network error. Please try again.");
    } finally {
      setSendingToOps(false);
    }
  }

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "#f9fafb", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ color: "#9ca3af", fontSize: 16 }}>Loading application...</div>
      </div>
    );
  }

  if (error || !app) {
    return (
      <div style={{ minHeight: "100vh", background: "#f9fafb", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
          <div style={{ fontWeight: 700, fontSize: 18, color: "#111827", marginBottom: 8 }}>
            {error || "Application not found"}
          </div>
          <a href="/sales/dashboard" style={{ color: "#FFA500", textDecoration: "none", fontWeight: 600 }}>
            ← Back to All Applications
          </a>
        </div>
      </div>
    );
  }

  const agreementDone = (app.agreements?.length ?? 0) > 0;
  const paymentDone = !!app.paymentDetails;
  const opsDone = !!app.operationalRequirements;
  const allDone = agreementDone && paymentDone && opsDone;
  const alreadySentToOps = !!app.operationalRequirements?.sentToOpsAt || app.status === "ops_setup" || app.status === "active";

  const displayName =
    app.type === "company" ? app.companyName : app.individualName;

  const STEPS: { key: TabType; label: string; done: boolean }[] = [
    { key: "agreement", label: "Agreement", done: agreementDone },
    { key: "payment", label: "Payment", done: paymentDone },
    { key: "ops", label: "Ops Requirements", done: opsDone },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#f9fafb", paddingBottom: 100 }}>
      {/* Header */}
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 100,
          background: "#fff",
          borderBottom: "1px solid #f3f4f6",
          padding: "0 24px",
          height: 60,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <a
            href="/sales/dashboard"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              color: "#6b7280",
              textDecoration: "none",
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            ← All Applications
          </a>
          <span style={{ color: "#e5e7eb" }}>|</span>
          <Logo />
        </div>
        <button
          onClick={handleSignOut}
          style={{
            padding: "7px 16px",
            background: "transparent",
            border: "1.5px solid #e5e7eb",
            borderRadius: 8,
            fontSize: 13,
            fontWeight: 600,
            color: "#374151",
            cursor: "pointer",
          }}
        >
          Sign Out
        </button>
      </header>

      {/* Main */}
      <main style={{ maxWidth: 900, margin: "0 auto", padding: "28px 24px" }}>
        {/* Customer Summary Card */}
        <div
          style={{
            background: "#fff",
            borderRadius: 20,
            padding: 24,
            marginBottom: 20,
            boxShadow: "0 1px 4px rgba(0,0,0,0.07)",
          }}
        >
          <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 12, flexWrap: "wrap" }}>
            <span
              style={{
                fontFamily: "monospace",
                fontSize: 12,
                color: "#9ca3af",
                background: "#f3f4f6",
                borderRadius: 6,
                padding: "2px 8px",
              }}
            >
              {app.applicationId}
            </span>
            <StatusBadge status={app.status} />
          </div>

          <div style={{ fontSize: 22, fontWeight: 900, color: "#111827", marginBottom: 4 }}>
            {displayName || "—"}
          </div>
          <div style={{ fontSize: 14, color: "#9ca3af", marginBottom: 14 }}>{app.email}</div>

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
            {[
              { label: app.type === "company" ? "Company" : "Individual" },
              { label: app.country },
              {
                label: `Submitted ${new Date(app.createdAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}`,
              },
            ].map((chip, i) => (
              <span
                key={i}
                style={{
                  fontSize: 12,
                  color: "#374151",
                  background: "#f3f4f6",
                  borderRadius: 999,
                  padding: "4px 12px",
                  fontWeight: 500,
                }}
              >
                {chip.label}
              </span>
            ))}
          </div>

          {app.services?.length > 0 && (
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {app.services.map((s) => (
                <span
                  key={s}
                  style={{
                    fontSize: 11,
                    color: "#d97706",
                    border: "1px solid #fde68a",
                    background: "#fef9c3",
                    borderRadius: 999,
                    padding: "3px 10px",
                    fontWeight: 600,
                  }}
                >
                  {s}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Stepper */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            background: "#fff",
            borderRadius: 16,
            padding: "16px 24px",
            marginBottom: 20,
            boxShadow: "0 1px 4px rgba(0,0,0,0.07)",
            gap: 0,
          }}
        >
          {STEPS.map((step, idx) => (
            <div key={step.key} style={{ display: "flex", alignItems: "center", flex: 1 }}>
              <button
                onClick={() => setActiveTab(step.key)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  padding: "6px 10px",
                  borderRadius: 10,
                  transition: "background 0.15s",
                  flex: 1,
                }}
              >
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 800,
                    fontSize: 14,
                    flexShrink: 0,
                    background:
                      step.done
                        ? "#FFA500"
                        : activeTab === step.key
                        ? "#fff7ed"
                        : "#f3f4f6",
                    color:
                      step.done
                        ? "#fff"
                        : activeTab === step.key
                        ? "#FFA500"
                        : "#9ca3af",
                    border: activeTab === step.key && !step.done ? "2px solid #FFA500" : "none",
                  }}
                >
                  {step.done ? "✓" : idx + 1}
                </div>
                <div style={{ textAlign: "left" }}>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: activeTab === step.key ? 700 : 500,
                      color: activeTab === step.key ? "#111827" : "#6b7280",
                    }}
                  >
                    {step.label}
                  </div>
                  <div style={{ fontSize: 11, color: step.done ? "#16a34a" : "#9ca3af" }}>
                    {step.done ? "Done" : "Pending"}
                  </div>
                </div>
              </button>
              {idx < STEPS.length - 1 && (
                <div
                  style={{
                    flex: 0,
                    width: 24,
                    height: 2,
                    background: step.done ? "#FFA500" : "#e5e7eb",
                    flexShrink: 0,
                  }}
                />
              )}
            </div>
          ))}
        </div>

        {/* Tab Content */}
        <div
          style={{
            background: "#fff",
            borderRadius: 20,
            padding: 28,
            boxShadow: "0 1px 4px rgba(0,0,0,0.07)",
          }}
        >
          <h2 style={{ fontSize: 18, fontWeight: 800, color: "#111827", marginBottom: 20, marginTop: 0 }}>
            {activeTab === "agreement"
              ? "Agreement"
              : activeTab === "payment"
              ? "Payment Details"
              : "Operational Requirements"}
          </h2>

          {activeTab === "agreement" && (
            <AgreementTab app={app} onSaved={loadApp} />
          )}
          {activeTab === "payment" && (
            <PaymentTab app={app} agreementDone={agreementDone} onSaved={loadApp} />
          )}
          {activeTab === "ops" && (
            <OpsTab app={app} onSaved={loadApp} />
          )}
        </div>
      </main>

      {/* Sticky Bottom Action Bar */}
      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          background: "#fff",
          borderTop: "1px solid #f3f4f6",
          padding: "14px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
          zIndex: 50,
          flexWrap: "wrap",
        }}
      >
        {/* Completion pills */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {STEPS.map((step) => (
            <span
              key={step.key}
              style={{
                fontSize: 12,
                fontWeight: 600,
                borderRadius: 999,
                padding: "4px 12px",
                background: step.done ? "#dcfce7" : "#f3f4f6",
                color: step.done ? "#16a34a" : "#9ca3af",
                border: "1.5px solid",
                borderColor: step.done ? "#bbf7d0" : "#e5e7eb",
              }}
            >
              {step.done ? "✓" : "○"} {step.label}
            </span>
          ))}
        </div>

        {/* Send to Ops */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
          {opsError && (
            <span style={{ fontSize: 12, color: "#dc2626" }}>{opsError}</span>
          )}
          {sentToOps || alreadySentToOps ? (
            <span
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: "#16a34a",
                background: "#dcfce7",
                borderRadius: 10,
                padding: "10px 20px",
                border: "1.5px solid #bbf7d0",
              }}
            >
              Sent to Operations Team ✓
            </span>
          ) : (
            <button
              onClick={handleSendToOps}
              disabled={!allDone || sendingToOps}
              style={{
                padding: "10px 22px",
                background: allDone ? "#FFA500" : "#e5e7eb",
                color: allDone ? "#fff" : "#9ca3af",
                fontWeight: 700,
                fontSize: 14,
                border: "none",
                borderRadius: 10,
                cursor: allDone ? "pointer" : "not-allowed",
                transition: "background 0.15s",
              }}
            >
              {sendingToOps ? "Sending..." : "Send to Operations Team →"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
