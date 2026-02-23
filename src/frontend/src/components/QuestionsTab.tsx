import { useCallback, useMemo } from "react";
import type { FC } from "react";
import {
  makeStyles,
  tokens,
  Select,
  Badge,
} from "@fluentui/react-components";
import { DataTable } from "./DataTable";
import { FilterToolbar } from "./FilterToolbar";
import { ExportButton } from "./ExportButton";
import { useDataFetch } from "../hooks/useDataFetch";
import { useExport } from "../hooks/useExport";
import { getQuestions, getQuestionsExportUrl } from "../services/api";
import type { Question, QuestionFilters, ColumnDef, PaginatedResponse, SortState } from "../types";

const useStyles = makeStyles({
  container: {
    display: "flex",
    flexDirection: "column",
    flex: 1,
    minHeight: 0,
    gap: tokens.spacingVerticalS,
  },
  filterRow: {
    display: "flex",
    alignItems: "center",
    gap: tokens.spacingHorizontalS,
    flexWrap: "wrap",
  },
});

interface QuestionsTabProps {
  onViewResponses?: (questionId: string) => void;
}

export const QuestionsTab: FC<QuestionsTabProps> = ({
  onViewResponses,
}) => {
  const styles = useStyles();
  const { triggerExport } = useExport();

  // Questions API doesn't paginate, but we wrap it to match the hook interface
  const fetchFn = useCallback(
    (
      _page: number,
      _pageSize: number,
      sort: SortState,
      filters: QuestionFilters
    ): Promise<PaginatedResponse<Question>> => getQuestions(sort, filters),
    []
  );

  const {
    data,
    pagination,
    loading,
    error,
    sort,
    filters,
    setSort,
    setPage,
    setPageSize,
    setFilters,
    refresh,
  } = useDataFetch<Question, QuestionFilters>({
    fetchFn,
    defaultSort: { sortBy: "question_order", sortOrder: "asc" },
    defaultFilters: {},
  });

  const columns: ColumnDef<Question>[] = useMemo(
    () => [
      { key: "id", label: "ID", sortable: true, minWidth: "60px", maxWidth: "80px" },
      { key: "question_id", label: "Question ID", sortable: true, minWidth: "100px", maxWidth: "120px" },
      { key: "question_text", label: "Question Text", sortable: false, minWidth: "300px" },
      { key: "question_order", label: "Order", sortable: true, minWidth: "70px", maxWidth: "90px" },
      {
        key: "is_active",
        label: "Status",
        sortable: true,
        minWidth: "80px",
        maxWidth: "100px",
        render: (val) => (
          <Badge
            appearance="filled"
            color={Number(val) === 1 ? "success" : "danger"}
            size="small"
          >
            {Number(val) === 1 ? "Active" : "Inactive"}
          </Badge>
        ),
      },
      {
        key: "created_at",
        label: "Created",
        sortable: true,
        minWidth: "140px",
        maxWidth: "180px",
        render: (val) => new Date(String(val)).toLocaleString(),
      },
    ],
    []
  );

  const handleSearchChange = useCallback(
    (value: string) => {
      setFilters({ ...filters, search: value || undefined });
    },
    [filters, setFilters]
  );

  const handleActiveFilter = useCallback(
    (_e: unknown, data: { value: string }) => {
      setFilters({ ...filters, isActive: data.value || undefined });
    },
    [filters, setFilters]
  );

  const handleRowClick = useCallback(
    (row: Question) => {
      if (onViewResponses) {
        onViewResponses(row.question_id);
      }
    },
    [onViewResponses]
  );

  return (
    <div className={styles.container}>
      <FilterToolbar
        searchValue={filters.search || ""}
        onSearchChange={handleSearchChange}
        onRefresh={refresh}
      >
        <div className={styles.filterRow}>
          <Select
            size="medium"
            value={filters.isActive || ""}
            onChange={handleActiveFilter}
          >
            <option value="">All Status</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </Select>
          <ExportButton
            onExportCsv={() =>
              triggerExport(getQuestionsExportUrl(filters, "csv"))
            }
            onExportExcel={() =>
              triggerExport(getQuestionsExportUrl(filters, "xlsx"))
            }
          />
        </div>
      </FilterToolbar>

      <DataTable<Question>
        columns={columns}
        data={data}
        pagination={pagination}
        sort={sort}
        loading={loading}
        error={error}
        onSortChange={setSort}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
        onRowClick={onViewResponses ? handleRowClick : undefined}
      />
    </div>
  );
};
