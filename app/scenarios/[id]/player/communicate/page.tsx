"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
  Avatar,
  Button,
  ConfigProvider,
  Input,
  message,
  Select,
  Spin,
  theme,
} from "antd";
import { useAuth } from "@/hooks/useAuth";
import { useApi } from "@/hooks/useApi";
import { usePolling } from "@/hooks/usePolling";
import type { Scenario } from "@/types/scenario";
import { useSelectedCharacter } from "@/hooks/useSelectedCharacter";
import { CharacterService } from "@/api/characterService";
import { DirectiveService } from "@/api/directiveService";
import { DirectiveCategory } from "@/types/directive";
import { MessageService } from "@/api/messageService";
import { ScenarioService } from "@/api/scenarioService";
import { NewsService } from "@/api/newsService";
import type { Character } from "@/types/character";
import styles from "@/styles/communicationForm.module.css";

type CommType = "direct_message" | "directive" | "pronouncement";

function initials(name: string | null): string {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function CommunicationFormPage() {
  const { token, isAuthenticated, authReady } = useAuth();
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const scenarioId = Number(params.id);
  const preselectedRecipient = searchParams.get("recipient")
    ? Number(searchParams.get("recipient"))
    : null;
  const preselectedType = (searchParams.get("type") as CommType | null) ?? null;

  const api = useApi();
  const characterService = useMemo(() => new CharacterService(api), [api]);
  const directiveService = useMemo(() => new DirectiveService(api), [api]);
  const messageService = useMemo(() => new MessageService(api), [api]);
  const newsService = useMemo(() => new NewsService(api), [api]);
  const scenarioService = useMemo(() => new ScenarioService(api), [api]);

  const { characterId } = useSelectedCharacter(scenarioId);

  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [commType, setCommType] = useState<CommType>(
    preselectedType ?? "direct_message",
  );
  const [recipientId, setRecipientId] = useState<number | null>(
    preselectedRecipient,
  );
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState<DirectiveCategory | null>(null);
  const MAX_POST_LENGTH = 500;

  const enabled = isAuthenticated && !!scenarioId;

  const { data: liveScenario } = usePolling<Scenario>(
    () => scenarioService.getScenarioById(scenarioId, token),
    5000,
    enabled,
  );

  const { data: liveCharacter } = usePolling<Character>(
    () =>
      characterId
        ? characterService.getCharacterById(characterId, token)
        : Promise.reject(),
    5000,
    enabled && !!characterId,
  );

  useEffect(() => {
    if (authReady && !isAuthenticated) router.replace("/login");
  }, [authReady, isAuthenticated, router]);

  useEffect(() => {
    if (!isAuthenticated || !scenarioId) return;
    let cancelled = false;
    setLoading(true);
    characterService
      .getCharactersByScenario(scenarioId, token)
      .then((chars) => {
        if (!cancelled) setCharacters(chars);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, scenarioId, token, characterService]);

  const [messageApi, contextHolder] = message.useMessage();

  if (!authReady || !isAuthenticated) return null;

  const selectedCharacter = characters.find((c) => c.id === characterId) ??
    null;
  const isGameActive = liveScenario?.status === "UNFROZEN";
  const isAlive = (liveCharacter?.alive ?? selectedCharacter?.alive) !== false;

  const authorName = selectedCharacter?.name ?? "Unknown";

  const totalLength = commType === "pronouncement"
    ? `${title}: ${content}\n-${authorName}`.length
    : `${title}: ${content}`.length;

  const overLimit = totalLength > MAX_POST_LENGTH;

  const commTypeOptions = [
    { value: "direct_message", label: "Direct Message" },
    { value: "directive", label: "Directive" },
    { value: "pronouncement", label: "Pronouncement" },
  ];

  const dmRecipientOptions = characters
    .filter((c) => c.id !== characterId)
    .map((c) => ({ value: c.id!, label: c.name ?? `Character ${c.id}` }));

  const handleSubmit = async () => {
    if (!characterId) {
      messageApi.error(
        "No character selected. Please go back to the lobby and select a character first.",
      );
      return;
    }
    if (!title.trim() || !content.trim()) {
      messageApi.error("Title and message content are required.");
      return;
    }
    if (commType === "direct_message" && !recipientId) {
      messageApi.error("Please select a recipient.");
      return;
    }

    if (
      (commType === "direct_message" &&
        (selectedCharacter?.messageCount ?? 0) <= 0)
    ) {
      messageApi.error("No Messages Available");
      return;
    }

    if (commType === "directive" && !category) {
      messageApi.error("Please select a directive category.");
      return;
    }

    setSubmitting(true);
    try {
      if (commType === "direct_message") {
        await messageService.createMessage(
          {
            title,
            body: content,
            creatorId: characterId,
            recipientId: recipientId!,
            scenarioId,
          },
          token,
        );
        router.push(
          `/scenarios/${scenarioId}/player/characters/${recipientId}`,
        );
      } else if (commType === "directive") {
        await directiveService.createDirective(
          {
            title,
            body: content,
            creatorId: characterId,
            scenarioId,
            category: category!,
          },
          token,
        );
        router.push(`/scenarios/${scenarioId}/player`);
      } else {
        if (overLimit) {
          messageApi.error("Pronouncement Must not Exceed 500 Characters");
          return;
        }
        await newsService.createPronouncement(
          {
            title,
            body: content,
            scenarioId,
            authorId: characterId,
          },
          token,
        );
        router.push(`/scenarios/${scenarioId}/player`);
      }
    } catch (err) {
      const detail = err instanceof Error
        ? err.message
        : "Submission failed. Please try again.";
      messageApi.error(detail);
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
        },
      }}
    >
      <div className={styles.pageRoot}>
        {contextHolder}
        {/* Navbar */}
        <nav className={styles.navbar}>
          <div className={styles.navLeft}>
            <div className={styles.logoMark} aria-hidden="true" />
            <span className={styles.navTitle}>Scenario Manager</span>
          </div>
          {!isAlive && (
            <div
              style={{ color: "#ef4444", fontWeight: 600, marginBottom: 12 }}
            >
              Your Character has Died.
            </div>
          )}
          <Avatar className={styles.navAvatar}>
            {initials(selectedCharacter?.name ?? null)}
          </Avatar>
        </nav>

        <div className={styles.pageBody}>
          <Spin spinning={loading}>
            <div className={styles.card}>
              {/* Card header */}
              <div className={styles.cardHeader}>
                <div>
                  <h1 className={styles.cardTitle}>Communication Form</h1>
                  <p className={styles.cardSubtitle}>
                    Create and submit your directive, pronouncement, or message
                  </p>
                </div>
                <Button
                  onClick={() => router.push(`/scenarios/${scenarioId}/player`)}
                >
                  Back to Dashboard
                </Button>
              </div>

              {/* Form fields */}
              <div className={styles.formBody}>
                <div className={styles.fieldGroup}>
                  <label className={styles.label}>Communication Type</label>
                  <Select
                    options={commTypeOptions}
                    value={commType}
                    onChange={(v) => {
                      setCommType(v as CommType);
                      setRecipientId(null);
                      setCategory(null);
                    }}
                    style={{ width: "100%" }}
                  />
                </div>

                <div className={styles.fieldGroup}>
                  <label className={styles.label}>Select Recipient</label>
                  {commType === "direct_message"
                    ? (
                      <Select
                        options={dmRecipientOptions}
                        value={recipientId ?? undefined}
                        onChange={(v) => setRecipientId(v)}
                        placeholder="Select recipient"
                        style={{ width: "100%" }}
                      />
                    )
                    : (
                      <Select
                        value={commType === "directive" ? "backroomer" : "all"}
                        disabled
                        options={[
                          commType === "directive"
                            ? { value: "backroomer", label: "Backroom" }
                            : { value: "all", label: "All" },
                        ]}
                        style={{ width: "100%" }}
                      />
                    )}
                </div>

                {commType === "directive" && (
                  <div className={styles.fieldGroup}>
                    <label className={styles.label}>Directive Category</label>
                    <Select
                      value={category ?? undefined}
                      onChange={(v) => setCategory(v)}
                      placeholder="Select category"
                      style={{ width: "100%" }}
                      options={[
                        {
                          value: DirectiveCategory.MILITARY,
                          label: "Military",
                        },
                        {
                          value: DirectiveCategory.POLITICAL,
                          label: "Political",
                        },
                        { value: DirectiveCategory.PUBLIC, label: "Public" },
                        {
                          value: DirectiveCategory.INTELLIGENCE,
                          label: "Intelligence",
                        },
                        { value: DirectiveCategory.OTHER, label: "Other" },
                      ]}
                    />
                  </div>
                )}

                <div className={styles.fieldGroup}>
                  <label className={styles.label}>Title</label>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter title"
                  />
                </div>

                <div className={styles.fieldGroup}>
                  <label className={styles.label}>Message Content</label>
                  <Input.TextArea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Write your message here..."
                    rows={10}
                    style={{ resize: "none" }}
                  />
                </div>
              </div>

              {/* Footer */}
              <div className={styles.cardFooter}>
                {commType === "pronouncement" && (
                  <div
                    style={{
                      marginTop: 6,
                      textAlign: "right",
                      fontSize: 12,
                      color: overLimit ? "#dc2626" : "#6b7280",
                    }}
                  >
                    {totalLength} / {MAX_POST_LENGTH}
                  </div>
                )}
                <Button
                  onClick={() => router.push(`/scenarios/${scenarioId}/player`)}
                >
                  Cancel
                </Button>
                <Button
                  type="primary"
                  loading={submitting}
                  onClick={handleSubmit}
                  disabled={submitting ||
                    !isGameActive ||
                    !isAlive ||
                    (commType === "direct_message" &&
                      (selectedCharacter?.messageCount ?? 0) <= 0) ||
                    (commType === "pronouncement" && overLimit)}
                >
                  Submit
                </Button>
              </div>
            </div>
          </Spin>
        </div>
      </div>
    </ConfigProvider>
  );
}
