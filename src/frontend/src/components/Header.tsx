import type { FC } from "react";
import {
  makeStyles,
  tokens,
  Text,
} from "@fluentui/react-components";
import {
  DataBarVertical20Regular,
} from "@fluentui/react-icons";

const useStyles = makeStyles({
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: `${tokens.spacingVerticalM} ${tokens.spacingHorizontalXL}`,
    backgroundColor: tokens.colorBrandBackground,
    color: tokens.colorNeutralForegroundOnBrand,
    boxShadow: tokens.shadow4,
    flexShrink: 0,
  },
  titleGroup: {
    display: "flex",
    alignItems: "center",
    gap: tokens.spacingHorizontalS,
  },
});

export const Header: FC = () => {
  const styles = useStyles();

  return (
    <header className={styles.header}>
      <div className={styles.titleGroup}>
        <DataBarVertical20Regular />
        <Text size={500} weight="semibold">
          Partner Developer Report
        </Text>
      </div>
    </header>
  );
};
