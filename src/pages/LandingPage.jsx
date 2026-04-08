import React, { useState } from "react";
import { PH, CAFES, CAFE_IMG, INIT_MENU, PICS } from "../constants/data";
import { Img, Dot, Icon } from "../components/common/UI";

export function LandingPage({ onOpenAuth }) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const allItems = Object.values(INIT_MENU).flat().slice(0, 8);
  return (
    <div className="anim-bg">
      {/* Navbar */}
      <nav
        className="bg-accent"
        style={{ position: "sticky", top: 0, zIndex: 100, backdropFilter: "blur(10px)", boxShadow: "0 2px 20px rgba(0,0,0,.3)" }}
      >
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 20px", height: 65, display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1 }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: "#F59E0B", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
              <Icon src={PICS.logo} size={38} round={10} />
            </div>
            <span style={{ fontFamily: "'Inter', system-ui, sans-serif", color: "#F59E0B", fontWeight: 900, fontSize: 17 }}>Campus Chop Hub</span>
          </div>
          <div style={{ display: "flex", gap: 24, alignItems: "center" }} className="hide-sm">
            {["Menu", "How It Works", "Cafeterias"].map((l) => (
              <a
                key={l}
                href="#"
                style={{ color: "rgba(255,255,255,.65)", fontSize: 14, fontWeight: 500, transition: "color .2s" }}
                onMouseEnter={(e) => (e.target.style.color = "white")}
                onMouseLeave={(e) => (e.target.style.color = "rgba(255,255,255,.65)")}
              >
                {l}
              </a>
            ))}
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button
              onClick={() => onOpenAuth("student")}
              style={{
                background: "transparent",
                border: "1.5px solid rgba(255,255,255,.3)",
                color: "rgba(255,255,255,.8)",
                borderRadius: 30,
                padding: "9px 20px",
                fontSize: 13,
                fontWeight: 600,
                transition: "all .2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "white";
                e.currentTarget.style.color = "white";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "rgba(255,255,255,.3)";
                e.currentTarget.style.color = "rgba(255,255,255,.8)";
              }}
            >
              Log In
            </button>
            <button
              onClick={() => onOpenAuth("student")}
              style={{
                background: "#F59E0B",
                color: "#0C3B2E",
                borderRadius: 30,
                padding: "9px 22px",
                fontSize: 13,
                fontWeight: 700,
                boxShadow: "0 4px 14px rgba(245,158,11,.35)",
                transition: "transform .2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.04)")}
              onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="bg-accent" style={{ position: "relative", height: "92vh", minHeight: 520, overflow: "hidden", display: "flex", alignItems: "center" }}>
        <div style={{ position: "absolute", inset: 0 }}>
          {!imgLoaded && <div style={{ position: "absolute", inset: 0 }} className="bg-accent" />}
          <img src={PH.hero} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.15, display: imgLoaded ? "block" : "none" }} onLoad={() => setImgLoaded(true)} />
        </div>
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg,rgba(12,59,46,.92) 40%,rgba(12,59,46,.6))" }} />
        <div style={{ position: "relative", maxWidth: 1100, margin: "0 auto", padding: "0 20px", width: "100%" }}>
          <div style={{ maxWidth: 620, animation: "fadeUp .8s ease both" }}>
            <div
              className="floating"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                background: "rgba(245,158,11,.15)",
                border: "1px solid rgba(245,158,11,.3)",
                borderRadius: 30,
                padding: "6px 16px",
                marginBottom: 24,
              }}
            >
              <Dot />
              <span style={{ color: "#F59E0B", fontSize: 12, fontWeight: 600, letterSpacing: 0.5 }}>LMU Campus Food Platform · Now Live</span>
            </div>
            <h1 style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: "clamp(38px,7vw,72px)", color: "#FEFCE8", lineHeight: 1.08, marginBottom: 20, fontWeight: 900 }}>
              Order Campus
              <br />
              <em style={{ color: "#F59E0B", fontStyle: "italic" }}>Food</em> From
              <br />
              Your Hostel
            </h1>
            <p style={{ color: "rgba(255,255,255,.65)", fontSize: "clamp(15px,2vw,18px)", lineHeight: 1.75, marginBottom: 36, maxWidth: 480 }}>
              Skip the queue. Browse menus from all 4 cafeterias, place your order, and have it delivered straight to your room.
            </p>
            <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
              <button
                onClick={() => onOpenAuth("student")}
                style={{
                  background: "#F59E0B",
                  color: "#0C3B2E",
                  borderRadius: 30,
                  padding: "15px 34px",
                  fontSize: 15,
                  fontWeight: 700,
                  boxShadow: "0 8px 30px rgba(245,158,11,.45)",
                  transition: "all .25s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-2px)")}
                onMouseLeave={(e) => (e.currentTarget.style.transform = "none")}
              >
                Order Food Now →
              </button>
              <button
                onClick={() => onOpenAuth("vendor")}
                style={{
                  background: "rgba(255,255,255,.08)",
                  border: "1.5px solid rgba(255,255,255,.25)",
                  color: "white",
                  borderRadius: 30,
                  padding: "15px 30px",
                  fontSize: 15,
                  fontWeight: 600,
                  transition: "all .25s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,.14)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,255,255,.08)")}
              >
                Vendor Portal
              </button>
            </div>
          </div>
        </div>
        {/* Stats strip */}
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "rgba(0,0,0,.4)", backdropFilter: "blur(8px)" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto", padding: "18px 20px", display: "flex", gap: 30, overflowX: "auto" }}>
            {[
              ["4", "Cafeterias"],
              ["6", "Hostels Covered"],
              ["100%", "No Queues"],
              ["Real-time", "Order Tracking"],
            ].map(([n, l]) => (
              <div key={l} style={{ flexShrink: 0, display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, fontWeight: 900, color: "#F59E0B" }}>{n}</span>
                <span style={{ color: "rgba(255,255,255,.6)", fontSize: 13, lineHeight: 1.3, maxWidth: 80 }}>{l}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section style={{ padding: "100px 20px", maxWidth: 1100, margin: "0 auto", textAlign: "center" }}>
        <h2 style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: "clamp(28px, 5vw, 42px)", color: "#0C3B2E", marginBottom: 12, fontWeight: 800 }}>How It Works</h2>
        <p style={{ color: "#8A7E72", marginBottom: 60, fontSize: 16 }}>Four simple steps to get your favorite campus meal delivered.</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 32 }}>
          {[
            {
              n: "01",
              title: "Browse Menus",
              body: "Explore live menus from Cafe 1, 2, 3, and Back of Cafe. See what's available, prices, and estimated times.",
              icon: PICS.menu,
            },
            { n: "02", title: "Place Your Order", body: "Add items to cart, choose your hostel and room, pick a payment method, and confirm.", icon: PICS.cart },
            { n: "03", title: "Track in Real Time", body: "Follow your order from kitchen to your door. Get live status updates every step.", icon: PICS.track },
            { n: "04", title: "Rate & Review", body: "Share your experience, rate the food, and help improve the campus dining experience.", icon: PICS.review },
          ].map((s) => (
            <div
              key={s.n}
              style={{ textAlign: "left", padding: 28, borderRadius: 20, border: "1px solid #EDE6DA", background: "#FAF7F2", transition: "all .2s" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "#F59E0B";
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.boxShadow = "0 12px 36px rgba(0,0,0,.08)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "#EDE6DA";
                e.currentTarget.style.transform = "none";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <div style={{ width: 52, height: 52, borderRadius: 14, background: "white", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20, boxShadow: "0 4px 12px rgba(0,0,0,.05)", overflow: "hidden" }}>
                <Icon src={s.icon} size={32} round={8} />
              </div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#F59E0B", marginBottom: 8 }}>STEP {s.n}</div>
              <h3 style={{ fontFamily: "'Inter', system-ui, sans-serif", color: "#0C3B2E", fontSize: 20, marginBottom: 10, fontWeight: 700 }}>{s.title}</h3>
              <p style={{ color: "#6B6056", fontSize: 14, lineHeight: 1.6 }}>{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Cafeterias section */}
      <section style={{ padding: "100px 20px", background: "#FAF7F2" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <p style={{ color: "#F59E0B", fontWeight: 700, fontSize: 12, letterSpacing: 3, textTransform: "uppercase", marginBottom: 12, textAlign: "center" }}>
            Where to Eat
          </p>
          <h2 style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: "clamp(28px, 5vw, 42px)", color: "#0C3B2E", marginBottom: 40, textAlign: "center", fontWeight: 800 }}>
            Our 4 Dining Locations
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 24 }}>
            {CAFES.map((c, i) => (
              <div key={c} className="card-h" style={{ borderRadius: 20, overflow: "hidden", boxShadow: "0 4px 20px rgba(0,0,0,.09)", background: "#fff" }}>
                <div style={{ height: 200, overflow: "hidden", position: "relative" }}>
                  <Img src={CAFE_IMG[c]} alt={c} style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform .5s" }} />
                  <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(12, 59, 46, .85) 0%, transparent 50%)" }} />
                  <div style={{ position: "absolute", bottom: 16, left: 16 }}>
                    <div style={{ fontFamily: "'Inter', system-ui, sans-serif", color: "white", fontSize: 18, fontWeight: 700 }}>{c}</div>
                    <div style={{ color: "rgba(255,255,255,.7)", fontSize: 12, marginTop: 2 }}>{INIT_MENU[c].length} items · Open daily</div>
                  </div>
                </div>
                <div style={{ padding: "16px 18px", display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {INIT_MENU[c].slice(0, 3).map((it) => (
                    <span key={it.id} style={{ fontSize: 12, color: "#6B6056", background: "#F0EBE3", borderRadius: 20, padding: "3px 10px" }}>
                      {it.name.split(" ")[0]}
                    </span>
                  ))}
                  <span style={{ fontSize: 12, color: "#F59E0B", fontWeight: 600 }}>+ more</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Dishes */}
      <section className="bg-accent" style={{ padding: "100px 20px", overflow: "hidden" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <p
            style={{
              color: "rgba(245, 158, 11, .7)",
              fontWeight: 700,
              fontSize: 12,
              letterSpacing: 3,
              textTransform: "uppercase",
              marginBottom: 12,
              textAlign: "center",
            }}
          >
            On the Menu Today
          </p>
          <h2 style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: "clamp(28px, 5vw, 42px)", color: "#FEFCE8", marginBottom: 40, textAlign: "center", fontWeight: 800 }}>
            Most Ordered Dishes
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(210px, 1fr))", gap: 20 }}>
            {allItems.map((item) => (
              <div
                key={item.id}
                style={{
                  borderRadius: 16,
                  overflow: "hidden",
                  background: "rgba(255,255,255,.05)",
                  border: "1px solid rgba(255,255,255,.07)",
                  transition: "all .25s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(255,255,255,.09)";
                  e.currentTarget.style.transform = "translateY(-4px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(255,255,255,.05)";
                  e.currentTarget.style.transform = "none";
                }}
              >
                <div style={{ height: 150, overflow: "hidden" }}>
                  <Img src={PH[item.img]} alt={item.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
                <div style={{ padding: "12px 14px" }}>
                  <div style={{ color: "rgba(255,255,255,.85)", fontWeight: 600, fontSize: 13, marginBottom: 4 }}>{item.name}</div>
                  <div style={{ color: "#F59E0B", fontWeight: 800, fontSize: 15 }}>₦{item.price.toLocaleString()}</div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ textAlign: "center", marginTop: 40 }}>
            <button
              onClick={() => onOpenAuth("student")}
              style={{ background: "#F59E0B", color: "#0C3B2E", borderRadius: 30, padding: "14px 36px", fontSize: 15, fontWeight: 700, boxShadow: "0 8px 30px rgba(245,158,11,.35)" }}
            >
              View Full Menu & Order →
            </button>
          </div>
        </div>
      </section>

      {/* Portals */}
      <section style={{ padding: "100px 20px", background: "white" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", textAlign: "center" }}>
          <h2 style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: "clamp(28px, 5vw, 42px)", color: "#0C3B2E", marginBottom: 12, fontWeight: 800 }}>Choose Your Portal</h2>
          <p style={{ color: "#8A7E72", marginBottom: 60, fontSize: 16 }}>Dedicated dashboards for students, cafeteria vendors, and administrators.</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 32 }}>
            {[
              {
                role: "student",
                icon: PICS.student,
                title: "Student Portal",
                color: "#0C3B2E",
                desc: "Browse menus, order food, track your delivery, and leave reviews.",
                cta: "Student Login",
              },
              {
                role: "vendor",
                icon: PICS.vendor,
                title: "Vendor Portal",
                color: "#1E3A5F",
                desc: "Manage your menu, set delivery times, handle orders and complaints.",
                cta: "Vendor Login",
              },
              {
                role: "admin",
                icon: PICS.admin,
                title: "Admin Portal",
                color: "#3D1A78",
                desc: "Full platform oversight — users, analytics, AI insights, and settings.",
                cta: "Admin Login",
              },
            ].map((p) => (
              <div key={p.role} style={{ borderRadius: 24, overflow: "hidden", boxShadow: "0 10px 40px rgba(0,0,0,.08)", border: "1px solid #EDE6DA", background: "#FAF7F2" }}>
                <div style={{ background: p.color, padding: "40px 24px", textAlign: "center" }}>
                  <div style={{ marginBottom: 16, display: "flex", justifyContent: "center" }}>
                    <Icon src={p.icon} size={64} round={16} />
                  </div>
                  <div style={{ fontFamily: "'Inter', system-ui, sans-serif", color: "white", fontSize: 24, fontWeight: 800 }}>{p.title}</div>
                </div>
                <div style={{ padding: "32px 24px" }}>
                  <p style={{ color: "#6B6056", fontSize: 15, lineHeight: 1.6, marginBottom: 28 }}>{p.desc}</p>
                  <button
                    onClick={() => onOpenAuth(p.role)}
                    style={{ width: "100%", background: p.color, color: "white", borderRadius: 14, padding: "14px", fontWeight: 700, fontSize: 15, transition: "all .2s" }}
                    onMouseEnter={(e) => (e.currentTarget.style.opacity = ".9")}
                    onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
                  >
                    {p.cta} →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-accent" style={{ padding: "80px 20px 40px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 40, flexWrap: "wrap", marginBottom: 60 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: "#F59E0B", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                  <Icon src={PICS.logo} size={40} round={10} />
                </div>
                <span style={{ fontFamily: "'Inter', system-ui, sans-serif", color: "white", fontWeight: 800, fontSize: 20 }}>Campus Chop Hub</span>
              </div>
              <p style={{ color: "rgba(255,255,255,.5)", fontSize: 14, maxWidth: 300, lineHeight: 1.8 }}>
                The official food ordering platform for Landmark University, Omu-Aran, Kwara State. Built for students, by students.
              </p>
            </div>
            <div style={{ display: "flex", gap: 60, flexWrap: "wrap" }}>
              {[
                { h: "Platform", links: ["Menu", "How It Works", "Cafeterias", "Reviews"] },
                { h: "Portals", links: ["Student Login", "Vendor Login", "Admin Login"] },
                { h: "University", links: ["LMU Official Site", "Student Affairs", "Campus Map"] },
              ].map((col) => (
                <div key={col.h}>
                  <div style={{ color: "#F59E0B", fontWeight: 700, fontSize: 12, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 20 }}>{col.h}</div>
                  {col.links.map((l) => (
                    <div key={l} style={{ marginBottom: 12 }}>
                      <a href="#" style={{ color: "rgba(255,255,255,.6)", fontSize: 14, textDecoration: "none", transition: "color .2s" }} onMouseEnter={(e) => (e.target.style.color = "white")} onMouseLeave={(e) => (e.target.style.color = "rgba(255,255,255,.6)")}>
                        {l}
                      </a>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
          <div style={{ borderTop: "1px solid rgba(255,255,255,.1)", paddingTop: 30, textAlign: "center" }}>
            <p style={{ color: "rgba(255,255,255,.3)", fontSize: 13 }}>&copy; {new Date().getFullYear()} Landmark University Campus Chop Hub. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
