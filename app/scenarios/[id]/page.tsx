"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Button,
  ConfigProvider,
  Form,
  Input,
  message,
  Modal,
  Spin,
  theme,
} from "antd";
import {
  CaretRightFilled,
  CloseCircleOutlined,
  PauseCircleOutlined,
  QuestionCircleOutlined,
} from "@ant-design/icons";

import { useAuth } from "@/hooks/useAuth";
import { useApi } from "@/hooks/useApi";
import { useDirector } from "@/hooks/useDirector";
import { usePolling } from "@/hooks/usePolling";
import { ScenarioService } from "@/api/scenarioService";
import { NewsService } from "@/api/newsService";
import { CharacterService } from "@/api/characterService";
import type { Scenario } from "@/types/scenario";
import { ScenarioStatus } from "@/types/scenario";
import type { NewsGetDTO } from "@/types/news";
import type { Character } from "@/types/character";
import { NewsItem, NewsList } from "@/components/NewsItem";
import { UserAvatarMenu } from "@/components/UserAvatarMenu";
import { NavLogo } from "@/components/NavLogo";
import { ScenarioNavTitle } from "@/components/ScenarioNavTitle";
import styles from "@/styles/directorDashboard.module.css";

const STATUS_LABEL: Record<ScenarioStatus, string> = {
  "UNSTARTED": "Not Started",
  "UNFROZEN": "Running",
  "FROZEN": "Frozen",
  "COMPLETED": "Completed",
};

const STATUS_ICON: Record<ScenarioStatus, React.ReactNode> = {
  UNSTARTED: <CloseCircleOutlined style={{ fontSize: 24, color: "#ef4444" }} />,
  UNFROZEN: <CaretRightFilled style={{ fontSize: 24, color: "#10b981" }} />,
  FROZEN: <PauseCircleOutlined style={{ fontSize: 24, color: "#3b82f6" }} />,
  COMPLETED: <CloseCircleOutlined style={{ fontSize: 24, color: "#6b7280" }} />,
};

const STATUS_ICON_BG: Record<ScenarioStatus, string> = {
  UNSTARTED: "#fef2f2",
  UNFROZEN: "#ecfdf5",
  FROZEN: "#eff6ff",
  COMPLETED: "#f3f4f6",
};

const STATUS_DOT: Record<ScenarioStatus, string> = {
  UNSTARTED: styles.red,
  UNFROZEN: styles.green,
  FROZEN: styles.blue,
  COMPLETED: styles.gray,
};

const STATUS_BADGE_TEXT: Record<ScenarioStatus, string> = {
  UNSTARTED: "Crisis has not started",
  UNFROZEN: "Crisis is running",
  FROZEN: "Crisis is frozen",
  COMPLETED: "Crisis has ended",
};

const STATUS_CLASS: Record<ScenarioStatus, string> = {
  UNSTARTED: styles.red,
  UNFROZEN: styles.green,
  FROZEN: styles.blue,
  COMPLETED: styles.gray,
};

export default function DirectorDashboardPage() {
  const { isAuthenticated, authReady } = useAuth();
  const router = useRouter();
  const params = useParams();
  const scenarioId = Number(params.id);

  const api = useApi();
  const scenarioService = useMemo(() => new ScenarioService(api), [api]);
  const newsService = useMemo(() => new NewsService(api), [api]);
  const characterService = useMemo(() => new CharacterService(api), [api]);
  // Director gate: possession of the per-scenario director token is the
  // canonical proof the user directs THIS scenario. It is written by the
  // create-scenario flow and rehydrated on each `useEngagedScenarios`
  // poll, so any current director has it regardless of which scenario
  // they last touched. `readyDirectorToken` lags the first render by one
  // tick (localStorage can only be read in `useEffect`); treat "not
  // ready" as "decision pending", never as "false".
  const { directorToken, readyDirectorToken } = useDirector(scenarioId);
  const directorAuth = directorToken ? `Director ${directorToken}` : "Wrong";
  const [messageApi, contextHolder] = message.useMessage();

  const enabled = isAuthenticated && !!scenarioId;

  const { data: scenario, loading, error } = usePolling<Scenario>(
    () => scenarioService.getScenarioById(scenarioId, directorAuth),
    5000,
    enabled,
  );

  const { data: newsItems } = usePolling<NewsGetDTO[]>(
    () => newsService.getNewsByScenario(scenarioId, directorAuth),
    5000,
    enabled,
  );

  const [characters, setCharacters] = useState<Character[]>([]);
  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    characterService
      .getCharactersByScenario(scenarioId, directorAuth)
      .then((chars) => {
        if (!cancelled) setCharacters(chars);
      })
      .catch(() => {
        // Silent: pronouncements without resolved names just render "Unknown".
      });
    return () => {
      cancelled = true;
    };
  }, [enabled, scenarioId, directorAuth, characterService]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);
  const [form] = Form.useForm();
  const [savingMastodon, setSavingMastodon] = useState(false);

  useEffect(() => {
    if (authReady && !isAuthenticated) {
      router.replace("/login");
      return;
    }
    if (!readyDirectorToken) return;
    if (!directorToken) {
      router.replace(`/scenarios/${scenarioId}/lobby`);
    }
  }, [
    authReady,
    isAuthenticated,
    readyDirectorToken,
    directorToken,
    router,
    scenarioId,
  ]);

  // Render nothing while any gate is still resolving. This is the data-race
  // fix: wait for BOTH auth state AND localStorage hydration before showing
  // the dashboard or deciding to redirect.
  if (
    !authReady || !isAuthenticated || !readyDirectorToken || !directorToken
  ) return null;

  const status = scenario?.status;

  const handleStartGame = async () => {
    try {
      await scenarioService.updateScenario(
        scenarioId,
        { status: ScenarioStatus.UNFROZEN, dayNumber: 1 },
        directorAuth,
      );
      messageApi.success("Game started");
    } catch {
      messageApi.error("Failed to start game");
    }
  };

  const handleNextDay = async () => {
    if (!scenario) return;

    try {
      await scenarioService.updateScenario(
        scenarioId,
        { dayNumber: scenario.dayNumber + 1 },
        directorAuth,
      );
      messageApi.success("Advanced to next day");
    } catch {
      messageApi.error("Failed to advance day");
    }
  };

  const handleFreezeToggle = async () => {
    if (!scenario) return;

    const isFrozen = scenario.status === ScenarioStatus.FROZEN;

    try {
      await scenarioService.updateScenario(
        scenarioId,
        { status: isFrozen ? ScenarioStatus.UNFROZEN : ScenarioStatus.FROZEN },
        directorAuth,
      );
      messageApi.success(isFrozen ? "Game resumed" : "Game frozen");
    } catch {
      messageApi.error("Failed to update game state");
    }
  };

  const handleEndGame = async () => {
    try {
      await scenarioService.updateScenario(
        scenarioId,
        { status: ScenarioStatus.COMPLETED },
        directorAuth,
      );
      messageApi.success("Game ended");
    } catch {
      messageApi.error("Failed to end game");
    }
  };

  const handleSubmitMastodon = async () => {
    if (savingMastodon) return;

    setSavingMastodon(true);

    try {
      const values = await form.validateFields();

      await scenarioService.updateMastodonConfig(
        scenarioId,
        values,
        directorAuth,
      );

      messageApi.success("Mastodon configuration saved");
      setIsModalOpen(false);
      form.resetFields();
    } catch {
      messageApi.error("Failed to update Mastodon configuration");
    } finally {
      setSavingMastodon(false);
    }
  };

  return (
    <ConfigProvider
      theme={{
        algorithm: theme.defaultAlgorithm,
        token: {
          colorBgContainer: "#ffffff",
          colorText: "#111827",
          colorTextSecondary: "#6b7280",
          colorBorder: "#e5e7eb",
          colorPrimary: "#4f46e5",
          borderRadius: 8,
          fontSize: 14,
        },
        // Don't override components.Button here: the root layout sets
        // Button.colorPrimary to green (#75bd9d), and Start Game / Next
        // Day on this dashboard depend on that to render green.
        // The one button we DO want indigo (See All News, to match the
        // Character Dashboard) is styled explicitly below.
      }}
    >
      {contextHolder}

      <div className={styles.pageRoot}>
        {/* NAVBAR */}
        <nav className={styles.navbar}>
          <div className={styles.navLeft}>
            <NavLogo className={styles.logoMark} />
            <span className={styles.navTitle}>Director Dashboard</span>
            <span className={styles.navDivider} aria-hidden="true" />
            <ScenarioNavTitle scenario={scenario} />
          </div>
          <div className={styles.navRight}>
            <Button onClick={() => router.push("/scenarios")}>
              All Scenarios
            </Button>
            <UserAvatarMenu avatarClassName={styles.avatar} />
          </div>
        </nav>

        {/* MAIN */}
        <main className={styles.pageBody}>
          <Spin spinning={loading}>
            <div className={styles.contentWrapper}>
              {error && <p style={{ color: "#dc2626" }}>{error}</p>}

              {/* HEADER */}
              <div className={styles.pageHeader}>
                <div>
                  <h1 className={styles.scenarioTitle}>
                    {scenario?.title ?? "Loading…"}
                  </h1>
                  <p className={styles.scenarioSubtitle}>
                    Setup Mastodon and Control Game Progress
                  </p>
                </div>

                <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                  {scenario?.mastodonProfileUrl && (
                    <Button
                      type="default"
                      size="large"
                      href={scenario.mastodonProfileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ height: 48, paddingInline: 24, fontWeight: 600 }}
                    >
                      Go to Mastodon
                    </Button>
                  )}

                  <Button
                    type="primary"
                    size="large"
                    onClick={() => setIsModalOpen(true)}
                    style={{
                      backgroundColor: "#4f46e5",
                      borderColor: "#4f46e5",
                      height: 48,
                      paddingInline: 24,
                      fontWeight: 600,
                    }}
                  >
                    {scenario?.mastodonProfileUrl
                      ? "Change Mastodon Account"
                      : "Add Mastodon Account"}
                  </Button>
                  <Button
                    type="default"
                    size="large"
                    icon={<QuestionCircleOutlined />}
                    onClick={() => setIsTutorialOpen(true)}
                    style={{
                      height: 48,
                      paddingInline: 24,
                      fontWeight: 600,
                    }}
                  >
                  </Button>
                </div>
              </div>

              {/* TOP ROW */}
              <div className={styles.topRow}>
                {/* STATUS CARD */}
                <div
                  className={`${styles.card} ${styles.statusCard}`}
                  style={{ position: "relative" }}
                >
                  {status && (
                    <>
                      <div
                        className={styles.statusIconBox}
                        style={{ background: STATUS_ICON_BG[status] }}
                      >
                        {STATUS_ICON[status]}
                      </div>

                      <p className={styles.cardLabel}>Crisis Status</p>

                      <div className={styles.statusValue}>
                        <span
                          className={`${styles.statusText} ${
                            STATUS_CLASS[status]
                          }`}
                        >
                          {STATUS_LABEL[status]}
                        </span>
                      </div>

                      <p className={styles.dayText}>
                        Day {scenario?.dayNumber ?? 0}
                      </p>

                      <div className={styles.statusFooter}>
                        <div className={styles.statusBadge}>
                          <span
                            className={`${styles.dot} ${STATUS_DOT[status]}`}
                          />
                          {STATUS_BADGE_TEXT[status]}
                        </div>
                      </div>
                    </>
                  )}
                </div>
                {/* CONTROLS */}
                <div className={styles.card}>
                  <p className={styles.cardLabel}>Game Controls</p>

                  {status === "COMPLETED"
                    ? (
                      <div className={styles.completedText}>
                        The Scenario Is Complete
                      </div>
                    )
                    : status === "UNSTARTED"
                    ? (
                      <Button
                        type="primary"
                        className={styles.startBtn}
                        block
                        size="large"
                        icon={<CaretRightFilled />}
                        onClick={handleStartGame}
                      >
                        Start Game
                      </Button>
                    )
                    : (
                      <div className={styles.controlsGrid}>
                        <Button
                          type="primary"
                          className={styles.startBtn}
                          block
                          size="large"
                          icon={<CaretRightFilled />}
                          onClick={handleNextDay}
                        >
                          Next Day
                        </Button>

                        <div className={styles.controlsRow}>
                          <Button
                            className={styles.freezeBtn}
                            icon={status === "FROZEN"
                              ? <CaretRightFilled />
                              : <PauseCircleOutlined />}
                            onClick={handleFreezeToggle}
                          >
                            {status === "FROZEN"
                              ? "Unfreeze Game"
                              : "Freeze Game"}
                          </Button>

                          <Button
                            danger
                            type="primary"
                            icon={<CloseCircleOutlined />}
                            onClick={handleEndGame}
                          >
                            End Game
                          </Button>
                        </div>
                      </div>
                    )}
                </div>
              </div>

              {/* ACTIVITY */}
              <div className={styles.activitySection}>
                <div className={styles.activitySectionHeader}>
                  <div>
                    <h2 className={styles.activitySectionTitle}>
                      Recent Activity
                    </h2>
                    <p className={styles.activitySectionSubtitle}>
                      News stories and pronouncements from Day{" "}
                      {scenario?.dayNumber ?? 0}
                    </p>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <Button
                      onClick={() =>
                        router.push(`/scenarios/${scenarioId}/statistics`)}
                    >
                      Player Overview
                    </Button>
                    <Button
                      type="primary"
                      onClick={() =>
                        router.push(`/scenarios/${scenarioId}/news`)}
                      style={{
                        backgroundColor: "#4f46e5",
                        borderColor: "#4f46e5",
                      }}
                    >
                      See All News
                    </Button>
                  </div>
                </div>

                {(() => {
                  if (!scenario) return null;
                  const today = (newsItems ?? [])
                    .filter((n) => n.dayNumber === scenario.dayNumber)
                    .sort((a, b) => new Date(b.createdAt).getTime() -
                      new Date(a.createdAt).getTime()
                    );
                  if (today.length === 0) {
                    return (
                      <div className={styles.activityEmptyCard}>
                        No activity today yet.
                      </div>
                    );
                  }
                  return (
                    <div className={styles.activityCard}>
                      <NewsList>
                        {today.map((item) => {
                          const authorName = item.authorId !== null &&
                              item.authorId !== undefined
                            ? (characters.find((c) => c.id === item.authorId)
                              ?.name ?? "Unknown")
                            : null;
                          return (
                            <NewsItem
                              key={item.id}
                              item={item}
                              authorName={authorName}
                            />
                          );
                        })}
                      </NewsList>
                    </div>
                  );
                })()}
              </div>
            </div>
          </Spin>
        </main>
        <Modal
          title="Mastodon Account"
          open={isModalOpen}
          onOk={handleSubmitMastodon}
          confirmLoading={savingMastodon}
          onCancel={() => setIsModalOpen(false)}
        >
          <Form form={form} layout="vertical">
            <Form.Item
              label={
                <span style={{ color: "#111827" }}>Mastodon Base URL</span>
              }
              name="mastodonBaseUrl"
              rules={[{ required: true, message: "Please enter the base URL" }]}
            >
              <Input placeholder="https://mastodon.social" />
            </Form.Item>
            <Form.Item
              label={<span style={{ color: "#111827" }}>Access Token</span>}
              name="mastodonAccessToken"
              rules={[{
                required: true,
                message: "Please enter the access token",
              }]}
            >
              <Input placeholder="Your access token" />
            </Form.Item>
          </Form>
        </Modal>
        <Modal
          title="How to Connect a Mastodon Account"
          open={isTutorialOpen}
          footer={[
            <Button key="close" onClick={() => setIsTutorialOpen(false)}>
              Close
            </Button>,
          ]}
          onCancel={() => setIsTutorialOpen(false)}
        >
          <div style={{ paddingTop: 8 }}>
            <ol
              style={{
                paddingLeft: 20,
                display: "flex",
                flexDirection: "column",
                gap: 16,
                color: "#374151",
                lineHeight: 1.6,
              }}
            >
              <li>
                Create or log into your Mastodon account.
              </li>
              <li>
                Under Settings, navigate to &quot;Development&quot;
              </li>
              <li>
                Select &quot;New Application&quot;
              </li>
              <li>
                Give your application a name, and select
                &quot;read:statuses&quot; and &quot;write:statuses&quot;
                permissions.
              </li>
              <li>
                Generate an access token for the application.
              </li>
              <li>
                Copy the access token, along with the Mastodon server URL (e.g.
                https://mastodon.social), into the &quot;Add Mastodon
                Account&quot; form.
              </li>
              <li>
                Save the configuration.
              </li>
            </ol>
          </div>
        </Modal>
      </div>
    </ConfigProvider>
  );
}
