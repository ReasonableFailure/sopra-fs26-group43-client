"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Avatar, Button, ConfigProvider, Spin, theme } from "antd";
import { FileTextOutlined, UserOutlined } from "@ant-design/icons";
import { useAuth } from "@/hooks/useAuth";
import { useApi } from "@/hooks/useApi";
import { usePolling } from "@/hooks/usePolling";
import { NewsService } from "@/api/newsService";
import type { Scenario } from "@/types/scenario";
import { ScenarioService } from "@/api/scenarioService";
import { CharacterService } from "@/api/characterService";
import { DirectiveService } from "@/api/directiveService";
import { MessageService } from "@/api/messageService";
import type { NewsGetDTO } from "@/types/news";
import type { Character } from "@/types/character";
import type { Directive } from "@/types/directive";
import { CommsStatus } from "@/types/directive";
import type { Message } from "@/types/message";
import styles from "@/styles/backroomDashboard.module.css";

function initials(name: string | null): string {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function DirectiveBadge({ status }: { status: CommsStatus | null }) {
  if (status === CommsStatus.ACCEPTED) {
    return <span className={`${styles.badge} ${styles.badgeResponded}`}>Approved</span>;
  }
  if (status === CommsStatus.REJECTED) {
    return <span className={`${styles.badge} ${styles.badgeRejected}`}>Rejected</span>;
  }
  return <span className={`${styles.badge} ${styles.badgePending}`}>Pending</span>;
}

export default function BackroomDashboardPage() {
  const { token, isAuthenticated, authReady } = useAuth();
  const router = useRouter();
  const params = useParams();
  const scenarioId = Number(params.id);
  const api = useApi();

  const characterService = useMemo(() => new CharacterService(api), [api]);
  const directiveService = useMemo(() => new DirectiveService(api), [api]);
  const messageService = useMemo(() => new MessageService(api), [api]);
  const newsService = useMemo(() => new NewsService(api), [api]);
  const scenarioService = useMemo(() => new ScenarioService(api), [api]);

  const [characters, setCharacters] = useState<Character[]>([]);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [scenario, setScenario] = useState<Scenario | null>(null);

  const enabled = isAuthenticated && !!scenarioId;

  const { data: directives, loading: directivesLoading } = usePolling<Directive[]>(
    () => directiveService.getDirectivesByScenario(scenarioId, `Backroomer ${token}`),
    5000,
    enabled,
  );

  const { data: newsItems, loading: newsLoading } = usePolling<NewsGetDTO[]>(
    () => newsService.getNewsByScenario(scenarioId, `Backroomer ${token}`),
    5000,
    enabled,
  );

  const [messages, setMessages] = useState<Message[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(false);

  useEffect(() => {
    if (!enabled) return;

    let cancelled = false;

    scenarioService.getScenarioById(scenarioId, `Backroomer ${token}`)
      .then((data) => {
        if (!cancelled) setScenario(data);
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [enabled, scenarioId, token, scenarioService]);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;

    const fetchMessages = async () => {
      setMessagesLoading(true);
      try {
        const pairs = await messageService.getMessagePairsByScenario(scenarioId, `Backroomer ${token}`);
        const arrays = await Promise.all(
          pairs.map((p) => messageService.getMessagesBetween(p.roleAId, p.roleBId, `Backroomer ${token}`)),
        );
        if (!cancelled) setMessages(arrays.flat());
      } catch {
        // silently ignore
      } finally {
        if (!cancelled) setMessagesLoading(false);
      }
    };

    fetchMessages();
    const intervalId = setInterval(fetchMessages, 5000);
    return () => {
      cancelled = true;
      clearInterval(intervalId);
    };
  }, [enabled, scenarioId, token, messageService]);

  const loading = directivesLoading || messagesLoading || newsLoading;

  useEffect(() => {
    if (authReady && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    characterService.getCharactersByScenario(scenarioId, `Backroomer ${token}`)
      .then((chars) => { if (!cancelled) setCharacters(chars); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [enabled, scenarioId, token, characterService]);

  if (!authReady || !isAuthenticated) return null;

  const pendingMessages = (messages ?? []).filter((m) => m.status === CommsStatus.PENDING || m.status === null);

  const characterName = (id: number | null): string => {
    if (id === null) return "Unknown";
    return characters.find((c) => c.id === id)?.name ?? "Unknown";
  };

  const handleMessageAction = async (messageId: number | null, status: CommsStatus) => {
    if (messageId === null) return;
    setActionLoading(messageId);
    try {
      await messageService.updateMessage(messageId, { status }, `Backroomer ${token}`);
    } catch {
      // silently ignore — message stays in list
    } finally {
      setActionLoading(null);
    }
  };

  function isPronouncement(item: NewsGetDTO) {
    return item.authorId !== null && item.authorId !== undefined;
  }

  function renderNewsText(item: NewsGetDTO) {
    const base = `${item.title}: ${item.body}`;

    if (!isPronouncement(item)) return base;

    return `${base}\n- ${characterName(item.authorId)}`;
  }

  const latestNews = [...(newsItems ?? [])]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() -
        new Date(a.createdAt).getTime()
    )
    .slice(0, 3);

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
      }}
    >
      <div className={styles.pageRoot}>
        <nav className={styles.navbar}>
          <div className={styles.navLeft}>
            <div className={styles.logoMark} aria-hidden="true" />
            <span className={styles.navTitle}>Backroom Dashboard</span>
          </div>
          <Avatar
            icon={<UserOutlined />}
            className={styles.navAvatar}
            aria-label="User avatar"
          />
        </nav>

        <Spin spinning={loading} style={{ flex: 1, display: "flex" }}>
          <div className={styles.body}>
            {/* ── Left: Directives ── */}
            <div className={styles.leftPanel}>
              <div className={styles.panelHeader}>
                <h2 className={styles.panelTitle}>Directives</h2>
                <p className={styles.panelSubtitle}>Review and manage player directives</p>
              </div>

              <div className={styles.tableHeader}>
                <div className={`${styles.tableHeaderCell} ${styles.colPlayerName}`}>Player Name</div>
                <div className={`${styles.tableHeaderCell} ${styles.colDirectiveTitle}`}>Directive Title</div>
                <div className={`${styles.tableHeaderCell} ${styles.colStatus}`}>Status</div>
              </div>

              {(directives ?? []).length === 0 && !loading && (
                <p className={styles.emptyState}>No directives submitted yet.</p>
              )}

              {(directives ?? []).map((directive) => (
                <div
                  key={directive.id}
                  className={styles.tableRow}
                  style={{ cursor: "pointer" }}
                  onClick={() => {
                    if (directive.status === CommsStatus.PENDING || directive.status === null) {
                      router.push(
                        `/scenarios/${scenarioId}/backroom/communicate?type=response&directiveId=${directive.id}`,
                      );
                    } else {
                      router.push(`/scenarios/${scenarioId}/backroom/directives/${directive.id}`);
                    }
                  }}
                >
                  <div className={`${styles.playerCell} ${styles.colPlayerName}`}>
                    <div className={styles.playerAvatar}>
                      {initials(characterName(directive.creatorId ?? null))}
                    </div>
                    <span className={styles.playerName}>
                      {characterName(directive.creatorId ?? null)}
                    </span>
                  </div>

                  <div className={`${styles.directiveCell} ${styles.colDirectiveTitle}`}>
                    <span className={styles.directiveTitle}>
                      {directive.title ?? directive.body ?? "Untitled"}
                    </span>
                    {directive.createdAt && (
                      <span className={styles.directiveDay}>
                        {directive.createdAt.slice(0, 10)}
                      </span>
                    )}
                  </div>

                  <div className={styles.statusCell}>
                    <DirectiveBadge status={directive.status} />
                  </div>
                </div>
              ))}
            </div>

            {/* ── Center: News Feed ── */}
            <div className={styles.centerPanel}>
              <div className={styles.panelHeader}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    width: "100%",
                    gap: "16px",
                  }}
                >
                  <div>
                    <h2 className={styles.panelTitle}>News Feed</h2>
                    <p className={styles.panelSubtitle}>
                      Publish stories to all players
                    </p>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "8px",
                      alignItems: "flex-end",
                    }}
                  >
                    <Button
                      type="primary"
                      onClick={() =>
                        router.push(`/scenarios/${scenarioId}/news`)
                      }
                    >
                      See All News
                    </Button>

                    {scenario?.mastodonProfileUrl && (
                      <Button
                        type="primary"
                        onClick={() =>
                          window.open(
                            scenario.mastodonProfileUrl!,
                            "_blank",
                            "noopener,noreferrer"
                          )
                        }
                      >
                        Go to Mastodon
                      </Button>
                    )}
                  </div>
                </div>
              </div>
              <div className={styles.newsFeedBody}>
                {latestNews.length === 0 ? (
                  <>
                    <div className={styles.newsFeedIcon}>
                      <FileTextOutlined />
                    </div>
                    <p className={styles.newsFeedTitle}>No news yet</p>
                    <p className={styles.newsFeedSub}>
                      Published stories will appear here.
                    </p>
                  </>
                ) : (
                  <div style={{ width: "100%" }}>
                    {latestNews.map((item, index) => (
                      <div
                        key={item.id}
                        style={{
                          padding: "14px 0",
                          textAlign: "center",
                          color: "#000000",
                          whiteSpace: "pre-line",
                          lineHeight: 1.5,
                          borderBottom:
                            index < latestNews.length - 1
                              ? "1px solid #e5e7eb"
                              : "none",
                        }}
                      >
                        {renderNewsText(item)}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className={styles.newStoryFooter}>
                <Button
                  type="primary"
                  className={styles.newStoryBtn}
                  onClick={() =>
                    router.push(`/scenarios/${scenarioId}/backroom/communicate?type=news_story`)
                  }
                >
                  Post a New Story
                </Button>
              </div>
            </div>

            {/* ── Right: Pending Messages ── */}
            <div className={styles.rightPanel}>
              <div className={styles.panelHeader}>
                <h2 className={styles.panelTitle}>Pending Messages</h2>
                <p className={styles.panelSubtitle}>Approve or reject player communications</p>
              </div>

              {pendingMessages.length === 0 && !loading && (
                <p className={styles.emptyState}>No pending messages.</p>
              )}

              <div className={styles.messagesList}>
                {pendingMessages.map((message) => (
                  <div key={message.id} className={styles.messageCard}>
                    <div className={styles.messageCardHeader}>
                      <div className={styles.senderAvatar}>
                        {initials(characterName(message.creatorId))}
                      </div>
                      <div className={styles.senderInfo}>
                        <span className={styles.senderName}>
                          {characterName(message.creatorId)}
                        </span>
                        <span className={styles.recipientLabel}>
                          To: {characterName(message.recipientId)}
                        </span>
                      </div>
                    </div>

                    <p className={styles.messageBody}>
                      {message.body ?? message.title ?? ""}
                    </p>

                    <div className={styles.messageActions}>
                      <Button
                        className={styles.approveBtn}
                        loading={actionLoading === message.id}
                        onClick={() => handleMessageAction(message.id, CommsStatus.ACCEPTED)}
                      >
                        Approve
                      </Button>
                      <Button
                        className={styles.rejectBtn}
                        loading={actionLoading === message.id}
                        onClick={() => handleMessageAction(message.id, CommsStatus.REJECTED)}
                      >
                        Reject
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Spin>
      </div>
    </ConfigProvider>
  );
}
