"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useApi } from "@/hooks/useApi";
import useLocalStorage from "@/hooks/useLocalStorage";
import { Scenario } from "@/types/scenario";
import { Button, List, Card, Typography, Spin, Empty, Divider } from "antd";
import { PlusOutlined, EyeOutlined, SettingOutlined, CalendarOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

const DEMO_SCENARIOS = [
  { id: 1, title: "MUN Zurich", description: "Model United Nations in Zurich.", date: "January 15, 2024" },
  { id: 2, title: "The 1956 Suez Crisis", description: "Egyptian President Gamal Abdel Nasser has just nationalized the Suez Canal Company, threatening the vital shipping lanes of the British and French empires...", date: "January 14, 2024" },
  { id: 3, title: "The Silicon Valley Succession", description: "The eccentric founder and CEO of OmniCorp, the world's most powerful tech conglomerate, has suddenly vanished...", date: "January 12, 2024" },
  { id: 4, title: "The Ides of March, 44 BC", description: "Julius Caesar lies dead on the Senate floor, assassinated by his closest allies. Rome is plunged into immediate chaos...", date: "January 10, 2024" },
  { id: 5, title: "The Trojan War", description: "Plague ravages the Greek camps, while supplies dwindle behind the impenetrable walls of Troy...", date: "January 8, 2024" },
];

export default function Home() {
  const router = useRouter();
  const apiService = useApi();
  const { value: token } = useLocalStorage<string>("token", "");
  const { value: userId } = useLocalStorage<string>("userId", "");
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [loading, setLoading] = useState(false);
  const [initials, setInitials] = useState("JD");

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    apiService.get<Scenario[]>("/scenarios", token)
      .then(data => setScenarios(data))
      .catch(() => setScenarios([]))
      .finally(() => setLoading(false));
  }, [token]);

  useEffect(() => {
    if (userId && token) {
      apiService.get<{ username: string }>(`/users/${userId}`, token)
        .then(u => { if (u.username) setInitials(u.username.slice(0, 2).toUpperCase()); })
        .catch(() => {});
    }
  }, [userId, token]);

  const displayScenarios = scenarios.length > 0 ? scenarios.map(s => ({
    id: s.id as number, title: s.title || "", description: s.description || "", date: `Day ${s.dayNumber}`,
  })) : DEMO_SCENARIOS;

  return (
    <div style={{ background: "#f8fafc", minHeight: "100vh" }}>
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "0 16px" }}>
        {/* Nav */}
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

        {/* Demo Navigation - visible links to all pages */}
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
    </div>
  );
}
