import { useState, useCallback } from "react";
import type { FC } from "react";
import {
  FluentProvider,
  TabList,
  Tab,
  makeStyles,
  tokens,
} from "@fluentui/react-components";
import {
  DocumentText20Regular,
  People20Regular,
  QuestionCircle20Regular,
} from "@fluentui/react-icons";
import { lightTheme } from "./theme";
import { Header, ResponsesTab, ParticipantsTab, QuestionsTab } from "./components";

const useStyles = makeStyles({
  app: {
    display: "flex",
    flexDirection: "column",
    height: "100vh",
    overflow: "hidden",
  },
  content: {
    display: "flex",
    flexDirection: "column",
    flex: 1,
    minHeight: 0,
    padding: `0 ${tokens.spacingHorizontalXL} ${tokens.spacingVerticalL}`,
  },
  tabList: {
    padding: `${tokens.spacingVerticalM} 0`,
    borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
    flexShrink: 0,
  },
  tabContent: {
    display: "flex",
    flexDirection: "column",
    flex: 1,
    minHeight: 0,
    paddingTop: tokens.spacingVerticalS,
  },
});

type TabId = "responses" | "participants" | "questions";

const App: FC = () => {
  const styles = useStyles();
  const [activeTab, setActiveTab] = useState<TabId>("responses");
  const [responseSubmissionFilter, setResponseSubmissionFilter] = useState<
    string | undefined
  >();
  const [responseQuestionFilter, setResponseQuestionFilter] = useState<
    string | undefined
  >();

  const handleViewParticipantResponses = useCallback(
    (submissionId: string) => {
      setResponseSubmissionFilter(submissionId);
      setResponseQuestionFilter(undefined);
      setActiveTab("responses");
    },
    []
  );

  const handleViewQuestionResponses = useCallback((questionId: string) => {
    setResponseQuestionFilter(questionId);
    setResponseSubmissionFilter(undefined);
    setActiveTab("responses");
  }, []);

  const handleTabChange = useCallback(
    (_: unknown, data: { value: string | unknown }) => {
      const tab = data.value as TabId;
      setActiveTab(tab);
      // Clear cross-tab filters when manually switching tabs
      if (tab !== "responses") {
        setResponseSubmissionFilter(undefined);
        setResponseQuestionFilter(undefined);
      }
    },
    []
  );

  return (
    <FluentProvider theme={lightTheme}>
      <div className={styles.app}>
        <Header />
        <div className={styles.content}>
          <TabList
            className={styles.tabList}
            selectedValue={activeTab}
            onTabSelect={handleTabChange}
            size="large"
          >
            <Tab
              value="responses"
              icon={<DocumentText20Regular />}
            >
              Responses
            </Tab>
            <Tab
              value="participants"
              icon={<People20Regular />}
            >
              Participants
            </Tab>
            <Tab
              value="questions"
              icon={<QuestionCircle20Regular />}
            >
              Questions
            </Tab>
          </TabList>

          <div className={styles.tabContent}>
            {activeTab === "responses" && (
              <ResponsesTab
                key={`responses-${responseSubmissionFilter}-${responseQuestionFilter}`}
              />
            )}
            {activeTab === "participants" && (
              <ParticipantsTab
                onViewResponses={handleViewParticipantResponses}
              />
            )}
            {activeTab === "questions" && (
              <QuestionsTab onViewResponses={handleViewQuestionResponses} />
            )}
          </div>
        </div>
      </div>
    </FluentProvider>
  );
};

export default App;
