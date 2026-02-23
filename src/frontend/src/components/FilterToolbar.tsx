import { useState, useCallback } from "react";
import type { FC, ReactNode, KeyboardEvent } from "react";
import {
  Input,
  Button,
  makeStyles,
  tokens,
} from "@fluentui/react-components";
import {
  Search20Regular,
  ArrowClockwise20Regular,
  Dismiss16Regular,
} from "@fluentui/react-icons";

const useStyles = makeStyles({
  toolbar: {
    display: "flex",
    alignItems: "center",
    gap: tokens.spacingHorizontalS,
    flexWrap: "wrap",
    padding: `${tokens.spacingVerticalS} 0`,
  },
  searchBox: {
    minWidth: "250px",
    flex: "0 1 350px",
  },
});

interface FilterToolbarProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  onRefresh: () => void;
  children?: ReactNode; // Additional filter controls
}

export const FilterToolbar: FC<FilterToolbarProps> = ({
  searchValue,
  onSearchChange,
  onRefresh,
  children,
}) => {
  const styles = useStyles();
  const [localSearch, setLocalSearch] = useState(searchValue);

  const handleSearchSubmit = useCallback(() => {
    onSearchChange(localSearch);
  }, [localSearch, onSearchChange]);

  const handleClear = useCallback(() => {
    setLocalSearch("");
    onSearchChange("");
  }, [onSearchChange]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Enter") handleSearchSubmit();
    },
    [handleSearchSubmit]
  );

  return (
    <div className={styles.toolbar}>
      <Input
        className={styles.searchBox}
        placeholder="Search..."
        size="medium"
        contentBefore={<Search20Regular />}
        contentAfter={
          localSearch ? (
            <Button
              appearance="transparent"
              icon={<Dismiss16Regular />}
              size="small"
              onClick={handleClear}
              aria-label="Clear search"
            />
          ) : undefined
        }
        value={localSearch}
        onChange={(_e, data) => setLocalSearch(data.value)}
        onKeyDown={handleKeyDown}
      />
      <Button appearance="primary" onClick={handleSearchSubmit}>
        Search
      </Button>
      {children}
      <Button
        appearance="subtle"
        icon={<ArrowClockwise20Regular />}
        onClick={onRefresh}
        aria-label="Refresh data"
      >
        Refresh
      </Button>
    </div>
  );
};
