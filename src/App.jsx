import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AppLayout from "./layouts/AppLayout";
import Home from "./pages/Home";
import Favorites from "./pages/Favorites";
import EventCreate from "./pages/EventCreate";
import Settings from "./pages/Settings";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Apply from "./pages/Apply";
import ErrorBoundary from "./components/ErrorBoundary";
import { FavoritesProvider } from "./context/FavoritesContext.jsx";

export default function App() {
  return (
    <FavoritesProvider>
      <ErrorBoundary>
        <Router>  {/* 只在這裡使用 Router */}
          <Routes>
            <Route element={<AppLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/favorites" element={<Favorites />} />
              <Route path="/create" element={<EventCreate />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/apply" element={<Apply />} />
            </Route>

            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Routes>
        </Router>
      </ErrorBoundary>
    </FavoritesProvider>
  );
}
