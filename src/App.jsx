// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import AppLayout from "./layouts/AppLayout";
import Home from "./pages/Home";
import Favorites from "./pages/Favorites";
import EventCreate from "./pages/EventCreate";
import Settings from "./pages/Settings";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Apply from "./pages/Apply";
import VerifyEmail from "./pages/VerifyEmail";

import ErrorBoundary from "./components/ErrorBoundary";
import { FavoritesProvider } from "./context/FavoritesContext.jsx";

// ✅ 新增：登入狀態與頂部訊息視窗
import { AuthProvider } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";

// ✅ 新增：路由守衛（需登入 / 訪客限定）
import RequireAuth from "./components/RequireAuth";
import GuestOnly from "./components/GuestOnly";

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <FavoritesProvider>
          <ToastProvider>
            <Router>
              <Routes>
                {/* 共用版型 */}
                <Route element={<AppLayout />}>
                  <Route path="/" element={<Home />} />

                  {/* 需登入頁 */}
                  <Route
                    path="/favorites"
                    element={
                      <RequireAuth>
                        <Favorites />
                      </RequireAuth>
                    }
                  />
                  <Route
                    path="/create"
                    element={
                      <RequireAuth>
                        <EventCreate />
                      </RequireAuth>
                    }
                  />
                  <Route
                    path="/settings"
                    element={
                      <RequireAuth>
                        <Settings />
                      </RequireAuth>
                    }
                  />

                  {/* 不強制登入（你原本就有的頁） */}
                  <Route path="/apply" element={<Apply />} />
                </Route>

                {/* 訪客限定（已登入就導回首頁） */}
                <Route
                  path="/login"
                  element={
                    <GuestOnly>
                      <Login />
                    </GuestOnly>
                  }
                />
                <Route
                  path="/register"
                  element={
                    <GuestOnly>
                      <Register />
                    </GuestOnly>
                  }
                />

                {/* 驗證結果頁（獨立，不套 Layout） */}
                <Route path="/verify-email" element={<VerifyEmail />} />

                {/* 404 */}
                <Route path="*" element={<div>Not Found</div>} />
              </Routes>
            </Router>
          </ToastProvider>
        </FavoritesProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
