"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useApi } from "@/hooks/useApi";
import useLocalStorage from "@/hooks/useLocalStorage";
import { Button, Card, Form, Input, InputNumber, Typography, Space, Alert } from "antd";
import { PlusOutlined, DeleteOutlined, SettingOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;
const { TextArea } = Input;

interface Draft { name: string; description: string }

export default function CreateScenarioPage() {
  const router = useRouter();
  const apiService = useApi();
  const { value: token } = useLocalStorage<string>("token", "");
  const { value: userId } = useLocalStorage<string>("userId", "");
  const [characters, setCharacters] = useState<Draft[]>([]);
  const [cabinets, setCabinets] = useState<Draft[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form] = Form.useForm();

  const handleSave = async (values: { title: string; description: string; exchangeRate: number }) => {
    setError(null);
    setLoading(true);
    try {
      const scenario = await apiService.post<{ id: number }>(
        "/scenarios",
        { title: values.title, description: values.description, exchangeRate: values.exchangeRate || 0 },
        token
      );
      // Create characters
      for (const c of characters) {
        if (c.name) {
          await apiService.post("/characters", { name: c.name }, token);
        }
      }
      router.push(`/scenarios/${scenario.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create scenario");
    } finally {
      setLoading(false);
    }
  };

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
          <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#6c5ce7", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 13 }}>JD</div>
        </div>

        <Title level={3} style={{ marginTop: 24, color: "#1a1a2e" }}>Create New Scenario</Title>
        <Text style={{ color: "#64748b" }}>Define a new scenario with cabinets, characters, and settings</Text>

        {error && <Alert message={error} type="error" style={{ marginTop: 12 }} closable onClose={() => setError(null)} />}

        <Card style={{ marginTop: 24, borderRadius: 12, border: "1px solid #e2e8f0", background: "#fff" }}>
          <Form layout="vertical" form={form} onFinish={handleSave}>
            <Form.Item label={<Text strong style={{ color: "#1a1a2e" }}>Scenario Title</Text>} name="title" rules={[{ required: true, message: "Please enter a title" }]}>
              <Input placeholder="Enter scenario title" style={{ color: "#1a1a2e" }} />
            </Form.Item>
            <Form.Item label={<Text strong style={{ color: "#1a1a2e" }}>Description</Text>} name="description">
              <TextArea rows={3} placeholder="Describe the crisis scenario" style={{ color: "#1a1a2e" }} />
            </Form.Item>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 16 }}>
              <Text strong style={{ fontSize: 15, color: "#1a1a2e" }}>Characters</Text>
              <Button icon={<PlusOutlined />} type="primary" onClick={() => setCharacters([...characters, { name: "", description: "" }])}>Add Character</Button>
            </div>
            {characters.length === 0 ? (
              <div style={{ textAlign: "center", padding: "16px 0", color: "#94a3b8" }}>No characters added yet. Click &quot;Add Character&quot; to get started.</div>
            ) : (
              <Space direction="vertical" style={{ width: "100%", marginTop: 12 }}>
                {characters.map((c, i) => (
                  <Card key={i} size="small" style={{ border: "1px solid #e2e8f0" }} extra={
                    <Button icon={<DeleteOutlined />} danger size="small" onClick={() => setCharacters(characters.filter((_, j) => j !== i))} />
                  }>
                    <Input placeholder="Name" value={c.name} onChange={(e) => { const u = [...characters]; u[i].name = e.target.value; setCharacters(u); }} style={{ marginBottom: 8, color: "#1a1a2e" }} />
                    <TextArea placeholder="Description" value={c.description} onChange={(e) => { const u = [...characters]; u[i].description = e.target.value; setCharacters(u); }} rows={2} style={{ color: "#1a1a2e" }} />
                  </Card>
                ))}
              </Space>
            )}

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 24 }}>
              <Text strong style={{ fontSize: 15, color: "#1a1a2e" }}>Cabinets</Text>
              <Button icon={<PlusOutlined />} type="primary" onClick={() => setCabinets([...cabinets, { name: "", description: "" }])}>Add Cabinet</Button>
            </div>
            {cabinets.length === 0 ? (
              <div style={{ textAlign: "center", padding: "16px 0", color: "#94a3b8" }}>No cabinets added yet. Click &quot;Add Cabinet&quot; to get started.</div>
            ) : (
              <Space direction="vertical" style={{ width: "100%", marginTop: 12 }}>
                {cabinets.map((c, i) => (
                  <Card key={i} size="small" style={{ border: "1px solid #e2e8f0" }} extra={
                    <Button icon={<DeleteOutlined />} danger size="small" onClick={() => setCabinets(cabinets.filter((_, j) => j !== i))} />
                  }>
                    <Input placeholder="Cabinet Name" value={c.name} onChange={(e) => { const u = [...cabinets]; u[i].name = e.target.value; setCabinets(u); }} style={{ marginBottom: 8, color: "#1a1a2e" }} />
                    <TextArea placeholder="Description" value={c.description} onChange={(e) => { const u = [...cabinets]; u[i].description = e.target.value; setCabinets(u); }} rows={2} style={{ color: "#1a1a2e" }} />
                  </Card>
                ))}
              </Space>
            )}

            <div style={{ borderTop: "1px solid #e2e8f0", marginTop: 24, paddingTop: 16 }}>
              <Form.Item label={<Text strong style={{ color: "#1a1a2e" }}>Message Cost</Text>} name="exchangeRate">
                <InputNumber min={0} defaultValue={0} style={{ width: "100%", color: "#1a1a2e" }} addonAfter="credits" />
              </Form.Item>
              <Text style={{ fontSize: 12, color: "#94a3b8" }}>Cost per message in this scenario</Text>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 24 }}>
              <Button onClick={() => router.push("/")}>Cancel</Button>
              <Button type="primary" htmlType="submit" loading={loading}>Save Scenario</Button>
            </div>
          </Form>
        </Card>
      </div>
    </div>
  );
}
