import { Routes, Route } from "react-router-dom";
import AppLayout from "./layouts/AppLayout";

import Home from "./pages/Home";
import Settings from "./pages/Settings";
import Apply from "./pages/Apply";
import EventCreate from "./pages/EventCreate";
import Login from "./pages/Login";
import Register from "./pages/Register";
// 可選：你的錯誤邊界
import ErrorBoundary from "./components/ErrorBoundary";

export default function App() {
  return (
    <ErrorBoundary>
      <Routes>
        {/* 這組路由都會自動有 Sidebar（因為被 AppLayout 包住） */}
        <Route element={<AppLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/favorites" element={<div style={{padding:16}}>（TODO）我的收藏頁</div>} />
          <Route path="/create" element={<EventCreate />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/apply" element={<Apply />} />
        </Route>

        {/* 不需要 Sidebar 的頁面放外面 */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* 可選：未知路徑導回首頁 */}
        {/* <Route path="*" element={<Home />} /> */}
      </Routes>
    </ErrorBoundary>
  );
}
