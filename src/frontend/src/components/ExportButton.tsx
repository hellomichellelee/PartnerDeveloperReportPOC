import type { FC } from "react";
import {
  Menu,
  MenuTrigger,
  MenuPopover,
  MenuList,
  MenuItem,
  SplitButton,
  makeStyles,
} from "@fluentui/react-components";
import {
  ArrowDownload20Regular,
} from "@fluentui/react-icons";

const useStyles = makeStyles({
  button: {
    minWidth: "auto",
  },
});

interface ExportButtonProps {
  onExportCsv: () => void;
  onExportExcel: () => void;
}

export const ExportButton: FC<ExportButtonProps> = ({
  onExportCsv,
  onExportExcel,
}) => {
  const styles = useStyles();

  return (
    <Menu positioning="below-end">
      <MenuTrigger disableButtonEnhancement>
        {(triggerProps) => (
          <SplitButton
            className={styles.button}
            appearance="outline"
            icon={<ArrowDownload20Regular />}
            menuButton={triggerProps}
            primaryActionButton={{ onClick: onExportCsv }}
          >
            Export CSV
          </SplitButton>
        )}
      </MenuTrigger>
      <MenuPopover>
        <MenuList>
          <MenuItem onClick={onExportCsv}>Export as CSV</MenuItem>
          <MenuItem onClick={onExportExcel}>Export as Excel</MenuItem>
        </MenuList>
      </MenuPopover>
    </Menu>
  );
};
