# Example usage (React + Vite)

> 假設你的專案根目錄是 `C:\Users\MA302\Topics`，並已把本文件夾放在 `C:\Users\MA302\Topics\api`。

## 1) 安裝依賴
```bash
npm i axios
```

## 2) 設定 API Base URL (選用)
在專案根目錄建立 `.env.local`：
```
VITE_API_BASE_URL=http://localhost:5001
```
不設定也可以，預設就是 `http://localhost:5001`。

## 3) 在程式中呼叫
```ts
// src/pages/EventsPage.tsx
import { useEffect, useState } from "react";
import { searchEvents, createEvent, deleteEvent, getMe, type EventItem } from "../../api";

export default function EventsPage() {
  const [events, setEvents] = useState<EventItem[]>([]);

  useEffect(() => {
    // 條件查詢 (範例同你提供的 query)
    searchEvents({
      keyword: "音樂會",
      category: [1, 2],
      tag: 4,
      start: "2025-04-25",
      end: "2025-04-26",
    })
      .then((res: any) => {
        const items = Array.isArray(res) ? res : res.items;
        setEvents(items ?? []);
      })
      .catch((e) => console.error(e));
  }, []);

  return (
    <div>
      <h1>Events</h1>
      <pre>{JSON.stringify(events, null, 2)}</pre>
    </div>
  );
}
```

## 4) 其他端點
```ts
import { getEvents, createEvent, deleteEvent } from "../../api";

// 取得所有活動
const list = await getEvents();

// 新增活動
const created = await createEvent({
  title: "校園音樂祭",
  start: "2025-05-01T12:00:00+08:00",
  end: "2025-05-01T18:00:00+08:00",
  categories: [1, 2],
  tags: [4],
});

// 刪除活動
await deleteEvent("61b79c27-4a07-4685-bd72-ee91d8e8f468");
```

## 5) 登入/登出/註冊/驗證
```ts
import { login, logout, getMe, register } from "../../api";

await register({ username: "demo", password: "pass123", email: "demo@example.com" });
await login({ username: "demo", password: "pass123" });

const me = await getMe(); // 需要伺服器回傳 cookie 或 token

await logout();
```
