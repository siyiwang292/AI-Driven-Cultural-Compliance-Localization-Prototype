import React from "react";

export function Chip({ children, primary, onClick }) {
  return (
    <span
      className={`chip ${primary ? "chip-primary" : ""}`}
      onClick={onClick}
    >
      {children}
    </span>
  );
}

export function Badge({ children }) {
  return <span className="badge">{children}</span>;
}
