import React from "react";

const baseStyle = {
  borderRadius: 999,
  padding: "10px 18px",
  fontSize: "0.82rem",
  fontWeight: 600,
  cursor: "pointer",
  display: "inline-flex",
  alignItems: "center",
  gap: "8px",
  border: "1px solid transparent",
  transition: "transform 0.2s ease, box-shadow 0.2s ease, filter 0.2s ease",
};

const variants = {
  primary: {
    background:
      "linear-gradient(120deg, #f97316, #fbbf24, #f97316)",
    color: "#1f2937",
    boxShadow: "0 10px 25px rgba(251, 191, 36, 0.35)",
  },
  ghost: {
    background: "transparent",
    color: "var(--text-sub)",
    border: "1px solid rgba(55, 65, 81, 0.9)",
  },
  secondary: {
    background: "#374151",
    color: "#f8fafc",
    border: "1px solid #4b5563",
    boxShadow: "0 6px 20px rgba(15, 23, 42, 0.45)",
  },
  soft: {
    background: "rgba(22,163,74,0.2)",
    color: "var(--accent)",
    border: "1px solid rgba(34,197,94,0.6)",
  },
  "danger-soft": {
    background: "rgba(220,38,38,0.2)",
    color: "var(--danger)",
    border: "1px solid rgba(239,68,68,0.5)",
  },
};

export function Button({ variant = "primary", children, style, ...rest }) {
  const variantStyle = variants[variant] || variants.primary;
  return (
    <button
      className="app-btn"
      style={{ ...baseStyle, ...variantStyle, ...style }}
      {...rest}
    >
      {children}
    </button>
  );
}
