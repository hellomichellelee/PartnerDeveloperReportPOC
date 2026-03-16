import { useCallback, useMemo, useState } from "react";
import type { FC } from "react";
import {
  makeStyles,
  tokens,
  Select,
  Badge,
  Dialog,
  DialogSurface,
  DialogBody,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Text,
} from "@fluentui/react-components";
import { Dismiss24Regular } from "@fluentui/react-icons";
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
  dialogContent: {
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
    maxHeight: "60vh",
    overflow: "auto",
  },
});

export const QuestionsTab: FC = () => {
  const styles = useStyles();
  const { triggerExport } = useExport();
  const [detailRow, setDetailRow] = useState<Question | null>(null);

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
  } = useDataFetch<Question, QuestionFilters>({
    fetchFn,
    defaultSort: { sortBy: "question_order", sortOrder: "asc" },
    defaultFilters: {},
  });

  const columns: ColumnDef<Question>[] = useMemo(
    () => [
      { key: "id", label: "ID", sortable: true, minWidth: "60px", maxWidth: "80px" },
      { key: "question_id", label: "Question ID", sortable: true, minWidth: "100px", maxWidth: "120px" },
      { key: "topic", label: "Topic", sortable: true, minWidth: "100px", maxWidth: "140px" },
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

  const handleTopicFilter = useCallback(
    (_e: unknown, data: { value: string }) => {
      setFilters({ ...filters, topic: data.value || undefined });
    },
    [filters, setFilters]
  );

  const handleRowClick = useCallback(
    (row: Question) => {
      setDetailRow(row);
    },
    []
  );

  return (
    <div className={styles.container}>
      <FilterToolbar
        searchValue={filters.search || ""}
        onSearchChange={handleSearchChange}
      >
        <div className={styles.filterRow}>
          <Select
            size="medium"
            value={filters.topic || ""}
            onChange={handleTopicFilter}
          >
            <option value="">All Topics</option>
            <option value="Context">Context</option>
            <option value="Onboarding">Onboarding</option>
            <option value="Development">Development</option>
            <option value="Integration">Integration</option>
            <option value="Testing">Testing</option>
            <option value="Publishing">Publishing</option>
            <option value="Wrap-Up">Wrap-Up</option>
          </Select>
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
        onRowClick={handleRowClick}
      />

      {/* Detail Dialog */}
      <Dialog
        open={detailRow !== null}
        onOpenChange={(_e, data) => {
          if (!data.open) setDetailRow(null);
        }}
      >
        <DialogSurface>
          <DialogBody>
            <DialogTitle
              action={
                <Button
                  appearance="subtle"
                  icon={<Dismiss24Regular />}
                  onClick={() => setDetailRow(null)}
                />
              }
            >
              Question Detail — {detailRow?.question_id}
            </DialogTitle>
            <DialogContent>
              {detailRow && (
                <div className={styles.dialogContent}>
                  <Text weight="semibold" block>Question ID:</Text>
                  <Text block style={{ marginBottom: tokens.spacingVerticalM }}>
                    {detailRow.question_id}
                  </Text>
                  <Text weight="semibold" block>Topic:</Text>
                  <Text block style={{ marginBottom: tokens.spacingVerticalM }}>
                    {detailRow.topic}
                  </Text>
                  <Text weight="semibold" block>Question Text:</Text>
                  <Text block style={{ marginBottom: tokens.spacingVerticalM }}>
                    {detailRow.question_text}
                  </Text>
                  <Text weight="semibold" block>Order:</Text>
                  <Text block style={{ marginBottom: tokens.spacingVerticalM }}>
                    {detailRow.question_order}
                  </Text>
                  <Text weight="semibold" block>Status:</Text>
                  <Text block style={{ marginBottom: tokens.spacingVerticalM }}>
                    {Number(detailRow.is_active) === 1 ? "Active" : "Inactive"}
                  </Text>
                  <Text
                    size={200}
                    style={{
                      color: tokens.colorNeutralForeground3,
                      marginTop: tokens.spacingVerticalM,
                      display: "block",
                    }}
                  >
                    Created: {new Date(detailRow.created_at).toLocaleString()}
                  </Text>
                </div>
              )}
            </DialogContent>
            <DialogActions>
              <Button appearance="secondary" onClick={() => setDetailRow(null)}>
                Close
              </Button>
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>
    </div>
  );
};
