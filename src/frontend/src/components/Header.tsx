import { useEffect, useState } from "react";
import type { FC } from "react";
import {
  makeStyles,
  tokens,
  Text,
  Button,
  Avatar,
  Tooltip,
} from "@fluentui/react-components";
import {
  SignOut20Regular,
  DataBarVertical20Regular,
} from "@fluentui/react-icons";
import { getUserInfo } from "../services/api";

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
  userGroup: {
    display: "flex",
    alignItems: "center",
    gap: tokens.spacingHorizontalM,
  },
});

export const Header: FC = () => {
  const styles = useStyles();
  const [userName, setUserName] = useState<string | null>(null);

  useEffect(() => {
    getUserInfo().then((info) => {
      if (info.clientPrincipal) {
        setUserName(info.clientPrincipal.userDetails);
      }
    });
  }, []);

  return (
    <header className={styles.header}>
      <div className={styles.titleGroup}>
        <DataBarVertical20Regular />
        <Text size={500} weight="semibold">
          Partner Developer Report
        </Text>
      </div>
      <div className={styles.userGroup}>
        {userName && (
          <>
            <Avatar name={userName} size={28} color="colorful" />
            <Text size={300}>{userName}</Text>
            <Tooltip content="Sign out" relationship="label">
              <Button
                as="a"
                href="/.auth/logout"
                appearance="transparent"
                icon={
                  <SignOut20Regular
                    style={{ color: tokens.colorNeutralForegroundOnBrand }}
                  />
                }
                style={{ color: tokens.colorNeutralForegroundOnBrand }}
              />
            </Tooltip>
          </>
        )}
      </div>
    </header>
  );
};
