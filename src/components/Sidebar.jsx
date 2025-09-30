import { NavLink, Link } from "react-router-dom";
import "../styles/Home.css"; // 繼續沿用

export default function Sidebar({ isOpen, onToggle }) {
  return (
    <div className={`sidebar ${isOpen ? "open" : "collapsed"}`}>
      {/* 上方標題 & 漢堡按鈕 */}
      <div className="sidebar-header">
        {isOpen && <span className="sidebar-title">導覽</span>}
        <button className="toggle-btn" onClick={onToggle}>☰</button>
      </div>

      {/* 內容區：整個包起來做收合動畫 */}
      <div className={`sidebar-content ${isOpen ? "show" : "hide"}`}>
        <ul className="nav-list">
          <li>
            <NavLink 
              to="/" 
              end 
              className={({isActive}) => isActive ? "nav-link active" : "nav-link"}
            >
              活動列表
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="/favorites" 
              className={({isActive}) => isActive ? "nav-link active" : "nav-link"}
            >
              我的收藏
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="/create" 
              className={({isActive}) => isActive ? "nav-link active" : "nav-link"}
            >
              新增活動
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="/settings" 
              className={({isActive}) => isActive ? "nav-link active" : "nav-link"}
            >
              設定
            </NavLink>
          </li>
        </ul>

        {/* 底部登入註冊 */}
        <div className="auth-links">
          <Link to="/login">登入</Link>
          <Link to="/register">註冊</Link>
        </div>
      </div>
    </div>
  );
}
