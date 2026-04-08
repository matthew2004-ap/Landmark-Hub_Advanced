import React from "react";
import { PICS } from "../../constants/data";
import { Icon } from "./UI";

export function Shell({ user, onLogout, children, tabs, activeTab, setTab, dark = false }) {
  const fg = dark ? "white" : "#1C1C1C";
  const border = dark ? "rgba(255,255,255,.07)" : "#EDE6DA";
  return (
    <div style={{ minHeight: "100vh", color: fg }} className={dark ? "bg-dark-accent" : ""}>
      {/* Navbar */}
      <nav 
        className={dark ? "bg-dark-accent" : "bg-accent"}
        style={{ position: "sticky", top: 0, zIndex: 200, boxShadow: "0 2px 20px rgba(0,0,0,.25)" }}
      >
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 20px", height: 62, display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: "#F59E0B", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, overflow: "hidden" }}>
              <Icon src={PICS.logo} size={36} round={10} />
            </div>
            <div>
              <div style={{ fontFamily: "'Inter', system-ui, sans-serif", color: "#F59E0B", fontWeight: 900, fontSize: 15, letterSpacing: 0.3 }}>Campus Chop Hub</div>
              <div style={{ color: "rgba(255,255,255,.35)", fontSize: 9, letterSpacing: 2, textTransform: "uppercase" }}>Landmark University</div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ background: "rgba(255,255,255,.08)", borderRadius: 20, padding: "6px 14px", display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 26, height: 26, borderRadius: "50%", background: "#F59E0B", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 12, color: "#0C3B2E", overflow: "hidden" }}>
                <Icon src={PICS.user} size={26} round={13} />
              </div>
              <span style={{ color: "white", fontSize: 13, fontWeight: 500, maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} className="hide-sm">
                {user?.name}
              </span>
            </div>
            <button
              onClick={onLogout}
              style={{ background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.15)", color: "rgba(255,255,255,.7)", borderRadius: 20, padding: "7px 16px", fontSize: 12, fontWeight: 600 }}
            >
              Logout
            </button>
          </div>
        </div>
        {/* Tab bar */}
        {tabs && (
          <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 20px", display: "flex", overflowX: "auto", borderTop: `1px solid ${dark ? "rgba(255,255,255,.05)" : "rgba(255,255,255,.08)"}` }}>
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                style={{
                  padding: "12px 20px",
                  background: "none",
                  border: "none",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  borderBottom: activeTab === t.id ? "3px solid #F59E0B" : "3px solid transparent",
                  color: activeTab === t.id ? "#F59E0B" : "rgba(255,255,255,.45)",
                  fontWeight: activeTab === t.id ? 700 : 400,
                  fontSize: "clamp(12px, 2vw, 14px)",
                  whiteSpace: "nowrap",
                  transition: "all .2s",
                  cursor: "pointer",
                }}
              >
                <Icon src={t.icon} size={18} round={4} /> {t.label}
              </button>
            ))}
          </div>
        )}
      </nav>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "24px 18px" }}>{children}</div>
    </div>
  );
}
