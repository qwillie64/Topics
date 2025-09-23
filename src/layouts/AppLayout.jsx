import { Outlet } from "react-router-dom";
import { useState } from "react";
import Sidebar from "../components/Sidebar";
import "../styles/Home.css"; // 使用同一套版面配置（sidebar + main-content）

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="home-container">
      {/* 左側導覽列（共用） */}
      <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(v => !v)} />

      {/* 右側主內容：各頁會渲染在這裡 */}
      <div className="main-content">
        <Outlet />
      </div>
    </div>
  );
}
