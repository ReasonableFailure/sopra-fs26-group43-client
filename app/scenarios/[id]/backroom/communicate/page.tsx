"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
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
import { CharacterService } from "@/api/characterService";
import { DirectiveService } from "@/api/directiveService";
import { NewsService } from "@/api/newsService";
import type { Character } from "@/types/character";
import type { Directive } from "@/types/directive";
import { CommsStatus } from "@/types/directive";
import styles from "@/styles/communicationForm.module.css";

type CommType = "response" | "news_story";
type Outcome = "approve" | "reject";

export default function BackroomCommunicatePage() {
  const { token, isAuthenticated, authReady } = useAuth();
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const scenarioId = Number(params.id);

  const preselectedType = searchParams.get("type") === "news_story"
    ? "news_story"
    : "response";
  const preselectedDirectiveId = searchParams.get("directiveId")
    ? Number(searchParams.get("directiveId"))
    : null;

  const api = useApi();
  const characterService = useMemo(() => new CharacterService(api), [api]);
  const directiveService = useMemo(() => new DirectiveService(api), [api]);
  const newsService = useMemo(() => new NewsService(api), [api]);

  const [commType, setCommType] = useState<CommType>(preselectedType);
  const [selectedDirectiveId, setSelectedDirectiveId] = useState<number | null>(
    preselectedDirectiveId,
  );
  const [selectedOutcome, setSelectedOutcome] = useState<Outcome | null>(null);
  const [directives, setDirectives] = useState<Directive[]>([]);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [content, setContent] = useState("");
  const [title, setTitle] = useState("");

  const [messageApi, contextHolder] = message.useMessage();
  const MAX_POST_LENGTH = 500;

  useEffect(() => {
    if (authReady && !isAuthenticated) router.replace("/login");
  }, [authReady,isAuthenticated, router]);

  useEffect(() => {
    if (!isAuthenticated || !scenarioId) return;
    let cancelled = false;
    setLoading(true);
    Promise.all([
      directiveService.getDirectivesByScenario(scenarioId, token),
      characterService.getCharactersByScenario(scenarioId, token),
    ])
      .then(([dirs, chars]) => {
        if (!cancelled) {
          setDirectives(dirs);
          setCharacters(chars);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, scenarioId, token, directiveService, characterService]);

  if (!authReady || !isAuthenticated) return null;

  const pendingDirectives = directives.filter((d) =>
    d.status === CommsStatus.PENDING
  );

  const characterName = (id: number | null): string => {
    if (id === null) return "Unknown";
    return characters.find((c) => c.id === id)?.name ?? "Unknown";
  };

  const directiveOptions = pendingDirectives.map((d) => ({
    value: d.id!,
    label: `${characterName(d.creatorId ?? null)} — ${
      d.title ?? d.body ?? "Untitled"
    }`,
  }));

  const selectedDirective =
    directives.find((d) => d.id === selectedDirectiveId) ?? null;

  const handleRespond = async () => {
    if (!selectedDirectiveId) {
      messageApi.error("Please select a directive to respond to.");
      return;
    }
    if (!selectedOutcome) {
      messageApi.error("Please select Approve or Reject.");
      return;
    }
    if (!content.trim()) {
      messageApi.error("Please enter a response message.");
      return;
    }
    setSubmitting(true);
    try {
      await directiveService.updateDirective(
        selectedDirectiveId,
        {
          status: selectedOutcome === "approve"
            ? CommsStatus.ACCEPTED
            : CommsStatus.REJECTED,
          response: content,
        },
        token,
      );
      router.push(`/scenarios/${scenarioId}/backroom`);
    } catch (err) {
      messageApi.error(
        err instanceof Error ? err.message : "Failed to submit response.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const totalLength = commType === "news_story"
    ? `${title}: ${content}`.length
    : content.length;

  const overLimit = commType === "news_story" && totalLength > MAX_POST_LENGTH;

  const handleNewsStory = async () => {
    if (!title.trim() || !content.trim()) {
      messageApi.error("Title and content are required.");
      return;
    }
    if (overLimit) {
      messageApi.error("News Story Must not Exceed 500 Characters");
      return;
    }
    setSubmitting(true);
    try {
      await newsService.createNewsStory({
        title,
        body: content,
        scenarioId,
      }, token);
      router.push(`/scenarios/${scenarioId}/backroom`);
    } catch (err) {
      messageApi.error(
        err instanceof Error ? err.message : "Failed to create news story.",
      );
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

        <nav className={styles.navbar}>
          <div className={styles.navLeft}>
            <div className={styles.logoMark} aria-hidden="true" />
            <span className={styles.navTitle}>Backroom</span>
          </div>
        </nav>

        <div className={styles.pageBody}>
          <Spin spinning={loading}>
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <div>
                  <h1 className={styles.cardTitle}>Communication Form</h1>
                  <p className={styles.cardSubtitle}>
                    Respond to player directives or publish a news story
                  </p>
                </div>
                <Button
                  onClick={() =>
                    router.push(`/scenarios/${scenarioId}/backroom`)}
                >
                  Back to Dashboard
                </Button>
              </div>

              <div className={styles.formBody}>
                {/* Communication type */}
                <div className={styles.fieldGroup}>
                  <label className={styles.label}>Communication Type</label>
                  <Select
                    value={commType}
                    onChange={(v) => {
                      setCommType(v as CommType);
                      setSelectedDirectiveId(null);
                      setSelectedOutcome(null);
                      setContent("");
                      setTitle("");
                    }}
                    options={[
                      { value: "response", label: "Response" },
                      { value: "news_story", label: "News Story" },
                    ]}
                    style={{ width: "100%" }}
                  />
                </div>

                {/* Recipient */}
                <div className={styles.fieldGroup}>
                  <label className={styles.label}>Recipient</label>
                  {commType === "response"
                    ? (
                      <Select
                        value={selectedDirectiveId ?? undefined}
                        onChange={(v) => {
                          setSelectedDirectiveId(v);
                          setSelectedOutcome(null);
                        }}
                        options={directiveOptions}
                        placeholder="Select a pending directive"
                        style={{ width: "100%" }}
                        notFoundContent="No pending directives"
                      />
                    )
                    : (
                      <Select
                        value="all"
                        disabled
                        options={[{ value: "all", label: "All Players" }]}
                        style={{ width: "100%" }}
                      />
                    )}
                </div>

                {/* Directive content — borderless, read-only */}
                {commType === "response" && selectedDirective && (
                  <div className={styles.fieldGroup}>
                    <label className={styles.label}>Directive Content</label>
                    <Input.TextArea
                      value={selectedDirective.body ?? ""}
                      readOnly
                      autoSize={{ minRows: 1 }}
                      variant="borderless"
                      style={{
                        resize: "none",
                        color: "#374151",
                        padding: "4px 0",
                      }}
                    />
                  </div>
                )}

                {/* Approve / Reject toggle (response type only) */}
                {commType === "response" && (
                  <div className={styles.fieldGroup}>
                    <label className={styles.label}>Decision</label>
                    <div style={{ display: "flex", gap: 12 }}>
                      <Button
                        style={{
                          flex: 1,
                          height: 44,
                          fontWeight: 600,
                          background: selectedOutcome === "approve"
                            ? "#059669"
                            : "transparent",
                          borderColor: "#059669",
                          color: selectedOutcome === "approve"
                            ? "#ffffff"
                            : "#059669",
                        }}
                        onClick={() =>
                          setSelectedOutcome(
                            selectedOutcome === "approve" ? null : "approve",
                          )}
                      >
                        Approve
                      </Button>
                      <Button
                        style={{
                          flex: 1,
                          height: 44,
                          fontWeight: 600,
                          background: selectedOutcome === "reject"
                            ? "#dc2626"
                            : "transparent",
                          borderColor: "#dc2626",
                          color: selectedOutcome === "reject"
                            ? "#ffffff"
                            : "#dc2626",
                        }}
                        onClick={() =>
                          setSelectedOutcome(
                            selectedOutcome === "reject" ? null : "reject",
                          )}
                      >
                        Reject
                      </Button>
                    </div>
                  </div>
                )}

                {/* Title (news story only) */}
                {commType === "news_story" && (
                  <div className={styles.fieldGroup}>
                    <label className={styles.label}>
                      Title <span style={{ color: "#ef4444" }}>*</span>
                    </label>
                    <Input
                      value={title}
                      onChange={(e) =>
                        setTitle(e.target.value)}
                      placeholder="Enter news story title"
                    />
                  </div>
                )}

                {/* Response message / content */}
                <div className={styles.fieldGroup}>
                  <label className={styles.label}>
                    {commType === "response" ? "Response Message" : "Content"}
                    {" "}
                    <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <Input.TextArea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder={commType === "response"
                      ? "Write your response to this directive..."
                      : "Write the news story content..."}
                    rows={8}
                    style={{ resize: "none" }}
                  />
                </div>
              </div>

              {/* Footer */}
              <div className={styles.cardFooter}>
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
                <Button
                  onClick={() =>
                    router.push(`/scenarios/${scenarioId}/backroom`)}
                >
                  Cancel
                </Button>
                {commType === "response"
                  ? (
                    <Button
                      type="primary"
                      loading={submitting}
                      onClick={handleRespond}
                      disabled={submitting || overLimit}
                    >
                      Respond
                    </Button>
                  )
                  : (
                    <Button
                      type="primary"
                      loading={submitting}
                      onClick={handleNewsStory}
                    >
                      Publish News
                    </Button>
                  )}
              </div>
            </div>
          </Spin>
        </div>
      </div>
    </ConfigProvider>
  );
}
