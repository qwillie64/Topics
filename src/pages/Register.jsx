import "../styles/global.css";
import "../styles/register.css";
import { Link } from "react-router-dom";

export default function Register() {
  return (
    <div className="auth-container">
      <div className="auth-box">
        <h1 className="logo">活動地圖</h1>
        <h2>註冊</h2>
        <form>
          
          <input type="text" className="input-field" placeholder="用戶名稱" required />
          <input type="email" className="input-field" placeholder="電子郵件" required />
          <input type="tel" className="input-field" placeholder="手機號碼" required />
          <input type="password" className="input-field" placeholder="密碼" required />

          {/* ✅ 包一層讓按鈕跟切換連結都在一起，且靠右 */}
          <div className="form-footer">
            <button type="submit" className="auth-button">註冊</button>
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
