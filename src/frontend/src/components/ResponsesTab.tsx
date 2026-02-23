import { useCallback, useMemo, useState } from "react";
import type { FC } from "react";
import {
  makeStyles,
  tokens,
  Select,
  Dialog,
  DialogSurface,
  DialogBody,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Text,
  Badge,
} from "@fluentui/react-components";
import { Dismiss24Regular } from "@fluentui/react-icons";
import { DataTable } from "./DataTable";
import { FilterToolbar } from "./FilterToolbar";
import { ExportButton } from "./ExportButton";
import { useDataFetch } from "../hooks/useDataFetch";
import { useExport } from "../hooks/useExport";
import { getResponses, getResponsesExportUrl } from "../services/api";
import type { SurveyResponse, ResponseFilters, ColumnDef } from "../types";

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

export const ResponsesTab: FC = () => {
  const styles = useStyles();
  const { triggerExport } = useExport();
  const [detailRow, setDetailRow] = useState<SurveyResponse | null>(null);

  const fetchFn = useCallback(
    (page: number, pageSize: number, sort: { sortBy: string; sortOrder: "asc" | "desc" }, filters: ResponseFilters) =>
      getResponses(page, pageSize, sort, filters),
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
  } = useDataFetch<SurveyResponse, ResponseFilters>({
    fetchFn,
    defaultSort: { sortBy: "created_at", sortOrder: "desc" },
    defaultFilters: {},
  });

  const columns: ColumnDef<SurveyResponse>[] = useMemo(
    () => [
      { key: "id", label: "ID", sortable: true, minWidth: "60px", maxWidth: "80px" },
      {
        key: "submission_id",
        label: "Submission",
        sortable: true,
        minWidth: "120px",
        maxWidth: "180px",
        render: (val) => String(val).substring(0, 8) + "…",
      },
      { key: "question_id", label: "Question", sortable: true, minWidth: "80px", maxWidth: "100px" },
      {
        key: "response_text",
        label: "Response",
        sortable: false,
        minWidth: "200px",
        maxWidth: "400px",
      },
      {
        key: "input_method",
        label: "Input",
        sortable: true,
        minWidth: "70px",
        maxWidth: "90px",
        render: (val) => (
          <Badge
            appearance="filled"
            color={val === "voice" ? "informative" : "subtle"}
            size="small"
          >
            {String(val)}
          </Badge>
        ),
      },
      {
        key: "processed",
        label: "Processed",
        sortable: true,
        minWidth: "80px",
        maxWidth: "100px",
        render: (val) => (Number(val) === 1 ? "Yes" : "No"),
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

  const handleQuestionFilter = useCallback(
    (_e: unknown, data: { value: string }) => {
      setFilters({ ...filters, questionId: data.value || undefined });
    },
    [filters, setFilters]
  );

  const handleInputMethodFilter = useCallback(
    (_e: unknown, data: { value: string }) => {
      setFilters({ ...filters, inputMethod: data.value || undefined });
    },
    [filters, setFilters]
  );

  const handleProcessedFilter = useCallback(
    (_e: unknown, data: { value: string }) => {
      setFilters({ ...filters, processed: data.value || undefined });
    },
    [filters, setFilters]
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
            value={filters.questionId || ""}
            onChange={handleQuestionFilter}
          >
            <option value="">All Questions</option>
            <option value="q1">Q1</option>
            <option value="q2">Q2</option>
            <option value="q3">Q3</option>
            <option value="q4">Q4</option>
            <option value="q5">Q5</option>
          </Select>
          <Select
            size="medium"
            value={filters.inputMethod || ""}
            onChange={handleInputMethodFilter}
          >
            <option value="">All Input</option>
            <option value="voice">Voice</option>
            <option value="text">Text</option>
          </Select>
          <Select
            size="medium"
            value={filters.processed || ""}
            onChange={handleProcessedFilter}
          >
            <option value="">All Status</option>
            <option value="true">Processed</option>
            <option value="false">Unprocessed</option>
          </Select>
          <ExportButton
            onExportCsv={() => triggerExport(getResponsesExportUrl(filters, "csv"))}
            onExportExcel={() => triggerExport(getResponsesExportUrl(filters, "xlsx"))}
          />
        </div>
      </FilterToolbar>

      <DataTable<SurveyResponse>
        columns={columns}
        data={data}
        pagination={pagination}
        sort={sort}
        loading={loading}
        error={error}
        onSortChange={setSort}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
        onRowClick={setDetailRow}
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
              Response Detail — {detailRow?.question_id}
            </DialogTitle>
            <DialogContent>
              {detailRow && (
                <>
                  <Text weight="semibold" block>
                    Question:
                  </Text>
                  <Text block style={{ marginBottom: tokens.spacingVerticalM }}>
                    {detailRow.question_text}
                  </Text>
                  <Text weight="semibold" block>
                    Response:
                  </Text>
                  <div className={styles.dialogContent}>
                    {detailRow.response_text}
                  </div>
                  <Text
                    size={200}
                    style={{
                      color: tokens.colorNeutralForeground3,
                      marginTop: tokens.spacingVerticalM,
                      display: "block",
                    }}
                  >
                    Submission: {detailRow.submission_id} | Input:{" "}
                    {detailRow.input_method} | Created:{" "}
                    {new Date(detailRow.created_at).toLocaleString()}
                  </Text>
                </>
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
