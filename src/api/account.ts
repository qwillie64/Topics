/**
 * Account/Auth API wrappers.
 * Place at: C:\Users\MA302\Topics\api\account.ts
 */
import { api, setToken, toApiError } from "./client";
import type { AccountProfile, LoginRequest, RegisterRequest } from "./types";

/** GET /account/me — returns current session/account info */
export async function getMe() {
  try {
    const { data } = await api.get<AccountProfile>("/account/me");
    return data;
  } catch (err) {
    throw toApiError(err);
  }
}

/** POST /account/login — username/password login */
export async function login(credentials: LoginRequest) {
  try {
    const { data, headers } = await api.post<{ token?: string; profile?: AccountProfile }>(
      "/account/login",
      credentials
    );
    if (data?.token) setToken(data.token);
    const bearer = headers?.["authorization"];
    if (typeof bearer === "string" && bearer.toLowerCase().startsWith("bearer ")) {
      setToken(bearer.split(" ")[1]);
    }
    return data;
  } catch (err) {
    throw toApiError(err);
  }
}

/** POST /account/logout — clears session/token */
export async function logout() {
  try {
    const { data } = await api.post<{ success: boolean }>("/account/logout", {});
    setToken(null);
    return data;
  } catch (err) {
    setToken(null);
    throw toApiError(err);
  }
}

/** POST /account/register — create new account */
export async function register(payload: RegisterRequest) {
  try {
    const { data } = await api.post<{ success: boolean; profile?: AccountProfile }>("/account/register", payload);
    return data;
  } catch (err) {
    throw toApiError(err);
  }
}
