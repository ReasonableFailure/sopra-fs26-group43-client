"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useApi } from "@/hooks/useApi";
import useLocalStorage from "@/hooks/useLocalStorage";
import { Scenario } from "@/types/scenario";
        import {
  CalendarOutlined,
  EyeOutlined,
  MoreOutlined,
  PlusOutlined,
  SettingOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Button, List, Card, Typography, Spin, Empty, Divider } from "antd";
import { PlusOutlined, EyeOutlined, SettingOutlined, CalendarOutlined } from "@ant-design/icons";
import { useAuth } from "@/hooks/useAuth";
import { useScenarios } from "@/hooks/useScenarios";
import { useDirectedScenarios } from "@/hooks/useDirectedScenarios";
import type { Scenario } from "@/types/scenario";
import styles from "@/styles/scenarios.module.css";

const { Title, Text } = Typography;

const DEMO_SCENARIOS = [
  { id: 1, title: "MUN Zurich", description: "Model United Nations in Zurich.", date: "January 15, 2024" },
  { id: 2, title: "The 1956 Suez Crisis", description: "Egyptian President Gamal Abdel Nasser has just nationalized the Suez Canal Company, threatening the vital shipping lanes of the British and French empires...", date: "January 14, 2024" },
  { id: 3, title: "The Silicon Valley Succession", description: "The eccentric founder and CEO of OmniCorp, the world's most powerful tech conglomerate, has suddenly vanished...", date: "January 12, 2024" },
  { id: 4, title: "The Ides of March, 44 BC", description: "Julius Caesar lies dead on the Senate floor, assassinated by his closest allies. Rome is plunged into immediate chaos...", date: "January 10, 2024" },
  { id: 5, title: "The Trojan War", description: "Plague ravages the Greek camps, while supplies dwindle behind the impenetrable walls of Troy...", date: "January 8, 2024" },
];

function ScenarioCard({ scenario, isDirector }: { scenario: Scenario; isDirector: boolean }) {
  const router = useRouter();
  const apiService = useApi();
  const { value: token } = useLocalStorage<string>("token", "");
  const { value: userId } = useLocalStorage<string>("userId", "");
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [loading, setLoading] = useState(false);
  const [initials, setInitials] = useState("JD");

  const fetchScenarios = useCallback(() => {
    if (!token) return;
    setLoading(true);
    apiService.get<Scenario[]>("/scenarios", token)
      .then(data => setScenarios(data))
      .catch(() => setScenarios([]))
      .finally(() => setLoading(false));
  }, [token, apiService]);

  const fetchUser = useCallback(() => {
    if (userId && token) {
      apiService.get<{ username: string }>(`/users/${userId}`, token)
        .then(u => { if (u.username) setInitials(u.username.slice(0, 2).toUpperCase()); })
        .catch(() => {});
    }
  }, [userId, token, apiService]);

  useEffect(() => { fetchScenarios(); }, [fetchScenarios]);
  useEffect(() => { fetchUser(); }, [fetchUser]);

  const displayScenarios = scenarios.length > 0 ? scenarios.map(s => ({
    id: s.id as number, title: s.title || "", description: s.description || "", date: `Day ${s.dayNumber}`,
  })) : DEMO_SCENARIOS;

  return (
    <div style={{ background: "#f8fafc", minHeight: "100vh" }}>
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "0 16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 0", borderBottom: "1px solid #e2e8f0" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ background: "#6c5ce7", borderRadius: 8, width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <SettingOutlined style={{ color: "#fff", fontSize: 16 }} />
            </div>
            <Text strong style={{ fontSize: 16, color: "#1a1a2e" }}>Scenario Manager</Text>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => router.push("/scenarios/create")}>
              Create New Scenario
            </Button>
            <div
              onClick={() => router.push(token ? `/users/${userId}` : "/login")}
              style={{ width: 36, height: 36, borderRadius: "50%", background: "#6c5ce7", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#fff", fontWeight: 700, fontSize: 13 }}
            >
              {initials}
            </div>
          </div>
        </div>
        <div style={{ paddingTop: 24 }}>
          <Title level={3} style={{ color: "#1a1a2e", marginBottom: 4 }}>Created Scenarios</Title>
          <Text style={{ color: "#64748b" }}>Review previously created scenarios</Text>
        </div>
        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: 60 }}><Spin size="large" /></div>
        ) : displayScenarios.length === 0 ? (
          <Empty description="No scenarios yet" style={{ marginTop: 48 }} />
        ) : (
          <List
            style={{ marginTop: 16 }}
            dataSource={displayScenarios}
            renderItem={(s) => (
              <Card
                style={{ marginBottom: 12, borderRadius: 10, border: "1px solid #e2e8f0", cursor: "pointer", background: "#fff" }}
                bodyStyle={{ padding: "16px 20px" }}
                hoverable
                onClick={() => router.push(`/scenarios/${s.id}`)}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div style={{ flex: 1 }}>
                    <Text strong style={{ fontSize: 15, color: "#1a1a2e" }}>{s.title}</Text>
                    <br />
                    <Text style={{ fontSize: 13, color: "#64748b" }}>{s.description}</Text>
                    <br />
                    <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 4 }}>
                      <CalendarOutlined style={{ color: "#6c5ce7", fontSize: 12 }} />
                      <Text style={{ fontSize: 12, color: "#6c5ce7" }}>{s.date}</Text>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <Button type="link" icon={<EyeOutlined />} style={{ color: "#6c5ce7" }}>View</Button>
                    <Button type="text" style={{ color: "#94a3b8" }}>⋮</Button>
                  </div>
                </div>
              </Card>
            )}
          />
        )}
        <Divider />
        <div style={{ paddingBottom: 32 }}>
          <Text strong style={{ color: "#1a1a2e", fontSize: 14 }}>Demo Navigation (All Pages)</Text>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 12 }}>
            <Button size="small" onClick={() => router.push("/login")}>Login / Register</Button>
            <Button size="small" onClick={() => router.push("/scenarios/create")}>Create Scenario</Button>
            <Button size="small" onClick={() => router.push("/lobby?scenarioId=5")}>Game Lobby</Button>
            <Button size="small" onClick={() => router.push("/news?scenarioId=5")}>News Feed</Button>
            <Button size="small" onClick={() => router.push("/director?scenarioId=5")}>Director Dashboard</Button>
            <Button size="small" onClick={() => router.push("/player?scenarioId=5")}>Player Dashboard</Button>
            <Button size="small" onClick={() => router.push("/backroom?scenarioId=5")}>Backroom Dashboard</Button>
            <Button size="small" onClick={() => router.push("/editor?scenarioId=5")}>Editor / Comm Form</Button>
            <Button size="small" onClick={() => router.push("/chat?scenarioId=5&with=0")}>Chat / Comm Log</Button>
            <Button size="small" onClick={() => router.push("/directive/1")}>Directive Detail</Button>
            <Button size="small" onClick={() => router.push("/scenarios/5")}>Scenario Detail</Button>
          </div>
        </div>
      </div>
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
