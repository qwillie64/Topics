// src/pages/Home.jsx
// 說明：地圖滿版、上方搜尋與篩選、下方卡片滑動；資料來自 getEvents（不動 API）
// 強化：關鍵字/類別/城市/日期篩選、標準化事件欄位、marker 與卡片互動、收藏、z-index 與點擊外部關閉等
// 本次新增：城市正規化（台/臺/是否加市縣）＋ 城市下拉固定 22 縣市清單

import { MapContainer, TileLayer, Marker, Tooltip } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import "../styles/home.css";
import { useEffect, useRef, useState, useMemo } from "react";
import { getEvents } from "../api/events";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useLocation } from "react-router-dom";

import { useFavorites } from "../context/FavoritesContext";

// ========================
// 自訂 Marker 圖示
// ========================
const customIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

// ========================
// 小工具：字串包含 / 日期轉換
// ========================
const strIncludes = (txt, kw) =>
  (txt || "").toLowerCase().includes((kw || "").trim().toLowerCase());

const toDate = (v) => {
  if (!v) return null;
  const d = new Date(v);
  return isNaN(d) ? null : d;
};

// ========================
// 臺灣 22 縣市（標準顯示名稱）＋ 城市正規化
// ========================
const CITY_CANON = [
  "台北市", "新北市", "桃園市", "台中市", "台南市", "高雄市",
  "基隆市", "新竹市", "嘉義市",
  "新竹縣", "苗栗縣", "彰化縣", "南投縣", "雲林縣", "嘉義縣", "屏東縣",
  "宜蘭縣", "花蓮縣", "台東縣",
  "澎湖縣", "金門縣", "連江縣",
];

// 常見寫法 → 標準名稱
const cityAlias = new Map([
  // 六都
  ["台北", "台北市"], ["臺北", "台北市"], ["台北市", "台北市"], ["臺北市", "台北市"],
  ["新北", "新北市"], ["新北市", "新北市"],
  ["桃園", "桃園市"], ["桃園市", "桃園市"],
  ["台中", "台中市"], ["臺中", "台中市"], ["台中市", "台中市"], ["臺中市", "台中市"],
  ["台南", "台南市"], ["臺南", "台南市"], ["台南市", "台南市"], ["臺南市", "台南市"],
  ["高雄", "高雄市"], ["高雄市", "高雄市"],

  // 直轄/省轄市
  ["基隆", "基隆市"], ["基隆市", "基隆市"],
  ["新竹市", "新竹市"], ["嘉義市", "嘉義市"],

  // 縣
  ["新竹縣", "新竹縣"], ["新竹", "新竹縣"],    // 「新竹」未指明時預設縣
  ["苗栗", "苗栗縣"], ["苗栗縣", "苗栗縣"],
  ["彰化", "彰化縣"], ["彰化縣", "彰化縣"],
  ["南投", "南投縣"], ["南投縣", "南投縣"],
  ["雲林", "雲林縣"], ["雲林縣", "雲林縣"],
  ["嘉義縣", "嘉義縣"], ["嘉義", "嘉義縣"],   // 「嘉義」未指明時預設縣
  ["屏東", "屏東縣"], ["屏東縣", "屏東縣"],
  ["宜蘭", "宜蘭縣"], ["宜蘭縣", "宜蘭縣"],
  ["花蓮", "花蓮縣"], ["花蓮縣", "花蓮縣"],
  ["台東", "台東縣"], ["臺東", "台東縣"], ["台東縣", "台東縣"], ["臺東縣", "台東縣"],
  ["澎湖", "澎湖縣"], ["澎湖縣", "澎湖縣"],
  ["金門", "金門縣"], ["金門縣", "金門縣"],
  ["連江", "連江縣"], ["連江縣", "連江縣"],
]);

function canonCity(raw) {
  if (!raw) return "";
  // 去空白、全形空白、尾綴（市/縣/區）
  const s = String(raw).trim().replace(/\u3000/g, " ").replace(/\s+/g, "");
  if (cityAlias.has(s)) return cityAlias.get(s);
  const s2 = s.replace(/臺/g, "台");
  if (cityAlias.has(s2)) return cityAlias.get(s2);
  const s3 = s2.replace(/(市|縣|區)$/u, "");
  if (cityAlias.has(s3)) return cityAlias.get(s3);
  return s || "";
}

// ========================
// 活動資料正規化函式
// ========================
function normalizeEvent(e) {
  const lat = Number(e.latitude ?? e.lat ?? e?.location?.lat ?? e?.geo?.lat);
  const lng = Number(e.longitude ?? e.lng ?? e.lon ?? e?.location?.lng ?? e?.geo?.lng);
  const ev = {
    id: e.id ?? e.uuid ?? e._id ?? `${lat},${lng}`,
    name: e.name ?? e.title ?? "未命名活動",
    address: e.address ?? e.location?.address ?? e.place ?? "未提供",
    content: e.content ?? e.description ?? "",
    start: e.start ?? e.startDate ?? e?.days?.[0]?.start ?? "",
    end:   e.end   ?? e.endDate   ?? e?.days?.[0]?.end   ?? "",
    date:  e.date  ?? e?.days?.[0]?.date ?? "",
    tag:   e.tag ?? e.categoryName ?? e.type ?? "",
    _lat: lat, _lng: lng,
  };
  // 預組可搜尋字串，讓關鍵字比對更快
  ev._search = [ev.name, ev.content, ev.address, ev.tag].filter(Boolean).join(" ").toLowerCase();
  // ✅ 城市正規化（若 API 沒給就從地址抓第一段，再 canon）
  ev.city = canonCity(e.city ?? e?.location?.city ?? (ev.address.split(" ")[0] || ""));
  return ev;
}

export default function Home() {
  // ===== 既有狀態 =====
  const [events, setEvents] = useState([]);
  const [openFilter, setOpenFilter] = useState(null);
  const [dateRange, setDateRange] = useState([null, null]);
  const [clickedLatLng, setClickedLatLng] = useState(null);
  const [showClickPopup, setShowClickPopup] = useState(false);
  const [startDate, endDate] = dateRange;

  const { addToFavorites, removeFromFavorites, isFavorite } = useFavorites();

  const filterRef = useRef(null);
  const cardRefs = useRef({});
  const sliderRef = useRef(null);
  const mapRef = useRef(null);

  const { pathname } = useLocation();
  const isActive = (pathPrefix, exact = false) =>
    exact ? pathname === pathPrefix : pathname.startsWith(pathPrefix);

  // ===== 搜尋與篩選狀態 =====
  const [keyword, setKeyword] = useState("");
  const [selectedTag, setSelectedTag] = useState("");
  const [selectedCity, setSelectedCity] = useState("");

  // 載入活動資料（不動 API）
  useEffect(() => {
    getEvents()
      .then((data) => {
        const raw = Array.isArray(data) ? data : (data?.items ?? data?.data ?? []);
        const normalized = (raw ?? [])
          .map((e) => ({ ...normalizeEvent(e), expanded: false }))
          .filter((e) => Number.isFinite(e._lat) && Number.isFinite(e._lng));
        setEvents(normalized);
      })
      .catch((e) => {
        console.error("getEvents error:", e);
        setEvents([]);
      });
  }, []);

  // 產生「類別 / 城市」選項
  // 類別仍依現有資料動態去重
  const tagOptions = useMemo(
    () => Array.from(new Set(events.map((e) => e.tag).filter(Boolean))),
    [events]
  );
  // ✅ 城市固定為 22 縣市清單（不受目前資料量影響）
  const cityOptions = useMemo(() => CITY_CANON.slice(), []);

  // 地圖點擊提示
  const handleMapClick = (latlng) => {
    setClickedLatLng(latlng);
    setShowClickPopup(true);
    setTimeout(() => setShowClickPopup(false), 3000);
  };

  // 卡片滑動（左右箭頭）
  const scrollSlider = (direction) => {
    if (sliderRef.current) {
      const scrollAmount = 300;
      sliderRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  // 標記卡片 & 平滑捲動到視窗內
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

  // 地圖飛到活動座標
  const flyToEvent = (event) => {
    if (!mapRef.current) return;
    const target = [event._lat, event._lng];
    const zoom = Math.max(mapRef.current.getZoom?.() ?? 13, 15);
    mapRef.current.flyTo(target, zoom, { duration: 0.8 });
  };

  // 點擊外部關閉 dropdown
  useEffect(() => {
    const onDocClick = (e) => {
      if (!filterRef.current) return;
      if (!filterRef.current.contains(e.target)) setOpenFilter(null);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  // 收藏按鈕處理
  const handleFavoriteClick = (event) => {
    if (isFavorite(event.id)) {
      if (window.confirm(`確定要取消收藏「${event.name}」嗎？`)) {
        removeFromFavorites(event.id);
      }
    } else {
      addToFavorites(event);
    }
  };

  // ========================
  // 篩選核心：由 events -> filteredEvents
  // ========================
  const filteredEvents = useMemo(() => {
    return events.filter((ev) => {
      // 關鍵字（先用預組 _search，加上城市與 tag 強化）
      const passKeyword =
        !keyword ||
        ev._search.includes(keyword.trim().toLowerCase()) ||
        strIncludes(ev.city, keyword) ||
        strIncludes(ev.tag, keyword);

      // 類別（單選）
      const passTag = !selectedTag || ev.tag === selectedTag;

      // 城市（單選）— ev.city 已經 canon 過了，直接比對
      const passCity = !selectedCity || ev.city === selectedCity;

      // 日期（視為「事件期間」與選取區間有重疊即通過）
      const evStart = toDate(ev.start || ev.date || ev.end);
      const evEnd = toDate(ev.end || ev.start || ev.date || evStart);
      let passDate = true;
      if (startDate && endDate && (evStart || evEnd)) {
        const s = evStart || evEnd;
        const e = evEnd || evStart || s;
        passDate = e >= startDate && s <= endDate;
      } else if (startDate && !endDate && (evStart || evEnd)) {
        const s = evStart || evEnd;
        passDate = s >= startDate;
      } else if (!startDate && endDate && (evStart || evEnd)) {
        const e = evEnd || evStart || endDate;
        passDate = e <= endDate;
      }

      return passKeyword && passTag && passCity && passDate;
    });
  }, [events, keyword, selectedTag, selectedCity, startDate, endDate]);

  return (
    <div className="home-container">
      <div className="main-content">
        <div className="home-main">
          {/* ===== 搜尋欄 ===== */}
          <div className="search-bar">
            {/* 關鍵字輸入 */}
            <div className="search-input">
              <input
                type="text"
                placeholder="輸入關鍵字（活動、地點、城市、標籤）"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
              />
              {/* 這顆按鈕可保留空動作（單靠即時輸入即可）或加入 GA 事件 */}
              <button onClick={() => { /* 可加入分析事件 */ }}>搜尋</button>
            </div>

            {/* ===== 篩選列（Pills + Dropdown） ===== */}
            <div className="filters" ref={filterRef}>
              {/* 類別 */}
              <div className="filter-group">
                <div
                  className="filter-trigger"
                  onClick={() => setOpenFilter(openFilter === "category" ? null : "category")}
                >
                  {selectedTag || "類別"}
                </div>
                {openFilter === "category" && (
                  <div className="filter-panel">
                    <div className="panel-row">
                      <select
                        value={selectedTag}
                        onChange={(e) => setSelectedTag(e.target.value)}
                      >
                        <option value="">全部類別</option>
                        {tagOptions.map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="filter-actions">
                      <button onClick={() => setSelectedTag("")}>清除</button>
                      <button onClick={() => setOpenFilter(null)}>完成</button>
                    </div>
                  </div>
                )}
              </div>

              {/* 城市 */}
              <div className="filter-group">
                <div
                  className="filter-trigger"
                  onClick={() => setOpenFilter(openFilter === "city" ? null : "city")}
                >
                  {selectedCity || "城市"}
                </div>
                {openFilter === "city" && (
                  <div className="filter-panel">
                    <div className="panel-row">
                      <select
                        value={selectedCity}
                        onChange={(e) => setSelectedCity(e.target.value)}
                      >
                        <option value="">全部城市</option>
                        {cityOptions.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="filter-actions">
                      <button onClick={() => setSelectedCity("")}>清除</button>
                      <button onClick={() => setOpenFilter(null)}>完成</button>
                    </div>
                  </div>
                )}
              </div>

              {/* 日期 */}
              <div className="filter-group">
                <div
                  className="filter-trigger"
                  onClick={() => setOpenFilter(openFilter === "date" ? null : "date")}
                >
                  {startDate && endDate
                    ? `${startDate.toLocaleDateString()} ~ ${endDate.toLocaleDateString()}`
                    : "日期"}
                </div>
                {openFilter === "date" && (
                  <div className="filter-panel">
                    <div className="panel-row" style={{ width: 260 }}>
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
                    <div className="filter-actions">
                      <button onClick={() => setDateRange([null, null])}>清除</button>
                      <button onClick={() => setOpenFilter(null)}>完成</button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ===== 地圖 ===== */}
          <MapContainer
            center={[25.033964, 121.564468]}
            zoom={13}
            style={{ height: "80vh", width: "100%" }}  // 會被 .map 的 height:100% 覆蓋
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

            {/* Marker + Tooltip：改用 filteredEvents */}
            {filteredEvents.map((event) => (
              <Marker
                key={event.id}
                position={[event._lat, event._lng]}
                icon={customIcon}
                eventHandlers={{ click: () => focusCard(event.id) }}
              >
                <Tooltip direction="top" offset={[0, -20]} opacity={1}>
                  <strong>{event.name}</strong>
                </Tooltip>
              </Marker>
            ))}
          </MapContainer>

          {/* 點地圖提示 */}
          {showClickPopup && clickedLatLng && (
            <div
              style={{
                position: "absolute",
                zIndex: 1100,
                bottom: "110px",
                left: "50%",
                transform: "translateX(-50%)",
                background: "#333",
                color: "#fff",
                padding: "6px 10px",
                borderRadius: 6,
                boxShadow: "0 2px 8px rgba(0,0,0,0.25)",
                fontSize: 13,
                opacity: 0.95,
              }}
            >
              已點選座標：{clickedLatLng.lat.toFixed(5)}, {clickedLatLng.lng.toFixed(5)}
            </div>
          )}

          {/* ===== 地圖下方滑動活動資訊：改用 filteredEvents ===== */}
          <div className="event-slider-container">
            <button className="slider-arrow left" onClick={() => scrollSlider("left")}>
              ◀
            </button>

            <div className="event-slider" ref={sliderRef}>
              {filteredEvents.map((event) => (
                <div
                  key={event.id}
                  ref={(el) => (cardRefs.current[event.id] = el)}
                  className="event-card"
                  onClick={() => flyToEvent(event)}
                  title="點我讓地圖飛到這個活動"
                >
                  {/* 收藏按鈕 */}
                  <button
                    className={`favorite-btn ${isFavorite(event.id) ? "favorited" : ""}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleFavoriteClick(event);
                    }}
                  >
                    {isFavorite(event.id) ? "★" : "☆"}
                  </button>

                  <div className="event-name">{event.name}</div>
                  <div className="event-info">地址：{event.address}</div>
                  <div className="event-info">
                    日期：
                    {event.date
                      ? `${event.date} ${event.start || ""} - ${event.end || ""}`
                      : event.start && event.end
                      ? `${event.start} - ${event.end}`
                      : "未提供"}
                  </div>

                  <div className="event-info event-content-wrapper">
                    {event.expanded ? (
                      <div className="event-content-text">
                        內容：{event.content}
                        <span
                          className="event-content-collapse"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEvents((prev) =>
                              prev.map((x) => (x.id === event.id ? { ...x, expanded: false } : x))
                            );
                          }}
                        >
                          收合
                        </span>
                      </div>
                    ) : (
                      <div className="event-content-text">
                        內容：{event.content ? `${event.content.slice(0, 50)}...` : ""}
                        <span
                          className="event-content-expand"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEvents((prev) =>
                              prev.map((x) => (x.id === event.id ? { ...x, expanded: true } : x))
                            );
                          }}
                        >
                          展開
                        </span>
                      </div>
                    )}
                  </div>

                  {event.tag && (
                    <span
                      style={{
                        display: "inline-block",
                        marginTop: 5,
                        padding: "2px 6px",
                        backgroundColor:
                          event.tag === "演唱會"
                            ? "#dc3545"
                            : event.tag === "市集"
                            ? "#28a745"
                            : event.tag === "展覽"
                            ? "#007bff"
                            : "#6c757d",
                        color: "#fff",
                        borderRadius: 6,
                        fontSize: 12,
                      }}
                    >
                      {event.tag}
                    </span>
                  )}
                </div>
              ))}
            </div>

            <button className="slider-arrow right" onClick={() => scrollSlider("right")}>
              ▶
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
