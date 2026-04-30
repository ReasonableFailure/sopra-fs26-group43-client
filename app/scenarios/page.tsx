"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useApi } from "@/hooks/useApi";
import useLocalStorage from "@/hooks/useLocalStorage";
import { Scenario } from "@/types/scenario";
import { Button, Card, Typography, Spin, Empty, List } from "antd";
import { PlusOutlined, EyeOutlined, SettingOutlined, ArrowLeftOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

export default function ScenariosPage() {
  const router = useRouter();
  const apiService = useApi();
  const { value: token } = useLocalStorage<string>("token", "");
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) { setLoading(false); return; }
    apiService.get<Scenario[]>("/scenarios", token)
      .then(data => setScenarios(data))
      .catch(() => setScenarios([]))
      .finally(() => setLoading(false));
  }, [token]);

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
          <Button icon={<ArrowLeftOutlined />} onClick={() => router.push("/")}>Back</Button>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 24, marginBottom: 8 }}>
          <div>
            <Title level={3} style={{ color: "#1a1a2e", margin: 0 }}>Created Scenarios</Title>
            <Text style={{ color: "#64748b" }}>Review previously created scenarios</Text>
          </div>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => router.push("/scenarios/create")}>
            Create New Scenario
          </Button>
        </div>
        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: 60 }}><Spin size="large" /></div>
        ) : scenarios.length === 0 ? (
          <Empty description="No scenarios yet" style={{ marginTop: 48 }} />
        ) : (
          <List
            style={{ marginTop: 16 }}
            dataSource={scenarios}
            renderItem={(s) => (
              <Card
                style={{ marginBottom: 12, borderRadius: 10, border: "1px solid #e2e8f0", background: "#fff", cursor: "pointer" }}
                bodyStyle={{ padding: "16px 20px" }}
                hoverable
                onClick={() => router.push(`/scenarios/${s.id}`)}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <Text strong style={{ fontSize: 15, color: "#1a1a2e" }}>{s.title || "Untitled"}</Text>
                    <br />
                    <Text style={{ fontSize: 13, color: "#64748b" }}>{s.description || ""}</Text>
                    <br />
                    <Text style={{ fontSize: 12, color: "#6c5ce7" }}>
                      Day {s.dayNumber} • {s.active ? "Active" : "Inactive"}
                    </Text>
                  </div>
                  <Button type="link" icon={<EyeOutlined />} style={{ color: "#6c5ce7" }}>View</Button>
                </div>
              </Card>
            )}
          />
        )}
      </div>
    </div>
  );
}
