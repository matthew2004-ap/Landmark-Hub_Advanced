import React, { useState, useEffect, useRef } from "react";
import { CAFES, CAFE_IMG, PAY, PH, FB, PICS } from "../constants/data";
import { Shell } from "../components/common/Shell";
import { SectionHead, Img, Label, Select, Input, Badge, SChip, Stars, Spin, Icon } from "../components/common/UI";
import { FoodCard } from "../components/features/FoodCard";
import { ai } from "../utils/ai";

export function StudentApp({ user, onLogout, orders, reviews, complaints, menu, delivTimes, save, toast }) {
  const [tab, setTab] = useState("menu");
  const [cafe, setCafe] = useState("Cafe 1");
  const [cart, setCart] = useState([]);
  const [room, setRoom] = useState("");
  const [pay, setPay] = useState("wallet");
  const [myOrders, setMyOrders] = useState([]);
  const [ordering, setOrdering] = useState(false);
  const [countdown, setCountdown] = useState({}); // orderId -> secs remaining
  const timerRef = useRef(null);

  // Review form
  const [rvForm, setRvForm] = useState({ cafe: "Cafe 1", rating: 5, text: "" });
  // Complaint form
  const [cpForm, setCpForm] = useState({ cafe: "Cafe 1", issue: "", anon: false });

  // AI chat
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMsgs, setChatMsgs] = useState([
    { role: "a", text: "Hello! I'm your Chop AI 🍛 Tell me what you're craving or your budget, and I'll suggest the best meal for you today!" },
  ]);
  const [chatIn, setChatIn] = useState("");
  const [chatLoad, setChatLoad] = useState(false);
  const chatRef = useRef(null);

  const qty = (id) => cart.find((c) => c.id === id)?.qty || 0;
  const totalQty = cart.reduce((a, b) => a + b.qty, 0);
  const totalAmt = cart.reduce((a, b) => a + b.price * b.qty, 0);

  const add = (item) =>
    setCart((p) => {
      const ex = p.find((c) => c.id === item.id);
      return ex ? p.map((c) => (c.id === item.id ? { ...c, qty: c.qty + 1 } : c)) : [...p, { ...item, qty: 1 }];
    });
  const dec = (id) =>
    setCart((p) =>
      p
        .map((c) => (c.id === id && c.qty > 1 ? { ...c, qty: c.qty - 1 } : c))
        .filter((c) => c.qty > 0)
    );

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setCountdown((p) => {
        const n = { ...p };
        Object.keys(n).forEach((k) => {
          if (n[k] > 0) n[k]--;
        });
        return n;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, []);
  useEffect(() => {
    chatRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMsgs]);

  const placeOrder = async () => {
    if (!room || cart.length === 0) {
      toast("Please add items and enter your room number.", "error");
      return;
    }
    setOrdering(true);
    const dt = delivTimes[cafe] || 20;
    const order = {
      id: Date.now().toString(),
      studentId: user.id,
      studentName: user.name,
      cafe,
      hostel: user.hostel,
      room,
      items: cart.map((c) => ({ id: c.id, name: c.name, img: c.img, price: c.price, qty: c.qty })),
      total: totalAmt,
      payment: pay,
      deliveryMins: dt,
      status: "Preparing",
      createdAt: new Date().toISOString(),
      timestamp: new Date().toLocaleTimeString(),
    };
    const updated = [order, ...orders];
    await save.orders(updated);
    setMyOrders((p) => [order, ...p]);
    setCountdown((p) => ({ ...p, [order.id]: dt * 60 }));
    setCart([]);
    setRoom("");
    setTab("track");
    toast(`Order placed! 🎉 Estimated delivery: ${dt} minutes.`);
    setOrdering(false);
  };

  const sendChat = async () => {
    if (!chatIn.trim() || chatLoad) return;
    const msg = chatIn.trim();
    setChatIn("");
    setChatMsgs((p) => [...p, { role: "u", text: msg }]);
    setChatLoad(true);
    try {
      const ms = Object.entries(menu)
        .map(([c, items]) => `${c}: ` + items.filter((i) => i.available).map((i) => `${i.name} ₦${i.price}`).join(", "))
        .join("\n");

      const myActiveOrders = myOrders.filter(o => o.status !== "Delivered");
      const orderContext = myActiveOrders.length > 0
        ? `The user has ${myActiveOrders.length} active orders: ${myActiveOrders.map(o => `Order #${o.id.slice(-6)} (${o.status})`).join(", ")}.`
        : "The user has no active orders currently.";

      const r = await ai(
        `You are Chop AI, the official food assistant for Landmark University Campus Chop Hub. 
        Your goal is to help students with menu recommendations, order tracking, and general campus food info.
        
        CURRENT CONTEXT:
        - Student Name: ${user.name}
        - Current Menu: ${ms}
        - User's Active Orders: ${orderContext}
        
        GUIDELINES:
        - Be warm, helpful, and use food emojis.
        - Only recommend items that are actually on the menu.
        - If asked about their order, check the context above.
        - Keep responses concise and friendly.`,
        msg
      );
      setChatMsgs((p) => [...p, { role: "a", text: r }]);
    } catch {
      setChatMsgs((p) => [...p, { role: "a", text: "Sorry, AI is taking a break! Check the menu tab for available items. 😊" }]);
    }
    setChatLoad(false);
  };

  const submitReview = async () => {
    if (!rvForm.text.trim()) {
      toast("Please write something!", "warn");
      return;
    }
    const r = {
      id: Date.now().toString(),
      ...rvForm,
      student: user.name,
      avatar: user.name[0].toUpperCase(),
      time: "Just now",
      createdAt: new Date().toISOString(),
    };
    await save.reviews([r, ...reviews]);
    setRvForm({ cafe: "Cafe 1", rating: 5, text: "" });
    toast("Review submitted! Thank you ⭐");
  };
  const submitComplaint = async () => {
    if (!cpForm.issue.trim()) {
      toast("Please describe the issue.", "warn");
      return;
    }
    const c = {
      id: Date.now().toString(),
      student: cpForm.anon ? "Anonymous" : user.name,
      cafe: cpForm.cafe,
      issue: cpForm.issue,
      status: "Pending",
      vendorResponse: "",
      time: "Just now",
      createdAt: new Date().toISOString(),
    };
    await save.complaints([c, ...complaints]);
    setCpForm({ cafe: "Cafe 1", issue: "", anon: false });
    toast("Complaint submitted. We'll look into it!");
  };

  const TABS = [
    { id: "menu", icon: PICS.menu, label: "Menu" },
    { id: "order", icon: PICS.cart, label: `Cart${totalQty > 0 ? ` (${totalQty})` : ""}` },
    { id: "track", icon: PICS.track, label: "Track" },
    { id: "reviews", icon: PICS.review, label: "Reviews" },
  ];

  return (
    <Shell user={user} onLogout={onLogout} tabs={TABS} activeTab={tab} setTab={setTab}>
      {/* ── MENU ── */}
      {tab === "menu" && (
        <div className="anim">
          {/* Cafe selector */}
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 22 }}>
            {CAFES.map((c) => (
              <button
                key={c}
                onClick={() => setCafe(c)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "8px 18px",
                  borderRadius: 30,
                  border: cafe === c ? "none" : "1.5px solid #EDE6DA",
                  background: cafe === c ? "#0C3B2E" : "white",
                  color: cafe === c ? "#F59E0B" : "#374151",
                  fontWeight: 700,
                  fontSize: 13,
                  transition: "all .2s",
                  boxShadow: cafe === c ? "0 4px 16px rgba(12,59,46,.25)" : "none",
                }}
              >
                {cafe === c && <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#F59E0B" }} />}
                {c}
              </button>
            ))}
          </div>

          {/* Cafe hero banner */}
          <div style={{ borderRadius: 20, overflow: "hidden", marginBottom: 26, height: 180, position: "relative" }}>
            <Img src={CAFE_IMG[cafe]} alt={cafe} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right,rgba(12,59,46,.88) 30%,transparent)" }} />
            <div style={{ position: "absolute", inset: 0, padding: "24px 28px", display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
              <div style={{ fontFamily: "'Inter', system-ui, sans-serif", color: "white", fontSize: 28, fontWeight: 800, marginBottom: 6 }}>{cafe}</div>
              <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
                <span style={{ background: "rgba(245,158,11,.9)", color: "#0C3B2E", fontSize: 11, fontWeight: 700, borderRadius: 20, padding: "3px 12px" }}>
                  ⏱ ~{delivTimes[cafe] || 20} min delivery
                </span>
                <span style={{ color: "rgba(255,255,255,.7)", fontSize: 13 }}>{(menu[cafe] || []).filter((i) => i.available).length} items available</span>
              </div>
            </div>
          </div>

          {/* Items */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(210px,1fr))", gap: 20 }}>
            {(menu[cafe] || []).map((item) => (
              <FoodCard key={item.id} item={item} qty={qty(item.id)} onAdd={() => add(item)} onDec={() => dec(item.id)} disabled={!item.available} />
            ))}
          </div>
        </div>
      )}

      {/* ── CART ── */}
      {tab === "order" && (
        <div className="anim">
          <SectionHead title="Your Order" sub="Review your items and complete checkout" />
          {cart.length === 0 ? (
            <div style={{ background: "white", borderRadius: 20, padding: 56, textAlign: "center", boxShadow: "0 2px 20px rgba(0,0,0,.06)" }}>
              <Img src={PH[9]} alt="" style={{ width: 120, height: 100, objectFit: "cover", borderRadius: 14, margin: "0 auto 20px" }} />
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, color: "#0C3B2E", marginBottom: 8 }}>Your cart is empty</div>
              <p style={{ color: "#8A7E72", marginBottom: 20, fontSize: 14 }}>Browse the menu and add items you'd like to order.</p>
              <button onClick={() => setTab("menu")} style={{ background: "#0C3B2E", color: "#F59E0B", borderRadius: 30, padding: "12px 28px", fontWeight: 700, fontSize: 14 }}>
                Browse Menu →
              </button>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 20, maxWidth: 680 }}>
              {/* Cart items */}
              <div style={{ background: "white", borderRadius: 20, overflow: "hidden", boxShadow: "0 2px 20px rgba(0,0,0,.06)" }}>
                <div style={{ padding: "18px 22px", borderBottom: "1px solid #F0EBE3", fontFamily: "'Playfair Display', serif", fontSize: 18, color: "#0C3B2E" }}>
                  Items
                </div>
                {cart.map((item, i) => (
                  <div
                    key={item.id}
                    style={{ display: "flex", alignItems: "center", padding: "14px 22px", borderBottom: i < cart.length - 1 ? "1px solid #F9F5F0" : "none", gap: 14 }}
                  >
                    <div style={{ width: 56, height: 52, borderRadius: 10, overflow: "hidden", flexShrink: 0 }}>
                      <Img src={PH[item.img] || FB} alt={item.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 14, color: "#1C1C1C" }}>{item.name}</div>
                      <div style={{ color: "#8A7E72", fontSize: 12, marginTop: 2 }}>₦{item.price.toLocaleString()} each</div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <button
                        onClick={() => dec(item.id)}
                        style={{ width: 28, height: 28, borderRadius: "50%", border: "1.5px solid #EDE6DA", background: "none", fontWeight: 800, fontSize: 14 }}
                      >
                        −
                      </button>
                      <span style={{ fontWeight: 700, minWidth: 18, textAlign: "center" }}>{item.qty}</span>
                      <button
                        onClick={() => add(item)}
                        style={{ width: 28, height: 28, borderRadius: "50%", background: "#0C3B2E", color: "#F59E0B", fontWeight: 800, fontSize: 14 }}
                      >
                        +
                      </button>
                    </div>
                    <span style={{ fontWeight: 800, color: "#0C3B2E", fontSize: 15, minWidth: 76, textAlign: "right" }}>
                      ₦{(item.price * item.qty).toLocaleString()}
                    </span>
                  </div>
                ))}
                <div style={{ padding: "14px 22px", background: "#FAF7F2", display: "flex", justifyBetween: "space-between", fontSize: 15, fontWeight: 700 }}>
                  <span style={{ color: "#374151" }}>Order Total</span>
                  <span style={{ color: "#0C3B2E", fontSize: 18, fontFamily: "'Playfair Display', serif" }}>₦{totalAmt.toLocaleString()}</span>
                </div>
              </div>

              {/* Delivery details */}
              <div style={{ background: "white", borderRadius: 20, padding: "22px 24px", boxShadow: "0 2px 20px rgba(0,0,0,.06)" }}>
                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, color: "#0C3B2E", marginBottom: 16 }}>Delivery Details</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
                  <div style={{ gridColumn: "span 2" }}>
                    <Label text="Cafeteria" />
                    <Select value={cafe} onChange={(e) => setCafe(e.target.value)} style={{ background: "#FEFCF8" }}>
                      {CAFES.map((c) => (
                        <option key={c}>{c}</option>
                      ))}
                    </Select>
                  </div>
                  <div>
                    <Label text="Hostel" />
                    <div style={{ padding: "11px 14px", borderRadius: 10, border: "1.5px solid #E5DDD0", fontSize: 14, background: "#F0F0F0", color: "#6B6056" }}>
                      {user.hostel || "Not set"}
                    </div>
                  </div>
                  <div>
                    <Label text="Room Number" />
                    <Input value={room} onChange={(e) => setRoom(e.target.value)} placeholder="e.g. A204" />
                  </div>
                </div>
                <div
                  style={{
                    background: "#F0FAF4",
                    border: "1px solid #BBF7D0",
                    borderRadius: 10,
                    padding: "10px 14px",
                    marginBottom: 16,
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                  }}
                >
                  <Icon src={PICS.check} size={18} round={4} />
                  <span style={{ fontSize: 13, color: "#166534", fontWeight: 600 }}>
                    Estimated delivery: <strong>{delivTimes[cafe] || 20} minutes</strong> from order placement
                  </span>
                </div>

                {/* Payment */}
                <div style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: 16, color: "#0C3B2E", marginBottom: 12, fontWeight: 700 }}>Payment Method</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {PAY.map((pm) => (
                    <div
                      key={pm.id}
                      onClick={() => setPay(pm.id)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 14,
                        padding: "12px 16px",
                        borderRadius: 12,
                        border: pay === pm.id ? "1.5px solid #0C3B2E" : "1.5px solid #E5DDD0",
                        background: pay === pm.id ? "#F0FAF4" : "#FEFCF8",
                        cursor: "pointer",
                        transition: "all .18s",
                      }}
                    >
                      <Icon src={pm.icon} size={28} round={6} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: 14, color: "#1C1C1C" }}>{pm.label}</div>
                        <div style={{ color: "#8A7E72", fontSize: 12 }}>{pm.note}</div>
                      </div>
                      <div
                        style={{
                          width: 18,
                          height: 18,
                          borderRadius: "50%",
                          border: `3px solid ${pay === pm.id ? "#0C3B2E" : "#D5C9B8"}`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {pay === pm.id && <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#0C3B2E" }} />}
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={placeOrder}
                  disabled={ordering || !room}
                  style={{
                    marginTop: 20,
                    width: "100%",
                    background: room ? "#0C3B2E" : "#C4B8A8",
                    color: room ? "#F59E0B" : "#8A7E72",
                    borderRadius: 14,
                    padding: "15px",
                    fontWeight: 700,
                    fontSize: 16,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 10,
                    transition: "all .2s",
                    cursor: room ? "pointer" : "not-allowed",
                    fontFamily: "inherit",
                  }}
                >
                  {ordering ? (
                    <>
                      <Spin />
                      Placing Order…
                    </>
                  ) : (
                    `Place Order — ₦${totalAmt.toLocaleString()}`
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── TRACK ── */}
      {tab === "track" && (
        <div className="anim">
          <SectionHead title="Order Tracking" sub="Live status of your food delivery" />
          {myOrders.length === 0 ? (
            <div style={{ background: "white", borderRadius: 20, padding: 48, textAlign: "center", boxShadow: "0 2px 20px rgba(0,0,0,.06)" }}>
              <div style={{ marginBottom: 16, display: "flex", justifyContent: "center" }}>
                <Icon src={PICS.box} size={64} round={16} />
              </div>
              <div style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: 20, color: "#0C3B2E", marginBottom: 8, fontWeight: 700 }}>No active orders</div>
              <p style={{ color: "#8A7E72", fontSize: 14 }}>Place an order and track it here in real time.</p>
            </div>
          ) : (
            myOrders.map((o) => {
              const secs = countdown[o.id] ?? 0;
              const tot = o.deliveryMins * 60;
              const pct = Math.min(100, Math.round((1 - secs / tot) * 100));
              const liveStatus = orders.find((x) => x.id === o.id)?.status || o.status;
              const done = secs === 0 || liveStatus === "Delivered";
              const steps = [
                { l: "Order Confirmed", icon: "✅", done: true },
                { l: "Kitchen Preparing", icon: "👨‍🍳", done: pct > 20 || liveStatus !== "Preparing" },
                { l: "On the Way", icon: "🛵", done: pct > 70 || liveStatus === "On the Way" || done },
                { l: "Delivered!", icon: "🎉", done },
              ];
              const minsLeft = Math.ceil(secs / 60);
              return (
                <div key={o.id} style={{ marginBottom: 24 }}>
                  {/* Order card */}
                  <div style={{ borderRadius: 22, overflow: "hidden", boxShadow: "0 4px 24px rgba(0,0,0,.1)", marginBottom: 14 }}>
                    <div style={{ position: "relative", height: 140 }}>
                      <Img src={CAFE_IMG[o.cafe]} alt={o.cafe} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      <div style={{ position: "absolute", inset: 0, background: "rgba(12, 59, 46, .8)" }} />
                      <div style={{ position: "absolute", inset: 0, padding: "20px 24px", display: "flex", justifyBetween: "space-between", alignItems: "flex-start" }}>
                        <div>
                          <div style={{ fontSize: 10, letterSpacing: 3, color: "rgba(255,255,255,.5)", textTransform: "uppercase", marginBottom: 4 }}>
                            Order #{o.id.slice(-6)}
                          </div>
                          <div style={{ fontFamily: "'Playfair Display', serif", color: "white", fontSize: 24, fontWeight: 700 }}>
                            ₦{o.total.toLocaleString()}
                          </div>
                          <div style={{ color: "rgba(255,255,255,.6)", fontSize: 12, marginTop: 3 }}>
                            {o.cafe} · {o.timestamp}
                          </div>
                        </div>
                        <SChip s={done ? "Delivered" : liveStatus} />
                      </div>
                    </div>
                    <div style={{ background: "white", padding: "18px 22px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14, background: "#F0FAF4", borderRadius: 10, padding: "10px 14px" }}>
                        <span style={{ fontSize: 18 }}>🏠</span>
                        <div>
                          <div style={{ fontSize: 11, color: "#6B6056" }}>Delivering to</div>
                          <div style={{ fontWeight: 700, fontSize: 14, color: "#0C3B2E" }}>
                            {o.hostel} — Room {o.room}
                          </div>
                        </div>
                        {!done && (
                          <div style={{ marginLeft: "auto", textAlign: "right" }}>
                            <div style={{ fontSize: 11, color: "#6B6056" }}>ETA</div>
                            <div style={{ fontWeight: 800, fontSize: 18, color: "#0C3B2E" }}>{minsLeft}m</div>
                          </div>
                        )}
                      </div>
                      {!done && (
                        <div style={{ marginBottom: 14 }}>
                          <div style={{ display: "flex", justifyBetween: "space-between", marginBottom: 6, fontSize: 12, color: "#8A7E72" }}>
                            <span>Progress</span>
                            <span style={{ fontWeight: 700, color: "#0C3B2E" }}>{pct}%</span>
                          </div>
                          <div style={{ background: "#F0EBE3", borderRadius: 8, height: 10, overflow: "hidden" }}>
                            <div
                              style={{
                                background: "linear-gradient(90deg,#0C3B2E,#1A5C36)",
                                height: "100%",
                                borderRadius: 8,
                                width: `${pct}%`,
                                transition: "width 1s linear",
                              }}
                            />
                          </div>
                        </div>
                      )}
                      <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                        {steps.map((s, i) => (
                          <div
                            key={i}
                            style={{ display: "flex", alignItems: "center", gap: 14, padding: "11px 0", borderBottom: i < 3 ? "1px solid #F9F5F0" : "none" }}
                          >
                            <div
                              style={{
                                width: 38,
                                height: 38,
                                borderRadius: "50%",
                                background: s.done ? "#0C3B2E" : "#F0EBE3",
                                display: "flex",
                                alignItems: "center",
                                justifyCenter: "center",
                                fontSize: 17,
                                flexShrink: 0,
                                transition: "all .5s",
                              }}
                            >
                              {s.icon}
                            </div>
                            <span style={{ fontWeight: s.done ? 600 : 400, color: s.done ? "#0C3B2E" : "#8A7E72", fontSize: 14 }}>{s.l}</span>
                            {s.done && <span style={{ marginLeft: "auto", fontSize: 11, color: "#16A34A", fontWeight: 700 }}>✔ Done</span>}
                          </div>
                        ))}
                      </div>
                      {/* Items */}
                      <div style={{ marginTop: 14, display: "flex", gap: 8, flexWrap: "wrap" }}>
                        {o.items.map((it) => (
                          <div
                            key={it.id}
                            style={{ display: "flex", alignItems: "center", gap: 8, background: "#F0EBE3", borderRadius: 20, padding: "4px 12px 4px 4px", overflow: "hidden" }}
                          >
                            <div style={{ width: 26, height: 26, borderRadius: "50%", overflow: "hidden", flexShrink: 0 }}>
                              <Img src={PH[it.img] || FB} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                            </div>
                            <span style={{ fontSize: 12, fontWeight: 600, color: "#374141" }}>
                              {it.name.split("+")[0].trim()} ×{it.qty}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* ── REVIEWS ── */}
      {tab === "reviews" && (
        <div className="anim">
          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 24, maxWidth: 680 }}>
            {/* Write review */}
            <div style={{ background: "white", borderRadius: 20, padding: "24px 26px", boxShadow: "0 2px 20px rgba(0,0,0,.06)" }}>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, color: "#0C3B2E", marginBottom: 18 }}>Share Your Experience</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
                <div>
                  <Label text="Cafeteria" />
                  <Select value={rvForm.cafe} onChange={(e) => setRvForm((p) => ({ ...p, cafe: e.target.value }))} style={{ background: "#FEFCF8" }}>
                    {CAFES.map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </Select>
                </div>
                <div>
                  <Label text="Rating" />
                  <Stars val={rvForm.rating} set={(r) => setRvForm((p) => ({ ...p, rating: r }))} sz={26} />
                </div>
              </div>
              <textarea
                value={rvForm.text}
                onChange={(e) => setRvForm((p) => ({ ...p, text: e.target.value }))}
                placeholder="Tell us about the food, service, and delivery experience…"
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  borderRadius: 10,
                  border: "1.5px solid #E5DDD0",
                  fontFamily: "inherit",
                  fontSize: 14,
                  minHeight: 90,
                  resize: "vertical",
                  background: "#FEFCF8",
                }}
              />
              <button
                onClick={submitReview}
                style={{ marginTop: 12, background: "#0C3B2E", color: "#F59E0B", borderRadius: 12, padding: "11px 24px", fontWeight: 700, fontSize: 14 }}
              >
                Submit Review
              </button>
            </div>

            {/* Reviews feed */}
            <div>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, color: "#0C3B2E", marginBottom: 16 }}>Student Reviews ({reviews.length})</div>
              {reviews.length === 0 && (
                <div style={{ background: "white", borderRadius: 16, padding: 32, textAlign: "center", color: "#8A7E72", fontSize: 14 }}>
                  No reviews yet. Be the first to share!
                </div>
              )}
              {reviews.map((r) => (
                <div
                  key={r.id}
                  style={{
                    background: "white",
                    borderRadius: 16,
                    padding: "18px 20px",
                    marginBottom: 12,
                    display: "flex",
                    gap: 14,
                    boxShadow: "0 2px 12px rgba(0,0,0,.05)",
                  }}
                >
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: "50%",
                      background: "linear-gradient(135deg,#0C3B2E,#1A5C36)",
                      color: "#F59E0B",
                      display: "flex",
                      alignItems: "center",
                      justifyCenter: "center",
                      fontWeight: 900,
                      fontSize: 16,
                      flexShrink: 0,
                    }}
                  >
                    {r.avatar || r.student?.[0]?.toUpperCase() || "?"}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", justifyBetween: "space-between", alignItems: "center", marginBottom: 4 }}>
                      <span style={{ fontWeight: 700, fontSize: 14, color: "#1C1C1C" }}>{r.student}</span>
                      <span style={{ color: "#8A7E72", fontSize: 11 }}>{r.time}</span>
                    </div>
                    <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6 }}>
                      <Stars val={r.rating} sz={13} />
                      <Badge text={r.cafe} color="#0C3B2E" />
                    </div>
                    <p style={{ color: "#374151", fontSize: 14, lineHeight: 1.6 }}>{r.text}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Submit complaint */}
            <div style={{ background: "white", borderRadius: 20, padding: "24px 26px", boxShadow: "0 2px 20px rgba(0,0,0,.06)" }}>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, color: "#0C3B2E", marginBottom: 6 }}>Submit a Complaint</div>
              <p style={{ color: "#8A7E72", fontSize: 13, marginBottom: 18 }}>We take every concern seriously. Vendors will respond within 24 hours.</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
                <div>
                  <Label text="Cafeteria" />
                  <Select value={cpForm.cafe} onChange={(e) => setCpForm((p) => ({ ...p, cafe: e.target.value }))} style={{ background: "#FEFCF8" }}>
                    {CAFES.map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </Select>
                </div>
                <div style={{ display: "flex", alignItems: "flex-end", paddingBottom: 2 }}>
                  <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 14, color: "#374151", fontWeight: 500 }}>
                    <input
                      type="checkbox"
                      checked={cpForm.anon}
                      onChange={(e) => setCpForm((p) => ({ ...p, anon: e.target.checked }))}
                      style={{ width: 16, height: 16, cursor: "pointer" }}
                    />
                    Submit anonymously
                  </label>
                </div>
              </div>
              <textarea
                value={cpForm.issue}
                onChange={(e) => setCpForm((p) => ({ ...p, issue: e.target.value }))}
                placeholder="Describe your complaint in detail…"
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  borderRadius: 10,
                  border: "1.5px solid #E5DDD0",
                  fontFamily: "inherit",
                  fontSize: 14,
                  minHeight: 80,
                  resize: "vertical",
                  background: "#FEFCF8",
                }}
              />
              <button
                onClick={submitComplaint}
                style={{ marginTop: 12, background: "#DC2626", color: "white", borderRadius: 12, padding: "11px 24px", fontWeight: 700, fontSize: 14 }}
              >
                Send Complaint
              </button>
            </div>

            {/* Complaint board */}
            <div>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, color: "#0C3B2E", marginBottom: 16 }}>Complaint Board</div>
              {complaints.map((c) => (
                <div
                  key={c.id}
                  style={{ background: "white", borderRadius: 14, padding: "16px 20px", marginBottom: 10, boxShadow: "0 2px 10px rgba(0,0,0,.05)" }}
                >
                  <div style={{ display: "flex", justifyBetween: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
                    <div style={{ fontWeight: 600, fontSize: 14, color: "#1C1C1C", flex: 1, marginRight: 10 }}>{c.issue}</div>
                    <SChip s={c.status} />
                  </div>
                  <div style={{ fontSize: 12, color: "#8A7E72", marginBottom: c.vendorResponse ? 10 : 0 }}>
                    {c.student} · {c.cafe} · {c.time}
                  </div>
                  {c.vendorResponse && (
                    <div style={{ background: "#F0FAF4", border: "1px solid #BBF7D0", borderRadius: 10, padding: "10px 14px", borderLeft: "3px solid #16A34A" }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: "#16A34A", marginBottom: 4 }}>Vendor Response</div>
                      <div style={{ fontSize: 13, color: "#374151" }}>{c.vendorResponse}</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* AI Chat */}
      <div style={{ position: "fixed", bottom: 24, right: 20, zIndex: 300 }}>
        {chatOpen && (
          <div
            style={{
              position: "absolute",
              bottom: 68,
              right: 0,
              width: 320,
              background: "white",
              borderRadius: 20,
              overflow: "hidden",
              boxShadow: "0 20px 60px rgba(0,0,0,.2)",
              border: "1px solid #EDE6DA",
              animation: "fadeUp .3s ease",
            }}
          >
            <div style={{ background: "linear-gradient(90deg,#0C3B2E,#1A5C36)", padding: "14px 18px", display: "flex", alignItems: "center", gap: 10 }}>
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 10,
                  background: "#F59E0B",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "hidden",
                }}
              >
                <Icon src={PICS.ai} size={34} round={10} />
              </div>
              <div>
                <div style={{ color: "#F59E0B", fontWeight: 700, fontSize: 14 }}>Chop AI</div>
                <div style={{ color: "rgba(255,255,255,.45)", fontSize: 11 }}>Your personal meal advisor</div>
              </div>
            </div>
            <div style={{ height: 250, overflowY: "auto", padding: "14px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
              {chatMsgs.map((m, i) => (
                <div key={i} style={{ display: "flex", justifyCenter: m.role === "u" ? "flex-end" : "flex-start" }}>
                  <div
                    style={{
                      maxWidth: "82%",
                      background: m.role === "u" ? "#0C3B2E" : "#F0EBE3",
                      color: m.role === "u" ? "white" : "#1C1C1C",
                      borderRadius: m.role === "u" ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                      padding: "9px 13px",
                      fontSize: 13,
                      lineHeight: 1.55,
                    }}
                  >
                    {m.text}
                  </div>
                </div>
              ))}
              {chatLoad && (
                <div style={{ display: "flex", gap: 6, alignItems: "center", color: "#8A7E72", fontSize: 13 }}>
                  <Spin /> Thinking…
                </div>
              )}
              <div ref={chatRef} />
            </div>
            <div style={{ padding: "10px 14px", borderTop: "1px solid #F0EBE3", display: "flex", gap: 8 }}>
              <input
                value={chatIn}
                onChange={(e) => setChatIn(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendChat()}
                placeholder="What are you craving?"
                style={{ flex: 1, background: "#F9F6F1", border: "1px solid #EDE6DA", borderRadius: 30, padding: "8px 14px", fontFamily: "inherit", fontSize: 13, color: "#1C1C1C" }}
              />
              <button
                onClick={sendChat}
                disabled={chatLoad}
                style={{
                  background: "#F59E0B",
                  border: "none",
                  borderRadius: "50%",
                  width: 36,
                  height: 36,
                  fontSize: 16,
                  display: "flex",
                  alignItems: "center",
                  justifyCenter: "center",
                  flexShrink: 0,
                  cursor: "pointer",
                }}
              >
                ➤
              </button>
            </div>
          </div>
        )}
        <button
          onClick={() => setChatOpen((p) => !p)}
          style={{
            width: 54,
            height: 54,
            borderRadius: "50%",
            background: "linear-gradient(135deg,#F59E0B,#D97706)",
            border: "none",
            fontSize: 26,
            boxShadow: "0 6px 24px rgba(245,158,11,.5)",
            display: "flex",
            alignItems: "center",
            justifyCenter: "center",
            transition: "transform .2s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.08)")}
          onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
        >
          {chatOpen ? "✕" : "🤖"}
        </button>
      </div>
    </Shell>
  );
}
