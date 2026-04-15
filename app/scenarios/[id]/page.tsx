"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useApi } from "@/hooks/useApi";
import { Scenario } from "@/types/scenario";
import { Character } from "@/types/character";
import { Button, Card, Descriptions, List, Spin, Tag, Typography, Empty } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

export default function ScenarioDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const apiService = useApi();
  const [scenario, setScenario] = useState<Scenario | null>(null);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const s = await apiService.get<Scenario>(`/scenarios/${id}`);
        setScenario(s);
        try {
          const chars = await apiService.get<Character[]>(`/characters/${id}/`);
          setCharacters(chars);
        } catch {
          setCharacters([]);
        }
      } catch {
        setScenario(null);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: 80 }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!scenario) {
    return (
      <div style={{ maxWidth: 900, margin: "0 auto", padding: 32 }}>
        <Empty description="Scenario not found" />
        <Button onClick={() => router.push("/scenarios")}>Back to Scenarios</Button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: 32 }}>
      <Button
        icon={<ArrowLeftOutlined />}
        onClick={() => router.push("/scenarios")}
        style={{ marginBottom: 16 }}
      >
        Back to Scenarios
      </Button>
      <Title level={2}>{scenario.title}</Title>
      <Text type="secondary">{scenario.description}</Text>
      <Card style={{ marginTop: 24 }}>
        <Descriptions column={2}>
          <Descriptions.Item label="Status">
            <Tag color={scenario.isActive ? "green" : "red"}>
              {scenario.isActive ? "Active" : "Inactive"}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Day">{scenario.day}</Descriptions.Item>
          <Descriptions.Item label="Exchange Rate">{scenario.exchangeRate}</Descriptions.Item>
        </Descriptions>
      </Card>
      <Title level={4} style={{ marginTop: 32 }}>Characters</Title>
      {characters.length === 0 ? (
        <Empty description="No characters in this scenario" />
      ) : (
        <List
          grid={{ gutter: 16, column: 3 }}
          dataSource={characters}
          renderItem={(c) => (
            <List.Item>
              <Card title={c.name} size="small">
                <Text type="secondary">{c.title}</Text>
                <br />
                <Text>{c.description}</Text>
                <br />
                <Tag color={c.isAlive ? "green" : "red"} style={{ marginTop: 8 }}>
                  {c.isAlive ? "Active" : "Eliminated"}
                </Tag>
              </Card>
            </List.Item>
          )}
        />
      )}
      <Button
        type="primary"
        size="large"
        style={{ marginTop: 24 }}
        onClick={() => router.push(`/lobby?scenarioId=${id}`)}
      >
        Join This Crisis
      </Button>
    </div>
  );
}
