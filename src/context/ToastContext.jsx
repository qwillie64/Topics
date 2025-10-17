import { createContext, useCallback, useContext, useState } from "react";

const ToastCtx = createContext(null);

export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null); // { text, actions: [{label,onClick}], duration }

  const show = useCallback((payload) => {
    // payload: { text, actions?, duration? }
    setToast(payload);
    const ms = payload?.duration ?? 6000;
    if (ms > 0) {
      clearTimeout(window.__toastTimer);
      window.__toastTimer = setTimeout(() => setToast(null), ms);
    }
  }, []);

  const hide = useCallback(() => setToast(null), []);

  return (
    <ToastCtx.Provider value={{ show, hide }}>
      {children}
      {toast && (
        <div
          className="top-toast"
          style={{
            position: "fixed",
            top: 16,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 3000,
            background: "#2b7fff",
            color: "#fff",
            padding: "10px 14px",
            borderRadius: 10,
            boxShadow: "0 8px 20px rgba(0,0,0,0.15)",
            display: "flex",
            alignItems: "center",
            gap: 10,
            maxWidth: "92%",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          <span style={{ fontWeight: 600 }}>{toast.text}</span>
          {(toast.actions || []).map((a, i) => (
            <button
              key={i}
              className="btn"
              onClick={a.onClick}
              style={{
                background: "#fff",
                color: "#2b7fff",
                borderRadius: 8,
                padding: "6px 10px",
                border: "none",
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              {a.label}
            </button>
          ))}
          <button
            onClick={hide}
            aria-label="關閉"
            style={{
              background: "transparent",
              border: "none",
              color: "#fff",
              fontSize: 18,
              lineHeight: 1,
              cursor: "pointer",
              marginLeft: 6,
            }}
          >
            ×
          </button>
        </div>
      )}
    </ToastCtx.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastCtx);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
