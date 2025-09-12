// src/pages/OrganizerApply.jsx
import { useEffect, useMemo, useState } from "react";
import "../styles/Apply.css";

// 可選社群平台
const SOCIAL_OPTIONS = [
  { value: "facebook",  label: "Facebook" },
  { value: "instagram", label: "Instagram" },
  { value: "youtube",   label: "YouTube" },
  { value: "x",         label: "X / Twitter" },
  { value: "threads",   label: "Threads" },
  { value: "linkedin",  label: "LinkedIn" },
  { value: "line",      label: "LINE" },
];

const LS_APP = "organizerApplication";
const EDIT_WINDOW_SECONDS = 300; // 5 分鐘

// 產生 id（支援沒有 crypto.randomUUID 的環境）
const genId = () =>
  (typeof crypto !== "undefined" && crypto.randomUUID)
    ? crypto.randomUUID()
    : `id_${Date.now()}_${Math.random().toString(16).slice(2, 8)}`;

const defaultApp = {
  status: "draft", // draft | pending | approved | rejected
  organizationName: "",
  organizationType: "公司",
  organizationTypeOther: "",
  website: "",
  socials: [], // [{id, type, url}]
  contact: { name: "", email: "", phone: "" },
  verification: {
    method: "email_domain", // email_domain | dns_txt | social_admin | document
    emailDomain: "",
    dnsTxtValue: "",
    socialProofUrl: "",
  },
  description: "",
  agreeToTerms: false,
  submittedAt: null,
  updatedAt: null,
  resubmittedAt: null,
};

// --------- 比對用（未儲存變更） ---------
const pickComparable = (a) => ({
  status: a.status,
  organizationName: a.organizationName,
  organizationType: a.organizationType,
  organizationTypeOther: a.organizationTypeOther,
  website: a.website,
  socials: (a.socials || []).map(s => ({ type: s.type, url: s.url })),
  contact: a.contact,
  verification: a.verification,
  description: a.description,
  agreeToTerms: a.agreeToTerms,
});
const isChanged = (a, b) =>
  JSON.stringify(pickComparable(a)) !== JSON.stringify(pickComparable(b));

export default function OrganizerApply({ onBack }) {
  const [app, setApp] = useState(defaultApp);
  const [errors, setErrors] = useState({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMode, setSuccessMode] = useState("submitted"); // submitted | updated | resubmitted

  // 編輯狀態 + 倒數 + dirty
  const [isEditing, setIsEditing] = useState(true);
  const [editCountdown, setEditCountdown] = useState(null);
  const [editBaseline, setEditBaseline] = useState(null);
  const [isDirty, setIsDirty] = useState(false);

  // 新增一筆社群的暫存
  const [newSocial, setNewSocial] = useState({ type: "facebook", url: "" });

  // 載入 localStorage；把舊版 object socials 轉成 array
  useEffect(() => {
    const saved = localStorage.getItem(LS_APP);
    if (!saved) {
      setIsEditing(true); // draft 預設可編輯
      setEditBaseline(pickComparable(defaultApp));
      return;
    }
    try {
      const parsed = JSON.parse(saved);
      let next = { ...defaultApp, ...parsed };
      if (!Array.isArray(next.socials)) {
        const obj = next.socials || {};
        next.socials = Object.entries(obj)
          .filter(([, url]) => (url || "").trim())
          .map(([type, url]) => ({ id: genId(), type, url }));
      }
      setApp(next);
      setIsEditing(next.status === "draft"); // 草稿可編輯；其他預設鎖
      setEditBaseline(pickComparable(next));
    } catch { /* ignore */ }
  }, []);

  // 倒數（到 0 自動鎖回）
  useEffect(() => {
    if (editCountdown === null) return;
    if (editCountdown <= 0) {
      setIsEditing(false);
      setEditCountdown(null);
      return;
    }
    const timer = setTimeout(() => setEditCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [editCountdown]);

  // beforeunload 提醒（dirty + 正在編輯）
  useEffect(() => {
    if (!(isEditing && isDirty)) return;
    const onBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [isEditing, isDirty]);

  // 同步 + 在編輯時重置倒數 & 標記 dirty
  const persist = (next) => {
    setApp(next);
    localStorage.setItem(LS_APP, JSON.stringify(next));
    if (isEditing) {
      setEditCountdown(EDIT_WINDOW_SECONDS);
      if (editBaseline) setIsDirty(isChanged(next, editBaseline));
    }
  };

  // 可編輯（approved 永遠鎖；draft 永遠開；pending/rejected 要進編輯模式）
  const canEdit = useMemo(() => {
    if (app.status === "approved") return false;
    if (app.status === "draft") return true;
    return isEditing;
  }, [app.status, isEditing]);

  // 驗證（社群連結不是必填）
  const validate = () => {
    const e = {};
    if (!app.organizationName.trim()) e.organizationName = "請輸入組織名稱";
    if (app.organizationType === "其他" && !app.organizationTypeOther.trim())
      e.organizationTypeOther = "請填寫其他型態";
    if (!app.contact.name.trim()) e.contactName = "請輸入聯絡人姓名";
    if (!app.contact.email.trim()) e.contactEmail = "請輸入聯絡人 Email";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(app.contact.email.trim()))
      e.contactEmail = "Email 格式不正確";
    if (!app.contact.phone.trim()) e.contactPhone = "請輸入聯絡人電話";

    if (app.verification.method === "email_domain" && !app.verification.emailDomain.trim())
      e.emailDomain = "請輸入組織 Email 網域（例如 example.org）";
    if (app.verification.method === "dns_txt" && !app.verification.dnsTxtValue.trim())
      e.dnsTxtValue = "請填寫 DNS TXT 值";
    if (app.verification.method === "social_admin" && !app.verification.socialProofUrl.trim())
      e.socialProofUrl = "請貼上社群管理員的公開連結";

    if (!app.agreeToTerms) e.agreeToTerms = "需要勾選同意條款";

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // 提交 / 更新 / 重新提交
  const handleSave = () => {
    if (!validate()) return;

    let payload = { ...app };
    let mode = "submitted";

    if (app.status === "draft") {
      payload = { ...payload, status: "pending", submittedAt: new Date().toISOString() };
      mode = "submitted";
    } else if (app.status === "pending") {
      payload = { ...payload, updatedAt: new Date().toISOString() };
      mode = "updated";
    } else if (app.status === "rejected") {
      payload = { ...payload, status: "pending", resubmittedAt: new Date().toISOString() };
      mode = "resubmitted";
    } else {
      return; // approved 不處理
    }

    // TODO：之後接後端 API
    // await fetch("/api/organizers/apply", { method:"POST", headers:{ "Content-Type":"application/json" }, body: JSON.stringify(payload) });

    persist(payload);
    setSuccessMode(mode);
    setShowSuccess(true);
    setIsEditing(false);
    setEditCountdown(null);
    setIsDirty(false);
    setEditBaseline(pickComparable(payload));
  };

  // 進入編輯模式（pending / rejected）
  const handleEditToggle = () => {
    if (app.status === "pending" || app.status === "rejected") {
      setIsEditing(true);
      setEditCountdown(EDIT_WINDOW_SECONDS);
      setEditBaseline(pickComparable(app));
      setIsDirty(false);
    }
  };

  // 取消：回滾並鎖回
  const handleCancel = () => {
    try {
      const saved = localStorage.getItem(LS_APP);
      if (saved) {
        const parsed = JSON.parse(saved);
        let next = { ...defaultApp, ...parsed };
        if (!Array.isArray(next.socials)) {
          const obj = next.socials || {};
          next.socials = Object.entries(obj)
            .filter(([, url]) => (url || "").trim())
            .map(([type, url]) => ({ id: genId(), type, url }));
        }
        setApp(next);
        setEditBaseline(pickComparable(next));
      } else {
        setApp(defaultApp);
        setEditBaseline(pickComparable(defaultApp));
      }
    } catch { /* ignore */ }
    setIsEditing(false);
    setEditCountdown(null);
    setIsDirty(false);
  };

  // 返回設定：dirty 時攔截
  const safeGoBack = () => {
    if (isEditing && isDirty) {
      const ok = confirm("你有尚未儲存的變更，確定要離開嗎？");
      if (!ok) return;
    }
    onBack && onBack();
  };

  // ====== 社群連結：操作方法 ======
  const addSocial = () => {
    if (!newSocial.url.trim()) return;
    const next = [ ...(app.socials || []), { id: genId(), ...newSocial } ];
    persist({ ...app, socials: next });
    setNewSocial({ type: "facebook", url: "" });
  };
  const updateSocial = (idx, patch) => {
    const next = [...(app.socials || [])];
    next[idx] = { ...next[idx], ...patch };
    persist({ ...app, socials: next });
  };
  const removeSocial = (idx) => {
    const next = (app.socials || []).filter((_, i) => i !== idx);
    persist({ ...app, socials: next });
  };

  // 主要按鈕文案
  const primaryLabel =
    app.status === "pending" ? "更新申請" :
    app.status === "rejected" ? "重新提交" :
    "提交申請";

  // 倒數提示（mm:ss）
  const mmss = (s) => {
    const m = Math.floor(s / 60).toString();
    const sec = (s % 60).toString().padStart(2, "0");
    return `${m}:${sec}`;
  };

  return (
    <div className="apply-container">
      {/* Header + 操作列 */}
      <div className="apply-header">
        <h1 className="apply-title">申請成為主辦方</h1>
        <div className="apply-actions">
          <button className="apply-btn" onClick={safeGoBack}>← 返回設定</button>

          {app.status === "approved" ? null : (
            isEditing ? (
              <>
                {/* 倒數 + 未儲存提示 */}
                {editCountdown !== null && (
                  <span className="apply-edit-countdown">
                    編輯模式（剩餘 {mmss(editCountdown)}）
                    {isDirty && " ‧ 有未儲存的變更"}
                  </span>
                )}
                <button className="apply-btn" onClick={handleCancel}>取消</button>
                <button className="apply-btn primary" onClick={handleSave}>{primaryLabel}</button>
              </>
            ) : (
              <button
                className="apply-btn"
                onClick={handleEditToggle}
                disabled={app.status === "draft"} // draft 本來就可編輯
                title={app.status === "approved" ? "已通過後不可修改" : ""}
              >
                編輯
              </button>
            )
          )}
        </div>
      </div>

      {/* 狀態條 */}
      <StatusBanner status={app.status} />

      {/* 狀態提示 */}
      {app.status === "approved" && (
        <div className="apply-note">已通過審核，此頁內容已鎖定。如需異動請聯繫客服。</div>
      )}
      {app.status === "pending" && !isEditing && (
        <div className="apply-note">目前狀態為「審核中」。若需更改，請按右上角「編輯」。</div>
      )}

      {/* 表單卡片（用 fieldset 控制可編輯性） */}
      <section className="apply-card">
        <fieldset className="apply-fieldset" disabled={!canEdit}>
          <div className="apply-grid2">
            {/* 組織名稱 */}
            <div>
              <div className="apply-label">組織名稱 *</div>
              <input
                className="apply-input"
                value={app.organizationName}
                onChange={(e) => persist({ ...app, organizationName: e.target.value })}
                placeholder="木木文化工作室 / XX大學社團 / OO慈善協會"
              />
              <FieldError msg={errors.organizationName} />
            </div>

            {/* 組織型態 */}
            <div>
              <div className="apply-label">組織型態 *</div>
              <div style={{ display: "flex", gap: 8 }}>
                <select
                  className="apply-input"
                  value={app.organizationType}
                  onChange={(e) => persist({ ...app, organizationType: e.target.value })}
                >
                  <option>公司</option>
                  <option>學校</option>
                  <option>社福</option>
                  <option>社團</option>
                  <option>工作室</option>
                  <option>個人品牌</option>
                  <option>其他</option>
                </select>
                {app.organizationType === "其他" && (
                  <input
                    className="apply-input"
                    style={{ flex: 1 }}
                    value={app.organizationTypeOther}
                    onChange={(e) => persist({ ...app, organizationTypeOther: e.target.value })}
                    placeholder="請輸入其他型態"
                  />
                )}
              </div>
              <FieldError msg={errors.organizationTypeOther} />
            </div>

            {/* 官方網站 */}
            <div>
              <div className="apply-label">官方網站</div>
              <input
                className="apply-input"
                value={app.website}
                onChange={(e) => persist({ ...app, website: e.target.value })}
                placeholder="https://example.org"
              />
            </div>

            {/* ===== 社群連結（動態清單）— 跨欄 ===== */}
            <div style={{ gridColumn: "1 / -1" }}>
              <div className="apply-label">社群連結（可新增多筆）</div>

              {/* 已新增的清單 */}
              <div className="social-list">
                {(app.socials || []).map((s, i) => (
                  <div key={s.id || i} className="social-row">
                    <select
                      className="apply-input apply-input--small"
                      value={s.type}
                      onChange={(e) => updateSocial(i, { type: e.target.value })}
                    >
                      {SOCIAL_OPTIONS.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>

                    <input
                      className="apply-input social-url"
                      value={s.url}
                      onChange={(e) => updateSocial(i, { url: e.target.value })}
                      placeholder="https://..."
                    />

                    <button
                      type="button"
                      className="apply-btn danger"
                      onClick={() => removeSocial(i)}
                    >
                      刪除
                    </button>
                  </div>
                ))}
              </div>

              {/* 新增一筆 */}
              <div className="social-add">
                <select
                  className="apply-input apply-input--small"
                  value={newSocial.type}
                  onChange={(e) => setNewSocial(prev => ({ ...prev, type: e.target.value }))}
                >
                  {SOCIAL_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                <input
                  className="apply-input social-url"
                  value={newSocial.url}
                  onChange={(e) => setNewSocial(prev => ({ ...prev, url: e.target.value }))}
                  placeholder="https://..."
                />
                <button type="button" className="apply-btn" onClick={addSocial}>新增</button>
              </div>
            </div>

            {/* 聯絡資料 */}
            <div>
              <div className="apply-label">聯絡人姓名 *</div>
              <input
                className="apply-input"
                value={app.contact.name}
                onChange={(e) => persist({ ...app, contact: { ...app.contact, name: e.target.value } })}
              />
              <FieldError msg={errors.contactName} />
            </div>

            <div>
              <div className="apply-label">聯絡人 Email *</div>
              <input
                className="apply-input"
                value={app.contact.email}
                onChange={(e) => persist({ ...app, contact: { ...app.contact, email: e.target.value } })}
                placeholder="you@example.org"
              />
              <FieldError msg={errors.contactEmail} />
            </div>

            <div>
              <div className="apply-label">聯絡人電話 *</div>
              <input
                className="apply-input"
                value={app.contact.phone}
                onChange={(e) => persist({ ...app, contact: { ...app.contact, phone: e.target.value } })}
                placeholder="+886-9xx-xxx-xxx"
              />
              <FieldError msg={errors.contactPhone} />
            </div>

            {/* 驗證方式（跨欄） */}
            <div style={{ gridColumn: "1 / -1" }}>
              <div className="apply-label">驗證方式 *</div>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                {[
                  ["email_domain", "公司/組織 Email 網域驗證"],
                  ["dns_txt", "DNS TXT 驗證"],
                  ["social_admin", "社群管理員頁面驗證"],
                  ["document", "上傳證明文件（之後接後端）"],
                ].map(([value, label]) => (
                  <label key={value}>
                    <input
                      type="radio"
                      name="verify"
                      checked={app.verification.method === value}
                      onChange={() => persist({ ...app, verification: { ...app.verification, method: value } })}
                    />{" "}
                    {label}
                  </label>
                ))}
              </div>

              {app.verification.method === "email_domain" && (
                <div style={{ marginTop: 8 }}>
                  <input
                    className="apply-input"
                    value={app.verification.emailDomain}
                    onChange={(e) => persist({ ...app, verification: { ...app.verification, emailDomain: e.target.value } })}
                    placeholder="example.org"
                  />
                  <FieldError msg={errors.emailDomain} />
                  <small style={{ color: "#666" }}>我們會向該網域的 Email 發送驗證信。</small>
                </div>
              )}

              {app.verification.method === "dns_txt" && (
                <div style={{ marginTop: 8 }}>
                  <input
                    className="apply-input"
                    value={app.verification.dnsTxtValue}
                    onChange={(e) => persist({ ...app, verification: { ...app.verification, dnsTxtValue: e.target.value } })}
                    placeholder="請填寫要設定的 TXT 值（由後端核發）"
                  />
                  <FieldError msg={errors.dnsTxtValue} />
                  <small style={{ color: "#666" }}>設定到你的網域 DNS；系統會定時檢查。</small>
                </div>
              )}

              {app.verification.method === "social_admin" && (
                <div style={{ marginTop: 8 }}>
                  <input
                    className="apply-input"
                    value={app.verification.socialProofUrl}
                    onChange={(e) => persist({ ...app, verification: { ...app.verification, socialProofUrl: e.target.value } })}
                    placeholder="請貼上你/貴組織作為管理員的公開連結"
                  />
                  <FieldError msg={errors.socialProofUrl} />
                </div>
              )}

              {app.verification.method === "document" && (
                <div style={{ marginTop: 8 }}>
                  <div className="apply-input" style={{ padding: 8 }}>
                    <em>（尚未接後端，上傳控件之後補）</em>
                  </div>
                </div>
              )}
            </div>

            {/* 申請說明（跨欄） */}
            <div style={{ gridColumn: "1 / -1" }}>
              <div className="apply-label">申請說明（補充資料）</div>
              <textarea
                className="apply-input"
                rows={4}
                value={app.description}
                onChange={(e) => persist({ ...app, description: e.target.value })}
                placeholder="請簡述活動性質、舉辦紀錄、預計上架內容……"
              />
            </div>

            {/* 同意條款（跨欄） */}
            <div style={{ gridColumn: "1 / -1" }}>
              <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <input
                  type="checkbox"
                  checked={app.agreeToTerms}
                  onChange={(e) => persist({ ...app, agreeToTerms: e.target.checked })}
                />
                我已閱讀並同意《活動主辦方條款》與《社群規範》。
              </label>
              <FieldError msg={errors.agreeToTerms} />
            </div>
          </div>
        </fieldset>
      </section>

      {/* 說明卡片 */}
      <section className="apply-card" style={{ color: "#555" }}>
        <h3 style={{ marginTop: 0 }}>申請流程說明</h3>
        <ol style={{ paddingLeft: 20, lineHeight: 1.8 }}>
          <li>提交後狀態為「審核中」。</li>
          <li>可能要求補件，請留意通知。</li>
          <li>通過後帳號升級為主辦方，可上架/管理活動。</li>
        </ol>
      </section>

      {/* 成功提交/更新 Modal */}
      {showSuccess && (
        <div className="apply-modal-backdrop">
          <div className="apply-modal">
            <h3 style={{ marginTop: 0 }}>
              {successMode === "updated" ? "已更新申請 ✅" :
               successMode === "resubmitted" ? "已重新提交 ✅" :
               "申請已提交 ✅"}
            </h3>
            <p style={{ margin: "8px 0 16px", color: "#555" }}>
              {successMode === "updated"
                ? <>你已更新申請內容，狀態仍為 <b>審核中（pending）</b>。審核單位將以最新資料為準。</>
                : <>我們已收到你的申請，狀態為 <b>審核中（pending）</b>。審核結果將以 Email 或站內通知。</>
              }
            </p>
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <button className="apply-btn" onClick={() => setShowSuccess(false)}>留在此頁</button>
              <button className="apply-btn primary" onClick={safeGoBack}>回設定頁</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function FieldError({ msg }) {
  if (!msg) return null;
  return <div className="apply-error">{msg}</div>;
}

function StatusBanner({ status }) {
  const map = {
    approved: { cls: "approved", text: "已通過（approved）" },
    pending:  { cls: "pending",  text: "審核中（pending）" },
    rejected: { cls: "rejected", text: "未通過（rejected）" },
    draft:    { cls: "draft",    text: "草稿（draft）" },
  };
  const view = map[status] ?? map.draft;
  return <div className={`apply-status ${view.cls}`}>申請狀態：{view.text}</div>;
}
