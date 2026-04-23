"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Button, ConfigProvider, Input, message, Select, Spin, theme } from "antd";
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

export default function BackroomCommunicatePage() {
  const { token, isAuthenticated, authReady } = useAuth();
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const scenarioId = Number(params.id);

  const preselectedType = searchParams.get("type") === "news_story" ? "news_story" : "response";
  const preselectedDirectiveId = searchParams.get("directiveId")
    ? Number(searchParams.get("directiveId"))
    : null;

  const api = useApi();
  const characterService = useMemo(() => new CharacterService(api), [api]);
  const directiveService = useMemo(() => new DirectiveService(api), [api]);
  const newsService = useMemo(() => new NewsService(api), [api]);

  const [commType, setCommType] = useState<CommType>(preselectedType);
  const [selectedDirectiveId, setSelectedDirectiveId] = useState<number | null>(preselectedDirectiveId);
  const [directives, setDirectives] = useState<Directive[]>([]);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [content, setContent] = useState("");
  const [title, setTitle] = useState("");

  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    if (authReady && !isAuthenticated) router.replace("/login");
  }, [isAuthenticated, router]);

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
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [isAuthenticated, scenarioId, token, directiveService, characterService]);

  if (!authReady || !isAuthenticated) return null;

  const pendingDirectives = directives.filter((d) => d.status === CommsStatus.PENDING);

  const characterName = (id: number | null): string => {
    if (id === null) return "Unknown";
    return characters.find((c) => c.id === id)?.name ?? "Unknown";
  };

  const directiveOptions = pendingDirectives.map((d) => ({
    value: d.id!,
    label: `${characterName(d.creatorId ?? null)} — ${d.title ?? d.body ?? "Untitled"}`,
  }));

  const selectedDirective = directives.find((d) => d.id === selectedDirectiveId) ?? null;

  const handleResponse = async (status: CommsStatus) => {
    if (!selectedDirectiveId) {
      messageApi.error("Please select a directive to respond to.");
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
        { status, response: content },
        token,
      );
      router.push(`/scenarios/${scenarioId}/backroom`);
    } catch (err) {
      messageApi.error(err instanceof Error ? err.message : "Failed to submit response.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleNewsStory = async () => {
    if (!title.trim() || !content.trim()) {
      messageApi.error("Title and content are required.");
      return;
    }
    setSubmitting(true);
    try {
      await newsService.createNewsStory({ title, body: content, scenarioId }, token);
      router.push(`/scenarios/${scenarioId}/backroom`);
    } catch (err) {
      messageApi.error(err instanceof Error ? err.message : "Failed to create news story.");
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
                <Button onClick={() => router.push(`/scenarios/${scenarioId}/backroom`)}>
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
                  {commType === "response" ? (
                    <Select
                      value={selectedDirectiveId ?? undefined}
                      onChange={(v) => setSelectedDirectiveId(v)}
                      options={directiveOptions}
                      placeholder="Select a pending directive"
                      style={{ width: "100%" }}
                      notFoundContent="No pending directives"
                    />
                  ) : (
                    <Select
                      value="all"
                      disabled
                      options={[{ value: "all", label: "All Players" }]}
                      style={{ width: "100%" }}
                    />
                  )}
                </div>

                {/* Directive context (response type only) */}
                {commType === "response" && selectedDirective && (
                  <div className={styles.fieldGroup}>
                    <label className={styles.label}>Directive Content</label>
                    <Input.TextArea
                      value={selectedDirective.body ?? ""}
                      readOnly
                      rows={4}
                      style={{ resize: "none", background: "#f9fafb", color: "#374151" }}
                    />
                  </div>
                )}

                {/* Title (news story only) */}
                {commType === "news_story" && (
                  <div className={styles.fieldGroup}>
                    <label className={styles.label}>Title <span style={{ color: "#ef4444" }}>*</span></label>
                    <Input
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Enter news story title"
                    />
                  </div>
                )}

                {/* Content */}
                <div className={styles.fieldGroup}>
                  <label className={styles.label}>
                    {commType === "response" ? "Response Message" : "Content"}{" "}
                    <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <Input.TextArea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder={
                      commType === "response"
                        ? "Write your response to this directive..."
                        : "Write the news story content..."
                    }
                    rows={8}
                    style={{ resize: "none" }}
                  />
                </div>
              </div>

              {/* Footer */}
              <div className={styles.cardFooter}>
                <Button onClick={() => router.push(`/scenarios/${scenarioId}/backroom`)}>
                  Cancel
                </Button>
                {commType === "response" ? (
                  <>
                    <Button
                      danger
                      loading={submitting}
                      onClick={() => handleResponse(CommsStatus.REJECTED)}
                    >
                      Deny
                    </Button>
                    <Button
                      type="primary"
                      loading={submitting}
                      onClick={() => handleResponse(CommsStatus.ACCEPTED)}
                    >
                      Approve
                    </Button>
                  </>
                ) : (
                  <Button type="primary" loading={submitting} onClick={handleNewsStory}>
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
