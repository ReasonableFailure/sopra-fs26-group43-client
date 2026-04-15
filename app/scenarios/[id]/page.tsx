"use client";
import { useParams, useRouter } from "next/navigation";
import { Button, Card, Descriptions, Tag, Typography, List, Col, Row } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

const SCENARIOS: Record<string, { title: string; description: string; isActive: boolean; day: number; exchangeRate: number; characters: { name: string; title: string; description: string; cabinet: string }[] }> = {
  "1": { title: "MUN Zurich", description: "Model United Nations in Zurich.", isActive: false, day: 0, exchangeRate: 10, characters: [
    { name: "Ambassador Chen Wei", title: "Chinese Delegate", description: "Represents China in trade negotiations", cabinet: "Security Council" },
    { name: "Prime Minister Sarah Johnson", title: "UK Representative", description: "Leading the British delegation", cabinet: "Security Council" },
    { name: "General Marcus Stone", title: "NATO Commander", description: "Military advisor to the alliance", cabinet: "Military Advisory" },
  ]},
  "4": { title: "The Ides of March, 44 BC", description: "Julius Caesar lies dead on the Senate floor, assassinated by his closest allies. Rome is plunged into immediate chaos...", isActive: true, day: 3, exchangeRate: 10, characters: [
    { name: "Marcus Brutus", title: "Senator", description: "One of the key conspirators against Caesar", cabinet: "The Roman Senate" },
    { name: "Mark Antony", title: "Consul", description: "Caesar's loyal friend and co-consul", cabinet: "The Roman Senate" },
    { name: "Octavian", title: "Heir of Caesar", description: "Caesar's adopted son and political heir", cabinet: "Caesarian Faction" },
    { name: "Cicero", title: "Orator", description: "Rome's greatest orator and defender of the Republic", cabinet: "The Roman Senate" },
    { name: "Cleopatra", title: "Queen of Egypt", description: "Ruler of Egypt with ties to Rome", cabinet: "Foreign Powers" },
    { name: "Cassius", title: "Senator", description: "The mastermind behind the conspiracy", cabinet: "The Roman Senate" },
  ]},
  "5": { title: "The Trojan War", description: "Plague ravages the Greek camps, while supplies dwindle behind the impenetrable walls of Troy...", isActive: true, day: 8, exchangeRate: 10, characters: [
    { name: "Shadow Weaver", title: "The Obsidian Council", description: "Master of illusions and deception, capable of bending reality to their will in the darkest corners", cabinet: "The Obsidian Council" },
    { name: "Crimson Blade", title: "The Iron Vanguard", description: "Elite warrior with unmatched combat prowess and strategic battlefield dominance", cabinet: "The Iron Vanguard" },
    { name: "Mystic Oracle", title: "The Ethereal Sanctum", description: "Seer of futures and keeper of ancient wisdom, wielding powerful divination magic", cabinet: "The Ethereal Sanctum" },
    { name: "Storm Caller", title: "The Tempest Legion", description: "Commander of elemental forces, summoning devastating weather phenomena at will", cabinet: "The Tempest Legion" },
    { name: "Void Walker", title: "The Abyss Collective", description: "Traveler between dimensions, harnessing the power of the void itself", cabinet: "The Abyss Collective" },
    { name: "Phoenix Knight", title: "The Radiant Order", description: "Immortal guardian rising from ashes, wielding flames of purification and rebirth", cabinet: "The Radiant Order" },
  ]},
};

export default function ScenarioDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const sid = typeof id === "string" ? id : "5";
  const scenario = SCENARIOS[sid] || SCENARIOS["5"];

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: 32 }}>
      <Button icon={<ArrowLeftOutlined />} onClick={() => router.push("/")} style={{ marginBottom: 16 }}>Back to Scenarios</Button>
      <Title level={2}>{scenario.title}</Title>
      <Text type="secondary">{scenario.description}</Text>
      <Card style={{ marginTop: 24 }}>
        <Descriptions column={2}>
          <Descriptions.Item label="Status"><Tag color={scenario.isActive ? "green" : "red"}>{scenario.isActive ? "Active" : "Inactive"}</Tag></Descriptions.Item>
          <Descriptions.Item label="Day">{scenario.day}</Descriptions.Item>
          <Descriptions.Item label="Exchange Rate">{scenario.exchangeRate} likes per action point</Descriptions.Item>
        </Descriptions>
      </Card>
      <Title level={4} style={{ marginTop: 32 }}>Characters</Title>
      <Row gutter={[16, 16]}>
        {scenario.characters.map((c, i) => (
          <Col xs={24} sm={12} md={8} key={i}>
            <Card title={c.name} size="small" extra={<Tag color="purple">{c.cabinet}</Tag>}>
              <Text type="secondary" style={{ fontSize: 12 }}>{c.title}</Text><br />
              <Text style={{ fontSize: 13 }}>{c.description}</Text>
            </Card>
          </Col>
        ))}
      </Row>
      <Button type="primary" size="large" style={{ marginTop: 24, background: "#6c5ce7" }} onClick={() => router.push(`/lobby?scenarioId=${sid}`)}>Join This Crisis</Button>
    </div>
  );
}
