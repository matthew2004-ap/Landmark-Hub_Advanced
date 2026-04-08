import React, { useState } from "react";
import { VENDOR_ACCTS, ADMIN, HOSTELS, PH } from "../../constants/data";
import { Spin, Label, Input, Select, Img } from "../common/UI";

export function AuthModal({ mode, setMode, students, saveStudents, onLogin, onClose, toast }) {
  const [sub, setSub] = useState("login"); // login | register (student only)
  const [form, setForm] = useState({ name: "", matric: "", hostel: "", pass: "", uname: "" });
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const f = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  const handleLogin = async () => {
    setErr("");
    setLoading(true);
    await new Promise((r) => setTimeout(r, 500));
    if (mode === "student") {
      const s = students.find((s) => s.matric.toLowerCase() === form.matric.toLowerCase() && s.pass === form.pass);
      if (!s) {
        setErr("Invalid matric number or password.");
        setLoading(false);
        return;
      }
      onLogin({ ...s, role: "student" });
      onClose();
      toast(`Welcome back, ${s.name.split(" ")[0]}! 🎉`);
    } else if (mode === "vendor") {
      const v = VENDOR_ACCTS.find((v) => v.u === form.uname && v.p === form.pass);
      if (!v) {
        setErr("Invalid vendor credentials.");
        setLoading(false);
        return;
      }
      onLogin({ id: v.id, name: v.name, role: "vendor", cafe: v.cafe });
      onClose();
      toast(`Welcome, ${v.name}!`);
    } else {
      if (form.uname !== ADMIN.u || form.pass !== ADMIN.p) {
        setErr("Invalid admin credentials.");
        setLoading(false);
        return;
      }
      onLogin({ id: "admin", name: ADMIN.name, role: "admin" });
      onClose();
      toast("Welcome, Administrator.");
    }
    setLoading(false);
  };

  const handleRegister = async () => {
    setErr("");
    if (!form.name || !form.matric || !form.hostel || !form.pass) {
      setErr("Please fill all fields.");
      return;
    }
    if (form.pass.length < 6) {
      setErr("Password must be at least 6 characters.");
      return;
    }
    if (students.find((s) => s.matric.toLowerCase() === form.matric.toLowerCase())) {
      setErr("Matric number already registered.");
      return;
    }
    setLoading(true);
    const ns = { id: Date.now().toString(), name: form.name, matric: form.matric, hostel: form.hostel, pass: form.pass };
    const updated = [...students, ns];
    await saveStudents(updated);
    onLogin({ ...ns, role: "student" });
    onClose();
    toast(`Account created! Welcome, ${form.name.split(" ")[0]}! 🎉`);
    setLoading(false);
  };

  const TABS = [
    { k: "student", label: "Student" },
    { k: "vendor", label: "Vendor" },
    { k: "admin", label: "Admin" },
  ];

  return (
    <div
      style={{ position: "fixed", inset: 0, zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div style={{ position: "absolute", inset: 0, background: "rgba(12, 59, 46, .7)", backdropFilter: "blur(6px)" }} />
      <div
        style={{
          position: "relative",
          background: "white",
          borderRadius: 24,
          overflow: "hidden",
          width: "100%",
          maxWidth: 860,
          maxHeight: "92vh",
          display: "flex",
          boxShadow: "0 30px 80px rgba(0,0,0,.35)",
          animation: "scalePop .35s cubic-bezier(.34,1.56,.64,1) both",
        }}
      >
        {/* Left image panel */}
        <div className="hide-sm" style={{ flex: "0 0 40%", position: "relative", minHeight: 520 }}>
          <Img src={PH.auth} alt="Campus dining" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, rgba(12, 59, 46, .85), rgba(12, 59, 46, .5))" }} />
          <div style={{ position: "absolute", inset: 0, padding: 32, display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
            <div style={{ fontFamily: "'Playfair Display', serif", color: "white", fontSize: 26, fontWeight: 700, lineHeight: 1.2, marginBottom: 12 }}>
              Great food,
              <br />
              <em style={{ color: "#F59E0B" }}>right at your door.</em>
            </div>
            <p style={{ color: "rgba(255,255,255,.7)", fontSize: 13, lineHeight: 1.6 }}>
              Join thousands of Landmark University students ordering campus meals without the queue.
            </p>
            {mode === "vendor" && (
              <div style={{ marginTop: 20, background: "rgba(245, 158, 11, .15)", border: "1px solid rgba(245, 158, 11, .4)", borderRadius: 12, padding: "12px 16px" }}>
                <div style={{ color: "#F59E0B", fontSize: 11, fontWeight: 700, letterSpacing: 1, marginBottom: 6 }}>VENDOR CREDENTIALS</div>
                {VENDOR_ACCTS.map((v) => (
                  <div key={v.id} style={{ color: "rgba(255,255,255,.7)", fontSize: 11, marginBottom: 3 }}>
                    <span style={{ color: "white", fontWeight: 600 }}>{v.cafe}:</span> {v.u} / {v.p}
                  </div>
                ))}
              </div>
            )}
            {mode === "admin" && (
              <div style={{ marginTop: 20, background: "rgba(245, 158, 11, .15)", border: "1px solid rgba(245, 158, 11, .4)", borderRadius: 12, padding: "12px 16px" }}>
                <div style={{ color: "#F59E0B", fontSize: 11, fontWeight: 700, letterSpacing: 1, marginBottom: 6 }}>ADMIN CREDENTIALS</div>
                <div style={{ color: "rgba(255,255,255,.7)", fontSize: 11 }}>
                  <span style={{ color: "white", fontWeight: 600 }}>Username:</span> admin
                </div>
                <div style={{ color: "rgba(255,255,255,.7)", fontSize: 11, marginTop: 2 }}>
                  <span style={{ color: "white", fontWeight: 600 }}>Password:</span> Admin2024
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right form panel */}
        <div style={{ flex: 1, padding: "36px 32px", overflowY: "auto", display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, fontWeight: 700, color: "#0C3B2E" }}>
              {sub === "register" ? "Create Account" : "Welcome Back"}
            </div>
            <button
              onClick={onClose}
              style={{
                background: "#F0EBE3",
                border: "none",
                borderRadius: "50%",
                width: 34,
                height: 34,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 16,
                color: "#6B6056",
                cursor: "pointer",
              }}
            >
              ✕
            </button>
          </div>

          {/* Role tabs */}
          <div style={{ display: "flex", background: "#F0EBE3", borderRadius: 12, padding: 4, marginBottom: 24 }}>
            {TABS.map((t) => (
              <button
                key={t.k}
                onClick={() => {
                  setMode(t.k);
                  setErr("");
                  setSub("login");
                  setForm({ name: "", matric: "", hostel: "", pass: "", uname: "" });
                }}
                style={{
                  flex: 1,
                  padding: "9px 0",
                  borderRadius: 9,
                  border: "none",
                  background: mode === t.k ? "white" : "transparent",
                  color: mode === t.k ? "#0C3B2E" : "#8A7E72",
                  fontWeight: mode === t.k ? 700 : 500,
                  fontSize: 13,
                  boxShadow: mode === t.k ? "0 2px 8px rgba(0,0,0,.1)" : "none",
                  transition: "all .2s",
                  cursor: "pointer",
                }}
              >
                {t.k === "student" ? "🎓" : t.k === "vendor" ? "🍽️" : "🛡️"} {t.label}
              </button>
            ))}
          </div>

          {/* Student login/register toggle */}
          {mode === "student" && (
            <div style={{ display: "flex", borderBottom: "2px solid #F0EBE3", marginBottom: 24, gap: 0 }}>
              {["login", "register"].map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    setSub(s);
                    setErr("");
                  }}
                  style={{
                    flex: 1,
                    padding: "10px 0",
                    background: "none",
                    border: "none",
                    borderBottom: sub === s ? "2px solid #0C3B2E" : "2px solid transparent",
                    marginBottom: -2,
                    color: sub === s ? "#0C3B2E" : "#8A7E72",
                    fontWeight: sub === s ? 700 : 500,
                    fontSize: 14,
                    cursor: "pointer",
                    transition: "all .2s",
                  }}
                >
                  {s === "login" ? "Log In" : "Register"}
                </button>
              ))}
            </div>
          )}

          {/* Fields */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {mode === "student" && sub === "register" && (
              <>
                <div>
                  <Label text="Full Name" />
                  <Input value={form.name} onChange={f("name")} placeholder="e.g. Temi Adeyemi" />
                </div>
                <div>
                  <Label text="Hostel" />
                  <Select value={form.hostel} onChange={f("hostel")} style={{ background: "#FEFCF8" }}>
                    <option value="">Select your hostel</option>
                    {HOSTELS.map((h) => (
                      <option key={h}>{h}</option>
                    ))}
                  </Select>
                </div>
              </>
            )}
            {mode === "student" && (
              <div>
                <Label text="Matric Number" />
                <Input value={form.matric} onChange={f("matric")} placeholder="e.g. LMU/21/0001" />
              </div>
            )}
            {(mode === "vendor" || mode === "admin") && (
              <div>
                <Label text="Username" />
                <Input value={form.uname} onChange={f("uname")} placeholder={mode === "vendor" ? "e.g. cafe1" : "admin"} />
              </div>
            )}
            <div>
              <Label text="Password" />
              <Input type="password" value={form.pass} onChange={f("pass")} placeholder="Enter password" />
            </div>

            {err && (
              <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 10, padding: "10px 14px", color: "#DC2626", fontSize: 13 }}>
                {err}
              </div>
            )}

            <button
              onClick={sub === "register" ? handleRegister : handleLogin}
              disabled={loading}
              style={{
                background: "#0C3B2E",
                color: "#F59E0B",
                borderRadius: 12,
                padding: "14px",
                fontWeight: 700,
                fontSize: 15,
                marginTop: 4,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
                opacity: loading ? 0.75 : 1,
                transition: "opacity .2s",
              }}
            >
              {loading ? (
                <>
                  <Spin /> Processing…
                </>
              ) : sub === "register" ? (
                "Create My Account →"
              ) : (
                "Log In →"
              )}
            </button>
          </div>

          {mode === "student" && sub === "login" && (
            <p style={{ textAlign: "center", marginTop: 20, fontSize: 13, color: "#8A7E72" }}>
              No account?{" "}
              <button
                onClick={() => setSub("register")}
                style={{ background: "none", border: "none", color: "#0C3B2E", fontWeight: 700, cursor: "pointer", textDecoration: "underline" }}
              >
                Register here
              </button>
            </p>
          )}

          <p style={{ marginTop: "auto", paddingTop: 20, fontSize: 11, color: "#C4B8A8", textAlign: "center", lineHeight: 1.6 }}>
            By logging in, you agree to Campus Chop Hub's terms of service.
          </p>
        </div>
      </div>
    </div>
  );
}
