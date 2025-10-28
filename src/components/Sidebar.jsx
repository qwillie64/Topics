import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/sidebar.css";

export default function Sidebar({ isOpen = true, onToggle }) {
  const { isAuthenticated, user, logout } = useAuth();
  const nav = useNavigate();

  const handleLogout = async () => {
    await logout();
    nav("/");
  };

  return (
    <aside className={`sidebar ${isOpen ? "" : "collapsed"}`}>
      {/* 頂部：標題＋漢堡（兩狀態都顯示三條線） */}
      <div className="sidebar-header">
        <h3 className="sidebar-title">導覽</h3>
        <button
          className={`hamburger ${isOpen ? "is-open" : ""}`}
          onClick={onToggle}
          aria-label="切換側欄"
          aria-expanded={isOpen}
          type="button"
        >
          <span />
          <span />
          <span />
        </button>
      </div>

      {/* 上方導覽（收合不留白） */}
      <nav className={`sidebar-section ${isOpen ? "show" : "hide"}`}>
        <ul className="nav-list">
          <li>
            <NavLink className="nav-link" to="/">
              <span className="icon">🏠</span>
              <span className="label">首頁</span>
            </NavLink>
          </li>

          {isAuthenticated && (
            <>
              <li>
                <NavLink className="nav-link" to="/favorites">
                  <span className="icon">⭐</span>
                  <span className="label">收藏</span>
                </NavLink>
              </li>
              <li>
                <NavLink className="nav-link" to="/create">
                  <span className="icon">➕</span>
                  <span className="label">建立活動</span>
                </NavLink>
              </li>
              <li>
                <NavLink className="nav-link" to="/settings">
                  <span className="icon">⚙️</span>
                  <span className="label">設定</span>
                </NavLink>
              </li>
            </>
          )}
        </ul>
      </nav>

      {/* 撐開器：把底部區塊推到最底 */}
      <div className="grow" />

      {/* 底部（登入前後切換；收合不留白） */}
      <nav className={`sidebar-bottom ${isOpen ? "show" : "hide"}`}>
        <ul className="nav-list">
          {!isAuthenticated ? (
            <>
              <li>
                <NavLink className="nav-link" to="/login">
                  <span className="icon">🔑</span>
                  <span className="label">登入</span>
                </NavLink>
              </li>
              <li>
                <NavLink className="nav-link" to="/register">
                  <span className="icon">🧾</span>
                  <span className="label">註冊</span>
                </NavLink>
              </li>
            </>
          ) : (
            <li>
              <button className="nav-link" onClick={handleLogout}>
                <span className="icon">🚪</span>
                <span className="label">登出</span>
              </button>
            </li>
          )}
        </ul>
      </nav>
    </aside>
  );
}
