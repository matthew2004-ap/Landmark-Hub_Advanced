import { useState } from "react";

export function useToast() {
  const [toasts, setToasts] = useState([]);
  const show = (msg, type = "ok") => {
    const id = Date.now();
    setToasts((p) => [...p, { id, msg, type }]);
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 3200);
  };
  return { toasts, show };
}
