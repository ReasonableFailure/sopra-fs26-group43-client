"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useApi } from "@/hooks/useApi";
import { Scenario } from "@/types/scenario";
import { Button, Card, List, Typography, Spin, Empty } from "antd";
import { PlusOutlined, EyeOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

export default function ScenariosPage() {
  const router = useRouter();
  const apiService = useApi();
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchScenarios = async () => {
      try {
        const data = await apiService.get<Scenario[]>("/scenarios");
        setScenarios(data);
      } catch {
        setScenarios([]);
      } finally {
        setLoading(false);
      }
    };
    fetchScenarios();
  }, []);

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: 80 }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: 32 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0 }}>Created Scenarios</Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => router.push("/scenarios/create")}
        >
          Create New Scenario
        </Button>
      </div>
      <Text type="secondary">Review previously created scenarios</Text>
      {scenarios.length === 0 ? (
        <Empty description="No scenarios yet" style={{ marginTop: 48 }} />
      ) : (
        <List
          style={{ marginTop: 24 }}
          dataSource={scenarios}
          renderItem={(s) => (
            <Card
              style={{ marginBottom: 12, cursor: "pointer" }}
              hoverable
              onClick={() => router.push(`/scenarios/${s.id}`)}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <Title level={4} style={{ margin: 0 }}>{s.title || "Untitled"}</Title>
                  <Text type="secondary">{s.description || ""}</Text>
                  <br />
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    Day {s.day} {s.isActive ? " \u2022 Active" : " \u2022 Inactive"}
                  </Text>
                </div>
                <Button type="link" icon={<EyeOutlined />}>View</Button>
              </div>
            </Card>
          )}
        />
      )}
    </div>
  );
}
