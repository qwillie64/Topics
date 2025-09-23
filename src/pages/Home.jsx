// src/pages/Home.jsx
import { MapContainer, TileLayer, Marker, Tooltip } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import "../styles/Home.css";
import { useEffect, useRef, useState } from "react";
import { getEvents } from "../api/events";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Link, NavLink, useLocation } from "react-router-dom";

// ========================
// 自訂 Marker 圖示
// ========================
const customIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

// ========================
// 活動資料正規化函式
// ========================
function normalizeEvent(e) {
  const lat = Number(e.latitude ?? e.lat ?? e?.location?.lat ?? e?.geo?.lat);
  const lng = Number(e.longitude ?? e.lng ?? e.lon ?? e?.location?.lng ?? e?.geo?.lng);
  return {
    id: e.id ?? e.uuid ?? e._id ?? `${lat},${lng}`,
    name: e.name ?? e.title ?? "未命名活動",
    address: e.address ?? e.location?.address ?? e.place ?? "未提供",
    content: e.content ?? e.description ?? "",
    start: e.start ?? e.startDate ?? e?.days?.[0]?.start ?? "",
    end:   e.end   ?? e.endDate   ?? e?.days?.[0]?.end   ?? "",
    date:  e.date  ?? e?.days?.[0]?.date ?? "",
    tag:   e.tag ?? e.categoryName ?? e.type,
    _lat: lat, _lng: lng,
  };
}

export default function Home() {
  // ========================
  // State
  // ========================
  const [events, setEvents] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [openFilter, setOpenFilter] = useState(null);
  const [dateRange, setDateRange] = useState([null, null]);
  const [clickedLatLng, setClickedLatLng] = useState(null);
  const [showClickPopup, setShowClickPopup] = useState(false);
  const [startDate, endDate] = dateRange;

  // ========================
  // Refs
  // ========================
  const filterRef = useRef(null);
  const cardRefs = useRef({});
  const sliderRef = useRef(null);
  const mapRef = useRef(null);

  // 目前路徑（用來讓 li 套用 .active）
  const { pathname } = useLocation();
  const isActive = (pathPrefix, exact = false) =>
    exact ? pathname === pathPrefix : pathname.startsWith(pathPrefix);

  // ========================
  // 載入活動資料
  // ========================
  useEffect(() => {
    getEvents()
      .then((data) => {
        const raw = Array.isArray(data) ? data : (data?.items ?? data?.data ?? []);
        const normalized = (raw ?? []).map(normalizeEvent)
          .filter(e => Number.isFinite(e._lat) && Number.isFinite(e._lng));
        setEvents(normalized);
      })
      .catch((e) => { console.error("getEvents error:", e); setEvents([]); });
  }, []);

  // ========================
  // 點地圖 → 提示 3 秒
  // ========================
  const handleMapClick = (latlng) => {
    setClickedLatLng(latlng);
    setShowClickPopup(true);
    setTimeout(() => setShowClickPopup(false), 3000);
  };

  // ========================
  // 左右滑動卡片
  // ========================
  const scrollSlider = (direction) => {
    if (sliderRef.current) {
      const scrollAmount = 300;
      sliderRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  // ========================
  // 點 Marker → 捲到對應卡片並高亮
  // ========================
  const focusCard = (id) => {
    const el = cardRefs.current[id];
    if (!el || !sliderRef.current) return;
    const slider = sliderRef.current;
    const { left: sLeft } = slider.getBoundingClientRect();
    const { left: cLeft } = el.getBoundingClientRect();
    const delta = cLeft - sLeft - 20;
    slider.scrollBy({ left: delta, behavior: "smooth" });
    el.classList.add("highlight-card");
    setTimeout(() => el.classList.remove("highlight-card"), 1200);
  };

  // ========================
  // 點卡片 → 地圖飛到該活動位置
  // ========================
  const flyToEvent = (event) => {
    if (!mapRef.current) return;
    const target = [event._lat, event._lng];
    const zoom = Math.max(mapRef.current.getZoom?.() ?? 13, 15);
    mapRef.current.flyTo(target, zoom, { duration: 0.8 });
  };

  // ========================
  // 點擊外面 → 收合篩選下拉
  // ========================
  useEffect(() => {
    const onDocClick = (e) => {
      if (!filterRef.current) return;
      if (!filterRef.current.contains(e.target)) setOpenFilter(null);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  return (
    <div className="home-container">
      {/* 主內容區域（地圖 + 搜尋 + 卡片） */}
      <div className="main-content">
        <div className="home-main">
          {/* 搜尋欄 */}
          <div className="search-bar">
            <input type="text" placeholder="搜尋活動..." className="search-input" />
            <div className="filter-buttons" ref={filterRef}>
              {/* 類別 */}
              <div className="filter-group">
                <button
                  className="filter-pill"
                  onClick={() => setOpenFilter(openFilter === "category" ? null : "category")}
                >
                  類別
                </button>
                {openFilter === "category" && (
                  <div className="filter-dropdown">
                    <div className="dropdown-option">演唱會</div>
                    <div className="dropdown-option">市集</div>
                    <div className="dropdown-option">展覽</div>
                  </div>
                )} 
              </div>

              {/* 城市 */}
              <div className="filter-group">
                <button
                  className="filter-pill"
                  onClick={() => setOpenFilter(openFilter === "city" ? null : "city")}
                >
                  城市
                </button>
                {openFilter === "city" && (
                  <div className="filter-dropdown">
                    <div className="dropdown-option">台北</div>
                    <div className="dropdown-option">新北</div>
                    <div className="dropdown-option">台中</div>
                  </div>
                )}
              </div>

              {/* 日期 */}
              <div className="filter-group">
                <button
                  className="filter-pill"
                  onClick={() => setOpenFilter(openFilter === "date" ? null : "date")}
                >
                  日期
                </button>
                {openFilter === "date" && (
                  <div className="calendar-dropdown">
                    <DatePicker
                      selectsRange
                      startDate={startDate}
                      endDate={endDate}
                      onChange={(update) => setDateRange(update)}
                      isClearable
                      dateFormat="yyyy/MM/dd"
                      inline
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 地圖 */}
          <MapContainer
            center={[25.033964, 121.564468]}
            zoom={13}
            style={{ height: "80vh", width: "100%" }}
            className="map"
            whenCreated={(map) => {
              mapRef.current = map;
              map.on("click", (e) => handleMapClick(e.latlng));
            }}
          >
            <TileLayer
              attribution="&copy; OpenStreetMap"
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* Marker + Tooltip */}
            {events.map((event) => (
              <Marker
                key={event.id}
                position={[event._lat, event._lng]}
                icon={customIcon}
                eventHandlers={{ click: () => focusCard(event.id) }}
              >
                <Tooltip direction="top" offset={[0, -20]} opacity={1}>
                  <div>
                    <strong>{event.name}</strong><br />
                    🗓 {event.date
                          ? `${event.date} ${event.start || ""} - ${event.end || ""}`
                          : (event.start && event.end) ? `${event.start} - ${event.end}` : "未提供"}<br />
                    📍 {event.address}<br />
                    📖 {event.content}
                </div>
                </Tooltip>
              </Marker>
            ))}
          </MapContainer>

          {/* 點地圖提示 */}
          {showClickPopup && clickedLatLng && (
            <div style={{
              position: "absolute", zIndex: 1100, bottom: "110px", left: "50%", transform: "translateX(-50%)",
              background: "#333", color: "#fff", padding: "6px 10px", borderRadius: 6,
              boxShadow: "0 2px 8px rgba(0,0,0,0.25)", fontSize: 13, opacity: 0.95
            }}>
              已點選座標：{clickedLatLng.lat.toFixed(5)}, {clickedLatLng.lng.toFixed(5)}
            </div>
          )}

          {/* 地圖下方滑動活動資訊 */}
          <div className="event-slider-container">
            {/* 左箭頭 */}
            <button className="slider-arrow left" onClick={() => scrollSlider("left")}>◀</button>

            {/* 卡片滑軌 */}
            <div className="event-slider" ref={sliderRef}>
              {events.map((event) => (
                <div
                  key={event.id}
                  ref={(el) => (cardRefs.current[event.id] = el)}
                  className="event-card"
                  onClick={() => flyToEvent(event)}
                  title="點我讓地圖飛到這個活動"
                >
                  <div className="event-name">{event.name}</div>
                  <div className="event-info">地址：{event.address}</div>
                  <div className="event-info">
                    日期：
                    {event.date
                      ? `${event.date} ${event.start || ""} - ${event.end || ""}`
                      : (event.start && event.end) ? `${event.start} - ${event.end}` : "未提供"}
                  </div>
                  <div className="event-info">內容：{event.content}</div>
                  {event.tag && (
                    <span style={{
                      display:"inline-block", marginTop:5, padding:"2px 6px",
                      backgroundColor: event.tag==="演唱會" ? "#dc3545" :
                                       event.tag==="市集" ? "#28a745" :
                                       event.tag==="展覽" ? "#007bff" : "#6c757d",
                      color:"#fff", borderRadius:6, fontSize:12
                    }}>
                      {event.tag}
                    </span>
                  )}
                </div>
              ))}
            </div>

            {/* 右箭頭 */}
            <button className="slider-arrow right" onClick={() => scrollSlider("right")}>▶</button>
          </div>
        </div>
      </div>
    </div>
  );
}
