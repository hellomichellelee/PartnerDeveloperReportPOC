import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableHeaderCell,
  TableRow,
  Spinner,
  Text,
  makeStyles,
  tokens,
  Select,
  Button,
} from "@fluentui/react-components";
import {
  ChevronLeft20Regular,
  ChevronRight20Regular,
  ArrowUp16Regular,
  ArrowDown16Regular,
} from "@fluentui/react-icons";
import type { ColumnDef, Pagination, SortState } from "../types";

const useStyles = makeStyles({
  container: {
    display: "flex",
    flexDirection: "column",
    gap: tokens.spacingVerticalM,
    flex: 1,
    minHeight: 0,
  },
  tableWrapper: {
    overflow: "auto",
    flex: 1,
    border: `1px solid ${tokens.colorNeutralStroke2}`,
    borderRadius: tokens.borderRadiusMedium,
  },
  table: {
    minWidth: "800px",
  },
  headerCell: {
    cursor: "pointer",
    userSelect: "none",
    fontWeight: tokens.fontWeightSemibold,
    "&:hover": {
      backgroundColor: tokens.colorNeutralBackground1Hover,
    },
  },
  headerCellContent: {
    display: "flex",
    alignItems: "center",
    gap: tokens.spacingHorizontalXS,
  },
  nonSortable: {
    cursor: "default",
    "&:hover": {
      backgroundColor: "transparent",
    },
  },
  paginationBar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: tokens.spacingHorizontalM,
    padding: `${tokens.spacingVerticalS} 0`,
  },
  paginationControls: {
    display: "flex",
    alignItems: "center",
    gap: tokens.spacingHorizontalS,
  },
  centered: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: tokens.spacingVerticalXXL,
  },
  truncatedCell: {
    maxWidth: "300px",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
});

interface DataTableProps<T extends { [key: string]: unknown }> {
  columns: ColumnDef<T>[];
  data: T[];
  pagination: Pagination;
  sort: SortState;
  loading: boolean;
  error: string | null;
  onSortChange: (sort: SortState) => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onRowClick?: (row: T) => void;
}

export function DataTable<T extends { [key: string]: unknown }>({
  columns,
  data,
  pagination,
  sort,
  loading,
  error,
  onSortChange,
  onPageChange,
  onPageSizeChange,
  onRowClick,
}: DataTableProps<T>) {
  const styles = useStyles();

  const handleHeaderClick = (col: ColumnDef<T>) => {
    if (!col.sortable) return;
    const newOrder =
      sort.sortBy === col.key && sort.sortOrder === "asc" ? "desc" : "asc";
    onSortChange({ sortBy: col.key, sortOrder: newOrder });
  };

  if (loading) {
    return (
      <div className={styles.centered}>
        <Spinner size="large" label="Loading data..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.centered}>
        <Text style={{ color: tokens.colorPaletteRedForeground1 }}>
          Error: {error}
        </Text>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className={styles.centered}>
        <Text size={400} style={{ color: tokens.colorNeutralForeground3 }}>
          No records found. Try adjusting your filters.
        </Text>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.tableWrapper}>
        <Table className={styles.table} size="small">
          <TableHeader>
            <TableRow>
              {columns.map((col) => (
                <TableHeaderCell
                  key={col.key}
                  className={`${styles.headerCell} ${!col.sortable ? styles.nonSortable : ""}`}
                  onClick={() => handleHeaderClick(col)}
                  style={{
                    minWidth: col.minWidth,
                    maxWidth: col.maxWidth,
                  }}
                >
                  <div className={styles.headerCellContent}>
                    {col.label}
                    {col.sortable && sort.sortBy === col.key && (
                      sort.sortOrder === "asc" ? (
                        <ArrowUp16Regular />
                      ) : (
                        <ArrowDown16Regular />
                      )
                    )}
                  </div>
                </TableHeaderCell>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row, idx) => (
              <TableRow
                key={idx}
                onClick={() => onRowClick?.(row)}
                style={{ cursor: onRowClick ? "pointer" : "default" }}
              >
                {columns.map((col) => (
                  <TableCell
                    key={col.key}
                    className={styles.truncatedCell}
                    style={{
                      minWidth: col.minWidth,
                      maxWidth: col.maxWidth,
                    }}
                    title={String(row[col.key] ?? "")}
                  >
                    {col.render
                      ? col.render(row[col.key] as T[keyof T], row)
                      : String(row[col.key] ?? "")}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className={styles.paginationBar}>
        <div className={styles.paginationControls}>
          <Text size={200}>Rows per page:</Text>
          <Select
            size="small"
            value={String(pagination.pageSize)}
            onChange={(_e, data) => onPageSizeChange(Number(data.value))}
          >
            <option value="10">10</option>
            <option value="25">25</option>
            <option value="50">50</option>
            <option value="100">100</option>
          </Select>
        </div>

        <Text size={200}>
          {pagination.totalRecords === 0
            ? "No records"
            : `${(pagination.page - 1) * pagination.pageSize + 1}–${Math.min(
                pagination.page * pagination.pageSize,
                pagination.totalRecords
              )} of ${pagination.totalRecords}`}
        </Text>

        <div className={styles.paginationControls}>
          <Button
            icon={<ChevronLeft20Regular />}
            appearance="subtle"
            size="small"
            disabled={pagination.page <= 1}
            onClick={() => onPageChange(pagination.page - 1)}
            aria-label="Previous page"
          />
          <Text size={200}>
            Page {pagination.page} of {pagination.totalPages}
          </Text>
          <Button
            icon={<ChevronRight20Regular />}
            appearance="subtle"
            size="small"
            disabled={pagination.page >= pagination.totalPages}
            onClick={() => onPageChange(pagination.page + 1)}
            aria-label="Next page"
          />
        </div>
      </div>
    </div>
  );
}
