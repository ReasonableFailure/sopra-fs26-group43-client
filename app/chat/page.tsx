"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useApi } from "@/hooks/useApi";
import useLocalStorage from "@/hooks/useLocalStorage";
import { Button, Card, Typography, Avatar, Tag, Modal, Input } from "antd";
import { SettingOutlined, CheckOutlined, CloseCircleOutlined, PlusOutlined, CalendarOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;
const { TextArea } = Input;

interface MessageItem {
  id: number;
  title: string | null;
  body: string;
  createdAt: string | null;
  status: string | null;
  creatorId: number | null;
  recipientId: number | null;
  isMe: boolean;
}

const HARDCODED_MESSAGES: MessageItem[] = [
  { id: 1, title: null, body: "I have sent troop to assist you. Hold your ground for 2 more days.", createdAt: "2024-01-15 14:42:18", status: null, creatorId: 2, recipientId: 1, isMe: false },
  { id: 2, title: null, body: "We are losing the city. How longer shall we hold?", createdAt: "2024-01-15 14:33:45", status: "APPROVED", creatorId: 1, recipientId: 2, isMe: true },
  { id: 3, title: null, body: "General, we are surrounded. Requesting assistance.", createdAt: "2024-01-15 14:31:28", status: "REJECTED", creatorId: 1, recipientId: 2, isMe: true },
];

export default function ChatPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const scenarioId = searchParams.get("scenarioId") || "5";
  const withChar = searchParams.get("with") || "0";
  const apiService = useApi();
  const { value: token } = useLocalStorage<string>("token", "");
  const [messages, setMessages] = useState<MessageItem[]>(HARDCODED_MESSAGES);
  const [newMsgOpen, setNewMsgOpen] = useState(false);
  const [newMsg, setNewMsg] = useState("");
  const [newTitle, setNewTitle] = useState("");

  const OTHER = [
    { initials: "JC", color: "#6c5ce7", name: "Julius Caesar", description: "A General of Ancient Rome and more. This is a placeholder for the character description. This is a placeholder for the character description.", cabinet: "The Roman Empire", status: "Active" },
    { initials: "LM", color: "#f59e0b", name: "Light Mage", description: "A powerful mage commanding the forces of light.", cabinet: "The Radiant Order", status: "Active" },
    { initials: "SR", color: "#ef4444", name: "Soul Reaper", description: "Collects the souls of fallen warriors.", cabinet: "The Shadow Covenant", status: "Active" },
  ];

  const other = OTHER[parseInt(withChar) % OTHER.length];

  const handleSend = async () => {
    if (!newMsg.trim()) return;
    const newMessage: MessageItem = {
      id: messages.length + 1, title: newTitle || null, body: newMsg,
      createdAt: new Date().toISOString(), status: "PENDING", creatorId: 1, recipientId: 2, isMe: true,
    };
    setMessages([...messages, newMessage]);
    setNewMsg(""); setNewTitle(""); setNewMsgOpen(false);
    if (token) {
      try {
        await apiService.post("/messages", {
          title: newTitle, body: newMsg, creatorId: 1, recipientId: parseInt(withChar) + 1, scenarioId: parseInt(scenarioId),
        }, token);
      } catch { /* use local fallback */ }
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
            <Text strong style={{ fontSize: 16, color: "#1a1a2e" }}>Character Profile & Communication Log</Text>
          </div>
          <Button onClick={() => router.back()}>Back to Dashboard</Button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: 20, paddingTop: 20 }}>
          {/* Left: Profile */}
          <Card style={{ border: "1px solid #e2e8f0", borderRadius: 12, background: "#fff", alignSelf: "start" }} bodyStyle={{ padding: 24 }}>
            <div style={{ textAlign: "center", marginBottom: 16 }}>
              <Avatar size={80} style={{ background: other.color, fontSize: 24, fontWeight: 700 }}>{other.initials}</Avatar>
              <Title level={4} style={{ color: "#1a1a2e", marginTop: 12, marginBottom: 0 }}>{other.name}</Title>
            </div>
            <div style={{ borderTop: "1px solid #e2e8f0", paddingTop: 16 }}>
              <Text strong style={{ color: "#1a1a2e", fontSize: 13 }}>Description</Text>
              <br />
              <Text style={{ color: "#64748b", fontSize: 13 }}>{other.description}</Text>
              <br /><br />
              <Text strong style={{ color: "#1a1a2e", fontSize: 13 }}>Cabinet</Text>
              <br />
              <Text style={{ color: "#64748b", fontSize: 13, fontStyle: "italic" }}>{other.cabinet}</Text>
              <br /><br />
              <Text strong style={{ color: "#1a1a2e", fontSize: 13 }}>Status</Text>
              <br />
              <Tag color="green">{other.status}</Tag>
            </div>
          </Card>

          {/* Right: Messages */}
          <div>
            <Title level={3} style={{ color: "#1a1a2e", marginBottom: 4 }}>Communication Log</Title>
            <Text style={{ color: "#64748b", fontSize: 13 }}>All messages and transmissions</Text>

            <div style={{ marginTop: 16 }}>
              {messages.map((m) => (
                <Card key={m.id} style={{ marginBottom: 12, border: "1px solid #e2e8f0", borderRadius: 10, background: "#fff" }} bodyStyle={{ padding: 16 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                    <Text strong style={{ color: "#1a1a2e" }}>{m.isMe ? "You" : other.name}</Text>
                    {m.status === "APPROVED" && <Tag color="green" icon={<CheckOutlined />}>Sent</Tag>}
                    {m.status === "REJECTED" && <Tag color="red" icon={<CloseCircleOutlined />}>Failed</Tag>}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                    <CalendarOutlined style={{ color: "#94a3b8", fontSize: 12 }} />
                    <Text style={{ color: "#94a3b8", fontSize: 12 }}>{m.createdAt}</Text>
                  </div>
                  <Text style={{ color: "#475569" }}>{m.body}</Text>
                  {m.status === "REJECTED" && (
                    <Card style={{ marginTop: 10, background: "#fff1f2", border: "1px solid #fecdd3", borderRadius: 8 }} bodyStyle={{ padding: "8px 12px" }}>
                      <Text style={{ color: "#ef4444", fontSize: 12 }}>⊗ Failure Reason</Text>
                      <br />
                      <Text style={{ color: "#ef4444", fontSize: 12, fontStyle: "italic" }}>Backroom: Your carrier was captured on his way to the capital.</Text>
                    </Card>
                  )}
                </Card>
              ))}
            </div>

            <Button type="primary" size="large" icon={<PlusOutlined />} style={{ width: "100%", marginTop: 8 }} onClick={() => setNewMsgOpen(true)}>
              New Message
            </Button>
          </div>
        </div>
      </div>

      <Modal title="New Message" open={newMsgOpen} onCancel={() => setNewMsgOpen(false)} onOk={handleSend} okText="Send">
        <Input placeholder="Title (optional)" value={newTitle} onChange={e => setNewTitle(e.target.value)} style={{ marginBottom: 8 }} />
        <TextArea rows={4} placeholder="Message content..." value={newMsg} onChange={e => setNewMsg(e.target.value)} />
      </Modal>
    </div>
  );
}
