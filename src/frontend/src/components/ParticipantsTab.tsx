import { useCallback, useMemo } from "react";
import type { FC } from "react";
import {
  makeStyles,
  tokens,
} from "@fluentui/react-components";
import { DataTable } from "./DataTable";
import { FilterToolbar } from "./FilterToolbar";
import { ExportButton } from "./ExportButton";
import { useDataFetch } from "../hooks/useDataFetch";
import { useExport } from "../hooks/useExport";
import { getParticipants, getParticipantsExportUrl } from "../services/api";
import type { Participant, ParticipantFilters, ColumnDef } from "../types";

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

interface ParticipantsTabProps {
  onViewResponses?: (submissionId: string) => void;
}

export const ParticipantsTab: FC<ParticipantsTabProps> = ({
  onViewResponses,
}) => {
  const styles = useStyles();
  const { triggerExport } = useExport();

  const fetchFn = useCallback(
    (
      page: number,
      pageSize: number,
      sort: { sortBy: string; sortOrder: "asc" | "desc" },
      filters: ParticipantFilters
    ) => getParticipants(page, pageSize, sort, filters),
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
  } = useDataFetch<Participant, ParticipantFilters>({
    fetchFn,
    defaultSort: { sortBy: "created_at", sortOrder: "desc" },
    defaultFilters: {},
  });

  const columns: ColumnDef<Participant>[] = useMemo(
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
      { key: "first_name", label: "First Name", sortable: true, minWidth: "100px" },
      { key: "last_name", label: "Last Name", sortable: true, minWidth: "100px" },
      { key: "email", label: "Email", sortable: true, minWidth: "180px" },
      {
        key: "consent_given",
        label: "Consent",
        sortable: true,
        minWidth: "70px",
        maxWidth: "90px",
        render: (val) => (Number(val) === 1 ? "Yes" : "No"),
      },
      {
        key: "consent_timestamp",
        label: "Consent Time",
        sortable: true,
        minWidth: "140px",
        maxWidth: "180px",
        render: (val) => (val ? new Date(String(val)).toLocaleString() : "—"),
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

  const handleRowClick = useCallback(
    (row: Participant) => {
      if (onViewResponses) {
        onViewResponses(row.submission_id);
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
          <ExportButton
            onExportCsv={() =>
              triggerExport(getParticipantsExportUrl(filters, "csv"))
            }
            onExportExcel={() =>
              triggerExport(getParticipantsExportUrl(filters, "xlsx"))
            }
          />
        </div>
      </FilterToolbar>

      <DataTable<Participant>
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
