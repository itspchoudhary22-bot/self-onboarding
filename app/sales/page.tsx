"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SalesLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/sales/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Login failed");
      } else {
        router.push("/sales/dashboard");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f9fafb",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 400,
          background: "#fff",
          borderRadius: 24,
          padding: 36,
          boxShadow: "0 4px 32px rgba(0,0,0,0.08)",
        }}
      >
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 8 }}>
          <span style={{ fontSize: 28, fontWeight: 900, color: "#111827", letterSpacing: -1 }}>
            BYTES
          </span>
          <span style={{ fontSize: 28, fontWeight: 900, color: "#FFA500", letterSpacing: -1 }}>
            CARE
          </span>
        </div>

        {/* Badge */}
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <span
            style={{
              display: "inline-block",
              background: "#fff7ed",
              color: "#FFA500",
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: 1.5,
              textTransform: "uppercase",
              borderRadius: 999,
              padding: "4px 14px",
              border: "1px solid #fed7aa",
            }}
          >
            Sales Portal
          </span>
        </div>

        {/* Heading */}
        <h1
          style={{
            fontSize: 22,
            fontWeight: 800,
            color: "#111827",
            marginBottom: 4,
            textAlign: "center",
          }}
        >
          Sign in to continue
        </h1>
        <p
          style={{
            fontSize: 14,
            color: "#9ca3af",
            textAlign: "center",
            marginBottom: 28,
          }}
        >
          Internal access only
        </p>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label
              style={{
                display: "block",
                fontSize: 13,
                fontWeight: 600,
                color: "#374151",
                marginBottom: 6,
              }}
            >
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter portal password"
              required
              style={{
                width: "100%",
                padding: "10px 14px",
                borderRadius: 10,
                border: "1.5px solid #e5e7eb",
                fontSize: 15,
                color: "#111827",
                outline: "none",
                boxSizing: "border-box",
                background: "#f9fafb",
              }}
            />
          </div>

          {error && (
            <p
              style={{
                fontSize: 13,
                color: "#dc2626",
                marginBottom: 12,
                padding: "8px 12px",
                background: "#fef2f2",
                borderRadius: 8,
                border: "1px solid #fecaca",
              }}
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "12px",
              background: loading ? "#fbbf24" : "#FFA500",
              color: "#fff",
              fontWeight: 700,
              fontSize: 15,
              border: "none",
              borderRadius: 10,
              cursor: loading ? "not-allowed" : "pointer",
              transition: "background 0.2s",
            }}
          >
            {loading ? "Signing in..." : "Sign In →"}
          </button>
        </form>
      </div>
    </div>
  );
}
