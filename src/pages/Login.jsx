import "../styles/global.css";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

export default function Login() {
  const nav = useNavigate();
  const { state } = useLocation();
  const { login } = useAuth();
  const { show } = useToast();

  const [form, setForm] = useState({ account: "", password: "" });
  const [loading, setLoading] = useState(false);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    // 前端驗證失敗 → 用頂部 Toast 顯示
    if (!form.account) {
      return show({ text: "請輸入帳號", duration: 4000 });
    }
    if (!form.password || form.password.length < 6) {
      return show({ text: "請輸入至少 6 碼的密碼", duration: 4000 });
    }

    try {
      setLoading(true);
  const u = await login({ account: form.account, password: form.password });

      // 尚未驗證 → 顯示提示並導向驗證頁
      if (!u.emailVerified) {
        show({
    text: `你的帳號尚未驗證，已寄送驗證信至 ${form.account}`,
          actions: [{ label: "前往驗證頁", onClick: () => nav("/verify-email?status=failed") }],
          duration: 7000,
        });
        return;
      }

      // 成功
      show({ text: "歡迎回來！登入成功 ✅", duration: 2500 });
      const redirect = state?.from?.pathname || "/";
      nav(redirect, { replace: true });
    } catch (err) {
      const msg = String(err?.message || "");
      if (/not\s*verified|未驗證/i.test(msg)) {
        show({
    text: `你的帳號尚未驗證，已寄送驗證信至 ${form.account}`,
          actions: [{ label: "前往驗證頁", onClick: () => nav("/verify-email?status=failed") }],
          duration: 7000,
        });
      } else if (/password|密碼/i.test(msg)) {
        show({ text: "密碼錯誤，請再試一次", duration: 5000 });
      } else if (/not\s*found|不存在|no\s*user/i.test(msg)) {
        show({ text: "找不到此帳號", duration: 5000 });
      } else {
        show({ text: "登入失敗，請稍後再試", duration: 5000 });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h1 className="logo">活動地圖</h1>
        <h2>登入</h2>

        <form onSubmit={onSubmit}>
          <input
            type="text"
            name="account"
            className="input-field"
            placeholder="帳號"
            required
            value={form.account}
            onChange={onChange}
            autoComplete="username"
          />
          <input
            type="password"
            name="password"
            className="input-field"
            placeholder="密碼（至少 6 碼）"
            required
            value={form.password}
            onChange={onChange}
            minLength={6}
            autoComplete="current-password"
          />

          {/* ⛔️ 把表單內紅框錯誤移除，避免出現在表單裡 */}
          {/* （如果你想保留，改用 CSS 隱藏或只在開發時顯示） */}

          <div className="form-footer">
            <button type="submit" className="auth-button" disabled={loading}>
              {loading ? "登入中…" : "登入"}
            </button>
            <div className="switch-link">
              沒有帳號？<Link to="/register">點擊註冊</Link>
            </div>
          </div>
        </form>

        <div className="home-link">
          <Link to="/">← 回首頁</Link>
        </div>
      </div>
    </div>
  );
}
