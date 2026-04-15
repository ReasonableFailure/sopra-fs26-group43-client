"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Card, Form, Input, InputNumber, Typography, Space } from "antd";
import { PlusOutlined, DeleteOutlined, SettingOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;
const { TextArea } = Input;

interface Draft { name: string; description: string }

export default function CreateScenarioPage() {
  const router = useRouter();
  const [characters, setCharacters] = useState<Draft[]>([]);
  const [cabinets, setCabinets] = useState<Draft[]>([]);

  return (
    <div style={{ maxWidth: 700, margin: "0 auto", padding: 32 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8, padding: "12px 0", borderBottom: "1px solid #f0f0f0" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <SettingOutlined style={{ color: "#6c5ce7", fontSize: 20 }} />
          <Text strong style={{ fontSize: 16 }}>Scenario Manager</Text>
        </div>
        <Button shape="circle">JD</Button>
      </div>
      <Title level={3} style={{ marginTop: 24 }}>Create New Scenario</Title>
      <Text type="secondary">Define a new scenario with cabinets, characters, and settings</Text>
      <Card style={{ marginTop: 24 }}>
        <Form layout="vertical">
          <Form.Item label="Scenario Title"><Input placeholder="Enter scenario title" /></Form.Item>
          <Form.Item label="Description"><TextArea rows={3} placeholder="Describe the crisis scenario" /></Form.Item>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 16 }}>
            <Title level={5} style={{ margin: 0 }}>Characters</Title>
            <Button icon={<PlusOutlined />} type="primary" style={{ background: "#6c5ce7" }} onClick={() => setCharacters([...characters, { name: "", description: "" }])}>Add Character</Button>
          </div>
          {characters.length === 0 ? (
            <Text type="secondary" style={{ display: "block", textAlign: "center", padding: 16 }}>No characters added yet. Click &quot;Add Character&quot; to get started.</Text>
          ) : (
            <Space direction="vertical" style={{ width: "100%", marginTop: 12 }}>
              {characters.map((c, i) => (
                <Card key={i} size="small" extra={<Button icon={<DeleteOutlined />} danger size="small" onClick={() => setCharacters(characters.filter((_, j) => j !== i))} />}>
                  <Input placeholder="Name" value={c.name} onChange={(e) => { const u = [...characters]; u[i].name = e.target.value; setCharacters(u); }} style={{ marginBottom: 8 }} />
                  <TextArea placeholder="Description" value={c.description} onChange={(e) => { const u = [...characters]; u[i].description = e.target.value; setCharacters(u); }} rows={2} />
                </Card>
              ))}
            </Space>
          )}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 24 }}>
            <Title level={5} style={{ margin: 0 }}>Cabinets</Title>
            <Button icon={<PlusOutlined />} type="primary" style={{ background: "#6c5ce7" }} onClick={() => setCabinets([...cabinets, { name: "", description: "" }])}>Add Cabinet</Button>
          </div>
          {cabinets.length === 0 ? (
            <Text type="secondary" style={{ display: "block", textAlign: "center", padding: 16 }}>No cabinets added yet. Click &quot;Add Cabinet&quot; to get started.</Text>
          ) : (
            <Space direction="vertical" style={{ width: "100%", marginTop: 12 }}>
              {cabinets.map((c, i) => (
                <Card key={i} size="small" extra={<Button icon={<DeleteOutlined />} danger size="small" onClick={() => setCabinets(cabinets.filter((_, j) => j !== i))} />}>
                  <Input placeholder="Cabinet Name" value={c.name} onChange={(e) => { const u = [...cabinets]; u[i].name = e.target.value; setCabinets(u); }} style={{ marginBottom: 8 }} />
                  <TextArea placeholder="Description" value={c.description} onChange={(e) => { const u = [...cabinets]; u[i].description = e.target.value; setCabinets(u); }} rows={2} />
                </Card>
              ))}
            </Space>
          )}
          <Form.Item label="Message Cost" style={{ marginTop: 24 }}>
            <InputNumber min={0} defaultValue={0} style={{ width: "100%" }} addonAfter="credits" />
            <Text type="secondary" style={{ fontSize: 12 }}>Cost per message in this scenario</Text>
          </Form.Item>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 24 }}>
            <Button onClick={() => router.push("/")}>Cancel</Button>
            <Button type="primary" style={{ background: "#6c5ce7" }} onClick={() => router.push("/")}>Save Scenario</Button>
          </div>
        </Form>
      </Card>
    </div>
  );
}
