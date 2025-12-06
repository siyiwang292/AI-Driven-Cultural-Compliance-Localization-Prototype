import React from "react";

export function TopBar() {
  return (
    <header
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 18,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 999,
            background:
              "linear-gradient(135deg, #ff9900, #fde68a, #22c55e)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#020617",
            fontSize: "0.85rem",
            fontWeight: 800,
            boxShadow: "0 12px 24px rgba(0,0,0,0.6)",
          }}
        >
          AQ
        </div>
        <div>
          <div style={{ fontWeight: 800, fontSize: "1.05rem" }}>
            Audible QA & Localization Console
          </div>
          <div
            style={{
              fontSize: "0.78rem",
              color: "var(--text-sub)",
            }}
          >
            AI-powered cultural and compliance QA for localized campaigns
          </div>
        </div>
      </div>

      <div style={{ textAlign: "right", fontSize: "0.82rem" }}>
        <div style={{ fontWeight: 700, color: "var(--primary)" }}>
          Columbia Business School &amp; Audible
        </div>
        <div style={{ color: "var(--text-sub)" }}>
          AI Localization &amp; QA Collaboration
        </div>
      </div>
    </header>
  );
}
