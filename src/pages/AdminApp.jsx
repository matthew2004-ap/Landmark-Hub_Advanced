import React, { useState } from "react";
import { CAFES, CAFE_IMG, PAY, HOSTELS, VENDOR_ACCTS, PICS } from "../constants/data";
import { Shell } from "../components/common/Shell";
import { Badge, SChip, Img, Spin, Icon } from "../components/common/UI";
import { ai } from "../utils/ai";

export function AdminApp({ user, onLogout, orders, reviews, complaints, menu, delivTimes, students, save, toast }) {
  const [tab, setTab] = useState("overview");
  const [aiOut, setAiOut] = useState("");
  const [aiLoad, setAiLoad] = useState(false);
  const [dtEdits, setDtEdits] = useState({ ...delivTimes });
  const [filterCafe, setFilterCafe] = useState("All");

  const totalRev = orders.reduce((a, b) => a + b.total, 0);
  const avgRating = reviews.length > 0 ? (reviews.reduce((a, b) => a + b.rating, 0) / reviews.length).toFixed(1) : "—";
  const filtOrders = filterCafe === "All" ? orders : orders.filter((o) => o.cafe === filterCafe);

  const saveAllTimes = async () => {
    await save.delivTimes(dtEdits);
    toast("All delivery times updated ✓");
  };

  const runAI = async () => {
    setAiLoad(true);
    try {
      const payload = {
        orders: orders.length,
        revenue: totalRev,
        cafeBreakdown: CAFES.map((c) => ({
          cafe: c,
          orders: orders.filter((o) => o.cafe === c).length,
          rev: orders.filter((o) => o.cafe === c).reduce((a, b) => a + b.total, 0),
        })),
        avgRating,
        openComplaints: complaints.filter((c) => c.status !== "Resolved").length,
        students: students.length,
        hostelBreakdown: HOSTELS.map((h) => ({ hostel: h, orders: orders.filter((o) => o.hostel === h).length })),
        payBreakdown: PAY.map((p) => ({ method: p.label, count: orders.filter((o) => o.payment === p.id).length })),
      };
      const r = await ai(
        `You are a senior data analyst and strategic advisor for Landmark University's Campus Chop Hub. 
        Your goal is to provide deep, actionable business insights to the platform administrator.
        
        ANALYSIS GUIDELINES:
        - Identify trends in revenue, cafe performance, and student ordering habits.
        - Point out potential bottlenecks (e.g., high complaint counts, low-rated cafes).
        - Suggest specific marketing or operational improvements (e.g., "Cafe 2 needs more breakfast items").
        - Be direct, data-driven, and professional.
        - Format your response as 4-5 high-impact numbered points.`,
        "Current Platform Data: " + JSON.stringify(payload)
      );
      setAiOut(r);
    } catch {
      setAiOut("AI analysis failed. Please check your connection and try again.");
    }
    setAiLoad(false);
  };

  const TABS = [
    { id: "overview", icon: PICS.home, label: "Overview" },
    { id: "orders", icon: PICS.box, label: "All Orders" },
    { id: "users", icon: PICS.student, label: "Students" },
    { id: "settings", icon: PICS.settings, label: "Settings" },
    { id: "ai", icon: PICS.ai, label: "AI Insights" },
  ];
  const AC = "#A78BFA";

  return (
    <Shell user={user} onLogout={onLogout} tabs={TABS} activeTab={tab} setTab={setTab} dark>
      {/* ── OVERVIEW ── */}
      {tab === "overview" && (
        <div className="anim">
          <h2 style={{ color: "white", fontFamily: "'Inter', system-ui, sans-serif", fontSize: 28, marginBottom: 6, fontWeight: 800 }}>Platform Overview</h2>
          <p style={{ color: "rgba(255,255,255,.4)", fontSize: 14, marginBottom: 24 }}>Landmark University Campus Chop Hub · Real-time dashboard</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(155px,1fr))", gap: 14, marginBottom: 28 }}>
            {[
              { l: "Total Orders", v: orders.length, c: AC, i: PICS.box },
              { l: "Revenue", v: `₦${(totalRev / 1000).toFixed(1)}k`, c: "#F59E0B", i: PICS.money },
              { l: "Students", v: students.length, c: "#38BDF8", i: PICS.student },
              { l: "Delivered", v: orders.filter((o) => o.status === "Delivered").length, c: "#10B981", i: PICS.check },
              { l: "Avg Rating", v: avgRating + "★", c: "#FBBF24", i: PICS.star },
              { l: "Open Issues", v: complaints.filter((c) => c.status !== "Resolved").length, c: "#EF4444", i: PICS.issue },
            ].map((k) => (
              <div
                key={k.l}
                style={{ background: "#161B35", borderRadius: 18, padding: "18px 16px", border: `1px solid ${k.c}22`, transition: "transform .2s" }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-3px)")}
                onMouseLeave={(e) => (e.currentTarget.style.transform = "none")}
              >
                <div style={{ marginBottom: 10 }}>
                  <Icon src={k.i} size={32} round={10} />
                </div>
                <div style={{ fontSize: 22, fontWeight: 800, fontFamily: "'Inter', system-ui, sans-serif", color: k.c }}>{k.v}</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,.35)", marginTop: 4, letterSpacing: 0.3 }}>{k.l}</div>
              </div>
            ))}
          </div>
          {/* Cafe comparison */}
          <div style={{ background: "#161B35", borderRadius: 20, padding: 24, marginBottom: 20, border: "1px solid rgba(167,139,250,.08)" }}>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, color: AC, marginBottom: 18 }}>Cafeteria Performance</div>
            {CAFES.map((c, ci) => {
              const co = orders.filter((o) => o.cafe === c);
              const rev = co.reduce((a, b) => a + b.total, 0);
              const maxR = Math.max(1, ...CAFES.map((x) => orders.filter((o) => o.cafe === x).reduce((a, b) => a + b.total, 0)));
              const colors = [AC, "#F59E0B", "#10B981", "#F472B6"];
              return (
                <div key={c} style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
                  <div style={{ width: 48, height: 42, borderRadius: 9, overflow: "hidden", flexShrink: 0 }}>
                    <Img src={CAFE_IMG[c]} alt={c} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", justifyBetween: "space-between", marginBottom: 5 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,.8)" }}>{c}</span>
                      <span style={{ color: colors[ci], fontWeight: 700, fontSize: 13 }}>
                        {co.length} orders · ₦{rev.toLocaleString()}
                      </span>
                    </div>
                    <div style={{ background: "rgba(255,255,255,.06)", borderRadius: 8, height: 10, overflow: "hidden" }}>
                      <div style={{ background: colors[ci], height: "100%", borderRadius: 8, width: `${(rev / maxR) * 100}%`, transition: "width .9s ease" }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          {/* Recent orders */}
          <div style={{ background: "#161B35", borderRadius: 20, padding: 24, border: "1px solid rgba(167,139,250,.06)" }}>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, color: AC, marginBottom: 16 }}>Recent Orders</div>
            {orders.slice(0, 6).map((o) => (
              <div
                key={o.id}
                style={{
                  display: "flex",
                  justifyBetween: "space-between",
                  alignItems: "center",
                  padding: "11px 0",
                  borderBottom: "1px solid rgba(255,255,255,.04)",
                  flexWrap: "wrap",
                  gap: 8,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 38, height: 34, borderRadius: 8, overflow: "hidden", flexShrink: 0 }}>
                    <Img src={CAFE_IMG[o.cafe]} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14, color: "white" }}>{o.studentName}</div>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,.35)" }}>
                      {o.cafe} · {o.hostel} · {o.timestamp}
                    </div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <span style={{ color: AC, fontWeight: 800, fontSize: 15 }}>₦{o.total.toLocaleString()}</span>
                  <SChip s={o.status} />
                </div>
              </div>
            ))}
            {orders.length === 0 && <div style={{ textAlign: "center", color: "rgba(255,255,255,.3)", padding: 16 }}>No orders yet.</div>}
          </div>
        </div>
      )}

      {/* ── ALL ORDERS ── */}
      {tab === "orders" && (
        <div className="anim">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22, flexWrap: "wrap", gap: 12 }}>
            <h2 style={{ color: "white", fontFamily: "'Inter', system-ui, sans-serif", fontSize: 26, fontWeight: 800 }}>All Orders ({filtOrders.length})</h2>
            <select
              value={filterCafe}
              onChange={(e) => setFilterCafe(e.target.value)}
              style={{ background: "#161B35", color: "white", border: "1px solid rgba(255,255,255,.15)", borderRadius: 12, padding: "8px 14px", fontSize: 13 }}
            >
              <option value="All">All Cafeterias</option>
              {CAFES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          {filtOrders.length === 0 && (
            <div style={{ background: "#161B35", borderRadius: 16, padding: 40, textAlign: "center", color: "rgba(255,255,255,.35)" }}>No orders found for this selection.</div>
          )}
          {filtOrders.map((o) => (
            <div
              key={o.id}
              style={{
                background: "#161B35",
                borderRadius: 20,
                padding: "20px 24px",
                marginBottom: 16,
                border: "1px solid rgba(255,255,255,.04)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14, flexWrap: "wrap", gap: 10 }}>
                <div>
                  <div style={{ fontSize: 10, letterSpacing: 2, color: "rgba(255,255,255,.3)", textTransform: "uppercase", marginBottom: 4 }}>Order #{o.id.slice(-6)}</div>
                  <div style={{ fontFamily: "'Inter', system-ui, sans-serif", color: AC, fontSize: 22, fontWeight: 800 }}>₦{o.total.toLocaleString()}</div>
                  <div style={{ color: "rgba(255,255,255,.45)", fontSize: 13, marginTop: 4 }}>
                    {o.cafe} · {o.studentName} · {o.hostel} Rm {o.room}
                  </div>
                </div>
                <SChip s={o.status} />
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {o.items.map((it) => (
                  <div key={it.id} style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,.04)", borderRadius: 20, padding: "3px 10px 3px 3px" }}>
                    <div style={{ width: 22, height: 22, borderRadius: "50%", overflow: "hidden" }}>
                      <Img src={PH[it.img] || FB} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    </div>
                    <span style={{ fontSize: 12, color: "rgba(255,255,255,.6)" }}>
                      {it.name.split("+")[0].trim()} ×{it.qty}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── STUDENTS ── */}
      {tab === "users" && (
        <div className="anim">
          <h2 style={{ color: "white", fontFamily: "'Playfair Display', serif", fontSize: 26, marginBottom: 22 }}>Registered Students ({students.length})</h2>
          {students.length === 0 && (
            <div style={{ background: "#161B35", borderRadius: 16, padding: 40, textAlign: "center", color: "rgba(255,255,255,.35)" }}>No students registered yet.</div>
          )}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: 14 }}>
            {students.map((s) => {
              const sOrders = orders.filter((o) => o.studentId === s.id);
              return (
                <div key={s.id} style={{ background: "#161B35", borderRadius: 16, padding: "18px 20px", border: "1px solid rgba(167,139,250,.07)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                    <div
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: "50%",
                        background: "linear-gradient(135deg,#A78BFA,#7C3AED)",
                        display: "flex",
                        alignItems: "center",
                        justifyCenter: "center",
                        fontWeight: 800,
                        fontSize: 17,
                        color: "white",
                        flexShrink: 0,
                      }}
                    >
                      {s.name[0].toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 14, color: "white" }}>{s.name}</div>
                      <div style={{ fontSize: 12, color: "rgba(255,255,255,.4)" }}>{s.matric}</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                    <Badge text={s.hostel} color={AC} />
                    <Badge text={`${sOrders.length} orders`} color="#10B981" />
                    {sOrders.length > 0 && <Badge text={`₦${sOrders.reduce((a, b) => a + b.total, 0).toLocaleString()}`} color="#F59E0B" />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── SETTINGS ── */}
      {tab === "settings" && (
        <div className="anim" style={{ maxWidth: 600 }}>
          <h2 style={{ color: "white", fontFamily: "'Playfair Display', serif", fontSize: 26, marginBottom: 6 }}>Platform Settings</h2>
          <p style={{ color: "rgba(255,255,255,.4)", fontSize: 14, marginBottom: 28 }}>Configure global settings for all cafeterias.</p>
          <div style={{ background: "#161B35", borderRadius: 20, padding: 28, border: "1px solid rgba(167,139,250,.1)", marginBottom: 20 }}>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, color: AC, marginBottom: 18 }}>Delivery Time Configuration</div>
            <p style={{ color: "rgba(255,255,255,.45)", fontSize: 13, marginBottom: 20, lineHeight: 1.6 }}>
              Set the delivery time for each cafeteria. These times are shown to students and used for their order countdown timers.
            </p>
            {CAFES.map((c) => (
              <div key={c} style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16, background: "rgba(255,255,255,.03)", borderRadius: 12, padding: "14px 16px" }}>
                <div style={{ width: 44, height: 40, borderRadius: 8, overflow: "hidden", flexShrink: 0 }}>
                  <Img src={CAFE_IMG[c]} alt={c} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
                <span style={{ flex: 1, fontWeight: 600, fontSize: 14, color: "rgba(255,255,255,.8)" }}>{c}</span>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <input
                    type="number"
                    min={1}
                    max={120}
                    value={dtEdits[c] || 15}
                    onChange={(e) => setDtEdits((p) => ({ ...p, [c]: Number(e.target.value) }))}
                    style={{
                      width: 64,
                      padding: "7px 10px",
                      borderRadius: 8,
                      border: "1px solid rgba(255,255,255,.1)",
                      background: "rgba(255,255,255,.06)",
                      color: "white",
                      fontFamily: "inherit",
                      fontSize: 14,
                      fontWeight: 700,
                      textAlign: "center",
                    }}
                  />
                  <span style={{ color: "rgba(255,255,255,.4)", fontSize: 12 }}>min</span>
                </div>
              </div>
            ))}
            <button onClick={saveAllTimes} style={{ background: AC, color: "white", borderRadius: 12, padding: "12px 24px", fontWeight: 700, fontSize: 14, cursor: "pointer", marginTop: 8, width: "100%" }}>
              Save All Delivery Times
            </button>
          </div>
          {/* Credentials reference */}
          <div style={{ background: "#161B35", borderRadius: 20, padding: 24, border: "1px solid rgba(167,139,250,.08)" }}>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, color: AC, marginBottom: 16 }}>Vendor Credentials</div>
            {VENDOR_ACCTS.map((v) => (
              <div key={v.id} style={{ display: "flex", justifyBetween: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,.04)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 34, height: 30, borderRadius: 7, overflow: "hidden" }}>
                    <Img src={CAFE_IMG[v.cafe]} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </div>
                  <span style={{ color: "rgba(255,255,255,.7)", fontSize: 14, fontWeight: 600 }}>{v.cafe}</span>
                </div>
                <div style={{ fontFamily: "monospace", fontSize: 12, color: "rgba(255,255,255,.4)" }}>
                  {v.u} / {v.p}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── AI INSIGHTS ── */}
      {tab === "ai" && (
        <div className="anim" style={{ maxWidth: 720 }}>
          <h2 style={{ color: "white", fontFamily: "'Playfair Display', serif", fontSize: 28, marginBottom: 6 }}>AI Business Insights</h2>
          <p style={{ color: "rgba(255,255,255,.45)", fontSize: 14, lineHeight: 1.7, marginBottom: 28 }}>
            Let AI analyse your platform's live data to surface actionable insights and growth recommendations.
          </p>
          <div style={{ background: "#161B35", borderRadius: 20, padding: 28, border: "1px solid rgba(167,139,250,.12)", marginBottom: 20 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 24 }}>
              {[
                { l: "Orders Analysed", v: orders.length },
                { l: "Total Revenue", v: `₦${totalRev.toLocaleString()}` },
                { l: "Student Reviews", v: reviews.length },
                { l: "Open Complaints", v: complaints.filter((c) => c.status !== "Resolved").length },
              ].map((d) => (
                <div key={d.l} style={{ background: `${AC}0D`, borderRadius: 12, padding: "14px 18px", border: `1px solid ${AC}22` }}>
                  <div style={{ fontSize: 20, fontWeight: 800, fontFamily: "'Playfair Display', serif", color: AC }}>{d.v}</div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,.4)", marginTop: 3 }}>{d.l}</div>
                </div>
              ))}
            </div>
            <button
              onClick={runAI}
              disabled={aiLoad}
              style={{
                background: aiLoad ? `${AC}33` : `linear-gradient(90deg,#7C3AED,${AC})`,
                color: "white",
                border: "none",
                borderRadius: 14,
                padding: "14px 28px",
                fontWeight: 700,
                fontSize: 15,
                cursor: aiLoad ? "not-allowed" : "pointer",
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyCenter: "center",
                gap: 10,
                transition: "opacity .2s",
              }}
            >
              {aiLoad ? (
                <>
                  <Spin />
                  Analysing your data…
                </>
              ) : (
                "✨ Generate AI Insights"
              )}
            </button>
          </div>
          {aiOut && (
            <div style={{ background: "linear-gradient(135deg,#1A1035,#161B35)", borderRadius: 20, padding: 28, border: `1px solid ${AC}33`, animation: "fadeUp .5s ease" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: `${AC}22`, display: "flex", alignItems: "center", justifyCenter: "center", fontSize: 20 }}>
                  🤖
                </div>
                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, color: AC }}>AI Analysis Report</div>
              </div>
              <div style={{ color: "rgba(255,255,255,.75)", fontSize: 14, lineHeight: 1.85, whiteSpace: "pre-wrap" }}>{aiOut}</div>
            </div>
          )}
        </div>
      )}
    </Shell>
  );
}
