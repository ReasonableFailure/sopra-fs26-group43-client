"use client";

import { useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Avatar, Button, ConfigProvider, Dropdown, Spin, theme } from "antd";
import type { MenuProps } from "antd";
import {
  CalendarOutlined,
  EyeOutlined,
  MoreOutlined,
  PlusOutlined,
  SettingOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { useAuth } from "@/hooks/useAuth";
import { useScenarios } from "@/hooks/useScenarios";
import { useDirectedScenarios } from "@/hooks/useDirectedScenarios";
import type { Scenario } from "@/types/scenario";
import styles from "@/styles/scenarios.module.css";

function ScenarioCard({ scenario, isDirector }: { scenario: Scenario; isDirector: boolean }) {
  const router = useRouter();
  const moreMenu: MenuProps = {
    items: [
      { key: "edit", label: "Edit", onClick: () => router.push(`/scenarios/${scenario.id}/edit`) },
      { key: "delete", label: "Delete", danger: true, onClick: () => alert(`Delete scenario "${scenario.title}"? (not yet implemented)`) },
    ],
  };
  const handleView = () => {
    if (isDirector) { router.push(`/scenarios/${scenario.id}`); }
    else { router.push(`/scenarios/${scenario.id}/lobby`); }
  };
  return (
    <div className={styles.card} style={{ cursor: "pointer" }} onClick={handleView}>
      <div className={styles.cardHeader}>
        <h2 className={styles.cardTitle}>{scenario.title}</h2>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Button type="link" icon={<EyeOutlined />} style={{ color: "#4f46e5" }} onClick={(e) => { e.stopPropagation(); handleView(); }}>View</Button>
          <Dropdown menu={moreMenu} trigger={["click"]}>
            <Button type="text" icon={<MoreOutlined />} aria-label="More options" onClick={(e) => e.stopPropagation()} />
          </Dropdown>
        </div>
      </div>
      <p className={styles.cardDesc}>{scenario.description ?? "No description provided."}</p>
      <div className={styles.cardFooter}>
        <CalendarOutlined style={{ color: "#4f46e5", fontSize: 12, marginRight: 4 }} />
        <span style={{ fontSize: 12, color: "#4f46e5" }}>Day {scenario.dayNumber ?? 0}</span>
      </div>
    </div>
  );
}

export default function Home() {
  const { token, userId, isAuthenticated, authReady, logout } = useAuth();
  const { isDirector } = useDirectedScenarios(userId);
  const router = useRouter();
  const { scenarios, loading, error } = useScenarios(token);

  // If server returns 500 (stale token after server restart), force re-login
  const handleStaleSession = useCallback(async () => {
    await logout();
    router.replace("/login");
  }, [logout, router]);

  useEffect(() => {
    if (authReady && !isAuthenticated) { router.replace("/login"); }
  }, [authReady, isAuthenticated, router]);

  useEffect(() => {
    if (error && (error.includes("500") || error.includes("401"))) { handleStaleSession(); }
  }, [error, handleStaleSession]);

  if (!authReady || !isAuthenticated) return null;

  const demoId = scenarios && scenarios.length > 0 ? scenarios[0].id : 1;

  const navButtonStyle = { backgroundColor: "#ede9fe", borderColor: "#c4b5fd", color: "#4f46e5" };

  return (
    <ConfigProvider theme={{ algorithm: theme.defaultAlgorithm, token: { colorBgContainer: "#ffffff", colorText: "#111827", colorTextSecondary: "#6b7280", colorBorder: "#e5e7eb", colorPrimary: "#4f46e5", borderRadius: 12, fontSize: 14 }, components: { Button: { colorPrimary: "#4f46e5", algorithm: true } } }}>
      <div className={styles.pageRoot}>
        <nav className={styles.navbar}>
          <div className={styles.navLeft}>
            <div className={styles.logoMark} aria-hidden="true">
              <SettingOutlined style={{ color: "#fff", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center", width: "100%", height: "100%" }} />
            </div>
            <span className={styles.navTitle}>Scenario Manager</span>
          </div>
          <div className={styles.navRight}>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => router.push("/scenarios/create")}>Create New Scenario</Button>
            <Avatar icon={<UserOutlined />} className={styles.avatar} onClick={() => router.push(`/users/${userId}`)} style={{ cursor: "pointer" }} />
          </div>
        </nav>
        <main className={styles.pageBody}>
          <div className={styles.contentWrapper}>
            <div className={styles.pageHeader}>
              <h1 className={styles.heading}>Created Scenarios</h1>
              <p className={styles.subheading}>Review previously created scenarios</p>
            </div>
            {error && !(error.includes("500") || error.includes("401")) && <p className={styles.errorText}>{error}</p>}
            <Spin spinning={loading}>
              <div className={styles.cardList}>
                {!loading && scenarios?.length === 0 && <p className={styles.emptyText}>No scenarios yet. Create your first one above.</p>}
                {scenarios?.map((scenario) => <ScenarioCard key={scenario.id} scenario={scenario} isDirector={isDirector(scenario.id)} />)}
              </div>
            </Spin>
            <div style={{ marginTop: 40, borderTop: "1px solid #e5e7eb", paddingTop: 24, paddingBottom: 32 }}>
              <p style={{ fontWeight: 600, color: "#111827", fontSize: 14, marginBottom: 12 }}>Navigation (All Pages)</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                <Button size="large" style={navButtonStyle} onClick={() => router.push("/login")}>Login / Register</Button>
                <Button size="large" style={navButtonStyle} onClick={() => router.push("/scenarios")}>All Scenarios</Button>
                <Button size="large" style={navButtonStyle} onClick={() => router.push("/scenarios/create")}>Create Scenario</Button>
                <Button size="large" style={navButtonStyle} onClick={() => router.push(`/scenarios/${demoId}/lobby`)}>Game Lobby</Button>
                <Button size="large" style={navButtonStyle} onClick={() => router.push(`/scenarios/${demoId}/news`)}>News &amp; Pronouncements</Button>
                <Button size="large" style={navButtonStyle} onClick={() => router.push(`/scenarios/${demoId}`)}>Director Dashboard</Button>
                <Button size="large" style={navButtonStyle} onClick={() => router.push(`/scenarios/${demoId}/player`)}>Player Dashboard</Button>
                <Button size="large" style={navButtonStyle} onClick={() => router.push(`/scenarios/${demoId}/backroom`)}>Backroom Dashboard</Button>
                <Button size="large" style={navButtonStyle} onClick={() => router.push(`/scenarios/${demoId}/player/communicate`)}>Player Comm Form</Button>
                <Button size="large" style={navButtonStyle} onClick={() => router.push(`/scenarios/${demoId}/backroom/communicate`)}>Backroom Comm Form</Button>
                <Button size="large" style={navButtonStyle} onClick={() => router.push("/users")}>All Users</Button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </ConfigProvider>
  );
}
