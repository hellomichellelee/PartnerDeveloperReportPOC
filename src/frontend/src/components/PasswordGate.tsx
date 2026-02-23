import { useState, useCallback } from "react";
import type { FC, KeyboardEvent } from "react";
import {
  makeStyles,
  tokens,
  Text,
  Input,
  Button,
  Card,
  CardHeader,
  MessageBar,
  MessageBarBody,
} from "@fluentui/react-components";
import {
  LockClosed20Regular,
  DataBarVertical20Regular,
} from "@fluentui/react-icons";

const PASSCODE = "SurveyReport2026!";
const SESSION_KEY = "pdr_authenticated";

const useStyles = makeStyles({
  container: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    height: "100vh",
    backgroundColor: tokens.colorNeutralBackground2,
  },
  card: {
    width: "380px",
    maxWidth: "90vw",
    padding: tokens.spacingVerticalXL,
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: tokens.spacingVerticalM,
    marginTop: tokens.spacingVerticalL,
  },
  brandHeader: {
    display: "flex",
    alignItems: "center",
    gap: tokens.spacingHorizontalS,
    color: tokens.colorBrandForeground1,
  },
});

export const PasswordGate: FC<{ onAuthenticated: () => void }> = ({
  onAuthenticated,
}) => {
  const styles = useStyles();
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);

  const handleSubmit = useCallback(() => {
    if (password === PASSCODE) {
      sessionStorage.setItem(SESSION_KEY, "true");
      onAuthenticated();
    } else {
      setError(true);
    }
  }, [password, onAuthenticated]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        handleSubmit();
      }
    },
    [handleSubmit]
  );

  return (
    <div className={styles.container}>
      <Card className={styles.card}>
        <CardHeader
          header={
            <div className={styles.brandHeader}>
              <DataBarVertical20Regular />
              <Text size={500} weight="semibold">
                Partner Developer Report
              </Text>
            </div>
          }
        />
        <div className={styles.form}>
          <Text>Enter the access password to continue.</Text>
          <Input
            type="password"
            placeholder="Password"
            contentBefore={<LockClosed20Regular />}
            value={password}
            onChange={(_, data) => {
              setPassword(data.value);
              setError(false);
            }}
            onKeyDown={handleKeyDown}
          />
          {error && (
            <MessageBar intent="error">
              <MessageBarBody>Incorrect password. Please try again.</MessageBarBody>
            </MessageBar>
          )}
          <Button appearance="primary" onClick={handleSubmit}>
            Sign In
          </Button>
        </div>
      </Card>
    </div>
  );
};

export function isSessionAuthenticated(): boolean {
  return sessionStorage.getItem(SESSION_KEY) === "true";
}
