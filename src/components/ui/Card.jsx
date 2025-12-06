import React from "react";

export function Card({ className = "", children }) {
  return <div className={`main-card ${className}`}>{children}</div>;
}

export function SideCard({ className = "", children }) {
  return <div className={`side-card ${className}`}>{children}</div>;
}
