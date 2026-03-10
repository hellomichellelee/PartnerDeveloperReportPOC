import type { FC } from "react";
import {
  makeStyles,
  tokens,
  Text,
} from "@fluentui/react-components";
import {
  DataBarVertical24Regular,
} from "@fluentui/react-icons";

const useStyles = makeStyles({
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: `${tokens.spacingVerticalL} ${tokens.spacingHorizontalXXL}`,
    backgroundColor: tokens.colorNeutralBackground1,
    borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
    boxShadow: tokens.shadow2,
    flexShrink: 0,
  },
  titleGroup: {
    display: "flex",
    alignItems: "center",
    gap: tokens.spacingHorizontalM,
  },
  icon: {
    color: tokens.colorBrandForeground1,
    fontSize: '24px',
  },
  title: {
    color: tokens.colorNeutralForeground1,
  },
});

export const Header: FC = () => {
  const styles = useStyles();

  return (
    <header className={styles.header}>
      <div className={styles.titleGroup}>
        <DataBarVertical24Regular className={styles.icon} />
        <Text size={500} weight="semibold" className={styles.title}>
          Partner Developer Report
        </Text>
      </div>
    </header>
  );
};
