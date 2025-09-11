// MapView.jsx - 使用 Leaflet 建立可互動地圖與標記
import React from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "../styles/map.css";

// 假資料：可換成後端資料
const sampleLocations = [
  {
    id: 1,
    name: "台北市立大安森林公園",
    description: "音樂活動：春季音樂節",
    lat: 25.033964,
    lng: 121.564472,
  },
  {
    id: 2,
    name: "台北101",
    description: "高空攝影展",
    lat: 25.034153,
    lng: 121.562321,
  },
  {
    id: 3,
    name: "國父紀念館",
    description: "戶外電影放映",
    lat: 25.041782,
    lng: 121.561022,
  },
];

export default function MapView() {
  return (
    <div className="map-container">
     <MapContainer center={[25.033964, 121.564468]} zoom={13} style={{ height: "80vh", width: "100%" }}>
  <TileLayer
    attribution="&copy; OpenStreetMap"
    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
  />
</MapContainer>

    </div>
  );
}
