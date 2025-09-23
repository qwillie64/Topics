// src/pages/EventCreate.jsx
import { useEffect, useMemo, useState, forwardRef } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "../styles/EventCreate.css";

/**
 * 活動建立表單（先存 localStorage，之後再串 API）
 * - 已改為「日期區間」dateStart/dateEnd
 * - 已移除「經緯度」欄位與相關驗證/送出
 */

// 本地草稿儲存 key
const LS_KEY = "eventCreateDraft";

// 下拉選項
const CATEGORIES = ["演唱會", "市集", "展覽", "講座", "運動", "其他"];
const CITIES = ["台北", "新北", "桃園", "台中", "台南", "高雄", "新竹", "基隆", "宜蘭", "花蓮", "台東"];
const CURRENCIES = ["TWD", "USD", "JPY"];

/** 表單初始值（已無 latitude/longitude） */
const defaultEvent = {
  name: "", content: "", category: "演唱會", tag: "",
  city: "台北", address: "",
  dateStart: null, dateEnd: null,      // 日期區間
  startTime: null, endTime: null,      // 當日開始/結束時間
  coverUrl: "", externalUrl: "",
  priceType: "free", price: "", currency: "TWD", capacity: "",
  isPublic: true,
};

export default function EventCreate({ onBack }) {
  /* =========================
     狀態
     ========================= */
  const [form, setForm] = useState(defaultEvent);
  const [errors, setErrors] = useState({});
  const [savedAt, setSavedAt] = useState(null);
  const [justSaved, setJustSaved] = useState(false);

  /* =========================
     初始化：載入 localStorage 草稿
     ========================= */
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);

      // 還原日期/時間
      const revived = {
        ...defaultEvent,
        ...parsed,
        dateStart: parsed.dateStart ? new Date(parsed.dateStart) : null,
        dateEnd:   parsed.dateEnd   ? new Date(parsed.dateEnd)   : null,
        startTime: parsed.startTime ? new Date(parsed.startTime) : null,
        endTime:   parsed.endTime   ? new Date(parsed.endTime)   : null,
      };
      setForm(revived);
    } catch {
      // ignore
    }
  }, []);

  /* =========================
     同步狀態 + 自動儲存到 localStorage + 輕量提示
     ========================= */
  const persist = (next) => {
    setForm(next);
    try {
      const payload = {
        ...next,
        dateStart: next.dateStart ? next.dateStart.toISOString() : null,
        dateEnd:   next.dateEnd   ? next.dateEnd.toISOString()   : null,
        startTime: next.startTime ? next.startTime.toISOString() : null,
        endTime:   next.endTime   ? next.endTime.toISOString()   : null,
      };
      localStorage.setItem(LS_KEY, JSON.stringify(payload));
      setSavedAt(new Date());
      setJustSaved(true);
      setTimeout(() => setJustSaved(false), 1200);
    } catch {
      // ignore
    }
  };

  /* =========================
     顯示用字串（日期區間 / 時間）
     ========================= */
  const timeStrings = useMemo(() => {
    const dateStartStr = form.dateStart ? toYMD(form.dateStart) : "";
    const dateEndStr   = form.dateEnd   ? toYMD(form.dateEnd)   : "";
    const startStr     = form.startTime ? toHM(form.startTime)  : "";
    const endStr       = form.endTime   ? toHM(form.endTime)    : "";

    // 給 DatePicker customInput 顯示
    const dateRangeDisplay =
      dateStartStr && dateEndStr ? `${dateStartStr} ~ ${dateEndStr}` :
      dateStartStr ? `${dateStartStr} ~` : "";

    return { dateStartStr, dateEndStr, startStr, endStr, dateRangeDisplay };
  }, [form.dateStart, form.dateEnd, form.startTime, form.endTime]);

  /* =========================
     驗證（已移除經緯度相關）
     ========================= */
  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "請輸入活動名稱";
    if (!form.address.trim()) e.address = "請輸入活動地址";
    if (!form.city.trim()) e.city = "請選擇城市";
    if (!form.dateStart || !form.dateEnd) e.dateRange = "請選擇日期區間";
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

  /* =========================
     按鈕行為
     ========================= */
  const handleSaveDraft = () => {
    alert("已儲存草稿（localStorage）");
  };

  const handlePublish = async () => {
    if (!validate()) return;

    // 準備 payload（之後可直接丟給後端）
    const payload = {
      name: form.name.trim(),
      content: form.content.trim(),
      tag: form.tag.trim() || form.category,
      category: form.category,
      city: form.city,
      address: form.address.trim(),

      // ✅ 後端日期欄位（日期區間 + 兼容舊前台的 date=起始日）
      dateStart: timeStrings.dateStartStr,
      dateEnd:   timeStrings.dateEndStr,
      date:      timeStrings.dateStartStr,

      start: timeStrings.startStr,
      end:   timeStrings.endStr,

      // ✅ 已移除 latitude / longitude
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
    // await fetch("/api/events", {
    //   method: "POST",
    //   headers: { "Content-Type": "application/json" },
    //   body: JSON.stringify(payload),
    // });

    alert("（模擬）活動已發佈！\n之後在 handlePublish 內串接 /api/events");
  };

  /* =========================
     Render
     ========================= */
  return (
    <div className="create-container">
      {/* ===== 頁首／操作列 ===== */}
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

      {/* ===== 地點與時間 ===== */}
      <section className="create-card">
        <h3 className="create-card-title">地點與時間</h3>

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
              placeholder="完整地址（之後可加地圖選點）"
            />
            <FieldError msg={errors.address} />
          </div>
        </div>

        {/* 日期改為「選區間」 */}
        <div className="create-row create-grid2">
          <div>
            <div className="create-label">日期區間 *</div>
            <DatePicker
              selectsRange
              startDate={form.dateStart}
              endDate={form.dateEnd}
              onChange={([start, end]) => persist({ ...form, dateStart: start, dateEnd: end })}
              dateFormat="yyyy/MM/dd"
              placeholderText="選擇起訖日期"
              wrapperClassName="rc-datepicker-wrapper"
              customInput={<InputLike value={timeStrings.dateRangeDisplay} />}
            />
            <FieldError msg={errors.dateRange} />
          </div>

          <div>
            <div className="create-label">時間 *</div>
            <div className="create-inline">
              <DatePicker
                selected={form.startTime}
                onChange={(t) => persist({ ...form, startTime: t })}
                showTimeSelect
                showTimeSelectOnly
                timeIntervals={15}
                timeCaption="開始"
                dateFormat="HH:mm"
                placeholderText="開始"
                customInput={<InputLike value={timeStrings.startStr} />}
              />
              <span>—</span>
              <DatePicker
                selected={form.endTime}
                onChange={(t) => persist({ ...form, endTime: t })}
                showTimeSelect
                showTimeSelectOnly
                timeIntervals={15}
                timeCaption="結束"
                dateFormat="HH:mm"
                placeholderText="結束"
                customInput={<InputLike value={timeStrings.endStr} />}
              />
            </div>
            <FieldError msg={errors.startTime || errors.endTime} />
          </div>
        </div>
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

          {form.priceType === "paid" && (
            <div>
              <div className="create-label">金額（可選）</div>
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
          )}
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

        {form.coverUrl && (
          <div className="create-cover-section">
            <div className="create-cover-label">預覽：</div>
            <img
              src={form.coverUrl}
              alt="cover preview"
              className="create-cover-preview"
            />
          </div>
        )}
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

/* =========================
   小元件 / 小工具
   ========================= */

/** 自訂「像輸入框的按鈕」：給 react-datepicker 當 customInput 使用（需要 ref） */
const InputLike = forwardRef(function InputLike({ value, onClick }, ref) {
  return (
    <button
      type="button"
      ref={ref}
      onClick={onClick}
      className="create-input create-input-like"
    >
      {value || "選擇…"}
    </button>
  );
});

/** 錯誤訊息元件 */
function FieldError({ msg }) {
  if (!msg) return null;
  return <div className="create-error">{msg}</div>;
}

/** 工具：日期/時間格式化 */
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
