"use client";

import { useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Avatar,
  Button,
  ConfigProvider,
  Spin,
  theme,
} from "antd";
import {
  StopOutlined,
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
  if (!scenario.isActive && scenario.day === 0) return "stopped";
  if (scenario.isActive) return "running";
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

export default function DirectorDashboardPage() {
  const { token, isAuthenticated } = useAuth();
  const router = useRouter();
  const params = useParams();
  const scenarioId = Number(params.id);

  const api = useApi();
  const scenarioService = useMemo(() => new ScenarioService(api), [api]);

  const enabled = isAuthenticated && !!scenarioId;

  const { data: scenario, loading, error } = usePolling<Scenario>(
    () => scenarioService.getScenarioById(scenarioId, token),
    5000,
    enabled,
  );

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) return null;

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
                {/* Game Status */}
                <div className={styles.card}>
                  <p className={styles.cardLabel}>Game Status</p>
                  <div className={styles.statusValue}>
                    <StopOutlined
                      style={{
                        fontSize: 28,
                        color:
                          status === "running"
                            ? "#10b981"
                            : status === "frozen"
                            ? "#3b82f6"
                            : "#ef4444",
                      }}
                    />
                    <span className={`${styles.statusText} ${styles[status]}`}>
                      {STATUS_LABEL[status]}
                    </span>
                  </div>
                  <div className={styles.statusBadge}>
                    <span className={`${styles.dot} ${STATUS_DOT[status]}`} />
                    {STATUS_BADGE_TEXT[status]}
                  </div>
                  <p className={styles.statusDescription}>
                    {STATUS_DESC[status]}
                  </p>
                </div>

                {/* Game Controls */}
                <div className={styles.card}>
                  <p className={styles.cardLabel}>Game Controls</p>
                  <div className={styles.controlsGrid}>
                    <Button
                      type="primary"
                      className={styles.startBtn}
                      block
                      onClick={() => alert("Start Game — not yet implemented")}
                    >
                      Start Game
                    </Button>
                    <div className={styles.controlsRow}>
                      <Button
                        style={{ borderColor: "#3b82f6", color: "#3b82f6" }}
                        onClick={() => alert("Freeze Game — not yet implemented")}
                      >
                        Freeze Game
                      </Button>
                      <Button
                        danger
                        onClick={() => alert("End Game — not yet implemented")}
                      >
                        End Game
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className={styles.activityCard}>
                <div className={styles.activityHeader}>
                  <span className={styles.cardTitle}>Recent Activity</span>
                  <Button
                    type="link"
                    style={{ color: "#4f46e5", padding: 0 }}
                    onClick={() => alert("See All News — not yet implemented")}
                  >
                    See All News →
                  </Button>
                </div>
                <div className={styles.activityList}>
                  <p className={styles.emptyActivity}>
                    No recent activity yet.
                  </p>
                </div>
              </div>
            </div>
          </Spin>
        </main>
      </div>
    </ConfigProvider>
  );
}
