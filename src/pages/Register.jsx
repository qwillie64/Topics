// src/pages/Register.jsx
import "../styles/global.css";
import { register as apiRegister } from "../api/account";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useToast } from "../context/ToastContext";

// 依 Email 推測常見信箱登入網址（供「前往信箱」按鈕用）
function getMailProviderURL(email) {
  const domain = (email.split("@")[1] || "").toLowerCase();
  if (domain.includes("gmail")) return "https://mail.google.com/";
  if (domain.includes("yahoo")) return "https://mail.yahoo.com/";
  if (domain.includes("outlook") || domain.includes("hotmail") || domain.includes("live"))
    return "https://outlook.live.com/";
  if (domain.includes("icloud")) return "https://www.icloud.com/mail/";
  return domain ? "https://" + domain : "https://mail.google.com/";
}

// ✅ 手機號碼正規化：允許使用者輸入 +886、空白、破折號
//    最後轉成「0912345678」格式再做驗證與送到後端
function normalizePhone(s) {
  if (!s) return "";
  let num = s.replace(/[^\d]/g, ""); // 只留數字
  // 886 開頭（或 +886 去掉 + 之後）→ 換成 0 開頭
  if (num.startsWith("886")) num = "0" + num.slice(3);
  return num;
}

export default function Register() {
  const nav = useNavigate();
  const { show } = useToast();

  // 表單狀態
  const [form, setForm] = useState({
    username: "",
    email: "",
    phone: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // 受控輸入
  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // ✅ 在前端把手機號碼先正規化
    const phoneNormalized = normalizePhone(form.phone);

    // 基本前端驗證（不動後端介面）
    if (!form.username.trim()) return setError("請輸入用戶名稱");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email)) return setError("Email 格式不正確");
    // ✅ 驗證「正規化」後的手機號碼是否為 09 開頭 + 8 碼
    if (!/^09\d{8}$/.test(phoneNormalized)) return setError("手機格式需為 09 開頭共 10 碼");
    if (!form.password || form.password.length < 6) return setError("密碼至少 6 碼");

    try {
      setLoading(true);
      // ✅ 送到後端時用「正規化後」的手機號碼
      await apiRegister({
        name: form.username,
        email: form.email,
        phone: phoneNormalized,
        password: form.password,
      });

      // 顯示頂部訊息視窗（與 Login 用同風格）
      show({
        text: `已寄出驗證信到 ${form.email}，請至信箱完成驗證。`,
        actions: [
          { label: "前往信箱", onClick: () => window.open(getMailProviderURL(form.email), "_blank") },
          { label: "我已完成驗證", onClick: () => nav("/verify-email?status=success") },
        ],
        duration: 8000,
      });
    } catch (err) {
      console.error(err);
      setError(err?.message || "註冊失敗，請稍後再試");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h1 className="logo">活動地圖</h1>
        <h2>註冊</h2>

        <form onSubmit={onSubmit}>
          <input
            type="text"
            name="username"
            className="input-field"
            placeholder="用戶名稱"
            required
            value={form.username}
            onChange={onChange}
          />

          <input
            type="email"
            name="email"
            className="input-field"
            placeholder="電子郵件"
            required
            value={form.email}
            onChange={onChange}
            pattern="^[^\s@]+@[^\s@]+\.[^\s@]{2,}$"
            title="請輸入有效的 Email，例如 name@example.com"
            autoComplete="email"
          />

          {/* ✅ 手機欄位：拿掉嚴格的 pattern，改由 submit 時正規化＋驗證
              並用 inputMode/autoComplete 增加輸入體驗 */}
          <input
            type="tel"
            name="phone"
            className="input-field"
            placeholder="手機號碼（09xxxxxxxx 或 +886 9xxxxxxxx）"
            required
            value={form.phone}
            onChange={onChange}
            inputMode="numeric"
            autoComplete="tel"
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
            autoComplete="new-password"
          />

          {/* 表單內錯誤：仍保留（若你想全部改成頂部 Toast，可移除此區塊） */}
          {error && <div className="error" style={{ marginTop: 8 }}>{error}</div>}

          {/* ✅ 包一層讓按鈕跟切換連結都在一起，且靠右 */}
          <div className="form-footer">
            <button type="submit" className="auth-button" disabled={loading}>
              {loading ? "送出中…" : "註冊"}
            </button>
            <div className="switch-link">
              已經有帳號？<Link to="/login">點擊登入</Link>
            </div>
          </div>
        </form>

        {/* ✅ 回首頁置中 */}
        <div className="home-link">
          <Link to="/">← 回首頁</Link>
        </div>
      </div>
    </div>
  );
}
