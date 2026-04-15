"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Avatar, Button, ConfigProvider, Form, Input, InputNumber, theme } from "antd";
import { UserOutlined } from "@ant-design/icons";
import { useAuth } from "@/hooks/useAuth";
import { useApi } from "@/hooks/useApi";
import { ScenarioService } from "@/api/scenarioService";
import { useDirectedScenarios } from "@/hooks/useDirectedScenarios";
import type { ScenarioPostDTO } from "@/types/scenario";
import styles from "@/styles/createScenario.module.css";

interface FormValues {
  title: string;
  description: string;
  exchangeRate: number;
}

export default function CreateScenarioPage() {
  const { token, isAuthenticated } = useAuth();
  const router = useRouter();
  const api = useApi();
  const scenarioService = useMemo(() => new ScenarioService(api), [api]);
  const { addDirectedScenario } = useDirectedScenarios();
  const [form] = Form.useForm<FormValues>();
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) return null;

  const handleSubmit = async (values: FormValues) => {
    const data: ScenarioPostDTO = {
      title: values.title,
      description: values.description ?? null,
      exchangeRate: values.exchangeRate ?? 0,
    };
    setSubmitting(true);
    try {
      const created = await scenarioService.createScenario(data, token);
      addDirectedScenario(created.id);
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
          Button: {
            colorPrimary: "#4f46e5",
            algorithm: true,
          },
          Form: {
            labelColor: "#111827",
            labelFontSize: 14,
          },
          InputNumber: {
            algorithm: true,
          },
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
                Define a new scenario with cabinets, characters, and settings
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

                <div className={styles.section}>
                  <div className={styles.sectionHeader}>
                    <h3 className={styles.sectionTitle}>Characters</h3>
                    <Button
                      type="primary"
                      onClick={() => alert("Add Character (not yet implemented)")}
                    >
                      Add Character
                    </Button>
                  </div>
                  <p className={styles.sectionEmpty}>
                    {`No characters added yet. Click "Add Character" to get started.`}
                  </p>
                </div>

                <div className={styles.section}>
                  <div className={styles.sectionHeader}>
                    <h3 className={styles.sectionTitle}>Cabinets</h3>
                    <Button
                      type="primary"
                      onClick={() => alert("Add Cabinet (not yet implemented)")}
                    >
                      Add Cabinet
                    </Button>
                  </div>
                  <p className={styles.sectionEmpty}>
                    {`No cabinets added yet. Click "Add Cabinet" to get started.`}
                  </p>
                </div>

                <Form.Item
                  name="exchangeRate"
                  label="Message Cost"
                  initialValue={0}
                >
                  <InputNumber
                    min={0}
                    addonAfter="credits"
                    style={{ width: "100%" }}
                  />
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
    </ConfigProvider>
  );
}
