import React, { useState } from "react";
import { PH, FB } from "../../constants/data";
import { Img, ImgSkeleton } from "../common/UI";

export function FoodCard({ item, onAdd, onDec, qty, disabled }) {
  const [loaded, setLoaded] = useState(false);
  return (
    <div
      className="card-h"
      style={{
        background: "#fff",
        borderRadius: 18,
        overflow: "hidden",
        boxShadow: "0 2px 16px rgba(0,0,0,.07)",
        opacity: disabled ? 0.55 : 1,
        position: "relative",
      }}
    >
      <div style={{ height: 180, overflow: "hidden", position: "relative", background: "#f0ebe3" }}>
        {!loaded && <ImgSkeleton style={{ position: "absolute", inset: 0 }} />}
        <Img
          src={PH[item.img] || FB}
          alt={item.name}
          style={{ width: "100%", height: "100%", objectFit: "cover", display: loaded ? "block" : "none", transition: "transform .4s" }}
          fallback={FB}
        />
        <img
          src={PH[item.img] || FB}
          alt=""
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: 0 }}
          onLoad={() => setLoaded(true)}
          onError={() => setLoaded(true)}
        />
        {item.tag && (
          <span
            style={{
              position: "absolute",
              top: 10,
              left: 10,
              background: "#0C3B2E",
              color: "#F59E0B",
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: 0.6,
              borderRadius: 20,
              padding: "4px 10px",
            }}
          >
            {item.tag}
          </span>
        )}
        {!item.available && (
          <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,.5)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ color: "white", fontWeight: 700, fontSize: 13, letterSpacing: 1, textTransform: "uppercase" }}>Unavailable</span>
          </div>
        )}
      </div>
      <div style={{ padding: "14px 16px" }}>
        <div style={{ fontWeight: 700, fontSize: 14, color: "#1C1C1C", marginBottom: 4, lineHeight: 1.35 }}>{item.name}</div>
        <div style={{ display: "flex", justifyBetween: "space-between", alignItems: "center", marginTop: 10 }}>
          <span style={{ fontWeight: 800, fontSize: 16, color: "#0C3B2E" }}>₦{item.price.toLocaleString()}</span>
          {item.available &&
            (qty > 0 ? (
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <button
                  onClick={onDec}
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: "50%",
                    border: "2px solid #E5DDD0",
                    background: "none",
                    fontWeight: 800,
                    fontSize: 16,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#1C1C1C",
                  }}
                >
                  −
                </button>
                <span style={{ fontWeight: 800, fontSize: 15, minWidth: 18, textAlign: "center" }}>{qty}</span>
                <button
                  onClick={onAdd}
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: "50%",
                    background: "#0C3B2E",
                    fontWeight: 800,
                    fontSize: 16,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#F59E0B",
                  }}
                >
                  +
                </button>
              </div>
            ) : (
              <button onClick={onAdd} style={{ background: "#0C3B2E", color: "#F59E0B", borderRadius: 30, padding: "7px 18px", fontWeight: 700, fontSize: 13 }}>
                Add +
              </button>
            ))}
        </div>
      </div>
    </div>
  );
}
