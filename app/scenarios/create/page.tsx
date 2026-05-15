"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Button,
  ConfigProvider,
  Form,
  Input,
  InputNumber,
  message,
  Modal,
  Space,
  theme,
  Upload,
} from "antd";
import type { UploadFile } from "antd/es/upload/interface";
import {
  DeleteOutlined,
  EditOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import { useAuth } from "@/hooks/useAuth";
import { useApi } from "@/hooks/useApi";
import { ScenarioService } from "@/api/scenarioService";
import { CharacterService } from "@/api/characterService";
import type { ScenarioPostDTO } from "@/types/scenario";
import styles from "@/styles/createScenario.module.css";
import { DirectorService } from "@/api/directorService";
import { usePlayerRole } from "@/hooks/usePlayerRole";
import { portraitSrc } from "@/utils/portrait";
import { UserAvatarMenu } from "@/components/UserAvatarMenu";
import { CharacterPostDTO } from "@/types/character";
import { DirectorPostDTO } from "@/types/director";

interface ScenarioFormValues {
  title: string;
  description: string;
  exchangeRate: number;
  startingMessageCount: number;
}

interface CharacterFormValues {
  name: string;
  title: string;
  description: string;
  secret: string;
  portrait: string | null;
}

interface DraftCharacter {
  key: number;
  name: string;
  title: string;
  description: string;
  secret: string;
  portrait: string | null;
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.readAsDataURL(file);

    reader.onload = () => {
      resolve(reader.result as string);
    };

    reader.onerror = (error) => {
      reject(error);
    };
  });
}

export default function CreateScenarioPage() {
  const { token, userId, isAuthenticated, authReady } = useAuth();
  const router = useRouter();
  const api = useApi();
  const scenarioService = useMemo(() => new ScenarioService(api), [api]);
  const characterService = useMemo(() => new CharacterService(api), [api]);
  const directorService = useMemo(() => new DirectorService(api), [api]);
  const { setPlayerRole } = usePlayerRole(userId);

  const [form] = Form.useForm<ScenarioFormValues>();
  const [characterForm] = Form.useForm<CharacterFormValues>();
  // Driving the preview image off a local state (instead of Form.useWatch)
  // is the only reliable approach across AntD versions — useWatch sometimes
  // doesn't re-fire after setFieldValue/setFieldsValue, leaving the preview
  // stale or rendering a broken-image icon when the form holds an empty
  // string.
  const [portraitPreview, setPortraitPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [characters, setCharacters] = useState<DraftCharacter[]>([]);
  const [editingCharacter, setEditingCharacter] = useState<
    DraftCharacter | null
  >(null);
  const [nextKey, setNextKey] = useState(0);
  const [uploadFileList, setUploadFileList] = useState<UploadFile[]>([]);

  useEffect(() => {
    if (authReady && !isAuthenticated) {
      router.replace("/login");
    }
  }, [authReady, isAuthenticated, router]);

  const openModal = (character?: DraftCharacter) => {
    if (character) {
      setEditingCharacter(character);
      characterForm.setFieldsValue(character);
      setPortraitPreview(character.portrait ?? null);

      if (character.portrait) {
        setUploadFileList([
          {
            uid: "-1",
            name: "portrait",
            status: "done",
            url: character.portrait,
          },
        ]);
      } else {
        setUploadFileList([]);
      }
    } else {
      setEditingCharacter(null);
      characterForm.resetFields();
      setPortraitPreview(null);
      setUploadFileList([]);
    }

    setModalOpen(true);
  };

  const handleAddCharacter = (values: CharacterFormValues) => {
    if (editingCharacter) {
      setCharacters((prev) =>
        prev.map((c) =>
          c.key === editingCharacter.key
            ? { ...c, ...values, portrait: values.portrait ?? null }
            : c
        )
      );
    } else {
      setCharacters((prev) => [
        ...prev,
        {
          key: nextKey,
          ...values,
          portrait: values.portrait ?? null,
        },
      ]);
      setNextKey((k) => k + 1);
    }
    characterForm.resetFields();
    setModalOpen(false);
    setEditingCharacter(null);
  };

  const handleRemoveCharacter = (key: number) => {
    setCharacters((prev) => prev.filter((c) => c.key !== key));
  };

  const handleSubmit = async (values: ScenarioFormValues) => {
    setSubmitting(true);
    try {
      const directorData: DirectorPostDTO = {
        id: userId,
      };
      const createdDirector = await directorService.becomeDirector(
        directorData,
        token,
      );

      const directorAuth = `Director ${createdDirector.token}`;

      const scenarioData: ScenarioPostDTO = {
        title: values.title,
        description: values.description ?? null,
        exchangeRate: values.exchangeRate,
        startingMessageCount: values.startingMessageCount,
        director: createdDirector.id,
      };

      const createdScenario = await scenarioService.createScenario(
        scenarioData,
        directorAuth,
      );
      if (createdScenario) {
        // Persist the director credentials under the same key the director
        // dashboard reads via `useDirector(scenarioId)`. Writing directly
        // (not through useDirector(userId)) avoids the previous keying
        // mismatch where the dashboard could never find the token.
        try {
          globalThis.localStorage.setItem(
            `scenario_${createdScenario.id}_directorToken`,
            JSON.stringify(createdDirector.token),
          );
          globalThis.localStorage.setItem(
            `scenario_${createdScenario.id}_directorId`,
            JSON.stringify(createdDirector.id),
          );
        } catch {
          // localStorage may be unavailable (SSR / privacy mode)
        }
      }
      setPlayerRole("director");

      if (createdScenario && characters.length > 0) {
        // Loop through drafted characters and create them in the backend
        for (const char of characters) {
          const characterData: CharacterPostDTO = {
            name: char.name,
            title: char.title,
            description: char.description,
            portrait: char.portrait,
            secret: char.secret,
            scenarioId: createdScenario.id,
          };
          await characterService.createCharacter(
            characterData,
            directorAuth,
          );
        }
      }

      router.push(`/scenarios/${createdScenario.id}`);
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
            <span className={styles.navTitle}>Crisis Manager</span>
          </div>
          <UserAvatarMenu avatarClassName={styles.avatar} />
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
                  rules={[{
                    required: true,
                    message: "Please enter a scenario title",
                  }]}
                >
                  <Input placeholder="Enter scenario title" />
                </Form.Item>

                <Form.Item name="description" label="Description">
                  <Input.TextArea
                    rows={4}
                    placeholder="Describe the scenario"
                  />
                </Form.Item>

                {/* Characters */}
                <div className={styles.section}>
                  <div className={styles.sectionHeader}>
                    <h3 className={styles.sectionTitle}>
                      Characters
                      {characters.length > 0 && (
                        <span className={styles.sectionCount}>
                          {characters.length}
                        </span>
                      )}
                    </h3>
                    <Button type="primary" onClick={() => openModal()}>
                      Add Character
                    </Button>
                  </div>

                  {characters.length === 0
                    ? (
                      <p className={styles.sectionEmpty}>
                        {`No characters added yet. Click "Add Character" to get started.`}
                      </p>
                    )
                    : (
                      <div className={styles.characterList}>
                        {characters.map((c) => (
                          <div key={c.key} className={styles.characterRow}>
                            <div className={styles.characterAvatar}>
                              {portraitSrc(c.portrait)
                                ? (
                                  <img
                                    src={portraitSrc(c.portrait)!}
                                    alt={c.name}
                                    style={{
                                      width: "100%",
                                      height: "100%",
                                      objectFit: "cover",
                                      borderRadius: "50%",
                                    }}
                                  />
                                )
                                : (
                                  c.name.slice(0, 2).toUpperCase()
                                )}
                            </div>
                            <div className={styles.characterInfo}>
                              <span className={styles.characterName}>
                                {c.name}
                              </span>
                              {c.title && (
                                <span className={styles.characterMeta}>
                                  {c.title}
                                </span>
                              )}
                            </div>
                            <Button
                              type="text"
                              icon={<EditOutlined />}
                              onClick={() =>
                                openModal(c)}
                              aria-label={`Edit ${c.name}`}
                            />

                            <Button
                              type="text"
                              danger
                              icon={<DeleteOutlined />}
                              onClick={() =>
                                handleRemoveCharacter(c.key)}
                              aria-label={`Remove ${c.name}`}
                            />
                          </div>
                        ))}
                      </div>
                    )}
                </div>

                <Form.Item
                  name="exchangeRate"
                  label="Message Cost"
                  rules={[{
                    required: true,
                    message: "Please enter the message cost",
                  }]}
                >
                  <Space.Compact style={{ width: "100%" }}>
                    <InputNumber min={0} style={{ flex: 1 }} placeholder="0" />
                    <Input value="likes" disabled style={{ width: 72 }} />
                  </Space.Compact>
                </Form.Item>
                <p className={styles.fieldHint}>
                  This is the number of likes a player must receive on their
                  mastodon pronouncements to send one message.
                </p>

                <Form.Item
                  name="startingMessageCount"
                  label="Starting Messages"
                  rules={[{
                    required: true,
                    message: "Please enter the starting message count",
                  }]}
                >
                  <InputNumber
                    min={0}
                    style={{ width: "100%" }}
                    placeholder="15"
                  />
                </Form.Item>
                <p className={styles.fieldHint}>
                  This is the number of messages each player starts with
                </p>

                <div className={styles.formFooter}>
                  <Button onClick={() => router.push("/scenarios")}>
                    Cancel
                  </Button>
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
        title={editingCharacter ? "Edit Character" : "Add Character"}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={null}
      >
        <Form
          form={characterForm}
          layout="vertical"
          onFinish={handleAddCharacter}
          style={{ marginTop: 16 }}
        >
          {portraitPreview && (
            <img
              src={portraitPreview}
              alt="Portrait preview"
              style={{
                width: 80,
                height: 80,
                borderRadius: "50%",
                objectFit: "cover",
                marginTop: 8,
              }}
            />
          )}
          <Form.Item name="portrait" hidden>
            <Input />
          </Form.Item>

          <Form.Item label="Portrait">
            <Upload
              fileList={uploadFileList}
              maxCount={1}
              accept="image/*"
              beforeUpload={async (file) => {
                if (file.size > 2 * 1024 * 1024) {
                  message.error("Image must be smaller than 2MB");
                  return Upload.LIST_IGNORE;
                }

                const base64 = await fileToBase64(file as File);

                characterForm.setFieldValue("portrait", base64);
                setPortraitPreview(base64);

                setUploadFileList([
                  {
                    uid: file.uid,
                    name: file.name,
                    status: "done",
                    url: base64,
                  },
                ]);

                return false;
              }}
              onRemove={() => {
                characterForm.setFieldValue("portrait", null);
                setPortraitPreview(null);
                setUploadFileList([]);
              }}
              showUploadList={{ showPreviewIcon: false }}
            >
              <Button icon={<UploadOutlined />}>
                Upload Portrait
              </Button>
            </Upload>
          </Form.Item>

          <Form.Item
            name="name"
            label="Name"
            rules={[{
              required: true,
              message: "Please enter the character's name",
            }]}
          >
            <Input placeholder="e.g. President Johnson" />
          </Form.Item>

          <Form.Item
            name="title"
            label="Title"
            rules={[{
              required: true,
              message: "Please enter the character's title",
            }]}
          >
            <Input placeholder="e.g. Head of State" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
            rules={[{
              required: true,
              message: "Please enter the character's description",
            }]}
          >
            <Input.TextArea
              rows={3}
              placeholder="Public-facing character description"
            />
          </Form.Item>

          <Form.Item
            name="secret"
            label="Secret"
            rules={[{
              required: true,
              message: "Please enter the character's secret",
            }]}
          >
            <Input.TextArea
              rows={3}
              placeholder="Hidden information only this player can see"
            />
          </Form.Item>

          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: 8,
              paddingTop: 8,
            }}
          >
            <Button onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="primary" htmlType="submit">
              {editingCharacter ? "Save" : "Add"}
            </Button>
          </div>
        </Form>
      </Modal>
    </ConfigProvider>
  );
}
