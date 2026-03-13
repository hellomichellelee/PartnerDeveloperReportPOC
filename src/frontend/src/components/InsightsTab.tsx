import { useState, useEffect, useCallback, useMemo } from "react";
import type { FC } from "react";
import {
  makeStyles,
  tokens,
  Card,
  CardHeader,
  CardFooter,
  Text,
  Button,
  Spinner,
  Title3,
  Body1,
  Caption1,
  Dialog,
  DialogSurface,
  DialogBody,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@fluentui/react-components";
import { ArrowLeft20Regular, ArrowSync20Regular, Dismiss24Regular } from "@fluentui/react-icons";
import { DataTable } from "./DataTable";
import { useDataFetch } from "../hooks/useDataFetch";
import { getInsights, getInsightReferences, refreshInsights } from "../services/api";
import type {
  Insight,
  InsightReference,
  ColumnDef,
  SortState,
  PaginatedResponse,
} from "../types";

const useStyles = makeStyles({
  container: {
    display: "flex",
    flexDirection: "column",
    flex: 1,
    minHeight: 0,
    gap: tokens.spacingVerticalS,
  },
  cardsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
    gap: tokens.spacingHorizontalL,
    padding: `${tokens.spacingVerticalM} 0`,
    overflow: "auto",
    flex: 1,
  },
  card: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    minHeight: "180px",
    maxHeight: "270px",
  },
  cardBody: {
    padding: 0,
    flex: 1,
    overflow: "hidden",
  },
  refreshBar: {
    display: "flex",
    alignItems: "center",
    gap: tokens.spacingHorizontalS,
    flexShrink: 0,
  },
  centered: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: tokens.spacingVerticalXXL,
  },
  detailHeaderRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: tokens.spacingHorizontalM,
  },
  detailSubheader: {
    paddingBottom: tokens.spacingVerticalM,
  },
  dialogContent: {
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
    maxHeight: "60vh",
    overflow: "auto",
  },
});

interface EmptyFilters {}

export const InsightsTab: FC = () => {
  const styles = useStyles();

  // ─── Cards view state ───
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loadingCards, setLoadingCards] = useState(true);
  const [cardsError, setCardsError] = useState<string | null>(null);

  // ─── Drill-down state ───
  const [selectedInsight, setSelectedInsight] = useState<Insight | null>(null);

  // ─── Refresh state ───
  const [refreshing, setRefreshing] = useState(false);
  const [refreshError, setRefreshError] = useState<string | null>(null);

  // ─── Reference detail modal state ───
  const [detailRef, setDetailRef] = useState<InsightReference | null>(null);

  // Fetch all insight cards
  const loadInsights = useCallback(() => {
    setLoadingCards(true);
    setCardsError(null);

    getInsights()
      .then((result) => {
        setInsights(result.data);
      })
      .catch((err) => {
        setCardsError(err.message || "Failed to load insights");
      })
      .finally(() => {
        setLoadingCards(false);
      });
  }, []);

  useEffect(() => {
    loadInsights();
  }, [loadInsights]);

  // Handle refresh button click
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    setRefreshError(null);
    try {
      await refreshInsights();
      loadInsights();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to refresh insights";
      setRefreshError(message);
    } finally {
      setRefreshing(false);
    }
  }, [loadInsights]);

  // ─── References data fetch (driven by selectedInsight) ───
  const fetchReferencesFn = useCallback(
    (
      page: number,
      pageSize: number,
      sort: SortState,
      _filters: EmptyFilters
    ): Promise<PaginatedResponse<InsightReference>> => {
      if (!selectedInsight) {
        return Promise.resolve({
          data: [],
          pagination: {
            page: 1,
            pageSize: 25,
            totalRecords: 0,
            totalPages: 0,
          },
        });
      }
      return getInsightReferences(selectedInsight.id, page, pageSize, sort);
    },
    [selectedInsight]
  );

  const {
    data: references,
    pagination: refPagination,
    loading: refLoading,
    error: refError,
    sort: refSort,
    setSort: setRefSort,
    setPage: setRefPage,
    setPageSize: setRefPageSize,
  } = useDataFetch<InsightReference, EmptyFilters>({
    fetchFn: fetchReferencesFn,
    defaultSort: { sortBy: "created_at", sortOrder: "desc" },
    defaultFilters: {},
  });

  const referenceColumns: ColumnDef<InsightReference>[] = useMemo(
    () => [
      {
        key: "excerpt",
        label: "Excerpt",
        sortable: false,
        minWidth: "500px",
      },
      {
        key: "participant_id",
        label: "Participant ID",
        sortable: true,
        minWidth: "80px",
        maxWidth: "110px",
      },
      {
        key: "created_at",
        label: "Created",
        sortable: true,
        minWidth: "110px",
        maxWidth: "150px",
        render: (val) =>
          val ? new Date(String(val)).toLocaleString() : "—",
      },
    ],
    []
  );

  const handleBackToCards = useCallback(() => {
    setSelectedInsight(null);
  }, []);

  // ─── Cards View ───
  if (!selectedInsight) {
    if (loadingCards) {
      return (
        <div className={styles.centered}>
          <Spinner size="large" label="Loading insights..." />
        </div>
      );
    }

    if (cardsError) {
      return (
        <div className={styles.centered}>
          <Text style={{ color: tokens.colorPaletteRedForeground1 }}>
            Error: {cardsError}
          </Text>
        </div>
      );
    }

    if (insights.length === 0) {
      return (
        <div className={styles.centered}>
          <Text size={400} style={{ color: tokens.colorNeutralForeground3 }}>
            No insights found.
          </Text>
        </div>
      );
    }

    return (
      <div className={styles.container}>
        <div className={styles.refreshBar}>
          <Button
            appearance="subtle"
            icon={refreshing ? <Spinner size="tiny" /> : <ArrowSync20Regular />}
            disabled={refreshing}
            onClick={handleRefresh}
          >
            {refreshing ? "Refreshing…" : "Refresh"}
          </Button>
          {refreshError && (
            <Text size={200} style={{ color: tokens.colorPaletteRedForeground1 }}>
              {refreshError}
            </Text>
          )}
        </div>
        <div className={styles.cardsGrid}>
          {insights.map((insight) => (
            <Card key={insight.id} className={styles.card} size="large">
              <CardHeader header={<Title3>{insight.theme_name}</Title3>} />
              <div className={styles.cardBody}>
                <Body1>{insight.theme_summary}</Body1>
              </div>
              <CardFooter>
                <Button
                  appearance="primary"
                  onClick={() => setSelectedInsight(insight)}
                >
                  {insight.occurrence_count} References
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // ─── References Detail View ───
  return (
    <div className={styles.container}>
      <div className={styles.detailHeaderRow}>
        <Title3>{selectedInsight.theme_name}</Title3>
        <Button
          appearance="subtle"
          icon={<ArrowLeft20Regular />}
          onClick={handleBackToCards}
        >
          Back to Insights
        </Button>
      </div>
      <div className={styles.detailSubheader}>
        <Caption1>{selectedInsight.theme_summary}</Caption1>
      </div>

      <DataTable<InsightReference>
        columns={referenceColumns}
        data={references}
        pagination={refPagination}
        sort={refSort}
        loading={refLoading}
        error={refError}
        onSortChange={setRefSort}
        onPageChange={setRefPage}
        onPageSizeChange={setRefPageSize}
        onRowClick={setDetailRef}
      />

      {/* Reference Detail Dialog */}
      <Dialog
        open={detailRef !== null}
        onOpenChange={(_e, data) => {
          if (!data.open) setDetailRef(null);
        }}
      >
        <DialogSurface>
          <DialogBody>
            <DialogTitle
              action={
                <Button
                  appearance="subtle"
                  icon={<Dismiss24Regular />}
                  onClick={() => setDetailRef(null)}
                />
              }
            >
              Reference Detail
            </DialogTitle>
            <DialogContent>
              {detailRef && (
                <>
                  <Text weight="semibold" block>
                    Excerpt:
                  </Text>
                  <div className={styles.dialogContent}>
                    {detailRef.excerpt}
                  </div>
                  <Text
                    size={200}
                    style={{
                      color: tokens.colorNeutralForeground3,
                      marginTop: tokens.spacingVerticalM,
                      display: "block",
                    }}
                  >
                    Participant: {detailRef.participant_id ?? "N/A"} | Created:{" "}
                    {new Date(detailRef.created_at).toLocaleString()}
                  </Text>
                </>
              )}
            </DialogContent>
            <DialogActions>
              <Button appearance="secondary" onClick={() => setDetailRef(null)}>
                Close
              </Button>
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>
    </div>
  );
};
