"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useApi } from "@/hooks/useApi";
import { Button, Card, Form, Input, InputNumber, Typography, message, Space } from "antd";
import { PlusOutlined, DeleteOutlined, ArrowLeftOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;
const { TextArea } = Input;

interface CharacterDraft {
  name: string;
  title: string;
  description: string;
}

interface CabinetDraft {
  name: string;
  description: string;
}

export default function CreateScenarioPage() {
  const router = useRouter();
  const apiService = useApi();
  const [form] = Form.useForm();
  const [characters, setCharacters] = useState<CharacterDraft[]>([]);
  const [cabinets, setCabinets] = useState<CabinetDraft[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const addCharacter = () => {
    setCharacters([...characters, { name: "", title: "", description: "" }]);
  };

  const removeCharacter = (idx: number) => {
    setCharacters(characters.filter((_, i) => i !== idx));
  };

  const updateCharacter = (idx: number, field: keyof CharacterDraft, value: string) => {
    const updated = [...characters];
    updated[idx][field] = value;
    setCharacters(updated);
  };

  const addCabinet = () => {
    setCabinets([...cabinets, { name: "", description: "" }]);
  };

  const removeCabinet = (idx: number) => {
    setCabinets(cabinets.filter((_, i) => i !== idx));
  };

  const updateCabinet = (idx: number, field: keyof CabinetDraft, value: string) => {
    const updated = [...cabinets];
    updated[idx][field] = value;
    setCabinets(updated);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);
      await apiService.post("/scenarios", {
        title: values.title,
        description: values.description,
        exchangeRate: values.messageCost || 0,
      });
      message.success("Scenario created!");
      router.push("/scenarios");
    } catch {
      message.error("Failed to create scenario");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: 700, margin: "0 auto", padding: 32 }}>
      <Button icon={<ArrowLeftOutlined />} onClick={() => router.push("/scenarios")} style={{ marginBottom: 16 }}>
        Back
      </Button>
      <Title level={2}>Create New Scenario</Title>
      <Text type="secondary">Define a new scenario with cabinets, characters, and settings</Text>
      <Card style={{ marginTop: 24 }}>
        <Form form={form} layout="vertical">
          <Form.Item label="Scenario Title" name="title" rules={[{ required: true }]}>
            <Input placeholder="Enter scenario title" />
          </Form.Item>
          <Form.Item label="Description" name="description">
            <TextArea rows={3} placeholder="Describe the crisis scenario" />
          </Form.Item>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 24 }}>
            <Title level={4} style={{ margin: 0 }}>Characters</Title>
            <Button icon={<PlusOutlined />} type="primary" onClick={addCharacter}>Add Character</Button>
          </div>
          {characters.length === 0 ? (
            <Text type="secondary" style={{ display: "block", textAlign: "center", padding: 16 }}>
              No characters added yet. Click &quot;Add Character&quot; to get started.
            </Text>
          ) : (
            <Space direction="vertical" style={{ width: "100%", marginTop: 12 }}>
              {characters.map((c, i) => (
                <Card key={i} size="small" extra={<Button icon={<DeleteOutlined />} danger size="small" onClick={() => removeCharacter(i)} />}>
                  <Input placeholder="Name" value={c.name} onChange={(e) => updateCharacter(i, "name", e.target.value)} style={{ marginBottom: 8 }} />
                  <Input placeholder="Title" value={c.title} onChange={(e) => updateCharacter(i, "title", e.target.value)} style={{ marginBottom: 8 }} />
                  <TextArea placeholder="Description" value={c.description} onChange={(e) => updateCharacter(i, "description", e.target.value)} rows={2} />
                </Card>
              ))}
            </Space>
          )}

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 24 }}>
            <Title level={4} style={{ margin: 0 }}>Cabinets</Title>
            <Button icon={<PlusOutlined />} type="primary" onClick={addCabinet}>Add Cabinet</Button>
          </div>
          {cabinets.length === 0 ? (
            <Text type="secondary" style={{ display: "block", textAlign: "center", padding: 16 }}>
              No cabinets added yet. Click &quot;Add Cabinet&quot; to get started.
            </Text>
          ) : (
            <Space direction="vertical" style={{ width: "100%", marginTop: 12 }}>
              {cabinets.map((c, i) => (
                <Card key={i} size="small" extra={<Button icon={<DeleteOutlined />} danger size="small" onClick={() => removeCabinet(i)} />}>
                  <Input placeholder="Cabinet Name" value={c.name} onChange={(e) => updateCabinet(i, "name", e.target.value)} style={{ marginBottom: 8 }} />
                  <TextArea placeholder="Description" value={c.description} onChange={(e) => updateCabinet(i, "description", e.target.value)} rows={2} />
                </Card>
              ))}
            </Space>
          )}

          <Form.Item label="Message Cost" name="messageCost" style={{ marginTop: 24 }}>
            <InputNumber min={0} style={{ width: "100%" }} placeholder="Cost per message in this scenario" addonAfter="credits" />
          </Form.Item>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 24 }}>
            <Button onClick={() => router.push("/scenarios")}>Cancel</Button>
            <Button type="primary" onClick={handleSubmit} loading={submitting}>Save Scenario</Button>
          </div>
        </Form>
      </Card>
    </div>
  );
}
