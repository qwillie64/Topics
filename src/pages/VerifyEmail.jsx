import { useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../styles/global.css";

export default function VerifyEmail() {
  const { search } = useLocation();
  const nav = useNavigate();
  const params = useMemo(() => new URLSearchParams(search), [search]);
  const status = (params.get("status") || "success").toLowerCase();

  const view =
    {
      success: {
        title: "驗證成功 🎉",
        desc: "你的 Email 已完成驗證，現在可以使用帳號登入。",
        primary: { label: "前往登入", onClick: () => nav("/login") },
        secondary: { label: "回首頁", onClick: () => nav("/") },
      },
      failed: {
        title: "驗證失敗",
        desc: "驗證連結無效或已被使用，請重新發送驗證郵件。",
        primary: { label: "回註冊重新寄送", onClick: () => nav("/register") },
        secondary: { label: "回首頁", onClick: () => nav("/") },
      },
      expired: {
        title: "驗證連結已過期",
        desc: "連結已失效，請回註冊頁重新發送驗證郵件。",
        primary: { label: "回註冊重新寄送", onClick: () => nav("/register") },
        secondary: { label: "回首頁", onClick: () => nav("/") },
      },
    }[status] || {
      title: "驗證狀態",
      desc: "請依照信件中的連結完成驗證。",
      primary: { label: "回首頁", onClick: () => nav("/") },
    };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2>{view.title}</h2>
        <p>{view.desc}</p>
        <div className="form-footer" style={{ gap: 8 }}>
          {view.primary && (
            <button className="auth-button" onClick={view.primary.onClick}>
              {view.primary.label}
            </button>
          )}
          {view.secondary && (
            <button className="auth-button" onClick={view.secondary.onClick}>
              {view.secondary.label}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
