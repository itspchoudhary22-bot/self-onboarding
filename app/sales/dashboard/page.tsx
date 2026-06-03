"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Application {
  _id: string;
  applicationId: string;
  email: string;
  type: "individual" | "company";
  status: string;
  services: string[];
  servicesCount: number;
  createdAt: string;
  displayName: string;
  country: string;
}

const STATUS_TABS = [
  { label: "All", value: "all" },
  { label: "Pending Review", value: "pending_review" },
  { label: "Agreement Pending", value: "agreement_pending" },
  { label: "Payment Pending", value: "payment_pending" },
  { label: "Ops Setup", value: "ops_setup" },
  { label: "Active", value: "active" },
];

const STATUS_BADGE: Record<string, { bg: string; color: string; label: string }> = {
  pending_review: { bg: "#fef3c7", color: "#d97706", label: "Pending Review" },
  agreement_pending: { bg: "#dbeafe", color: "#1d4ed8", label: "Agreement Pending" },
  payment_pending: { bg: "#ede9fe", color: "#7c3aed", label: "Payment Pending" },
  ops_setup: { bg: "#ccfbf1", color: "#0d9488", label: "Ops Setup" },
  active: { bg: "#dcfce7", color: "#16a34a", label: "Active" },
};

function Logo() {
  return (
    <span style={{ fontWeight: 900, fontSize: 20, letterSpacing: -0.5 }}>
      <span style={{ color: "#111827" }}>BYTES</span>
      <span style={{ color: "#FFA500" }}>CARE</span>
    </span>
  );
}

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
}) {
  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 16,
        padding: 20,
        boxShadow: "0 1px 4px rgba(0,0,0,0.07)",
        display: "flex",
        alignItems: "flex-start",
        gap: 14,
      }}
    >
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: 10,
          background: "#fff7ed",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        {icon}
      </div>
      <div>
        <div style={{ fontSize: 28, fontWeight: 900, color: "#111827", lineHeight: 1 }}>
          {value}
        </div>
        <div style={{ fontSize: 13, color: "#9ca3af", marginTop: 4 }}>{label}</div>
      </div>
    </div>
  );
}

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
        whiteSpace: "nowrap",
      }}
    >
      {badge.label}
    </span>
  );
}

export default function SalesDashboardPage() {
  const router = useRouter();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    fetch("/api/sales/applications?limit=200")
      .then((r) => {
        if (r.status === 401) { router.push("/sales"); return null; }
        return r.json();
      })
      .then((data) => {
        if (data) setApplications(data.applications || []);
      })
      .catch(() => setError("Failed to load applications"))
      .finally(() => setLoading(false));
  }, [router]);

  async function handleSignOut() {
    setSigningOut(true);
    await fetch("/api/sales/logout", { method: "POST" });
    router.push("/sales");
  }

  const filtered =
    activeTab === "all"
      ? applications
      : applications.filter((a) => a.status === activeTab);

  const total = applications.length;
  const pendingReview = applications.filter((a) => a.status === "pending_review").length;
  const agreementPayment = applications.filter(
    (a) => a.status === "agreement_pending" || a.status === "payment_pending"
  ).length;
  const activeCount = applications.filter(
    (a) => a.status === "active" || a.status === "ops_setup"
  ).length;

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div style={{ minHeight: "100vh", background: "#f9fafb" }}>
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
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <Logo />
          <span
            style={{
              background: "#fff7ed",
              color: "#FFA500",
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: 1.2,
              textTransform: "uppercase",
              borderRadius: 999,
              padding: "3px 10px",
              border: "1px solid #fed7aa",
            }}
          >
            Sales Portal
          </span>
        </div>
        <button
          onClick={handleSignOut}
          disabled={signingOut}
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
          {signingOut ? "Signing out..." : "Sign Out"}
        </button>
      </header>

      {/* Main */}
      <main style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 24px" }}>
        {/* Page heading */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 24,
            flexWrap: "wrap",
            gap: 8,
          }}
        >
          <h1 style={{ fontSize: 26, fontWeight: 900, color: "#111827", margin: 0 }}>
            Applications
          </h1>
          <span style={{ fontSize: 13, color: "#9ca3af" }}>{today}</span>
        </div>

        {/* Stat Cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
            gap: 16,
            marginBottom: 28,
          }}
        >
          <StatCard
            label="Total Applications"
            value={total}
            icon={
              <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#FFA500" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                <path d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
              </svg>
            }
          />
          <StatCard
            label="Pending Review"
            value={pendingReview}
            icon={
              <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#FFA500" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
            }
          />
          <StatCard
            label="Agreement / Payment"
            value={agreementPayment}
            icon={
              <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#FFA500" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
            }
          />
          <StatCard
            label="Active / Ops Setup"
            value={activeCount}
            icon={
              <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#FFA500" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
              </svg>
            }
          />
        </div>

        {/* Filter Tabs */}
        <div
          style={{
            display: "flex",
            gap: 0,
            borderBottom: "2px solid #f3f4f6",
            marginBottom: 20,
            overflowX: "auto",
          }}
        >
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              style={{
                padding: "10px 18px",
                fontSize: 13,
                fontWeight: activeTab === tab.value ? 700 : 500,
                color: activeTab === tab.value ? "#FFA500" : "#6b7280",
                background: "transparent",
                border: "none",
                borderBottom: activeTab === tab.value ? "2px solid #FFA500" : "2px solid transparent",
                cursor: "pointer",
                whiteSpace: "nowrap",
                marginBottom: -2,
                transition: "color 0.15s",
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "60px 0", color: "#9ca3af" }}>
            Loading applications...
          </div>
        ) : error ? (
          <div
            style={{
              textAlign: "center",
              padding: "60px 0",
              color: "#dc2626",
              background: "#fef2f2",
              borderRadius: 12,
            }}
          >
            {error}
          </div>
        ) : filtered.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "60px 0",
              color: "#9ca3af",
              background: "#fff",
              borderRadius: 16,
              boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
            }}
          >
            <div style={{ fontSize: 40, marginBottom: 12 }}>📋</div>
            <div style={{ fontSize: 15, fontWeight: 600 }}>No applications found</div>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block">
              <div
                style={{
                  background: "#fff",
                  borderRadius: 16,
                  boxShadow: "0 1px 4px rgba(0,0,0,0.07)",
                  overflow: "hidden",
                }}
              >
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ background: "#f9fafb", borderBottom: "1px solid #f3f4f6" }}>
                      {["App ID", "Customer", "Type", "Services", "Submitted", "Status", "Action"].map(
                        (col) => (
                          <th
                            key={col}
                            style={{
                              padding: "12px 16px",
                              textAlign: "left",
                              fontSize: 12,
                              fontWeight: 700,
                              color: "#9ca3af",
                              textTransform: "uppercase",
                              letterSpacing: 0.5,
                            }}
                          >
                            {col}
                          </th>
                        )
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((app, idx) => (
                      <tr
                        key={app._id}
                        style={{
                          borderBottom: idx < filtered.length - 1 ? "1px solid #f9fafb" : "none",
                        }}
                      >
                        <td style={{ padding: "14px 16px" }}>
                          <span
                            style={{
                              fontFamily: "monospace",
                              fontSize: 12,
                              color: "#9ca3af",
                              background: "#f3f4f6",
                              borderRadius: 6,
                              padding: "2px 7px",
                            }}
                          >
                            {app.applicationId}
                          </span>
                        </td>
                        <td style={{ padding: "14px 16px" }}>
                          <div style={{ fontWeight: 700, fontSize: 14, color: "#111827" }}>
                            {app.displayName || "—"}
                          </div>
                          <div style={{ fontSize: 12, color: "#9ca3af" }}>{app.email}</div>
                        </td>
                        <td style={{ padding: "14px 16px" }}>
                          <span
                            style={{
                              fontSize: 11,
                              fontWeight: 700,
                              borderRadius: 999,
                              padding: "3px 10px",
                              background: app.type === "company" ? "#dbeafe" : "#fce7f3",
                              color: app.type === "company" ? "#1d4ed8" : "#be185d",
                            }}
                          >
                            {app.type === "company" ? "Company" : "Individual"}
                          </span>
                        </td>
                        <td style={{ padding: "14px 16px", fontSize: 13, color: "#374151" }}>
                          {app.servicesCount} service{app.servicesCount !== 1 ? "s" : ""}
                        </td>
                        <td style={{ padding: "14px 16px", fontSize: 13, color: "#6b7280" }}>
                          {new Date(app.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </td>
                        <td style={{ padding: "14px 16px" }}>
                          <StatusBadge status={app.status} />
                        </td>
                        <td style={{ padding: "14px 16px" }}>
                          <a
                            href={`/sales/application/${app._id}`}
                            style={{
                              display: "inline-block",
                              padding: "6px 14px",
                              background: "#fff7ed",
                              color: "#FFA500",
                              fontWeight: 700,
                              fontSize: 13,
                              borderRadius: 8,
                              textDecoration: "none",
                              border: "1px solid #fed7aa",
                              transition: "background 0.15s",
                            }}
                          >
                            Review →
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile Card List */}
            <div className="md:hidden" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {filtered.map((app) => (
                <div
                  key={app._id}
                  style={{
                    background: "#fff",
                    borderRadius: 16,
                    padding: 16,
                    boxShadow: "0 1px 4px rgba(0,0,0,0.07)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      marginBottom: 8,
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 15, color: "#111827" }}>
                        {app.displayName || "—"}
                      </div>
                      <div style={{ fontSize: 12, color: "#9ca3af" }}>{app.email}</div>
                    </div>
                    <StatusBadge status={app.status} />
                  </div>
                  <div
                    style={{
                      display: "flex",
                      gap: 8,
                      alignItems: "center",
                      marginBottom: 12,
                      flexWrap: "wrap",
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "monospace",
                        fontSize: 11,
                        color: "#9ca3af",
                        background: "#f3f4f6",
                        borderRadius: 6,
                        padding: "2px 7px",
                      }}
                    >
                      {app.applicationId}
                    </span>
                    <span style={{ fontSize: 12, color: "#6b7280" }}>
                      {app.servicesCount} service{app.servicesCount !== 1 ? "s" : ""}
                    </span>
                    <span style={{ fontSize: 12, color: "#6b7280" }}>
                      {new Date(app.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <a
                    href={`/sales/application/${app._id}`}
                    style={{
                      display: "block",
                      textAlign: "center",
                      padding: "8px",
                      background: "#fff7ed",
                      color: "#FFA500",
                      fontWeight: 700,
                      fontSize: 13,
                      borderRadius: 8,
                      textDecoration: "none",
                      border: "1px solid #fed7aa",
                    }}
                  >
                    Review →
                  </a>
                </div>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
