"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Avatar,
  Button,
  ConfigProvider,
  Form,
  Input,
  Modal,
  Spin,
  message,
  theme,
} from "antd";
import { InfoCircleOutlined, LockOutlined, UserOutlined } from "@ant-design/icons";
import { useAuth } from "@/hooks/useAuth";
import { useApi } from "@/hooks/useApi";
import { CharacterService } from "@/api/characterService";
import { ScenarioService } from "@/api/scenarioService";
import { useSelectedCharacter } from "@/hooks/useSelectedCharacter";
import type { Character } from "@/types/character";
import type { Scenario } from "@/types/scenario";
import type { ApplicationError } from "@/types/error";
import styles from "@/styles/lobby.module.css";

interface CharacterCardProps {
  character: Character;
  onSelect: () => void;
}

function CharacterCard({ character, onSelect }: CharacterCardProps) {
  return (
    <div className={styles.characterCard} onClick={onSelect} role="button" tabIndex={0}>
      <h3 className={styles.characterName}>{character.name}</h3>
      <p className={styles.characterDesc}>
        {character.description ?? "No description provided."}
      </p>
      <div className={styles.selectHint}>
        <InfoCircleOutlined className={styles.hintIcon} />
        <span className={styles.hintText}>Hover to select</span>
      </div>
    </div>
  );
}

export default function GameLobbyPage() {
  const { token, isAuthenticated, authReady } = useAuth();
  const router = useRouter();
  const params = useParams();
  const scenarioId = Number(params.id);
  const api = useApi();

  const characterService = useMemo(() => new CharacterService(api), [api]);
  const scenarioService = useMemo(() => new ScenarioService(api), [api]);
  const { setCharacterId } = useSelectedCharacter(scenarioId);

  const [characters, setCharacters] = useState<Character[]>([]);
  const [scenario, setScenario] = useState<Scenario | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Become-Backroomer modal state
  const [isCodeModalOpen, setIsCodeModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [codeForm] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    if (authReady && !isAuthenticated) {
      router.replace("/login");
    }
  }, [authReady, isAuthenticated, router]);

  useEffect(() => {
    if (!token || !scenarioId) return;

    let cancelled = false;

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [chars, sc] = await Promise.all([
          characterService.getCharactersByScenario(scenarioId, token),
          scenarioService.getScenarioById(scenarioId, token),
        ]);
        if (!cancelled) {
          setCharacters(chars);
          setScenario(sc);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load lobby");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchData();
    return () => {
      cancelled = true;
    };
  }, [token, scenarioId, characterService, scenarioService]);

  if (!authReady || !isAuthenticated) return null;

  const maxBackroomers = scenario?.maxBackroomers ?? 0;
  const backroomerCount = scenario?.backroomerCount ?? 0;
  const hasBackroomerCode = scenario?.hasBackroomerCode ?? false;
  const backroomFull = backroomerCount >= maxBackroomers;
  // Disable the button when the director clearly has not opened the door yet.
  const joinDisabled = !scenario || backroomFull || !hasBackroomerCode;

  const handleSelectCharacter = (character: Character) => {
    if (character.id == null) return;
    setCharacterId(character.id);
    router.push(`/scenarios/${scenarioId}/player`);
  };

  const openBecomeBackroomer = () => {
    if (!hasBackroomerCode) {
      messageApi.error("The director has not set a join code for this scenario yet.");
      return;
    }
    if (backroomFull) {
      messageApi.error(
        `This scenario is full (${backroomerCount}/${maxBackroomers}). No more backroomers can join.`,
      );
      return;
    }
    codeForm.resetFields();
    setIsCodeModalOpen(true);
  };

  const handleSubmitCode = async () => {
    let values: { backroomerCode: string };
    try {
      values = await codeForm.validateFields();
    } catch {
      return; // antd validation errors already shown
    }
    setSubmitting(true);
    try {
      const result = await scenarioService.joinBackroom(
        scenarioId,
        values.backroomerCode,
        token,
      );
      // Persist the freshly issued backroomer auth token so /backroom pages
      // can use it. The token is already prefixed with "Backroomer ".
      try {
        globalThis.localStorage?.setItem(
          `backroomerAuth_${scenarioId}`,
          result.authToken,
        );
      } catch {
        // best-effort; the redirect still works without storage
      }
      setIsCodeModalOpen(false);
      router.push(`/scenarios/${scenarioId}/backroom`);
    } catch (err) {
      const e = err as ApplicationError;
      if (e?.status === 403) {
        codeForm.setFields([
          {
            name: "backroomerCode",
            errors: ["Incorrect code. Ask the director for the current join code."],
          },
        ]);
      } else if (e?.status === 409) {
        messageApi.error("This scenario just filled up. Please try again later.");
        setIsCodeModalOpen(false);
      } else {
        messageApi.error(e?.message ?? "Failed to join the backroom");
      }
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
        },
      }}
    >
      {contextHolder}
      <div className={styles.pageRoot}>
        <nav className={styles.navbar}>
          <div className={styles.navLeft}>
            <div className={styles.logoMark} aria-hidden="true" />
            <span className={styles.navTitle}>Game Lobby</span>
          </div>
          <div>
            <Avatar icon={<UserOutlined />} className={styles.avatar} />
          </div>
        </nav>

        <main className={styles.pageBody}>
          <Button
            type="primary"
            className={styles.backroomerButton}
            icon={<LockOutlined />}
            onClick={openBecomeBackroomer}
            disabled={joinDisabled}
            title={
              !hasBackroomerCode
                ? "The director has not set a join code yet"
                : backroomFull
                ? "Backroom is full"
                : "Enter the director's join code to become a backroomer"
            }
          >
            Become Backroomer ({backroomerCount}/{maxBackroomers})
          </Button>

          <h1 className={styles.sectionHeading}>Select Your Character</h1>
          <p className={styles.sectionSubheading}>Choose a character to begin your journey</p>

          {error && <p className={styles.errorText}>{error}</p>}

          <Spin spinning={loading}>
            <div className={styles.characterGrid}>
              {!loading && characters.length === 0 && (
                <p className={styles.emptyText}>No characters available for this scenario.</p>
              )}
              {characters.map((character) => (
                <CharacterCard
                  key={character.id ?? character.name}
                  character={character}
                  onSelect={() => handleSelectCharacter(character)}
                />
              ))}
            </div>
          </Spin>
        </main>

        <Modal
          title="Enter Backroom Join Code"
          open={isCodeModalOpen}
          okText="Join"
          confirmLoading={submitting}
          onOk={handleSubmitCode}
          onCancel={() => setIsCodeModalOpen(false)}
        >
          <p style={{ color: "#6b7280", marginTop: 0 }}>
            The director has set a secret code for this scenario. Enter it
            to be admitted to the backroom.
          </p>
          <Form form={codeForm} layout="vertical">
            <Form.Item
              label={<span style={{ color: "#111827" }}>Join code</span>}
              name="backroomerCode"
              rules={[{ required: true, message: "Please enter the code" }]}
            >
              <Input.Password placeholder="Code from the director" autoFocus />
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </ConfigProvider>
  );
}
