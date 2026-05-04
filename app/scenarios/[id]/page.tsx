"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Avatar,
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
  UserOutlined,
} from "@ant-design/icons";

import { useAuth } from "@/hooks/useAuth";
import { useApi } from "@/hooks/useApi";
import { usePolling } from "@/hooks/usePolling";
import { ScenarioService } from "@/api/scenarioService";
import { Scenario, ScenarioStatus } from "@/types/scenario";
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
  const { token, isAuthenticated, authReady } = useAuth();
  const router = useRouter();
  const params = useParams();
  const scenarioId = Number(params.id);

  const api = useApi();
  const scenarioService = useMemo(() => new ScenarioService(api), [api]);
  const [messageApi, contextHolder] = message.useMessage();

  const enabled = isAuthenticated && !!scenarioId;

  const { data: scenario, loading, error } = usePolling<Scenario>(
    () => scenarioService.getScenarioById(scenarioId, token),
    5000,
    enabled,
  );

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    if (authReady && !isAuthenticated) {
      router.replace("/login");
    }
  }, [authReady, isAuthenticated, router]);

  if (!authReady || !isAuthenticated) return null;

  const status = scenario?.status;

  const handleStartGame = async () => {
    try {
      await scenarioService.updateScenario(
        scenarioId,
        { status: ScenarioStatus.UNFROZEN, dayNumber: 1 },
        token,
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
        token,
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
        token,
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
        token,
      );
      messageApi.success("Game ended");
    } catch {
      messageApi.error("Failed to end game");
    }
  };

  const handleSubmitMastodon = async () => {
    try {
      const values = await form.validateFields();

      await scenarioService.updateMastodonConfig(
        scenarioId,
        values,
        `Director ${token}`,
      );

      messageApi.success("Mastodon configuration saved");
      setIsModalOpen(false);
      form.resetFields();
    } catch {
      messageApi.error("Failed to update Mastodon configuration");
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
      }}
    >
      {contextHolder}

      <div className={styles.pageRoot}>
        {/* NAVBAR */}
        <nav className={styles.navbar}>
          <div className={styles.navLeft}>
            <div className={styles.logoMark} />
            <span className={styles.navTitle}>Director Dashboard</span>
            <Button onClick={() => router.push("/scenarios")}>
              All Scenarios
            </Button>
          </div>
          <div className={styles.navRight}>
            <Button
              onClick={() => router.push(`/scenarios/${scenarioId}/statistics`)}
            >
              Player Statistics
            </Button>
            <Avatar icon={<UserOutlined />} />
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
                    Monitor Readiness and Control Game State
                  </p>
                </div>

                <div style={{ display: "flex", gap: 12 }}>
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
              <div className={styles.activityCard}>
                <div className={styles.activityHeader}>
                  <span className={styles.cardTitle}>
                    Recent Activity
                  </span>
                  <Button
                    type="link"
                    onClick={() => router.push(`/scenarios/${scenarioId}/news`)}
                  >
                    See All News →
                  </Button>
                </div>

                <div className={styles.activityList}>
                  <p>No recent activity yet.</p>
                </div>
              </div>
            </div>
          </Spin>
        </main>
        <Modal
          title="Mastodon Account"
          open={isModalOpen}
          onOk={handleSubmitMastodon}
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
      </div>
    </ConfigProvider>
  );
}
