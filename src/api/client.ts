/**
 * Axios client with sensible defaults and helpers.
 * Place at: C:\Users\MA302\Topics\api\client.ts
 */
import axios, { AxiosError } from "axios";
import type { ApiErrorPayload } from "./types";

/**
 * 方案A：透過 Vite proxy 避免 CORS
 * - 開發時：baseURL 走 /api，由 Vite 代理到 http://localhost:5001
 * - 佈署時：可用 VITE_API_BASE_URL 覆蓋（例如 https://your-api.com）
 */
export const API_BASE_URL = (import.meta as any)?.env?.VITE_API_BASE_URL ?? "/api";
export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,   // 需要 cookie 就留著
  timeout: 15000,
});

// （強烈建議暫時打開，方便看請求有沒有真的送出去）
api.interceptors.request.use((c) => {
  console.log("[API] ->", (c.baseURL || "") + (c.url || ""));
  return c;
});
api.interceptors.response.use(
  (r) => { console.log("[API] <-", r.status, r.config.url); return r; },
  (e) => { console.log("[API] xx", e?.response?.status, e?.config?.url || e?.message); return Promise.reject(e); }
);




/**
 * Token storage (若後端同時支援 Bearer token 可用；純 Cookie 可忽略)
 */
const TOKEN_KEY = "topics.access_token";

export function setToken(token: string | null) {
  if (!token) {
    localStorage.removeItem(TOKEN_KEY);
  } else {
    localStorage.setItem(TOKEN_KEY, token);
  }
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

// Attach Authorization header when token exists
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers = config.headers ?? {};
    config.headers["Authorization"] = `Bearer ${token}`;
  }
  return config;
});

// Standardize error objects
export function toApiError(err: unknown): Error {
  if (axios.isAxiosError(err)) {
    const status = err.response?.status;
    const apiMsg = (err.response?.data as ApiErrorPayload | undefined)?.message;
    return new Error(`[HTTP ${status ?? "?"}] ${apiMsg || err.message || "Request failed"}`);
  }
  return new Error(String((err as any)?.message ?? err));
}

/**
 * Helper to build URL query strings where duplicate keys are allowed
 * (e.g., category=1&category=2).
 */
export function buildQuery(params: Record<string, any>): string {
  const usp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v == null || v === "") continue;
    Array.isArray(v) ? v.forEach((x) => x!=null && usp.append(k, String(x))) : usp.append(k, String(v));
  }
  const s = usp.toString();
  return s ? `?${s}` : "";
}
