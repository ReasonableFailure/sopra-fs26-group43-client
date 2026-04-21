"use client";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useApi } from "@/hooks/useApi";
import useLocalStorage from "@/hooks/useLocalStorage";
import { Button, Card, Form, Input, Select, Typography, Alert } from "antd";
import { SettingOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;
const { TextArea } = Input;

const PLAYER_TYPES = ["Direct Message", "Directive", "Pronouncement"];
const BACKROOM_TYPES = ["Response", "New Story"];
const RECIPIENTS = ["Julius Caesar", "Mark Antony", "Octavian", "Cicero", "Cleopatra", "Cassius"];

export default function EditorPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const scenarioId = searchParams.get("scenarioId");
  const initialType = searchParams.get("type") || "direct-message";
  const apiService = useApi();
  const { value: token } = useLocalStorage<string>("token", "");
  const { value: userId } = useLocalStorage<string>("userId", "");
  const [commType, setCommType] = useState(initialType === "pronouncement" ? "Pronouncement" : initialType === "directive" ? "Directive" : initialType === "response" ? "Response" : "Direct Message");
  const [recipient, setRecipient] = useState(RECIPIENTS[0]);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [approved, setApproved] = useState<boolean | null>(null);

  const isBackroomer = commType === "Response" || commType === "New Story";
  const typeOptions = isBackroomer ? BACKROOM_TYPES : PLAYER_TYPES;

  const handleSubmit = async () => {
    if (!body.trim()) return;
    setLoading(true);
    setError(null);
    try {
      if (commType === "Direct Message") {
        await apiService.post("/messages", {
          title, body, creatorId: parseInt(userId || "1"),
          recipientId: RECIPIENTS.indexOf(recipient) + 1, scenarioId: parseInt(scenarioId || "5"),
        }, token);
      } else if (commType === "Directive") {
        await apiService.post("/directives", {
          title, body, creatorId: parseInt(userId || "1"), scenarioId: parseInt(scenarioId || "5"),
        }, token);
      } else if (commType === "Pronouncement" || commType === "New Story") {
        await apiService.post("/news", {
          title, body, authorId: parseInt(userId || "1"), scenarioId: parseInt(scenarioId || "5"),
        }, token);
      }
      router.back();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Submission failed");
    } finally {
      setLoading(false);
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
            <Text strong style={{ fontSize: 16, color: "#1a1a2e" }}>Scenario Manager</Text>
          </div>
          <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#6c5ce7", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 13 }}>JD</div>
        </div>

        <div style={{ display: "flex", justifyContent: "center", paddingTop: 32 }}>
          <Card style={{ width: "100%", maxWidth: 600, border: "1px solid #e2e8f0", borderRadius: 16, background: "#fff" }} bodyStyle={{ padding: 32 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
              <div>
                <Title level={3} style={{ color: "#1a1a2e", marginBottom: 4 }}>Communication Form</Title>
                <Text style={{ color: "#64748b", fontSize: 13 }}>Create and submit your directive, pronouncement, or message</Text>
              </div>
              <Button onClick={() => router.back()}>Back to Dashboard</Button>
            </div>

            {error && <Alert message={error} type="error" style={{ marginBottom: 16 }} closable onClose={() => setError(null)} />}

            <Form layout="vertical">
              <Form.Item label={<Text strong style={{ color: "#1a1a2e" }}>Communication Type</Text>}>
                <Select value={commType} onChange={setCommType} style={{ width: "100%" }}>
                  {[...PLAYER_TYPES, ...BACKROOM_TYPES].map(t => <Select.Option key={t} value={t}>{t}</Select.Option>)}
                </Select>
              </Form.Item>

              {commType === "Direct Message" && (
                <Form.Item label={<Text strong style={{ color: "#1a1a2e" }}>Select Recipient</Text>}>
                  <Select value={recipient} onChange={setRecipient} style={{ width: "100%" }}>
                    {RECIPIENTS.map(r => <Select.Option key={r} value={r}>{r}</Select.Option>)}
                  </Select>
                </Form.Item>
              )}

              {commType === "Response" && (
                <Form.Item label={<Text strong style={{ color: "#1a1a2e" }}>Select Recipient</Text>}>
                  <Select defaultValue="directive-1" style={{ width: "100%" }}>
                    <Select.Option value="directive-1">This can be the title of the directive, showing which person&apos;s which directive you are responding to.</Select.Option>
                  </Select>
                </Form.Item>
              )}

              {commType === "Response" ? (
                <Form.Item label={<Text strong style={{ color: "#1a1a2e" }}>Approval Decision</Text>}>
                  <div style={{ display: "flex", gap: 8 }}>
                    <Button
                      style={{ flex: 1, background: approved === true ? "#22c55e" : undefined, color: approved === true ? "#fff" : undefined, borderColor: approved === true ? "#22c55e" : undefined }}
                      onClick={() => setApproved(true)}
                    >Approve</Button>
                    <Button
                      style={{ flex: 1, background: approved === false ? "#ef4444" : undefined, color: approved === false ? "#fff" : undefined, borderColor: approved === false ? "#ef4444" : undefined }}
                      onClick={() => setApproved(false)}
                    >Reject</Button>
                  </div>
                </Form.Item>
              ) : (
                <Form.Item label={<Text strong style={{ color: "#1a1a2e" }}>Title</Text>}>
                  <Input value={title} onChange={e => setTitle(e.target.value)} style={{ color: "#1a1a2e" }} />
                </Form.Item>
              )}

              <Form.Item label={<Text strong style={{ color: "#1a1a2e" }}>Message Content</Text>}>
                <TextArea rows={7} value={body} onChange={e => setBody(e.target.value)} style={{ color: "#1a1a2e" }} />
              </Form.Item>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 8 }}>
                <Button onClick={() => router.back()}>Cancel</Button>
                <Button type="primary" loading={loading} onClick={handleSubmit}>Submit</Button>
              </div>
            </Form>
          </Card>
        </div>
      </div>
    </div>
  );
}
