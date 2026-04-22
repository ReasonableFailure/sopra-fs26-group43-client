"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Avatar, Button, ConfigProvider, Form, Input, InputNumber,
  Modal, Space, theme,
} from "antd";
import { DeleteOutlined, UserOutlined } from "@ant-design/icons";
import { useAuth } from "@/hooks/useAuth";
import { useApi } from "@/hooks/useApi";
import { ScenarioService } from "@/api/scenarioService";
import { CharacterService } from "@/api/characterService";
import { useDirectedScenarios } from "@/hooks/useDirectedScenarios";
import type { ScenarioPostDTO } from "@/types/scenario";
import styles from "@/styles/createScenario.module.css";

interface ScenarioFormValues {
  title: string;
  description: string;
  exchangeRate: number;
}

interface CharacterFormValues {
  name: string;
  title: string;
  description: string;
  secret: string;
}

interface DraftCharacter {
  key: number;
  name: string;
  title: string;
  description: string;
  secret: string;
}

export default function CreateScenarioPage() {
  const { token, userId, isAuthenticated, authReady } = useAuth();
  const router = useRouter();
  const api = useApi();
  const scenarioService = useMemo(() => new ScenarioService(api), [api]);
  const characterService = useMemo(() => new CharacterService(api), [api]);
  const { addDirectedScenario } = useDirectedScenarios(userId);

  const [form] = Form.useForm<ScenarioFormValues>();
  const [characterForm] = Form.useForm<CharacterFormValues>();
  const [submitting, setSubmitting] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [characters, setCharacters] = useState<DraftCharacter[]>([]);
  const [nextKey, setNextKey] = useState(0);

  useEffect(() => {
    if (authReady && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated, router]);

  const openModal = () => {
    characterForm.resetFields();
    setModalOpen(true);
  };

  const handleAddCharacter = (values: CharacterFormValues) => {
    setCharacters((prev) => [
      ...prev,
      {
        key: nextKey,
        name: values.name,
        title: values.title ?? "",
        description: values.description ?? "",
        secret: values.secret ?? "",
      },
    ]);
    setNextKey((k) => k + 1);
    setModalOpen(false);
  };

  const handleRemoveCharacter = (key: number) => {
    setCharacters((prev) => prev.filter((c) => c.key !== key));
  };

  const handleSubmit = async (values: ScenarioFormValues) => {
    const data: ScenarioPostDTO = {
      title: values.title,
      description: values.description ?? null,
      exchangeRate: values.exchangeRate ?? 0,
    };
    setSubmitting(true);
    try {
      const created = await scenarioService.createScenario(data, token);
      addDirectedScenario(created.id);
      if (created.directorToken && characters.length > 0) {
        await Promise.all(
          characters.map((c) =>
            characterService.createCharacter(
              {
                name: c.name,
                title: c.title || null,
                description: c.description || null,
                portrait: null,
                secret: c.secret || null,
                scenarioId: created.id,
              },
              created.directorToken!,
            ),
          ),
        );
      }
      router.push(`/scenarios/${created.id}`);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to create scenario");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ConfigProvider
      theme={{
        algorithm: theme.defaultAlgorithm,
        token: {
          colorBgContainer: "#ffffff",
          colorText: "#111827",
          colorTextSecondary: "#6b7280",
          colorBorder: "#e5e7eb",
          colorPrimary: "#4f46e5",
          borderRadius: 8,
          fontSize: 14,
        },
        components: {
          Button: { colorPrimary: "#4f46e5", algorithm: true },
          Form: { labelColor: "#111827", labelFontSize: 14 },
          InputNumber: { algorithm: true },
        },
      }}
    >
      <div className={styles.pageRoot}>
        <nav className={styles.navbar}>
          <div className={styles.navLeft}>
            <div className={styles.logoMark} aria-hidden="true" />
            <span className={styles.navTitle}>Scenario Manager</span>
          </div>
          <div>
            <Avatar icon={<UserOutlined />} className={styles.avatar} />
          </div>
        </nav>

        <main className={styles.pageBody}>
          <div className={styles.contentWrapper}>
            <div className={styles.pageHeader}>
              <h1 className={styles.heading}>Create New Scenario</h1>
              <p className={styles.subheading}>
                Define a new scenario with characters and settings
              </p>
            </div>

            <div className={styles.formCard}>
              <Form form={form} layout="vertical" onFinish={handleSubmit}>
                <Form.Item
                  name="title"
                  label="Scenario Title"
                  rules={[{ required: true, message: "Please enter a scenario title" }]}
                >
                  <Input placeholder="Enter scenario title" />
                </Form.Item>

                <Form.Item name="description" label="Description">
                  <Input.TextArea rows={4} placeholder="Describe the scenario" />
                </Form.Item>

                {/* Characters */}
                <div className={styles.section}>
                  <div className={styles.sectionHeader}>
                    <h3 className={styles.sectionTitle}>
                      Characters
                      {characters.length > 0 && (
                        <span className={styles.sectionCount}>{characters.length}</span>
                      )}
                    </h3>
                    <Button type="primary" onClick={openModal}>
                      Add Character
                    </Button>
                  </div>

                  {characters.length === 0 ? (
                    <p className={styles.sectionEmpty}>
                      {`No characters added yet. Click "Add Character" to get started.`}
                    </p>
                  ) : (
                    <div className={styles.characterList}>
                      {characters.map((c) => (
                        <div key={c.key} className={styles.characterRow}>
                          <div className={styles.characterAvatar}>
                            {c.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div className={styles.characterInfo}>
                            <span className={styles.characterName}>{c.name}</span>
                            {c.title && (
                              <span className={styles.characterMeta}>{c.title}</span>
                            )}
                          </div>
                          <Button
                            type="text"
                            danger
                            icon={<DeleteOutlined />}
                            onClick={() => handleRemoveCharacter(c.key)}
                            aria-label={`Remove ${c.name}`}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <Form.Item name="exchangeRate" label="Message Cost" initialValue={0}>
                  <Space.Compact style={{ width: "100%" }}>
                    <InputNumber min={0} style={{ flex: 1 }} />
                    <Input value="credits" disabled style={{ width: 80 }} />
                  </Space.Compact>
                </Form.Item>
                <p className={styles.fieldHint}>Cost per message in this scenario</p>

                <div className={styles.formFooter}>
                  <Button onClick={() => router.push("/scenarios")}>Cancel</Button>
                  <Button type="primary" htmlType="submit" loading={submitting}>
                    Save Scenario
                  </Button>
                </div>
              </Form>
            </div>
          </div>
        </main>
      </div>

      {/* Add Character Modal */}
      <Modal
        title="Add Character"
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={null}
        destroyOnHidden
      >
        <Form
          form={characterForm}
          layout="vertical"
          onFinish={handleAddCharacter}
          style={{ marginTop: 16 }}
        >
          <Form.Item
            name="name"
            label="Name"
            rules={[{ required: true, message: "Please enter the character's name" }]}
          >
            <Input placeholder="e.g. President Johnson" />
          </Form.Item>

          <Form.Item name="title" label="Title"
            rules={[{ required: true, message: "Please enter the character's title" }]}>
            <Input placeholder="e.g. Head of State" />
          </Form.Item>

          <Form.Item name="description" label="Description"
            rules={[{ required: true, message: "Please enter the character's description" }]}>
            <Input.TextArea rows={3} placeholder="Public-facing character description" />
          </Form.Item>

          <Form.Item name="secret" label="Secret"
            rules={[{ required: true, message: "Please enter the character's secret" }]}>
            <Input.TextArea rows={3} placeholder="Hidden information only this player can see" />
          </Form.Item>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, paddingTop: 8 }}>
            <Button onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="primary" htmlType="submit">Add</Button>
          </div>
        </Form>
      </Modal>
    </ConfigProvider>
  );
}
