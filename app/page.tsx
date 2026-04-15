"use client";
import { useRouter } from "next/navigation";
import { Button, Card, Typography, List } from "antd";
import { PlusOutlined, EyeOutlined, SettingOutlined } from "@ant-design/icons";

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
  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "24px 16px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8, padding: "12px 0", borderBottom: "1px solid #f0f0f0" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <SettingOutlined style={{ color: "#6c5ce7", fontSize: 20 }} />
          <Text strong style={{ fontSize: 16 }}>Scenario Manager</Text>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <Button type="primary" style={{ background: "#6c5ce7", borderColor: "#6c5ce7" }} onClick={() => router.push("/scenarios/create")}>Create New Scenario</Button>
          <Button shape="circle" onClick={() => router.push("/login")}>JD</Button>
        </div>
      </div>
      <Title level={3} style={{ marginTop: 24, marginBottom: 4 }}>Created Scenarios</Title>
      <Text type="secondary">Review previously created scenarios</Text>
      <List
        style={{ marginTop: 16 }}
        dataSource={DEMO_SCENARIOS}
        renderItem={(s) => (
          <Card style={{ marginBottom: 12 }} hoverable onClick={() => router.push(`/scenarios/${s.id}`)}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <Text strong style={{ fontSize: 15 }}>{s.title}</Text>
                <br />
                <Text type="secondary" style={{ fontSize: 13 }}>{s.description}</Text>
                <br />
                <Text type="secondary" style={{ fontSize: 12 }}>{"\u{1F4C5}"} {s.date}</Text>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Button type="link" icon={<EyeOutlined />}>View</Button>
                <Button type="text">...</Button>
              </div>
            </div>
          </Card>
        )}
      />
    </div>
  );
}
