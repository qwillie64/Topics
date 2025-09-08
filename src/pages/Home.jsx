import { MapContainer, TileLayer, Marker, Tooltip, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import "../styles/Home.css";
import eventData from "../data/randomEvent.json";
import { useEffect, useRef, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

// 自訂 Marker 圖示
const customIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

// 用於點擊地圖取得座標的組件
function ClickMarker({ onClickMap }) {
  useMapEvents({
    click(e) {
      onClickMap(e.latlng);
    },
  });
  return null;
}

function Home() {
  const [events, setEvents] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activePage, setActivePage] = useState("activity");
  const [openFilter, setOpenFilter] = useState(null);
  const [dateRange, setDateRange] = useState([null, null]);
  const [clickedLatLng, setClickedLatLng] = useState(null);
  const [showClickPopup, setShowClickPopup] = useState(false);
  const [startDate, endDate] = dateRange;
  const filterRef = useRef(null);
  const cardRefs = useRef({});
  const sliderRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setOpenFilter(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleMapClick = (latlng) => {
    setClickedLatLng(latlng);
    setShowClickPopup(true);
    setTimeout(() => setShowClickPopup(false), 3000); // 3秒後自動關閉
  };

  const scrollSlider = (direction) => {
    if (sliderRef.current) {
      const scrollAmount = 300; // 每次移動 300px
      sliderRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="home-container">
      {/* 側邊欄 */}
      <div className={`sidebar ${sidebarOpen ? "open" : "collapsed"}`}>
        <div className="sidebar-header">
          {sidebarOpen && <span className="sidebar-title">導覽</span>}
          <button className="toggle-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>☰</button>
        </div>
        {sidebarOpen && (
          <>
            <ul className="nav-list">
              <li className={activePage === "activity" ? "active" : ""} onClick={() => setActivePage("activity")}>活動列表</li>
              <li className={activePage === "favorites" ? "active" : ""} onClick={() => setActivePage("favorites")}>我的收藏</li>
              <li className={activePage === "settings" ? "active" : ""} onClick={() => setActivePage("settings")}>設定</li>
            </ul>
            <div className="auth-links">
              <a href="Login">登入</a>
              <a href="Register">註冊</a>
            </div>
          </>
        )}
      </div>

      {/* 主內容區域 */}
      <div className="main-content">
        {/* 搜尋欄 */}
        <div className="search-bar">
          <input type="text" placeholder="搜尋活動..." className="search-input" />
          <div className="filter-buttons" ref={filterRef}>
            <div className="filter-group">
              <button className="filter-pill" onClick={() => setOpenFilter(openFilter === "category" ? null : "category")}>類別</button>
              {openFilter === "category" && (
                <div className="filter-dropdown">
                  <div className="dropdown-option">演唱會</div>
                  <div className="dropdown-option">市集</div>
                  <div className="dropdown-option">展覽</div>
                </div>
              )}
            </div>
            <div className="filter-group">
              <button className="filter-pill" onClick={() => setOpenFilter(openFilter === "city" ? null : "city")}>城市</button>
              {openFilter === "city" && (
                <div className="filter-dropdown">
                  <div className="dropdown-option">台北</div>
                  <div className="dropdown-option">新北</div>
                  <div className="dropdown-option">台中</div>
                </div>
              )}
            </div>
            <div className="filter-group">
              <button className="filter-pill" onClick={() => setOpenFilter(openFilter === "date" ? null : "date")}>日期</button>
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
        >
          <TileLayer
            attribution='&copy; OpenStreetMap'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <ClickMarker onClickMap={handleMapClick} />

          {eventData.map((event) => (
            <Marker
              key={event.id}
              position={[event.latitude, event.longitude]}
              icon={customIcon}
              eventHandlers={{
                click: () => {
                  const card = cardRefs.current[event.id];
                  if (card) {
                    card.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
                    card.classList.add("highlight-card");
                    setTimeout(() => {
                      card.classList.remove("highlight-card");
                    }, 2000);
                  }
                },
              }}
            >
              <Tooltip direction="top" offset={[0, -20]} opacity={1}>
                <div>
                  <strong>{event.name}</strong><br />
                  {event.content}<br />
                  {event.address}
                </div>
              </Tooltip>
            </Marker>
          ))}
        </MapContainer>

        {/* 地圖下方滑動活動資訊 */}
        <div className="event-slider-container">
          {/* 左箭頭 */}
          <button className="slider-arrow left" onClick={() => scrollSlider("left")}>
            ◀
          </button>

          {/* 卡片滾動區域 */}
          <div className="event-slider" ref={sliderRef}>
            {eventData.map((event) => (
              <div
                key={event.id}
                ref={(el) => (cardRefs.current[event.id] = el)}
                className="event-card"
              >
                <div className="event-name">{event.name}</div>
                <div className="event-info">地址：{event.address}</div>
                <div className="event-info">
                  日期：
                  {event.days && event.days.length > 0
                    ? `${event.days[0].date} ${event.days[0].start} - ${event.days[0].end}`
                    : "未提供"}
                </div>
                <div className="event-info">內容：{event.content}</div>
              </div>
            ))}
          </div>

          {/* 右箭頭 */}
          <button className="slider-arrow right" onClick={() => scrollSlider("right")}>
            ▶
          </button>
        </div>
      </div>
    </div>
  );
}

export default Home;
