import React, { useState } from "react";
import "../styles/Favorites.css";
import { useFavorites } from "../context/FavoritesContext";

export default function Favorites() {
  const { favorites, removeFromFavorites } = useFavorites();
  const [expandedEvents, setExpandedEvents] = useState({});

  // 切換展開/收合
  const toggleExpand = (id) => {
    setExpandedEvents((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // 處理取消收藏
  const handleRemove = (event) => {
    if (window.confirm("確定要取消收藏嗎？")) {
      removeFromFavorites(event.id);
    }
  };

  return (
    <div className="favorites-container">
      <h2>我的收藏</h2>

      {favorites.length === 0 ? (
        <p className="empty-text">目前沒有收藏的活動</p>
      ) : (
        <div className="favorites-list">
          {favorites.map((event) => (
            <div key={event.id} className="favorite-card">
              {/* 卡片頂部：活動名稱 + 取消收藏按鈕 */}
              <div className="card-header">
                <div className="event-name">{event.name}</div>
                <button
                  className="remove-btn"
                  onClick={() => handleRemove(event)}
                >
                  取消收藏
                </button>
              </div>

              {/* 活動資訊 */}
              <div className="event-info">地址：{event.address || event.place}</div>
              <div className="event-info">
                日期：{event.date
                  ? `${event.date} ${event.start || ""} - ${event.end || ""}`
                  : event.start && event.end
                  ? `${event.start} - ${event.end}`
                  : "未提供"}
              </div>

              {/* 活動內容 + 展開/收合 */}
              <div className="event-info event-content-wrapper">
                <span className={`event-content-text`}>
                  內容：
                  <span
                    className={`event-content-preview ${
                      expandedEvents[event.id] ? "expanded" : ""
                    }`}
                  >
                    {expandedEvents[event.id]
                      ? event.content
                      : event.content.length > 50
                      ? event.content.slice(0, 50) + "..."
                      : event.content}
                  </span>
                  <span
                    className="event-content-expand"
                    onClick={() => toggleExpand(event.id)}
                  >
                    {expandedEvents[event.id] ? "收合" : "展開"}
                  </span>
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
