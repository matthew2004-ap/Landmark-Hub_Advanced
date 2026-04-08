import React, { useState } from "react";
import { PAY, PH, FB, CAFE_IMG, PICS } from "../constants/data";
import { Shell } from "../components/common/Shell";
import { Dot, SChip, Label, Img, Stars, Spin, Badge, Icon } from "../components/common/UI";
import { ai } from "../utils/ai";

export function VendorApp({ user, onLogout, orders, reviews, complaints, menu, delivTimes, save, toast }) {
  const [tab, setTab] = useState("orders");
  const [editItem, setEditItem] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState({ name: "", price: "", img: 1, tag: "", available: true });
  const [dtInput, setDtInput] = useState(String(delivTimes[user.cafe] || 20));
  const [aiDraft, setAiDraft] = useState({});
  const [aiLoading, setAiLoading] = useState({});
  const af = (k) => (e) => setAddForm((p) => ({ ...p, [k]: e.target.value }));
  const myOrders = orders.filter((o) => o.cafe === user.cafe);

  const updateStatus = async (id, status) => {
    await save.orders(orders.map((o) => (o.id === id ? { ...o, status } : o)));
    toast(`Order updated to "${status}"`);
  };
  const saveDelivTime = async () => {
    const v = parseInt(dtInput) || 15;
    await save.delivTimes({ ...delivTimes, [user.cafe]: v });
    toast(`Delivery time updated to ${v} minutes ✓`);
  };
  const toggleAvail = async (id) => {
    await save.menu({ ...menu, [user.cafe]: menu[user.cafe].map((i) => (i.id === id ? { ...i, available: !i.available } : i)) });
  };
  const saveEdit = async () => {
    if (!editItem) return;
    await save.menu({ ...menu, [user.cafe]: menu[user.cafe].map((i) => (i.id === editItem.id ? { ...editItem, price: Number(editItem.price) } : i)) });
    setEditItem(null);
    toast("Item updated ✓");
  };
  const addItem = async () => {
    if (!addForm.name || !addForm.price) {
      toast("Name and price required", "warn");
      return;
    }
    const ni = { ...addForm, id: Date.now(), price: Number(addForm.price), img: Number(addForm.img) || 1 };
    await save.menu({ ...menu, [user.cafe]: [...(menu[user.cafe] || []), ni] });
    setAddForm({ name: "", price: "", img: 1, tag: "", available: true });
    setShowAdd(false);
    toast("New item added to menu ✓");
  };
  const delItem = async (id) => {
    if (!window.confirm("Delete this item?")) return;
    await save.menu({ ...menu, [user.cafe]: menu[user.cafe].filter((i) => i.id !== id) });
    toast("Item removed");
  };
  const resolveComplaint = async (id, resp) => {
    await save.complaints(complaints.map((c) => (c.id === id ? { ...c, status: "Resolved", vendorResponse: resp } : c)));
    toast("Complaint resolved ✓");
  };
  const genAI = async (c) => {
    setAiLoading((p) => ({ ...p, [c.id]: true }));
    try {
      const r = await ai(
        "You are a professional cafeteria manager at Landmark University. Write a brief, empathetic, professional response to a student complaint (under 60 words). Acknowledge the issue, apologise, and state corrective action.",
        "Complaint about " + c.cafe + ": " + c.issue
      );
      setAiDraft((p) => ({ ...p, [c.id]: r }));
    } catch {
      setAiDraft((p) => ({
        ...p,
        [c.id]: "Thank you for your feedback. We sincerely apologise for this experience and will take immediate corrective action to ensure it doesn't happen again.",
      }));
    }
    setAiLoading((p) => ({ ...p, [c.id]: false }));
  };

  const TABS = [
    { id: "orders", icon: PICS.box, label: "Orders" },
    { id: "menu", icon: PICS.menu, label: "Edit Menu" },
    { id: "reviews", icon: PICS.review, label: "Reviews" },
    { id: "complaints", icon: PICS.issue, label: "Issues" },
  ];

  return (
    <Shell user={user} onLogout={onLogout} tabs={TABS} activeTab={tab} setTab={setTab} dark>
      {/* ── LIVE ORDERS ── */}
      {tab === "orders" && (
        <div className="anim">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 22 }}>
            <div>
              <h2 style={{ color: "white", fontFamily: "'Inter', system-ui, sans-serif", fontSize: 26, fontWeight: 800 }}>Live Orders</h2>
              <p style={{ color: "rgba(255,255,255,.45)", fontSize: 13, marginTop: 4 }}>
                {user.cafe} · {myOrders.length} total orders
              </p>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                background: "rgba(56,189,248,.1)",
                border: "1px solid rgba(56,189,248,.3)",
                borderRadius: 20,
                padding: "7px 16px",
              }}
            >
              <Dot c="#38BDF8" />
              <span style={{ color: "#38BDF8", fontSize: 13, fontWeight: 600 }}>Live</span>
            </div>
          </div>
          {myOrders.length === 0 ? (
            <div style={{ background: "#1E293B", borderRadius: 20, padding: 48, textAlign: "center", border: "1px solid rgba(255,255,255,.07)" }}>
              <div style={{ fontSize: 48, marginBottom: 14 }}>📭</div>
              <div style={{ color: "rgba(255,255,255,.5)", fontSize: 15 }}>No orders yet for {user.cafe}.</div>
            </div>
          ) : (
            myOrders.map((o) => (
              <div
                key={o.id}
                style={{
                  background: "#1E293B",
                  borderRadius: 20,
                  padding: "22px 24px",
                  marginBottom: 16,
                  border: "1px solid rgba(56,189,248,.08)",
                  boxShadow: "0 4px 20px rgba(0,0,0,.2)",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14, flexWrap: "wrap", gap: 10 }}>
                  <div>
                    <div style={{ fontSize: 10, letterSpacing: 3, color: "rgba(255,255,255,.35)", textTransform: "uppercase", marginBottom: 4 }}>
                      Order #{o.id.slice(-6)}
                    </div>
                    <div style={{ fontFamily: "'Inter', system-ui, sans-serif", color: "#38BDF8", fontSize: 22, fontWeight: 800 }}>₦{o.total.toLocaleString()}</div>
                    <div style={{ color: "rgba(255,255,255,.45)", fontSize: 12, marginTop: 3 }}>
                      by {o.studentName} · {o.hostel} Rm {o.room}
                    </div>
                  </div>
                  <SChip s={o.status} />
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
                  {o.items.map((it) => (
                    <div key={it.id} style={{ display: "flex", alignItems: "center", gap: 7, background: "rgba(255,255,255,.05)", borderRadius: 20, padding: "4px 12px 4px 4px" }}>
                      <div style={{ width: 24, height: 24, borderRadius: "50%", overflow: "hidden", flexShrink: 0 }}>
                        <Img src={PH[it.img] || FB} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      </div>
                      <span style={{ fontSize: 12, color: "rgba(255,255,255,.75)" }}>
                        {it.name.split("+")[0].trim()} ×{it.qty}
                      </span>
                    </div>
                  ))}
                </div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,.3)", marginBottom: 12 }}>
                  💳 {PAY.find((p) => p.id === o.payment)?.label} · ⏰ {o.timestamp} · ⏱ {o.deliveryMins}min delivery
                </div>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  {["Preparing", "On the Way", "Delivered"].map((s) => (
                    <button
                      key={s}
                      onClick={() => updateStatus(o.id, s)}
                      style={{
                        background: o.status === s ? "#38BDF8" : "rgba(255,255,255,.04)",
                        color: o.status === s ? "#0B1628" : "rgba(255,255,255,.55)",
                        border: `1px solid ${o.status === s ? "#38BDF8" : "rgba(255,255,255,.1)"}`,
                        borderRadius: 20,
                        padding: "7px 16px",
                        fontSize: 13,
                        fontWeight: o.status === s ? 700 : 500,
                        cursor: "pointer",
                        transition: "all .2s",
                      }}
                    >
                      {s === "Preparing" ? "👨‍🍳" : s === "On the Way" ? "🛵" : "✅"} {s}
                    </button>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ── MENU EDITOR ── */}
      {tab === "menu" && (
        <div className="anim">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
            <div>
              <h2 style={{ color: "white", fontFamily: "'Inter', system-ui, sans-serif", fontSize: 26, fontWeight: 800 }}>Menu Editor</h2>
              <p style={{ color: "rgba(255,255,255,.4)", fontSize: 13, marginTop: 4 }}>
                {user.cafe} · {(menu[user.cafe] || []).length} items
              </p>
            </div>
            <button
              onClick={() => setShowAdd((p) => !p)}
              style={{
                background: showAdd ? "rgba(239,68,68,.15)" : "#38BDF8",
                color: showAdd ? "#EF4444" : "#0B1628",
                border: showAdd ? "1px solid #EF444455" : "none",
                borderRadius: 20,
                padding: "10px 20px",
                fontWeight: 700,
                fontSize: 13,
                cursor: "pointer",
                transition: "all .2s",
              }}
            >
              {showAdd ? "✕ Cancel" : "+ Add Item"}
            </button>
          </div>

          {showAdd && (
            <div style={{ background: "#1E293B", borderRadius: 18, padding: 24, marginBottom: 20, border: "1px solid rgba(56,189,248,.2)", animation: "fadeUp .3s ease" }}>
              <div style={{ color: "#38BDF8", fontWeight: 700, fontSize: 15, marginBottom: 16 }}>New Menu Item</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
                {[
                  { l: "Item Name", k: "name", ph: "e.g. Jollof Rice + Chicken" },
                  { l: "Price (₦)", k: "price", ph: "1200" },
                  { l: "Tag", k: "tag", ph: "Bestseller" },
                ].map((f) => (
                  <div key={f.k} style={{ gridColumn: f.k === "name" ? "span 2" : "span 1" }}>
                    <Label text={f.l} />
                    <input
                      value={addForm[f.k]}
                      onChange={af(f.k)}
                      placeholder={f.ph}
                      style={{
                        width: "100%",
                        padding: "10px 14px",
                        borderRadius: 10,
                        border: "1px solid rgba(255,255,255,.1)",
                        background: "rgba(255,255,255,.05)",
                        color: "white",
                        fontFamily: "inherit",
                        fontSize: 14,
                      }}
                    />
                  </div>
                ))}
                <div>
                  <Label text="Photo (1–16)" />
                  <input
                    type="number"
                    min={1}
                    max={16}
                    value={addForm.img}
                    onChange={(e) => setAddForm((p) => ({ ...p, img: Number(e.target.value) }))}
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      borderRadius: 10,
                      border: "1px solid rgba(255,255,255,.1)",
                      background: "rgba(255,255,255,.05)",
                      color: "white",
                      fontFamily: "inherit",
                      fontSize: 14,
                    }}
                  />
                </div>
              </div>
              {addForm.img && (
                <div style={{ width: 80, height: 70, borderRadius: 10, overflow: "hidden", marginBottom: 12 }}>
                  <Img src={PH[addForm.img] || FB} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
              )}
              <button onClick={addItem} style={{ background: "#38BDF8", color: "#0B1628", borderRadius: 12, padding: "11px 24px", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
                Add to Menu
              </button>
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {(menu[user.cafe] || []).map((item) => (
              <div key={item.id} style={{ background: "#1E293B", borderRadius: 16, padding: "16px 20px", border: "1px solid rgba(255,255,255,.05)" }}>
                {editItem?.id === item.id ? (
                  <div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
                      {[
                        { l: "Name", k: "name" },
                        { l: "Price (₦)", k: "price" },
                        { l: "Tag", k: "tag" },
                      ].map((f) => (
                        <div key={f.k} style={{ gridColumn: f.k === "name" ? "span 2" : "span 1" }}>
                          <Label text={f.l} />
                          <input
                            value={editItem[f.k]}
                            onChange={(e) => setEditItem((p) => ({ ...p, [f.k]: e.target.value }))}
                            style={{
                              width: "100%",
                              padding: "9px 12px",
                              borderRadius: 9,
                              border: "1px solid rgba(255,255,255,.12)",
                              background: "rgba(255,255,255,.06)",
                              color: "white",
                              fontFamily: "inherit",
                              fontSize: 14,
                            }}
                          />
                        </div>
                      ))}
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button onClick={saveEdit} style={{ background: "#10B981", color: "white", borderRadius: 20, padding: "8px 18px", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
                        Save Changes
                      </button>
                      <button
                        onClick={() => setEditItem(null)}
                        style={{ background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.1)", color: "rgba(255,255,255,.45)", borderRadius: 20, padding: "8px 18px", fontSize: 13, cursor: "pointer" }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    <div style={{ width: 56, height: 52, borderRadius: 10, overflow: "hidden", flexShrink: 0 }}>
                      <Img src={PH[item.img] || FB} alt={item.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: 14, color: "white" }}>{item.name}</div>
                      <div style={{ color: "rgba(255,255,255,.4)", fontSize: 12, marginTop: 2 }}>
                        ₦{Number(item.price).toLocaleString()}
                        {item.tag ? ` · ${item.tag}` : ""}
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", justifyEnd: "flex-end" }}>
                      <button
                        onClick={() => toggleAvail(item.id)}
                        style={{
                          background: item.available ? "rgba(16,185,129,.15)" : "rgba(239,68,68,.15)",
                          color: item.available ? "#10B981" : "#EF4444",
                          border: `1px solid ${item.available ? "#10B98144" : "#EF444444"}`,
                          borderRadius: 20,
                          padding: "5px 14px",
                          fontSize: 12,
                          fontWeight: 700,
                          cursor: "pointer",
                        }}
                      >
                        {item.available ? "● Live" : "● Off"}
                      </button>
                      <button
                        onClick={() => setEditItem({ ...item })}
                        style={{ background: "rgba(56,189,248,.1)", color: "#38BDF8", border: "1px solid rgba(56,189,248,.25)", borderRadius: 20, padding: "5px 14px", fontSize: 12, cursor: "pointer" }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => delItem(item.id)}
                        style={{ background: "rgba(239,68,68,.1)", color: "#EF4444", border: "1px solid rgba(239,68,68,.25)", borderRadius: 20, padding: "5px 14px", fontSize: 12, cursor: "pointer" }}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── DELIVERY TIME ── */}
      {tab === "delivery" && (
        <div className="anim" style={{ maxWidth: 520 }}>
          <h2 style={{ color: "white", fontFamily: "'Playfair Display', serif", fontSize: 26, marginBottom: 6 }}>Delivery Time Settings</h2>
          <p style={{ color: "rgba(255,255,255,.45)", fontSize: 14, marginBottom: 28 }}>
            Set how long students should expect to wait for delivery from {user.cafe}. This is displayed to students before and after they place an order.
          </p>
          <div style={{ background: "#1E293B", borderRadius: 20, padding: "28px 30px", border: "1px solid rgba(56,189,248,.15)", marginBottom: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 22 }}>
              <div style={{ width: 52, height: 52, borderRadius: 14, overflow: "hidden" }}>
                <Img src={CAFE_IMG[user.cafe]} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
              <div>
                <div style={{ color: "white", fontWeight: 700, fontSize: 16 }}>{user.cafe}</div>
                <div style={{ color: "rgba(255,255,255,.4)", fontSize: 13 }}>
                  Current time: <strong style={{ color: "#38BDF8" }}>{delivTimes[user.cafe] || 20} minutes</strong>
                </div>
              </div>
            </div>
            <Label text="New Delivery Time (minutes)" />
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <input
                type="number"
                min={1}
                max={120}
                value={dtInput}
                onChange={(e) => setDtInput(e.target.value)}
                style={{
                  flex: 1,
                  padding: "12px 16px",
                  borderRadius: 12,
                  border: "1px solid rgba(255,255,255,.1)",
                  background: "rgba(255,255,255,.06)",
                  color: "white",
                  fontFamily: "inherit",
                  fontSize: 18,
                  fontWeight: 700,
                }}
              />
              <span style={{ color: "rgba(255,255,255,.5)", fontSize: 14 }}>min</span>
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 14, flexWrap: "wrap" }}>
              {[10, 15, 20, 25, 30, 45].map((v) => (
                <button
                  key={v}
                  onClick={() => setDtInput(String(v))}
                  style={{
                    background: dtInput === String(v) ? "#38BDF8" : "rgba(255,255,255,.06)",
                    color: dtInput === String(v) ? "#0B1628" : "rgba(255,255,255,.55)",
                    border: `1px solid ${dtInput === String(v) ? "#38BDF8" : "rgba(255,255,255,.1)"}`,
                    borderRadius: 20,
                    padding: "6px 16px",
                    fontSize: 13,
                    fontWeight: dtInput === String(v) ? 700 : 400,
                    cursor: "pointer",
                    transition: "all .18s",
                  }}
                >
                  {v} min
                </button>
              ))}
            </div>
          </div>
          <button onClick={saveDelivTime} style={{ background: "#38BDF8", color: "#0B1628", borderRadius: 14, padding: "14px 28px", fontWeight: 700, fontSize: 15, cursor: "pointer", width: "100%" }}>
            ✓ Save Delivery Time
          </button>
          <div style={{ marginTop: 16, background: "rgba(245, 158, 11, .08)", border: "1px solid rgba(245, 158, 11, .2)", borderRadius: 12, padding: "12px 16px" }}>
            <div style={{ color: "#F59E0B", fontWeight: 700, fontSize: 12, letterSpacing: 1, marginBottom: 4 }}>💡 HOW IT WORKS</div>
            <p style={{ color: "rgba(255,255,255,.5)", fontSize: 13, lineHeight: 1.6 }}>
              The time you set here is shown to students on the menu page and used as their countdown timer after placing an order. Update it whenever your kitchen load changes.
            </p>
          </div>
        </div>
      )}

      {/* ── ANALYTICS ── */}
      {tab === "analytics" && (
        <div className="anim">
          <h2 style={{ color: "white", fontFamily: "'Playfair Display', serif", fontSize: 26, marginBottom: 22 }}>Sales Analytics — {user.cafe}</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(150px,1fr))", gap: 14, marginBottom: 24 }}>
            {[
              { l: "Orders", v: myOrders.length, c: "#38BDF8" },
              { l: "Revenue", v: `₦${myOrders.reduce((a, b) => a + b.total, 0).toLocaleString()}`, c: "#F59E0B" },
              { l: "Delivered", v: myOrders.filter((o) => o.status === "Delivered").length, c: "#10B981" },
              { l: "Preparing", v: myOrders.filter((o) => o.status === "Preparing").length, c: "#F472B6" },
            ].map((k) => (
              <div key={k.l} style={{ background: "#1E293B", borderRadius: 16, padding: "18px 16px", border: `1px solid ${k.c}1A` }}>
                <div style={{ fontSize: 22, fontWeight: 800, fontFamily: "'Playfair Display', serif", color: k.c }}>{k.v}</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,.4)", marginTop: 4 }}>{k.l}</div>
              </div>
            ))}
          </div>
          {/* Item popularity */}
          <div style={{ background: "#1E293B", borderRadius: 18, padding: 24, border: "1px solid rgba(255,255,255,.05)" }}>
            <div style={{ color: "#38BDF8", fontWeight: 700, fontSize: 15, marginBottom: 18 }}>Item Performance</div>
            {(menu[user.cafe] || []).map((item) => {
              const cnt = myOrders.reduce((a, o) => a + (o.items.find((i) => i.id === item.id)?.qty || 0), 0);
              const max = Math.max(
                1,
                ...(menu[user.cafe] || []).map((x) => myOrders.reduce((a, o) => a + (o.items.find((i) => i.id === x.id)?.qty || 0), 0))
              );
              return (
                <div key={item.id} style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 14 }}>
                  <div style={{ width: 44, height: 40, borderRadius: 8, overflow: "hidden", flexShrink: 0 }}>
                    <Img src={PH[item.img] || FB} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", justifyBetween: "space-between", marginBottom: 5 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,.8)" }}>{item.name}</span>
                      <span style={{ color: "#F59E0B", fontWeight: 700, fontSize: 13 }}>{cnt} sold</span>
                    </div>
                    <div style={{ background: "rgba(255,255,255,.06)", borderRadius: 6, height: 7 }}>
                      <div style={{ background: "#38BDF8", height: "100%", borderRadius: 6, width: `${max > 0 ? (cnt / max) * 100 : 0}%`, transition: "width .8s ease" }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── COMPLAINTS ── */}
      {tab === "complaints" && (
        <div className="anim">
          <h2 style={{ color: "white", fontFamily: "'Playfair Display', serif", fontSize: 26, marginBottom: 22 }}>Complaints & Reviews</h2>
          {complaints.length === 0 && (
            <div style={{ background: "#1E293B", borderRadius: 16, padding: 40, textAlign: "center", color: "rgba(255,255,255,.4)" }}>No complaints. Excellent! 🎉</div>
          )}
          {complaints.map((c) => (
            <div key={c.id} style={{ background: "#1E293B", borderRadius: 18, padding: "20px 22px", marginBottom: 16, border: "1px solid rgba(255,255,255,.06)" }}>
              <div style={{ display: "flex", justifyBetween: "space-between", alignItems: "flex-start", gap: 12, marginBottom: 10 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 15, color: "white", marginBottom: 4 }}>{c.issue}</div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,.35)" }}>
                    {c.student} · <span style={{ color: "#38BDF8" }}>{c.cafe}</span> · {c.time}
                  </div>
                </div>
                <SChip s={c.status} />
              </div>
              {c.vendorResponse && (
                <div style={{ background: "rgba(16,185,129,.08)", borderRadius: 10, padding: "10px 14px", borderLeft: "3px solid #10B981", marginTop: 10 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#10B981", marginBottom: 4 }}>Your Response</div>
                  <div style={{ fontSize: 13, color: "rgba(255,255,255,.65)" }}>{c.vendorResponse}</div>
                </div>
              )}
              {c.status !== "Resolved" && (
                <div style={{ marginTop: 14 }}>
                  {aiDraft[c.id] ? (
                    <div>
                      <div style={{ background: "rgba(56,189,248,.07)", borderRadius: 10, padding: "12px 14px", marginBottom: 10, border: "1px solid rgba(56,189,248,.15)" }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: "#38BDF8", marginBottom: 6 }}>🤖 AI Draft — Edit before sending</div>
                        <textarea
                          value={aiDraft[c.id]}
                          onChange={(e) => setAiDraft((p) => ({ ...p, [c.id]: e.target.value }))}
                          style={{
                            width: "100%",
                            background: "transparent",
                            border: "none",
                            color: "rgba(255,255,255,.75)",
                            fontFamily: "inherit",
                            fontSize: 13,
                            resize: "vertical",
                            minHeight: 60,
                          }}
                        />
                      </div>
                      <div style={{ display: "flex", gap: 10 }}>
                        <button
                          onClick={() => resolveComplaint(c.id, aiDraft[c.id])}
                          style={{ background: "#10B981", color: "white", borderRadius: 20, padding: "8px 20px", fontWeight: 700, fontSize: 13, cursor: "pointer" }}
                        >
                          ✔ Send & Resolve
                        </button>
                        <button
                          onClick={() => setAiDraft((p) => ({ ...p, [c.id]: "" }))}
                          style={{ background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.1)", color: "rgba(255,255,255,.45)", borderRadius: 20, padding: "8px 16px", fontSize: 13, cursor: "pointer" }}
                        >
                          Discard
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                      <button
                        onClick={() => genAI(c)}
                        disabled={aiLoading[c.id]}
                        style={{
                          background: "rgba(56,189,248,.1)",
                          border: "1px solid rgba(56,189,248,.3)",
                          color: "#38BDF8",
                          borderRadius: 20,
                          padding: "8px 18px",
                          fontWeight: 600,
                          fontSize: 13,
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                        }}
                      >
                        {aiLoading[c.id] ? (
                          <>
                            <Spin />
                            Drafting…
                          </>
                        ) : (
                          "🤖 AI Draft Response"
                        )}
                      </button>
                      <button
                        onClick={() => resolveComplaint(c.id, "")}
                        style={{ background: "rgba(16,185,129,.1)", border: "1px solid rgba(16,185,129,.3)", color: "#10B981", borderRadius: 20, padding: "8px 18px", fontSize: 13, cursor: "pointer" }}
                      >
                        Mark Resolved
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
          {/* Reviews */}
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, color: "white", margin: "28px 0 16px" }}>Student Reviews</div>
          {reviews
            .filter((r) => r.cafe === user.cafe)
            .map((r) => (
              <div
                key={r.id}
                style={{ background: "#1E293B", borderRadius: 14, padding: "16px 18px", marginBottom: 10, display: "flex", gap: 13, border: "1px solid rgba(255,255,255,.04)" }}
              >
                <div
                  style={{ width: 38, height: 38, borderRadius: "50%", background: "rgba(56,189,248,.15)", color: "#38BDF8", display: "flex", alignItems: "center", justifyCenter: "center", fontWeight: 800, flexShrink: 0 }}
                >
                  {r.avatar || "?"}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", justifyBetween: "space-between", alignItems: "center", marginBottom: 4 }}>
                    <span style={{ fontWeight: 700, fontSize: 14, color: "white" }}>{r.student}</span>
                    <span style={{ fontSize: 11, color: "rgba(255,255,255,.3)" }}>{r.time}</span>
                  </div>
                  <Stars val={r.rating} sz={13} />
                  <p style={{ color: "rgba(255,255,255,.6)", fontSize: 13, marginTop: 6, lineHeight: 1.55 }}>{r.text}</p>
                </div>
              </div>
            ))}
        </div>
      )}
    </Shell>
  );
}
