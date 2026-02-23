import { useState, useEffect, useCallback } from "react";
import type { PaginatedResponse, Pagination, SortState } from "../types";

interface UseDataFetchOptions<T, F> {
  fetchFn: (page: number, pageSize: number, sort: SortState, filters: F) => Promise<PaginatedResponse<T>>;
  defaultSort: SortState;
  defaultFilters: F;
  defaultPageSize?: number;
}

interface UseDataFetchResult<T, F> {
  data: T[];
  pagination: Pagination;
  loading: boolean;
  error: string | null;
  page: number;
  pageSize: number;
  sort: SortState;
  filters: F;
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
  setSort: (sort: SortState) => void;
  setFilters: (filters: F) => void;
  refresh: () => void;
}

export function useDataFetch<T, F>(
  options: UseDataFetchOptions<T, F>
): UseDataFetchResult<T, F> {
  const { fetchFn, defaultSort, defaultFilters, defaultPageSize = 25 } = options;

  const [data, setData] = useState<T[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    pageSize: defaultPageSize,
    totalRecords: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(defaultPageSize);
  const [sort, setSort] = useState<SortState>(defaultSort);
  const [filters, setFilters] = useState<F>(defaultFilters);
  const [refreshKey, setRefreshKey] = useState(0);

  const refresh = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetchFn(page, pageSize, sort, filters)
      .then((result) => {
        if (!cancelled) {
          setData(result.data);
          setPagination(result.pagination);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.message || "Failed to fetch data");
          setData([]);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [fetchFn, page, pageSize, sort, filters, refreshKey]);

  // Reset to page 1 when filters or pageSize change
  useEffect(() => {
    setPage(1);
  }, [filters, pageSize]);

  return {
    data,
    pagination,
    loading,
    error,
    page,
    pageSize,
    sort,
    filters,
    setPage,
    setPageSize,
    setSort,
    setFilters,
    refresh,
  };
}
