import { useState, useEffect } from "react";
import { INIT_MENU, DEFAULT_TIMES } from "./constants/data";
import { db } from "./utils/storage";
import { useToast } from "./utils/useToast";
import { ToastContainer, Spin } from "./components/common/UI";
import { AuthModal } from "./components/features/AuthModal";
import { LandingPage } from "./pages/LandingPage";
import { StudentApp } from "./pages/StudentApp";
import { VendorApp } from "./pages/VendorApp";
import { AdminApp } from "./pages/AdminApp";
import "./index.css";

export default function App() {
  const [user, setUser] = useState(null);
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState("student"); // student | vendor | admin
  const [db_ready, setDbReady] = useState(false);

  // Shared backend state
  const [orders, setOrders] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [menu, setMenu] = useState(INIT_MENU);
  const [delivTimes, setDelivTimes] = useState(DEFAULT_TIMES);
  const [students, setStudents] = useState([]); // registered students

  const { toasts, show: toast } = useToast();

  useEffect(() => {
    (async () => {
      const [o, r, c, m, dt, s] = await Promise.all([
        db.get("cch-orders"),
        db.get("cch-reviews"),
        db.get("cch-complaints"),
        db.get("cch-menu"),
        db.get("cch-dtimes"),
        db.get("cch-students"),
      ]);
      if (o) setOrders(o);
      if (r) setReviews(r);
      if (c) setComplaints(c);
      if (m) setMenu(m);
      if (dt) setDelivTimes(dt);
      if (s) setStudents(s);
      setDbReady(true);
    })();
  }, []);

  const save = {
    orders: async (v) => {
      setOrders(v);
      await db.set("cch-orders", v);
    },
    reviews: async (v) => {
      setReviews(v);
      await db.set("cch-reviews", v);
    },
    complaints: async (v) => {
      setComplaints(v);
      await db.set("cch-complaints", v);
    },
    menu: async (v) => {
      setMenu(v);
      await db.set("cch-menu", v);
    },
    delivTimes: async (v) => {
      setDelivTimes(v);
      await db.set("cch-dtimes", v);
    },
    students: async (v) => {
      setStudents(v);
      await db.set("cch-students", v);
    },
  };

  const logout = () => {
    setUser(null);
    toast("Logged out successfully");
  };

  if (!db_ready)
    return (
      <div style={{ minHeight: "100vh", background: "#0C3B2E", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 20 }}>
        <div
          style={{
            width: 60,
            height: 60,
            borderRadius: 16,
            background: "#F59E0B",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 30,
            boxShadow: "0 8px 32px rgba(245,158,11,.4)",
          }}
        >
          🍛
        </div>
        <div style={{ fontFamily: "'Inter', system-ui, sans-serif", color: "#F59E0B", fontSize: 22, fontWeight: 700 }}>Campus Chop Hub</div>
        <Spin />
      </div>
    );

  const shared = { orders, reviews, complaints, menu, delivTimes, students, save, toast };

  return (
    <>
      <ToastContainer toasts={toasts} />
      {!user && (
        <LandingPage
          onOpenAuth={(m) => {
            setAuthMode(m);
            setAuthOpen(true);
          }}
        />
      )}
      {!user && authOpen && (
        <AuthModal
          mode={authMode}
          setMode={setAuthMode}
          students={students}
          saveStudents={save.students}
          onLogin={setUser}
          onClose={() => setAuthOpen(false)}
          toast={toast}
        />
      )}
      {user?.role === "student" && <StudentApp user={user} onLogout={logout} {...shared} />}
      {user?.role === "vendor" && <VendorApp user={user} onLogout={logout} {...shared} />}
      {user?.role === "admin" && <AdminApp user={user} onLogout={logout} {...shared} />}
    </>
  );
}
