export default function NotFound() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f9fafb",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: "#111827", marginBottom: 8 }}>
          Application not found
        </h1>
        <p style={{ color: "#9ca3af", fontSize: 14, marginBottom: 24 }}>
          The application you are looking for does not exist or has been removed.
        </p>
        <a
          href="/sales/dashboard"
          style={{
            display: "inline-block",
            padding: "10px 24px",
            background: "#FFA500",
            color: "#fff",
            fontWeight: 700,
            fontSize: 14,
            borderRadius: 10,
            textDecoration: "none",
          }}
        >
          ← Back to All Applications
        </a>
      </div>
    </div>
  );
}
