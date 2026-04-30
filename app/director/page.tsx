"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { Button, Card, Typography, List, Modal, Form, Input, message } from "antd";
import { SettingOutlined, PlayCircleOutlined, PauseCircleOutlined, CloseCircleOutlined, StopOutlined } from "@ant-design/icons";
import { useState, useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useApi } from "@/hooks/useApi";
import { ScenarioService } from "@/api/scenarioService";
import { Button, Card, Typography, List, Tag } from "antd";
import { SettingOutlined, PlayCircleOutlined, PauseCircleOutlined, CloseCircleOutlined, StopOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

const ACTIVITY = [
  { color: "#22c55e", title: "Player joined", detail: "Sarah Chen has joined as France delegate", time: "2 minutes ago" },
  { color: "#6c5ce7", title: "Backroomer ready", detail: "Michael Torres marked ready for scenario start", time: "5 minutes ago" },
  { color: "#f59e0b", title: "System update", detail: "Game parameters updated for current session", time: "12 minutes ago" },
  { color: "#3b82f6", title: "Message sent", detail: "Broadcast message sent to all participants", time: "18 minutes ago" },
];

export default function DirectorPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const scenarioId = searchParams.get("scenarioId") || "5";
  const { token } = useAuth();
  const api = useApi();
  const scenarioService = useMemo(() => new ScenarioService(api), [api]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();

  const handleSubmitMastodon = async () => {
    try {
      const values = await form.validateFields();

      await scenarioService.updateMastodonConfig(
        Number(scenarioId),
        values,
        `Director ${token}`
      );

      message.success("Mastodon configuration saved");
      setIsModalOpen(false);
      form.resetFields();
    } catch (err) {
      message.error("Failed to update Mastodon configuration");
    }
  };

  return (
    <div style={{ background: "#f8fafc", minHeight: "100vh" }}>
      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "0 16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 0", borderBottom: "1px solid #e2e8f0" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ background: "#6c5ce7", borderRadius: 8, width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <SettingOutlined style={{ color: "#fff", fontSize: 16 }} />
            </div>
            <Text strong style={{ fontSize: 16, color: "#1a1a2e" }}>Director Dashboard</Text>
          </div>
          <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#6c5ce7", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 13 }}>JD</div>
        </div>

        <div style={{ paddingTop: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div><Title level={2} style={{ color: "#1a1a2e", marginBottom: 4 }}> The Trojan War </Title> 
            <Text style={{ color: "#64748b" }}>Monitor readiness and control game state</Text>
          </div>
            <Button
              type="default"
              onClick={() => setIsModalOpen(true)}
            >
              Add Mastodon Account
            </Button>
          </div>
          <Title level={2} style={{ color: "#1a1a2e", marginBottom: 4 }}>The Trojan War</Title>
          <Text style={{ color: "#64748b" }}>Monitor readiness and control game state</Text>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 24 }}>
          <Card style={{ borderRadius: 12, border: "1px solid #e2e8f0", background: "#fff" }}>
            <Text style={{ color: "#64748b", fontSize: 13 }}>Game Status</Text>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 4 }}>
              <Title level={2} style={{ color: "#1a1a2e", margin: 0 }}>Stopped</Title>
              <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#fee2e2", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <StopOutlined style={{ color: "#ef4444", fontSize: 18 }} />
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 8 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#ef4444" }} />
              <Text style={{ color: "#ef4444", fontSize: 13 }}>Game is paused</Text>
            </div>
            <Text style={{ color: "#94a3b8", fontSize: 12 }}>Ready to start when needed</Text>
          </Card>

          <Card style={{ borderRadius: 12, border: "1px solid #e2e8f0", background: "#fff" }}>
            <Text strong style={{ color: "#1a1a2e", fontSize: 16 }}>Game Controls</Text>
            <Button type="primary" size="large" icon={<PlayCircleOutlined />} style={{ width: "100%", marginTop: 16, marginBottom: 8 }}>
              Start Game
            </Button>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              <Button icon={<PauseCircleOutlined />} style={{ background: "#3b82f6", color: "#fff", border: "none" }}>Freeze Game</Button>
              <Button danger icon={<CloseCircleOutlined />}>End Game</Button>
            </div>
          </Card>
        </div>

        <Card style={{ marginTop: 16, borderRadius: 12, border: "1px solid #e2e8f0", background: "#fff" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <Text strong style={{ fontSize: 16, color: "#1a1a2e" }}>Recent Activity</Text>
            <Button type="primary" onClick={() => router.push(`/news?scenarioId=${scenarioId}`)}>
              See All News &gt;
            </Button>
          </div>
          <List
            dataSource={ACTIVITY}
            renderItem={(item) => (
              <Card style={{ marginBottom: 8, border: "1px solid #f1f5f9", borderRadius: 8 }} bodyStyle={{ padding: "12px 16px" }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: item.color, marginTop: 5, flexShrink: 0 }} />
                  <div>
                    <Text strong style={{ color: "#1a1a2e" }}>{item.title}</Text>
                    <br />
                    <Text style={{ color: "#64748b", fontSize: 13 }}>{item.detail}</Text>
                    <br />
                    <Text style={{ color: "#94a3b8", fontSize: 12 }}>{item.time}</Text>
                  </div>
                </div>
              </Card>
            )}
          />
        </Card>
      </div>
      <Modal
        title="Mastodon Account"
        open={isModalOpen}
        onOk={handleSubmitMastodon}
        onCancel={() => setIsModalOpen(false)}
        okText="Save"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="Mastodon Base URL"
            name="mastodonBaseUrl"
            rules={[{ required: true, message: "Please enter the base URL" }]}
          >
            <Input placeholder="https://mastodon.social" />
          </Form.Item>

          <Form.Item
            label="Access Token"
            name="mastodonAccessToken"
            rules={[{ required: true, message: "Please enter the access token" }]}
          >
            <Input placeholder="Your access token" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
