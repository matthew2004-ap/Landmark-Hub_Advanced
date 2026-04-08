import React, { useState } from "react";
import { FB } from "../../constants/data";

export const Spin = () => (
  <span
    style={{
      display: "inline-block",
      width: 16,
      height: 16,
      border: "2px solid rgba(255,255,255,.3)",
      borderTopColor: "white",
      borderRadius: "50%",
      animation: "spin .7s linear infinite",
      verticalAlign: "middle",
    }}
  />
);

export const Dot = ({ c = "#F59E0B" }) => (
  <span
    style={{
      display: "inline-block",
      width: 8,
      height: 8,
      borderRadius: "50%",
      background: c,
      animation: "pulse 1.5s ease-in-out infinite",
    }}
  />
);

export function Stars({ val = 0, set, sz = 16 }) {
  return (
    <div style={{ display: "flex", gap: 3 }}>
      {[1, 2, 3, 4, 5].map((s) => (
        <span
          key={s}
          onClick={() => set?.(s)}
          style={{
            fontSize: sz,
            cursor: set ? "pointer" : "default",
            color: s <= val ? "#F59E0B" : "#D5C9B8",
            transition: "color .12s",
          }}
        >
          ★
        </span>
      ))}
    </div>
  );
}

export function Badge({ text, color = "#16A34A" }) {
  return (
    <span
      style={{
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: 0.5,
        background: color + "1A",
        color,
        border: `1px solid ${color}44`,
        borderRadius: 30,
        padding: "3px 10px",
        whiteSpace: "nowrap",
      }}
    >
      {text}
    </span>
  );
}

export function SChip({ s }) {
  const m = {
    Preparing: "#F59E0B",
    "On the Way": "#3B82F6",
    Delivered: "#16A34A",
    Pending: "#F59E0B",
    "In Review": "#3B82F6",
    Resolved: "#16A34A",
    Cancelled: "#EF4444",
  };
  return <Badge text={s} color={m[s] || "#6B7280"} />;
}

export function Img({ src, alt = "", style = {}, fallback = FB }) {
  const [err, setErr] = useState(false);
  return <img src={err ? fallback : src} alt={alt} style={style} onError={() => setErr(true)} />;
}

export function Icon({ src, size = 20, round = 8 }) {
  const isUrl = src?.startsWith?.("http");
  if (!isUrl) return <span style={{ fontSize: size }}>{src}</span>;
  return (
    <img
      src={src}
      alt="icon"
      style={{
        width: size,
        height: size,
        borderRadius: round,
        objectFit: "cover",
        display: "block",
        flexShrink: 0,
      }}
    />
  );
}

export function ImgSkeleton({ style = {} }) {
  return <div className="shimmer" style={{ borderRadius: 0, ...style }} />;
}

export function ToastContainer({ toasts }) {
  return (
    <div style={{ position: "fixed", bottom: 28, right: 20, zIndex: 9999, display: "flex", flexDirection: "column", gap: 10 }}>
      {toasts.map((t) => (
        <div
          key={t.id}
          style={{
            background: t.type === "error" ? "#EF4444" : t.type === "warn" ? "#F59E0B" : "#0C3B2E",
            color: "white",
            borderRadius: 12,
            padding: "12px 20px",
            fontSize: 14,
            fontWeight: 600,
            boxShadow: "0 8px 24px rgba(0,0,0,.2)",
            animation: "toast .35s ease both",
            maxWidth: 300,
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <span>{t.type === "error" ? "✗" : t.type === "warn" ? "⚠" : "✓"}</span>
          {t.msg}
        </div>
      ))}
    </div>
  );
}

export const Label = ({ text }) => (
  <label style={{ fontSize: 11, fontWeight: 600, letterSpacing: 1.2, color: "#8A7E72", textTransform: "uppercase", display: "block", marginBottom: 6 }}>
    {text}
  </label>
);

export const Input = ({ ...p }) => (
  <input
    {...p}
    style={{
      width: "100%",
      padding: "11px 14px",
      borderRadius: 10,
      border: "1.5px solid #E5DDD0",
      fontSize: 14,
      background: "#FEFCF8",
      ...p.style,
    }}
  />
);

export const Select = ({ children, ...p }) => (
  <select
    {...p}
    style={{
      width: "100%",
      padding: "11px 14px",
      borderRadius: 10,
      border: "1.5px solid #E5DDD0",
      fontSize: 14,
      background: "#FEFCF8",
      appearance: "none",
      ...p.style,
    }}
  >
    {children}
  </select>
);

export const SectionHead = ({ title, sub }) => (
  <div style={{ marginBottom: 24 }}>
    <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(22px, 4vw, 28px)", color: "#0C3B2E", lineHeight: 1.2 }}>{title}</h2>
    {sub && <p style={{ color: "#8A7E72", marginTop: 6, fontSize: 14 }}>{sub}</p>}
  </div>
);
