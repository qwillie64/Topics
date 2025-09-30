/**
 * Event API wrappers.
 * Place at: C:\Users\MA302\Topics\api\events.ts
 */
import { api, buildQuery, toApiError } from "./client";
import type { EventItem, Paginated } from "./types";

export interface SearchEventsParams {
  keyword?: string;
  category?: number | number[];
  tag?: number | number[];
  start?: string; // YYYY-MM-DD or ISO string
  end?: string;   // YYYY-MM-DD or ISO string
  page?: number;
  pageSize?: number;
}

/** GET /events — fetch all events (optionally with pagination) */

export async function getEvents(params?: { page?: number; pageSize?: number }) {
  try {
    const qs = buildQuery(params ?? {});
    const { data } = await api.get<EventItem[] | Paginated<EventItem>>(`/events${qs}`);
    return data;
  } catch (err) {
    throw toApiError(err);
  }
}

/** Conditional search: /events?keyword=...&category=1&category=2&tag=4&start=...&end=... */

export async function searchEvents(params: any) {
  try {
    const qs = buildQuery(params as Record<string, any>);
    const { data } = await api.get<EventItem[] | Paginated<EventItem>>(`/events${qs}`);
    return data;
  } catch (err) {
    throw toApiError(err); 
  }
}

/** POST /events — create a new event */
export async function createEvent(payload: Partial<EventItem>) {
  try {
    const { data } = await api.post<EventItem>("/events", payload);
    return data;
  } catch (err) {
    throw toApiError(err);
  }
}

/** DELETE /events?id=<uuid> — delete an existing event */
export async function deleteEvent(id: string) {
  try {
    const { data } = await api.delete<{ success: boolean; id: string }>(`/events`, {
      params: { id },
      paramsSerializer: (params) => new URLSearchParams(params as Record<string, string>).toString(),
    });
    return data;
  } catch (err) {
    throw toApiError(err);
  }
}
