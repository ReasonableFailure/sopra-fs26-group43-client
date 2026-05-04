"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Avatar, Button, ConfigProvider, Dropdown, Spin, theme } from "antd";
import type { MenuProps } from "antd";
import { MoreOutlined, UserOutlined } from "@ant-design/icons";
import { useAuth } from "@/hooks/useAuth";
import { useScenarios } from "@/hooks/useScenarios";
import { useDirectedScenarios } from "@/hooks/useDirectedScenarios";
import type { Scenario } from "@/types/scenario";
import styles from "@/styles/scenarios.module.css";

function ScenarioCard(
  { scenario, isDirector }: { scenario: Scenario; isDirector: boolean },
) {
  const router = useRouter();

  const moreMenu: MenuProps = {
    items: [
      {
        key: "edit",
        label: "Edit",
        onClick: () => router.push(`/scenarios/${scenario.id}/edit`),
      },
      {
        key: "delete",
        label: "Delete",
        danger: true,
        onClick: () =>
          alert(`Delete scenario "${scenario.title}"? (not yet implemented)`),
      },
    ],
  };

  const handleView = () => {
    if (isDirector) {
      router.push(`/scenarios/${scenario.id}`);
    } else {
      router.push(`/scenarios/${scenario.id}/lobby`);
    }
  };

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <h2 className={styles.cardTitle}>{scenario.title}</h2>
        <Dropdown menu={moreMenu} trigger={["click"]}>
          <Button
            type="text"
            icon={<MoreOutlined />}
            aria-label="More options"
          />
        </Dropdown>
      </div>
      <p className={styles.cardDesc}>
        {scenario.description ?? "No description provided."}
      </p>
      <div className={styles.cardFooter}>
        <Button type="link" onClick={handleView}>
          View
        </Button>
      </div>
    </div>
  );
}

export default function ScenariosPage() {
  const { token, userId, isAuthenticated, authReady } = useAuth();
  const { isDirector } = useDirectedScenarios(userId);
  const router = useRouter();
  const { scenarios, loading, error } = useScenarios(`Bearer ${token}`);

  useEffect(() => {
    if (authReady && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated, router]);

  if (!authReady || !isAuthenticated) return null;

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
          borderRadius: 12,
          fontSize: 14,
        },
        components: {
          Button: {
            colorPrimary: "#4f46e5",
            algorithm: true,
          },
        },
      }}
    >
      <div className={styles.pageRoot}>
        <nav className={styles.navbar}>
          <div className={styles.navLeft}>
            <div className={styles.logoMark} aria-hidden="true" />
            <span className={styles.navTitle}>Scenario Manager</span>
          </div>
          <div className={styles.navRight}>
            <Button
              type="primary"
              onClick={() => router.push("/scenarios/create")}
            >
              Create New Scenario
            </Button>
            <Avatar icon={<UserOutlined />} className={styles.avatar} />
          </div>
        </nav>

        <main className={styles.pageBody}>
          <div className={styles.contentWrapper}>
            <div className={styles.pageHeader}>
              <h1 className={styles.heading}>Created Scenarios</h1>
              <p className={styles.subheading}>
                Review previously created scenarios
              </p>
            </div>

            {error && <p className={styles.errorText}>{error}</p>}

            <Spin spinning={loading}>
              <div className={styles.cardList}>
                {!loading && scenarios?.length === 0 && (
                  <p className={styles.emptyText}>
                    No scenarios yet. Create your first one above.
                  </p>
                )}
                {scenarios?.map((scenario) => (
                  <ScenarioCard
                    key={scenario.id}
                    scenario={scenario}
                    isDirector={isDirector(scenario.id)}
                  />
                ))}
              </div>
            </Spin>
          </div>
        </main>
      </div>
    </ConfigProvider>
  );
}
