"use client";

import { useEffect } from "react";

export default function OnboardingError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Onboarding portal error:", error);
  }, [error]);

  const clearAndReset = () => {
    try {
      localStorage.removeItem("bytescare_submitted");
      localStorage.removeItem("bytescare_session_id");
      localStorage.removeItem("bytescare_form_data");
      localStorage.removeItem("bytescare_step");
    } catch {}
    reset();
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f9fafb", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ maxWidth: 480, width: "100%", background: "#fff", borderRadius: 20, padding: 32, boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>
        <div style={{ fontSize: 36, marginBottom: 12 }}>⚠️</div>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: "#111827", marginBottom: 8 }}>Something went wrong</h2>
        <p style={{ fontSize: 14, color: "#6b7280", marginBottom: 6 }}>
          {error?.message || "An unexpected error occurred."}
        </p>
        {error?.digest && (
          <p style={{ fontSize: 11, color: "#9ca3af", fontFamily: "monospace", marginBottom: 16 }}>
            Error ID: {error.digest}
          </p>
        )}
        <div style={{ display: "flex", gap: 10, flexDirection: "column" }}>
          <button
            onClick={reset}
            style={{ padding: "10px 20px", background: "#FFA500", color: "#111827", fontWeight: 700, fontSize: 14, border: "none", borderRadius: 10, cursor: "pointer" }}
          >
            Try again
          </button>
          <button
            onClick={clearAndReset}
            style={{ padding: "10px 20px", background: "#f3f4f6", color: "#374151", fontWeight: 600, fontSize: 13, border: "none", borderRadius: 10, cursor: "pointer" }}
          >
            Clear session &amp; start fresh
          </button>
        </div>
      </div>
    </div>
  );
}
