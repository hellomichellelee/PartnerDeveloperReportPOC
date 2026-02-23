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
      { key: "participant_id", label: "Participant ID", sortable: true, minWidth: "100px", maxWidth: "140px" },
      { key: "question_id", label: "Question", sortable: true, minWidth: "80px", maxWidth: "100px" },
      {
        key: "response_text",
        label: "Response",
        sortable: false,
        minWidth: "200px",
        maxWidth: "400px",
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

  const handleParticipantFilter = useCallback(
    (_e: unknown, data: { value: string }) => {
      setFilters({ ...filters, participantId: data.value || undefined });
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
            value={filters.participantId || ""}
            onChange={handleParticipantFilter}
          >
            <option value="">All Participants</option>
            {Array.from(
              new Set(data.map((r) => r.participant_id).filter((id): id is number => id != null))
            )
              .sort((a, b) => a - b)
              .map((id) => (
                <option key={id} value={String(id)}>
                  {id}
                </option>
              ))}
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
                    Participant: {detailRow.participant_id ?? "N/A"} | Input:{" "}
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
