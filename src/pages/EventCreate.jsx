// src/pages/EventCreate.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "../styles/EventCreate.css";

/**
 * 活動建立表單（localStorage 草稿；提交時再串 API）
 * 日期/時間：改為「開始/結束各一個按鈕」，點擊後才顯示日曆/下拉式時間
 */

const LS_KEY = "eventCreateDraft";
const CATEGORIES = ["演唱會", "市集", "展覽", "講座", "運動", "其他"];
const CITIES = ["台北", "新北", "桃園", "台中", "台南", "高雄", "新竹", "基隆", "宜蘭", "花蓮", "台東"];
const CURRENCIES = ["TWD", "USD", "JPY"];

const defaultEvent = {
  // 基本資訊
  name: "",
  content: "",
  category: "演唱會",
  tag: "",

  // 地點與日期/時間
  city: "台北",
  address: "",
  dateStart: null, // Date
  dateEnd: null,   // Date
  startTime: null, // Date（只用到時分）
  endTime: null,   // Date（只用到時分）

  // 圖片 / 連結
  coverUrl: "",
  externalUrl: "",

  // 票務
  priceType: "free",
  price: "",
  currency: "TWD",
  capacity: "",

  // 其他
  isPublic: true,
};

export default function EventCreate({ onBack }) {
  /* ========================
     狀態
     ======================== */
  const [form, setForm] = useState(defaultEvent);
  const [errors, setErrors] = useState({});
  const [savedAt, setSavedAt] = useState(null);
  const [justSaved, setJustSaved] = useState(false);

  // 彈窗控制（日期 & 時間）
  const [openDate, setOpenDate] = useState({ start: false, end: false });
  const [openTime, setOpenTime] = useState({ start: false, end: false });

  const timeStartRef = useRef(null);
  const timeEndRef   = useRef(null);

  /* ========================
     載入草稿
     ======================== */
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      const revived = {
        ...defaultEvent,
        ...parsed,
        dateStart: parsed.dateStart ? new Date(parsed.dateStart) : null,
        dateEnd: parsed.dateEnd ? new Date(parsed.dateEnd) : null,
        startTime: parsed.startTime ? new Date(parsed.startTime) : null,
        endTime: parsed.endTime ? new Date(parsed.endTime) : null,
      };
      setForm(revived);
    } catch { /* noop */ }
  }, []);

  /* ========================
     自動儲存
     ======================== */
  const persist = (next) => {
    setForm(next);
    try {
      const payload = {
        ...next,
        dateStart: next.dateStart ? next.dateStart.toISOString() : null,
        dateEnd: next.dateEnd ? next.dateEnd.toISOString() : null,
        startTime: next.startTime ? next.startTime.toISOString() : null,
        endTime: next.endTime ? next.endTime.toISOString() : null,
      };
      localStorage.setItem(LS_KEY, JSON.stringify(payload));
      setSavedAt(new Date());
      setJustSaved(true);
      setTimeout(() => setJustSaved(false), 900);
    } catch { /* noop */ }
  };

  /* ========================
     顯示字串
     ======================== */
  const timeStrings = useMemo(() => {
    const startStr = form.startTime ? toHM(form.startTime) : "";
    const endStr = form.endTime ? toHM(form.endTime) : "";
    const dateStartStr = form.dateStart ? toYMD(form.dateStart) : "";
    const dateEndStr = form.dateEnd ? toYMD(form.dateEnd) : "";
    return { startStr, endStr, dateStartStr, dateEndStr };
  }, [form.startTime, form.endTime, form.dateStart, form.dateEnd]);

  /* ========================
     驗證
     ======================== */
  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "請輸入活動名稱";
    if (!form.address.trim()) e.address = "請輸入活動地址";
    if (!form.city.trim()) e.city = "請選擇城市";
    if (!form.dateStart || !form.dateEnd) e.dateRange = "請選擇日期（開始與結束）";
    if (!form.startTime) e.startTime = "請選擇開始時間";
    if (!form.endTime) e.endTime = "請選擇結束時間";
    if (form.priceType === "paid") {
      if (form.price === "") e.price = "請輸入票價";
      else if (Number.isNaN(Number(form.price))) e.price = "票價需為數字";
    }
    if (form.capacity && Number.isNaN(Number(form.capacity))) e.capacity = "名額需為數字";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  /* ========================
     動作
     ======================== */
  const handleSaveDraft = () => {
    alert("已儲存草稿（localStorage）");
  };

  const handlePublish = async () => {
    if (!validate()) return;
    const payload = {
      name: form.name.trim(),
      content: form.content.trim(),
      tag: form.tag.trim() || form.category,
      category: form.category,

      city: form.city,
      address: form.address.trim(),

      dateStart: timeStrings.dateStartStr,
      dateEnd: timeStrings.dateEndStr,
      start: timeStrings.startStr,
      end: timeStrings.endStr,

      coverUrl: form.coverUrl.trim() || null,
      externalUrl: form.externalUrl.trim() || null,

      priceType: form.priceType,
      price: form.price === "" ? null : Number(form.price),
      currency: form.currency,
      capacity: form.capacity === "" ? null : Number(form.capacity),

      isPublic: !!form.isPublic,
    };

    console.log("👉 即將送出的活動 payload：", payload);

    // TODO: 串後端 API
    // await fetch("/api/events", { method:"POST", headers:{ "Content-Type": "application/json" }, body: JSON.stringify(payload) });

    alert("（模擬）活動已發佈！\n之後在 handlePublish 內串接 /api/events");
  };

  /* ========================
     外部點擊關閉：時間選單
     ======================== */
  useEffect(() => {
    const handler = (e) => {
      if (openTime.start && timeStartRef.current && !timeStartRef.current.contains(e.target)) {
        setOpenTime((s) => ({ ...s, start: false }));
      }
      if (openTime.end && timeEndRef.current && !timeEndRef.current.contains(e.target)) {
        setOpenTime((s) => ({ ...s, end: false }));
      }
    };
    const onEsc = (e) => {
      if (e.key === "Escape") {
        setOpenDate({ start: false, end: false });
        setOpenTime({ start: false, end: false });
      }
    };
    document.addEventListener("mousedown", handler);
    window.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", handler);
      window.removeEventListener("keydown", onEsc);
    };
  }, [openTime.start, openTime.end]);

  /* ========================
     JSX
     ======================== */
  return (
    <div className="create-container">
      {/* ===== 頁首 / 操作列 ===== */}
      <div className="create-header">
        <h1 className="create-title">上傳活動</h1>
        <div className="create-actions">
          {savedAt && <span>自動儲存於 {toHHMMSS(savedAt)}</span>}
          {justSaved && <span className="create-saved">已儲存</span>}
          <button className="create-btn" onClick={handleSaveDraft}>儲存草稿</button>
          <button className="create-btn primary" onClick={handlePublish}>發佈</button>
        </div>
      </div>

      {/* ===== 基本資訊 ===== */}
      <section className="create-card">
        <h3 className="create-card-title">基本資訊</h3>

        <div className="create-row">
          <div className="create-label">活動名稱 *</div>
          <input
            className="create-input"
            value={form.name}
            onChange={(e) => persist({ ...form, name: e.target.value })}
            placeholder="例如：2025 夏日音樂祭"
          />
          <FieldError msg={errors.name} />
        </div>

        <div className="create-row">
          <div className="create-label">活動描述</div>
          <textarea
            className="create-input create-textarea"
            value={form.content}
            onChange={(e) => persist({ ...form, content: e.target.value })}
            placeholder="簡述活動亮點、流程、注意事項…"
          />
        </div>

        <div className="create-row create-grid2">
          <div>
            <div className="create-label">類別 *</div>
            <select
              className="create-input"
              value={form.category}
              onChange={(e) => persist({ ...form, category: e.target.value })}
            >
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <div className="create-label">標籤（可選）</div>
            <input
              className="create-input"
              value={form.tag}
              onChange={(e) => persist({ ...form, tag: e.target.value })}
              placeholder="例如：親子 / 戶外 / 展演…"
            />
          </div>
        </div>
      </section>

      {/* ===== 地點與時間（Start/End 按鈕 → 彈窗） ===== */}
      <section className="create-card">
        <h3 className="create-card-title">地點與時間</h3>

        {/* 城市 + 地址 */}
        <div className="create-row create-grid2">
          <div>
            <div className="create-label">城市 *</div>
            <select
              className="create-input"
              value={form.city}
              onChange={(e) => persist({ ...form, city: e.target.value })}
            >
              {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <div className="create-label">地址 *</div>
            <input
              className="create-input"
              value={form.address}
              onChange={(e) => persist({ ...form, address: e.target.value })}
              placeholder="完整地址"
            />
            <FieldError msg={errors.address} />
          </div>
        </div>

        {/* 日期（開始 / 結束） */}
        <div className="create-row create-grid2">
          {/* 開始日期 */}
          <div className="picker-field">
            <div className="create-label">開始日期 *</div>
            <button
              type="button"
              className="create-input create-input-like"
              onClick={() => setOpenDate(s => ({ start: !s.start, end: false }))}
              aria-haspopup="dialog"
              aria-expanded={openDate.start}
            >
              {form.dateStart ? toYMD(form.dateStart) : "選擇開始日期"}
            </button>

            {/* DatePicker（控制 open） */}
            <div className="create-popover" style={{ display: openDate.start ? "block" : "none" }}>
              <DatePicker
                inline
                selected={form.dateStart}
                onChange={(d) => {
                  persist({ ...form, dateStart: d });
                  setOpenDate(s => ({ ...s, start: false }));
                }}
                calendarStartDay={0}
              />
            </div>
          </div>

          {/* 結束日期 */}
          <div className="picker-field">
            <div className="create-label">結束日期 *</div>
            <button
              type="button"
              className="create-input create-input-like"
              onClick={() => setOpenDate(s => ({ start: false, end: !s.end }))}
              aria-haspopup="dialog"
              aria-expanded={openDate.end}
            >
              {form.dateEnd ? toYMD(form.dateEnd) : "選擇結束日期"}
            </button>

            <div className="create-popover" style={{ display: openDate.end ? "block" : "none" }}>
              <DatePicker
                inline
                selected={form.dateEnd}
                onChange={(d) => {
                  persist({ ...form, dateEnd: d });
                  setOpenDate(s => ({ ...s, end: false }));
                }}
                calendarStartDay={0}
                minDate={form.dateStart || undefined}
              />
            </div>
          </div>
        </div>
        <FieldError msg={errors.dateRange} />

        {/* 時間（開始 / 結束） */}
        <div className="create-row create-grid2">
          {/* 開始時間 */}
          <div className="picker-field" ref={timeStartRef}>
            <div className="create-label">開始時間 *</div>
            <button
              type="button"
              className="create-input create-input-like"
              onClick={() => setOpenTime(s => ({ start: !s.start, end: false }))}
              aria-haspopup="listbox"
              aria-expanded={openTime.start}
            >
              {form.startTime ? toHM(form.startTime) : "選擇開始時間"}
            </button>

            {openTime.start && (
              <TimeDropdown
                onClose={() => setOpenTime(s => ({ ...s, start: false }))}
                value={form.startTime}
                onChange={(d) => persist({ ...form, startTime: d })}
                anchorRef={timeStartRef}
              />
            )}
          </div>

          {/* 結束時間 */}
          <div className="picker-field" ref={timeEndRef}>
            <div className="create-label">結束時間 *</div>
            <button
              type="button"
              className="create-input create-input-like"
              onClick={() => setOpenTime(s => ({ start: false, end: !s.end }))}
              aria-haspopup="listbox"
              aria-expanded={openTime.end}
            >
              {form.endTime ? toHM(form.endTime) : "選擇結束時間"}
            </button>

            {openTime.end && (
              <TimeDropdown
                onClose={() => setOpenTime(s => ({ ...s, end: false }))}
                value={form.endTime}
                onChange={(d) => persist({ ...form, endTime: d })}
                anchorRef={timeEndRef}
              />
            )}
          </div>
        </div>
        <FieldError msg={errors.startTime || errors.endTime} />
      </section>

      {/* ===== 票務與名額（可選） ===== */}
      <section className="create-card">
        <h3 className="create-card-title">票務與名額（可選）</h3>

        <div className="create-row create-grid2">
          <div>
            <div className="create-label">票種</div>
            <div className="create-inline no-select">
              <label>
                <input
                  type="radio"
                  checked={form.priceType === "free"}
                  onChange={() => persist({ ...form, priceType: "free" })}
                />{" "}
                免費
              </label>
              <label>
                <input
                  type="radio"
                  checked={form.priceType === "paid"}
                  onChange={() => persist({ ...form, priceType: "paid" })}
                />{" "}
                收費
              </label>
            </div>
          </div>

          <div style={{ display: form.priceType === "paid" ? "block" : "none" }}>
            <div className="create-label">票價</div>
            <div className="create-inline">
              <select
                className="create-input create-input--w120"
                value={form.currency}
                onChange={(e) => persist({ ...form, currency: e.target.value })}
              >
                {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <input
                className="create-input create-input--w200"
                value={form.price}
                onChange={(e) => persist({ ...form, price: e.target.value })}
                placeholder="例如：500"
              />
            </div>
            <FieldError msg={errors.price} />
          </div>
        </div>

        <div className="create-row">
          <div className="create-label">名額（可選）</div>
          <input
            className="create-input"
            value={form.capacity}
            onChange={(e) => persist({ ...form, capacity: e.target.value })}
            placeholder="例如：200"
          />
          <FieldError msg={errors.capacity} />
        </div>
      </section>

      {/* ===== 圖片與連結（可選） ===== */}
      <section className="create-card">
        <h3 className="create-card-title">圖片與連結（可選）</h3>

        <div className="create-row create-grid2">
          <div>
            <div className="create-label">封面圖片 URL</div>
            <input
              className="create-input"
              value={form.coverUrl}
              onChange={(e) => persist({ ...form, coverUrl: e.target.value })}
              placeholder="https://example.com/cover.jpg"
            />
          </div>
          <div>
            <div className="create-label">外部連結</div>
            <input
              className="create-input"
              value={form.externalUrl}
              onChange={(e) => persist({ ...form, externalUrl: e.target.value })}
              placeholder="官方頁或售票頁"
            />
          </div>
        </div>

        {form.coverUrl ? (
          <div className="create-cover-section">
            <div className="create-cover-label">預覽：</div>
            <img
              src={form.coverUrl}
              alt="cover preview"
              className="create-cover-preview"
            />
          </div>
        ) : null}
      </section>

      {/* ===== 其他 ===== */}
      <section className="create-card">
        <h3 className="create-card-title">其他</h3>
        <label className="create-inline no-select">
          <input
            type="checkbox"
            checked={form.isPublic}
            onChange={(e) => persist({ ...form, isPublic: e.target.checked })}
          />
          活動公開於前台列表（取消勾選 = 隱藏）
        </label>
      </section>

      {/* ===== 底部操作列 ===== */}
      <div className="create-footer">
        <button className="create-btn" onClick={() => onBack?.()}>取消</button>
        <button className="create-btn" onClick={handleSaveDraft}>儲存草稿</button>
        <button className="create-btn primary" onClick={handlePublish}>發佈</button>
      </div>
    </div>
  );
}

/* ========================
   下拉式時間選單（1 分鐘刻度）
   ======================== */
function TimeDropdown({ value, onChange, onClose, anchorRef }) {
  // 預設值
  const initH = value ? value.getHours() : 0;
  const initM = value ? value.getMinutes() : 0;

  const [h, setH] = useState(initH);
  const [m, setM] = useState(initM);

  const apply = () => {
    const d = value ? new Date(value) : new Date();
    d.setHours(h);
    d.setMinutes(m);
    d.setSeconds(0, 0);
    onChange?.(d);
    onClose?.();
  };

  // Esc 關閉
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose?.();
      if (e.key === "Enter") apply();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [h, m]);

  // 設定 popover 位置（靠近按鈕）
  const [pos, setPos] = useState({ top: 0, left: 0, width: 260 });
  useEffect(() => {
    const el = anchorRef?.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setPos({
      top: rect.bottom + window.scrollY + 6,
      left: rect.left + window.scrollX,
      width: rect.width,
    });
  }, [anchorRef]);

  return (
    <div className="time-popover" style={{ top: pos.top, left: pos.left, minWidth: pos.width }}>
      <div className="time-popover-row">
        <div className="time-popover-col">
          <div className="time-popover-label">小時</div>
          <select className="create-input" value={h} onChange={(e) => setH(Number(e.target.value))}>
            {Array.from({ length: 24 }, (_, i) => (
              <option key={i} value={i}>{String(i).padStart(2, "0")}</option>
            ))}
          </select>
        </div>
        <div className="time-popover-col">
          <div className="time-popover-label">分鐘</div>
          <select className="create-input" value={m} onChange={(e) => setM(Number(e.target.value))}>
            {Array.from({ length: 60 }, (_, i) => (
              <option key={i} value={i}>{String(i).padStart(2, "0")}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="time-popover-actions">
        <button className="create-btn" onClick={onClose}>取消</button>
        <button className="create-btn primary" onClick={apply}>套用</button>
      </div>
    </div>
  );
}

/* ========================
   小工具：錯誤文字 / 格式化
   ======================== */
function FieldError({ msg }) {
  if (!msg) return null;
  return <div className="create-error">{msg}</div>;
}

function toYMD(d) {
  const y = d.getFullYear();
  const m = `${d.getMonth() + 1}`.padStart(2, "0");
  const dd = `${d.getDate()}`.padStart(2, "0");
  return `${y}/${m}/${dd}`;
}
function toHM(d) {
  const h = `${d.getHours()}`.padStart(2, "0");
  const m = `${d.getMinutes()}`.padStart(2, "0");
  return `${h}:${m}`;
}
function toHHMMSS(d) {
  const h = `${d.getHours()}`.padStart(2, "0");
  const m = `${d.getMinutes()}`.padStart(2, "0");
  const s = `${d.getSeconds()}`.padStart(2, "0");
  return `${h}:${m}:${s}`;
}
