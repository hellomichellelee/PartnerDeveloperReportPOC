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
} from "@fluentui/react-components";
import { ArrowLeft20Regular } from "@fluentui/react-icons";
import { DataTable } from "./DataTable";
import { useDataFetch } from "../hooks/useDataFetch";
import { getInsights, getInsightReferences } from "../services/api";
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
  },
  cardBody: {
    padding: `0 ${tokens.spacingHorizontalM}`,
    flex: 1,
  },
  centered: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: tokens.spacingVerticalXXL,
  },
  detailHeader: {
    display: "flex",
    flexDirection: "column",
    gap: tokens.spacingVerticalXS,
    paddingBottom: tokens.spacingVerticalM,
  },
  backButton: {
    alignSelf: "flex-start",
    marginBottom: tokens.spacingVerticalS,
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

  // Fetch all insight cards
  useEffect(() => {
    let cancelled = false;
    setLoadingCards(true);
    setCardsError(null);

    getInsights()
      .then((result) => {
        if (!cancelled) setInsights(result.data);
      })
      .catch((err) => {
        if (!cancelled)
          setCardsError(err.message || "Failed to load insights");
      })
      .finally(() => {
        if (!cancelled) setLoadingCards(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

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
        minWidth: "300px",
      },
      {
        key: "participant_id",
        label: "Participant ID",
        sortable: true,
        minWidth: "120px",
        maxWidth: "160px",
      },
      {
        key: "created_at",
        label: "Created",
        sortable: true,
        minWidth: "140px",
        maxWidth: "180px",
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
      <Button
        className={styles.backButton}
        appearance="subtle"
        icon={<ArrowLeft20Regular />}
        onClick={handleBackToCards}
      >
        Back to Insights
      </Button>

      <div className={styles.detailHeader}>
        <Title3>{selectedInsight.theme_name}</Title3>
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
      />
    </div>
  );
};
