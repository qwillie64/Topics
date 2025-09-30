// src/pages/Favorites.jsx
import React, { useState } from "react";
import "../styles/Favorites.css";
import { useFavorites } from "../context/FavoritesContext";

export default function Favorites() {
  const { favorites, removeFromFavorites, addToFavorites, isFavorite } = useFavorites();
  const [expandedEvents, setExpandedEvents] = useState({}); // 用來控制每個卡片展開/收合

  const toggleExpand = (id) => {
    setExpandedEvents((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleFavoriteClick = (event) => {
    if (isFavorite(event.id)) {
      if (window.confirm("確定要取消收藏嗎？")) {
        removeFromFavorites(event.id);
      }
    } else {
      addToFavorites(event);
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

              <div style={{ flex: 1 }}>
                <div className="event-name">{event.name}</div>
                <div className="event-info">地址：{event.address || event.place}</div>
                <div className="event-info">
                  日期：
                  {event.date
                    ? `${event.date} ${event.start || ""} - ${event.end || ""}`
                    : event.start && event.end
                    ? `${event.start} - ${event.end}`
                    : "未提供"}
                </div>
                <div className="event-info event-content-wrapper">
                  {expandedEvents[event.id] ? (
                    <div className="event-content-text">
                      內容：{event.content}
                      <span
                        className="event-content-collapse"
                        onClick={() => toggleExpand(event.id)}
                      >
                        收合
                      </span>
                    </div>
                  ) : (
                    <div className="event-content-text">
                      內容：{event.content ? `${event.content.slice(0, 50)}...` : ""}
                      <span
                        className="event-content-expand"
                        onClick={() => toggleExpand(event.id)}
                      >
                        展開
                      </span>
                    </div>
                  )}
                </div>
                <button className="remove-btn" onClick={() => handleRemove(event)}>
                  取消收藏
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
