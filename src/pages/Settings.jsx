// src/pages/Settings.jsx
import { useNavigate, Link } from "react-router-dom"; // ← 新增：用 Router 導頁
import "../styles/Settings.css";

export default function Settings() {
  const navigate = useNavigate(); // ← 用於按鈕導頁

  // 讀使用者（和你原本相同）
  const savedUser = localStorage.getItem("currentUser");
  const user = savedUser
    ? JSON.parse(savedUser)
    : {
        id: "u_001",
        displayName: "小明",
        email: "user@example.com",
        phone: "+886-912-345-678",
        role: "user",
        avatarUrl: "https://avatars.githubusercontent.com/u/9919?s=200&v=4",
      };

  // 讀取主辦申請狀態（和你原本相同）
  const app = (() => {
    try { return JSON.parse(localStorage.getItem("organizerApplication")) || null; }
    catch { return null; }
  })();
  const status = app?.status ?? "none";
  const statusText =
    status === "approved" ? "已通過" :
    status === "pending"  ? "審核中" :
    status === "rejected" ? "未通過" :
    "尚未申請";

  return (
    <div className="settings-container">
      <h1 style={{ marginBottom: 16 }}>設定</h1>

      {/* 基本資料（條列式） */}
      <section className="settings-card">
        <h2>基本資料（唯讀）</h2>
        <div className="settings-list">
          <div className="settings-item">
            <div className="settings-label">頭像</div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <img
                src={user.avatarUrl}
                alt="avatar"
                style={{ width: 64, height: 64, borderRadius: "50%", objectFit: "cover" }}
              />
            </div>
          </div>

          <div className="settings-item">
            <div className="settings-label">暱稱 / 顯示名稱</div>
            <input className="settings-input" value={user.displayName} disabled />
          </div>

          <div className="settings-item">
            <div className="settings-label">電子信箱</div>
            <input className="settings-input" value={user.email} disabled />
          </div>

          <div className="settings-item">
            <div className="settings-label">聯絡電話</div>
            <input className="settings-input" value={user.phone ?? ""} disabled />
          </div>

          <div className="settings-item">
            <div className="settings-label">目前身分</div>
            <input className="settings-input" value={user.role === "organizer" ? "主辦方" : "一般用戶"} disabled />
          </div>
        </div>
      </section>

      {/* 升級為主辦方 CTA + 狀態展示 */}
      <section className="settings-card">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ fontWeight: 600 }}>升級為主辦方</div>
              {/* 狀態標籤 */}
              <span style={{
                fontSize: 12,
                padding: "2px 8px",
                borderRadius: 999,
                background:
                  status === "approved" ? "#E9F9EF" :
                  status === "pending"  ? "#FFF5E6" :
                  status === "rejected" ? "#FFE8E6" :
                                          "#F0F2F5",
                color:
                  status === "approved" ? "#1E874B" :
                  status === "pending"  ? "#A86200" :
                  status === "rejected" ? "#B22222" :
                                          "#555",
                border: "1px solid rgba(0,0,0,0.08)"
              }}>
                {statusText}
              </span>
            </div>
            <div style={{ color: "#666", fontSize: 14, marginTop: 4 }}>
              成為主辦方後，你可以上架與管理活動、設定檔期與售票資訊。
            </div>
          </div>

          {/* 🚀 改用 Router 導頁，不再用 onNavigate */}
          {status === "pending" ? (
            <button
              className="settings-btn"
              onClick={() => navigate("/apply")}   // ← 查看申請進度
              title="查看申請進度"
            >
              查看申請進度
            </button>
          ) : (
            <button
              className="settings-btn primary"
              onClick={() => navigate("/apply")}   // ← 進入申請表單
            >
              {status === "approved" ? "查看主辦資訊" : "申請成為主辦方"}
            </button>
          )}
        </div>

        {/* （可選）若已通過，顯示快速入口 */}
        {status === "approved" && (
          <div style={{ marginTop: 12, fontSize: 14 }}>
            你也可以直接前往：<Link to="/create" style={{ color: "#6c63ff" }}>上傳活動</Link>
          </div>
        )}
      </section>
    </div>
  );
}
