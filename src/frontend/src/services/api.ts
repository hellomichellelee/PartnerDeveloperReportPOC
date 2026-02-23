/**
 * API client for communicating with the Python Azure Functions backend.
 */

import type {
  PaginatedResponse,
  SurveyResponse,
  Participant,
  Question,
  ResponseFilters,
  ParticipantFilters,
  QuestionFilters,
  SortState,
} from "../types";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "/api";

function buildQueryString(params: Record<string, string | number | undefined>): string {
  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "" && value !== null) {
      searchParams.set(key, String(value));
    }
  }
  const qs = searchParams.toString();
  return qs ? `?${qs}` : "";
}

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url);
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`API error ${response.status}: ${text}`);
  }
  return response.json();
}

// ─── Responses ───

export async function getResponses(
  page: number,
  pageSize: number,
  sort: SortState,
  filters: ResponseFilters
): Promise<PaginatedResponse<SurveyResponse>> {
  const qs = buildQueryString({
    page,
    pageSize,
    sortBy: sort.sortBy,
    sortOrder: sort.sortOrder,
    ...filters,
  });
  return fetchJson(`${API_BASE}/responses${qs}`);
}

export function getResponsesExportUrl(filters: ResponseFilters, format: "csv" | "xlsx"): string {
  const qs = buildQueryString({ ...filters, format });
  return `${API_BASE}/responses/export${qs}`;
}

// ─── Participants ───

export async function getParticipants(
  page: number,
  pageSize: number,
  sort: SortState,
  filters: ParticipantFilters
): Promise<PaginatedResponse<Participant>> {
  const qs = buildQueryString({
    page,
    pageSize,
    sortBy: sort.sortBy,
    sortOrder: sort.sortOrder,
    ...filters,
  });
  return fetchJson(`${API_BASE}/participants${qs}`);
}

export function getParticipantsExportUrl(filters: ParticipantFilters, format: "csv" | "xlsx"): string {
  const qs = buildQueryString({ ...filters, format });
  return `${API_BASE}/participants/export${qs}`;
}

// ─── Questions ───

export async function getQuestions(
  sort: SortState,
  filters: QuestionFilters
): Promise<PaginatedResponse<Question>> {
  const qs = buildQueryString({
    sortBy: sort.sortBy,
    sortOrder: sort.sortOrder,
    ...filters,
  });
  return fetchJson(`${API_BASE}/questions${qs}`);
}

export function getQuestionsExportUrl(filters: QuestionFilters, format: "csv" | "xlsx"): string {
  const qs = buildQueryString({ ...filters, format });
  return `${API_BASE}/questions/export${qs}`;
}

// ─── Health ───

export async function getHealth(): Promise<{ status: string; database: string }> {
  return fetchJson(`${API_BASE}/health`);
}
