/** TypeScript types for the Partner Developer Report app. */

import type { ReactNode } from "react";

// ─── API Response Envelope ───

export interface PaginatedResponse<T> {
  data: T[];
  pagination: Pagination;
}

export interface Pagination {
  page: number;
  pageSize: number;
  totalRecords: number;
  totalPages: number;
}

// ─── Database entities ───

export interface SurveyResponse {
  [key: string]: unknown;
  id: number;
  submission_id: string;
  question_id: string;
  question_text: string;
  response_text: string;
  input_method: "voice" | "text";
  processed: number; // 0 or 1 from SQL BIT
  created_at: string;
  updated_at: string;
}

export interface Participant {
  [key: string]: unknown;
  id: number;
  submission_id: string;
  first_name: string;
  last_name: string;
  email: string;
  consent_given: number;
  consent_timestamp: string;
  created_at: string;
  updated_at: string;
}

export interface Question {
  [key: string]: unknown;
  id: number;
  question_id: string;
  question_text: string;
  question_order: number;
  is_active: number;
  created_at: string;
  updated_at: string;
}

// ─── Filter Types ───

export interface ResponseFilters {
  questionId?: string;
  inputMethod?: string;
  processed?: string;
  startDate?: string;
  endDate?: string;
  submissionId?: string;
  search?: string;
}

export interface ParticipantFilters {
  search?: string;
  startDate?: string;
  endDate?: string;
}

export interface QuestionFilters {
  isActive?: string;
  search?: string;
}

// ─── Sort State ───

export interface SortState {
  sortBy: string;
  sortOrder: "asc" | "desc";
}

// ─── Column Def ───

export interface ColumnDef<T> {
  key: keyof T & string;
  label: string;
  sortable?: boolean;
  minWidth?: string;
  maxWidth?: string;
  render?: (value: T[keyof T], row: T) => ReactNode;
}


