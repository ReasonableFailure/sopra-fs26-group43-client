"use client";

import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Avatar,
  Button,
  ConfigProvider,
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
import type { Scenario } from "@/types/scenario";
import styles from "@/styles/directorDashboard.module.css";

type GameStatus = "stopped" | "running" | "frozen";

function deriveStatus(scenario: Scenario): GameStatus {
  if (!scenario.active && scenario.dayNumber === 0) return "stopped";
  if (scenario.active) return "running";
  return "frozen";
}

const STATUS_LABEL: Record<GameStatus, string> = {
  stopped: "Stopped",
  running: "Running",
  frozen: "Frozen",
};

const STATUS_DOT: Record<GameStatus, string> = {
  stopped: styles.red,
  running: styles.green,
  frozen: styles.blue,
};

const STATUS_BADGE_TEXT: Record<GameStatus, string> = {
  stopped: "Game is paused",
  running: "Game is running",
  frozen: "Game is frozen",
};

const STATUS_DESC: Record<GameStatus, string> = {
  stopped: "Ready to start when needed",
  running: "Players can submit directives",
  frozen: "All submissions are disabled",
};

const STATUS_ICON: Record<GameStatus, React.ReactNode> = {
  stopped: <CloseCircleOutlined style={{ fontSize: 24, color: "#ef4444" }} />,
  running: <CaretRightFilled style={{ fontSize: 24, color: "#10b981" }} />,
  frozen: <PauseCircleOutlined style={{ fontSize: 24, color: "#3b82f6" }} />,
};

const STATUS_ICON_BG: Record<GameStatus, string> = {
  stopped: "#fef2f2",
  running: "#ecfdf5",
  frozen: "#eff6ff",
};

export default function DirectorDashboardPage() {
  const { token, isAuthenticated, authReady } = useAuth();
  const router = useRouter();
  const params = useParams();
  const scenarioId = Number(params.id);

  const api = useApi();
  const scenarioService = useMemo(() => new ScenarioService(api), [api]);

  const enabled = isAuthenticated && !!scenarioId;

  const { data: polledScenario, loading, error } = usePolling<Scenario>(
    () => scenarioService.getScenarioById(scenarioId, token),
    5000,
    enabled,
  );

  const [scenario, setScenario] = useState<Scenario | null>(null);

  useEffect(() => {
    if (polledScenario) setScenario(polledScenario);
  }, [polledScenario]);

  useEffect(() => {
    if (authReady && !isAuthenticated) {
      router.replace("/login");
    }
  }, [authReady, isAuthenticated, router]);

  const handleGameAction = useCallback(async (action: "start" | "freeze" | "end") => {
    try {
      if (action === "start") {
        await scenarioService.updateScenario(scenarioId, { active: true, dayNumber: (scenario?.dayNumber ?? 0) + 1 }, token);
      } else if (action === "freeze") {
        await scenarioService.updateScenario(scenarioId, { active: false }, token);
      } else {
        await scenarioService.updateScenario(scenarioId, { active: false, dayNumber: 0 }, token);
      }
      const updated = await scenarioService.getScenarioById(scenarioId, token);
      setScenario(updated);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Action failed");
    }
  }, [scenarioService, scenarioId, scenario, token]);

  if (!authReady || !isAuthenticated) return null;

  const status: GameStatus = scenario ? deriveStatus(scenario) : "stopped";

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
        components: {
          Button: { colorPrimary: "#4f46e5", algorithm: true },
        },
      }}
    >
      <div className={styles.pageRoot}>
        <nav className={styles.navbar}>
          <div className={styles.navLeft}>
            <div className={styles.logoMark} aria-hidden="true" />
            <span className={styles.navTitle}>Director Dashboard</span>
          </div>
          <div className={styles.navRight}>
            <Button type="default" onClick={() => router.push("/scenarios")}>
              All Scenarios
            </Button>
            <Avatar icon={<UserOutlined />} className={styles.avatar} />
          </div>
        </nav>

        <main className={styles.pageBody}>
          <Spin spinning={loading}>
            <div className={styles.contentWrapper}>
              {error && <p style={{ color: "#dc2626" }}>{error}</p>}

              <div className={styles.pageHeader}>
                <h1 className={styles.scenarioTitle}>
                  {scenario?.title ?? "Loading…"}
                </h1>
                <p className={styles.scenarioSubtitle}>
                  Monitor readiness and control game state
                </p>
              </div>

              <div className={styles.topRow}>
                <div className={`${styles.card} ${styles.statusCard}`} style={{ position: "relative" }}>
                  <div className={styles.statusIconBox} style={{ background: STATUS_ICON_BG[status] }}>
                    {STATUS_ICON[status]}
                  </div>
                  <p className={styles.cardLabel}>Game Status</p>
                  <div className={styles.statusValue}>
                    <span className={`${styles.statusText} ${styles[status]}`}>
                      {STATUS_LABEL[status]}
                    </span>
                  </div>
                  <div className={styles.statusFooter}>
                    <div className={styles.statusBadge}>
                      <span className={`${styles.dot} ${STATUS_DOT[status]}`} />
                      {STATUS_BADGE_TEXT[status]}
                    </div>
                    <p className={styles.statusDescription}>{STATUS_DESC[status]}</p>
                  </div>
                </div>

                <div className={styles.card}>
                  <p className={styles.cardLabel}>Game Controls</p>
                  <div className={styles.controlsGrid}>
                    <Button
                      type="primary"
                      className={styles.startBtn}
                      block
                      icon={<CaretRightFilled />}
                      onClick={() => handleGameAction("start")}
                    >
                      Start Game
                    </Button>
                    <div className={styles.controlsRow}>
                      <Button
                        className={styles.freezeBtn}
                        icon={<PauseCircleOutlined />}
                        onClick={() => handleGameAction("freeze")}
                      >
                        Freeze Game
                      </Button>
                      <Button
                        danger
                        type="primary"
                        icon={<CloseCircleOutlined />}
                        onClick={() => handleGameAction("end")}
                      >
                        End Game
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              <div className={styles.activityCard}>
                <div className={styles.activityHeader}>
                  <span className={styles.cardTitle}>Recent Activity</span>
                  <Button
                    type="link"
                    style={{ color: "#4f46e5", padding: 0 }}
                    onClick={() => router.push(`/scenarios/${scenarioId}/news`)}
                  >
                    See All News →
                  </Button>
                </div>
                <div className={styles.activityList}>
                  <p className={styles.emptyActivity}>No recent activity yet.</p>
                </div>
              </div>
            </div>
          </Spin>
        </main>
      </div>
    </ConfigProvider>
  );
}
