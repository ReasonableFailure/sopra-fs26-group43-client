"use client";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useApi } from "@/hooks/useApi";
import useLocalStorage from "@/hooks/useLocalStorage";
import { Scenario } from "@/types/scenario";
import { Character } from "@/types/character";
import { Button, Card, Descriptions, Tag, Typography, Row, Col, Spin } from "antd";
import { ArrowLeftOutlined, SettingOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

const HARDCODED: Record<string, { scenario: Scenario; characters: Character[] }> = {
  "1": { scenario: { id: 1, title: "MUN Zurich", description: "Model United Nations in Zurich.", active: false, dayNumber: 0, exchangeRate: 10 }, characters: [
    { id: 1, name: "Ambassador Chen Wei", title: "Chinese Delegate", description: "Represents China in trade negotiations", secret: null, isAlive: true, messageCount: 0, actionPoints: 10 },
    { id: 2, name: "Prime Minister Sarah Johnson", title: "UK Representative", description: "Leading the British delegation", secret: null, isAlive: true, messageCount: 0, actionPoints: 10 },
    { id: 3, name: "General Marcus Stone", title: "NATO Commander", description: "Military advisor to the alliance", secret: null, isAlive: true, messageCount: 0, actionPoints: 10 },
  ]},
  "4": { scenario: { id: 4, title: "The Ides of March, 44 BC", description: "Julius Caesar lies dead on the Senate floor, assassinated by his closest allies. Rome is plunged into immediate chaos...", active: true, dayNumber: 3, exchangeRate: 10 }, characters: [
    { id: 4, name: "Marcus Brutus", title: "Senator", description: "One of the key conspirators against Caesar", secret: null, isAlive: true, messageCount: 0, actionPoints: 10 },
    { id: 5, name: "Mark Antony", title: "Consul", description: "Caesar's loyal friend and co-consul", secret: null, isAlive: true, messageCount: 0, actionPoints: 10 },
    { id: 6, name: "Octavian", title: "Heir of Caesar", description: "Caesar's adopted son and political heir", secret: null, isAlive: true, messageCount: 0, actionPoints: 10 },
    { id: 7, name: "Cicero", title: "Orator", description: "Rome's greatest orator and defender of the Republic", secret: null, isAlive: true, messageCount: 0, actionPoints: 10 },
    { id: 8, name: "Cleopatra", title: "Queen of Egypt", description: "Ruler of Egypt with ties to Rome", secret: null, isAlive: true, messageCount: 0, actionPoints: 10 },
    { id: 9, name: "Cassius", title: "Senator", description: "The mastermind behind the conspiracy", secret: null, isAlive: true, messageCount: 0, actionPoints: 10 },
  ]},
  "5": { scenario: { id: 5, title: "The Trojan War", description: "Plague ravages the Greek camps, while supplies dwindle behind the impenetrable walls of Troy...", active: true, dayNumber: 8, exchangeRate: 10 }, characters: [
    { id: 10, name: "Shadow Weaver", title: "The Obsidian Council", description: "Master of illusions and deception", secret: null, isAlive: true, messageCount: 0, actionPoints: 10 },
    { id: 11, name: "Crimson Blade", title: "The Iron Vanguard", description: "Elite warrior with unmatched combat prowess", secret: null, isAlive: true, messageCount: 0, actionPoints: 10 },
    { id: 12, name: "Mystic Oracle", title: "The Ethereal Sanctum", description: "Seer of futures and keeper of ancient wisdom", secret: null, isAlive: true, messageCount: 0, actionPoints: 10 },
  ]},
};

export default function ScenarioDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const apiService = useApi();
  const { value: token } = useLocalStorage<string>("token", "");
  const sid = typeof id === "string" ? id : "5";
  const [scenario, setScenario] = useState<Scenario | null>(null);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        if (token) {
          const s = await apiService.get<Scenario>(`/scenarios/${sid}`, token);
          setScenario(s);
          const chars = await apiService.get<Character[]>(`/characters/${sid}`, token);
          setCharacters(chars);
        } else {
          const hc = HARDCODED[sid] || HARDCODED["5"];
          setScenario(hc.scenario);
          setCharacters(hc.characters);
        }
      } catch {
        const hc = HARDCODED[sid] || HARDCODED["5"];
        setScenario(hc.scenario);
        setCharacters(hc.characters);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [sid, token]);

  if (loading) return <div style={{ display: "flex", justifyContent: "center", padding: 80 }}><Spin size="large" /></div>;
  if (!scenario) return null;

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
          <Button icon={<ArrowLeftOutlined />} onClick={() => router.push("/")}>Back to Scenarios</Button>
        </div>

        <div style={{ paddingTop: 24 }}>
          <Title level={2} style={{ color: "#1a1a2e", marginBottom: 4 }}>{scenario.title}</Title>
          <Text style={{ color: "#64748b" }}>{scenario.description}</Text>
        </div>

        <Card style={{ marginTop: 20, borderRadius: 12, border: "1px solid #e2e8f0", background: "#fff" }}>
          <Descriptions column={2}>
            <Descriptions.Item label="Status">
              <Tag color={scenario.active ? "green" : "red"}>{scenario.active ? "Active" : "Inactive"}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Day">{scenario.dayNumber}</Descriptions.Item>
            <Descriptions.Item label="Exchange Rate">{scenario.exchangeRate} likes per action point</Descriptions.Item>
          </Descriptions>
        </Card>

        <Title level={4} style={{ marginTop: 32, color: "#1a1a2e" }}>Characters</Title>
        <Row gutter={[16, 16]}>
          {characters.map((c, i) => (
            <Col xs={24} sm={12} md={8} key={i}>
              <Card
                style={{ borderRadius: 10, border: "1px solid #e2e8f0", background: "#fff", height: "100%" }}
                bodyStyle={{ padding: 16 }}
              >
                <Text strong style={{ color: "#1a1a2e" }}>{c.name}</Text>
                <br />
                <Tag color="purple" style={{ marginTop: 4, marginBottom: 6 }}>{c.title}</Tag>
                <br />
                <Text style={{ fontSize: 13, color: "#64748b" }}>{c.description}</Text>
                {!c.isAlive && <Tag color="red" style={{ marginTop: 4 }}>Deceased</Tag>}
              </Card>
            </Col>
          ))}
        </Row>

        <div style={{ display: "flex", gap: 12, marginTop: 24, marginBottom: 32 }}>
          <Button type="primary" size="large" onClick={() => router.push(`/lobby?scenarioId=${sid}`)}>
            Join This Crisis
          </Button>
          <Button size="large" onClick={() => router.push(`/news?scenarioId=${sid}`)}>
            View News Feed
          </Button>
          <Button size="large" onClick={() => router.push(`/director?scenarioId=${sid}`)}>
            Director Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}
