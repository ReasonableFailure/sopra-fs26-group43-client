"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button, ConfigProvider, Select, Spin, theme } from "antd";
import {
  ClockCircleOutlined,
  FileTextOutlined,
  UserOutlined,
} from "@ant-design/icons";
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
import { DirectiveCategory } from "@/types/directive";
import { CommsStatus } from "@/types/directive";
import type { Message } from "@/types/message";
import { initials } from "@/helpers/helperFunctions";
import styles from "@/styles/backroomDashboard.module.css";
import { useBackroomer } from "@/hooks/useBackroomer";
import { portraitSrc as portraitSrcUtil } from "@/utils/portrait";
import { UserAvatarMenu } from "@/components/UserAvatarMenu";
import { NavLogo } from "@/components/NavLogo";

function timeAgo(iso: string | null | undefined): string {
  if (!iso) return "";
  const diff = Date.now() - new Date(iso).getTime();
  if (Number.isNaN(diff)) return "";
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min${mins === 1 ? "" : "s"} ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hr${hrs === 1 ? "" : "s"} ago`;
  const days = Math.floor(hrs / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}

function DirectiveBadge({ status }: { status: CommsStatus | null }) {
  if (status === CommsStatus.ACCEPTED) {
    return (
      <span className={`${styles.badge} ${styles.badgeResponded}`}>
        Approved
      </span>
    );
  }
  if (status === CommsStatus.REJECTED) {
    return (
      <span className={`${styles.badge} ${styles.badgeRejected}`}>
        Rejected
      </span>
    );
  }
  return (
    <span className={`${styles.badge} ${styles.badgePending}`}>Pending</span>
  );
}

export default function BackroomDashboardPage() {
  const { isAuthenticated, authReady } = useAuth();
  const router = useRouter();
  const params = useParams();
  const scenarioId = Number(params.id);
  const api = useApi();

  const characterService = useMemo(() => new CharacterService(api), [api]);
  const directiveService = useMemo(() => new DirectiveService(api), [api]);
  const messageService = useMemo(() => new MessageService(api), [api]);
  const newsService = useMemo(() => new NewsService(api), [api]);
  const scenarioService = useMemo(() => new ScenarioService(api), [api]);

  const { backroomerToken } = useBackroomer(scenarioId);
  const backroomerAuth = backroomerToken
    ? `Backroomer ${backroomerToken}`
    : "Wrong";

  const [characters, setCharacters] = useState<Character[]>([]);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [scenario, setScenario] = useState<Scenario | null>(null);

  const enabled = isAuthenticated && !!scenarioId;

  const { data: directives, loading: directivesLoading } = usePolling<
    Directive[]
  >(
    () => directiveService.getDirectivesByScenario(scenarioId, backroomerAuth),
    5000,
    enabled,
  );

  const { data: newsItems, loading: newsLoading } = usePolling<NewsGetDTO[]>(
    () => newsService.getNewsByScenario(scenarioId, backroomerAuth),
    5000,
    enabled,
  );

  const [messages, setMessages] = useState<Message[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<
    DirectiveCategory | "ALL"
  >("ALL");

  useEffect(() => {
    if (!enabled) return;

    let cancelled = false;

    scenarioService.getScenarioById(scenarioId, backroomerAuth)
      .then((data) => {
        if (!cancelled) setScenario(data);
      })
      .catch((err) => {
        console.error(err);
      });

    return () => {
      cancelled = true;
    };
  }, [enabled, scenarioId, backroomerAuth, scenarioService]);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;

    const fetchMessages = async () => {
      setMessagesLoading(true);
      try {
        const pairs = await messageService.getMessagePairsByScenario(
          scenarioId,
          backroomerAuth,
        );
        const arrays = await Promise.all(
          pairs.map((p) =>
            messageService.getMessagesBetween(
              p.roleAId,
              p.roleBId,
              backroomerAuth,
            )
          ),
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
  }, [enabled, scenarioId, backroomerAuth, messageService]);

  const loading = directivesLoading || messagesLoading || newsLoading;

  const CATEGORY_STYLES: Record<
    DirectiveCategory,
    { bg: string; border: string }
  > = {
    MILITARY: {
      bg: "#fef3c7",
      border: "#f59e0b",
    },
    POLITICAL: {
      bg: "#e0f2fe",
      border: "#0ea5e9",
    },
    PUBLIC: {
      bg: "#dcfce7",
      border: "#22c55e",
    },
    INTELLIGENCE: {
      bg: "#ede9fe",
      border: "#8b5cf6",
    },
    OTHER: {
      bg: "#f3f4f6",
      border: "#9ca3af",
    },
  };

  useEffect(() => {
    if (authReady && !isAuthenticated) {
      router.replace("/login");
    }
  }, [authReady, isAuthenticated, router]);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    characterService.getCharactersByScenario(scenarioId, backroomerAuth)
      .then((chars) => {
        if (!cancelled) setCharacters(chars);
      })
      .catch((err) => {
        console.error(err);
      });
    return () => {
      cancelled = true;
    };
  }, [enabled, scenarioId, backroomerAuth, characterService]);

  if (!authReady || !isAuthenticated) return null;

  const pendingMessages = (messages ?? []).filter((m) =>
    m.status === CommsStatus.PENDING || m.status === null
  );
  const messageHistory = (messages ?? [])
    .filter((m) =>
      m.status === CommsStatus.ACCEPTED || m.status === CommsStatus.REJECTED
    )
    .sort((a, b) => {
      if (!a.createdAt || !b.createdAt) return 0;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  const characterName = (id: number | null): string => {
    if (id === null) return "Unknown";
    return characters.find((c) => c.id === id)?.name ?? "Unknown";
  };

  // Thin wrapper around the shared utility so the rest of the component
  // can keep passing a Character object instead of digging out .portrait.
  function portraitSrc(character?: Character | null): string | null {
    return portraitSrcUtil(character?.portrait);
  }

  const handleMessageAction = async (
    messageId: number | null,
    status: CommsStatus,
  ) => {
    if (messageId === null) return;
    setActionLoading(messageId);
    try {
      await messageService.updateMessage(messageId, { status }, backroomerAuth);
      setMessages((prev) =>
        prev.map((m) => m.id === messageId ? { ...m, status } : m)
      );
    } catch {
      // silently ignore — message stays in list
    } finally {
      setActionLoading(null);
    }
  };

  function isPronouncement(item: NewsGetDTO) {
    return item.authorId !== null && item.authorId !== undefined;
  }

  const latestNews = [...(newsItems ?? [])]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() -
        new Date(a.createdAt).getTime(),
    )
    .slice(0, 3);

  const filteredDirectives = (directives ?? []).filter((d) => {
    if (selectedCategory === "ALL") return true;
    return d.category === selectedCategory;
  });

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
        // Inherit the root layout's green Button.colorPrimary so the
        // existing button palette on this page stays unchanged. The one
        // button we want indigo (See All News, matching the Character
        // Dashboard) is styled explicitly below.
      }}
    >
      <div className={styles.pageRoot}>
        <nav className={styles.navbar}>
          <div className={styles.navLeft}>
            <NavLogo className={styles.logoMark} />
            <span className={styles.navTitle}>Backroom Dashboard</span>
            <Button onClick={() => router.push("/scenarios")}>
              All Scenarios
            </Button>
          </div>
          <div className={styles.navRight}>
            <Button onClick={() => router.push("/scenarios")}>
              All Scenarios
            </Button>
            <UserAvatarMenu avatarClassName={styles.navAvatar} />
          </div>
        </nav>

        <Spin spinning={loading} fullscreen={false} />
        <div className={styles.body}>
          {/* ── Left: Directives ── */}
          <div className={styles.leftPanel}>
            <div className={styles.panelHeader}>
              <h2 className={styles.panelTitle}>Directives</h2>
              <p className={styles.panelSubtitle}>
                Review and manage player directives
              </p>
            </div>
            <div className={styles.leftPanelContent}>
              <div style={{ marginBottom: "12px" }}>
                <Select
                  value={selectedCategory}
                  onChange={(v) => setSelectedCategory(v)}
                  style={{ width: "100%" }}
                  options={[
                    {
                      value: "ALL",
                      label: "All Categories",
                    },
                    ...Object.values(DirectiveCategory).map((cat) => ({
                      value: cat,
                      label: (
                        <div
                          style={{
                            background: CATEGORY_STYLES[cat].bg,
                            padding: "4px 8px",
                            borderRadius: 4,
                          }}
                        >
                          {cat}
                        </div>
                      ),
                    })),
                  ]}
                />
              </div>

              <div className={styles.tableHeader}>
                <div
                  className={`${styles.tableHeaderCell} ${styles.colPlayerName}`}
                >
                  Player Name
                </div>
                <div
                  className={`${styles.tableHeaderCell} ${styles.colDirectiveTitle}`}
                >
                  Directive Title
                </div>
                <div
                  className={`${styles.tableHeaderCell} ${styles.colStatus}`}
                >
                  Status
                </div>
              </div>

              {filteredDirectives.length === 0 && !loading && (
                <p className={styles.emptyState}>
                  No directives submitted yet.
                </p>
              )}
              {filteredDirectives.map((directive) => {
                const style = directive.category
                  ? CATEGORY_STYLES[directive.category]
                  : CATEGORY_STYLES.OTHER;

                return (
                  <div
                    key={directive.id}
                    className={styles.tableRow}
                    style={{
                      cursor: "pointer",
                      backgroundColor: style.bg,
                      borderLeft: `4px solid ${style.border}`,
                    }}
                    onClick={() => {
                      if (
                        directive.status === CommsStatus.PENDING ||
                        directive.status === null
                      ) {
                        router.push(
                          `/scenarios/${scenarioId}/backroom/communicate?type=response&directiveId=${directive.id}`,
                        );
                      } else {
                        router.push(
                          `/scenarios/${scenarioId}/backroom/directives/${directive.id}`,
                        );
                      }
                    }}
                  >
                    <div
                      className={`${styles.playerCell} ${styles.colPlayerName}`}
                    >
                      {(() => {
                        const character = characters.find(
                          (c) => c.id === directive.creatorId,
                        );

                        const portrait = portraitSrc(character);

                        return portrait
                          ? (
                            <img
                              src={portrait}
                              alt={character?.name ?? "Character"}
                              className={styles.AvatarImage}
                            />
                          )
                          : (
                            <div className={styles.playerAvatar}>
                              {initials(
                                characterName(directive.creatorId ?? null),
                              )}
                            </div>
                          );
                      })()}
                      <span className={styles.playerName}>
                        {characterName(directive.creatorId ?? null)}
                      </span>
                    </div>

                    <div
                      className={`${styles.directiveCell} ${styles.colDirectiveTitle}`}
                    >
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
                );
              })}
            </div>
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
                    onClick={() => router.push(`/scenarios/${scenarioId}/news`)}
                    style={{
                      backgroundColor: "#4f46e5",
                      borderColor: "#4f46e5",
                    }}
                  >
                    See All News
                  </Button>

                  {scenario?.mastodonProfileUrl && (
                    <Button
                      type="primary"
                      href={scenario.mastodonProfileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Go to Mastodon
                    </Button>
                  )}
                </div>
              </div>
            </div>
            <div className={styles.centerPanelContent}>
              <div className={styles.newsFeedBody}>
                {latestNews.length === 0
                  ? (
                    <div className={styles.newsFeedEmpty}>
                      <div className={styles.newsFeedIcon}>
                        <FileTextOutlined />
                      </div>
                      <p className={styles.newsFeedTitle}>No news yet</p>
                      <p className={styles.newsFeedSub}>
                        Published stories will appear here.
                      </p>
                    </div>
                  )
                  : (
                    <div className={styles.newsList}>
                      {latestNews.map((item) => {
                        const pronouncement = isPronouncement(item);
                        const authorName = pronouncement
                          ? characterName(item.authorId)
                          : null;
                        return (
                          <article key={item.id} className={styles.newsItem}>
                            <div className={styles.newsItemTop}>
                              <div className={styles.newsItemTopLeft}>
                                <span
                                  className={pronouncement
                                    ? styles.badgePronouncement
                                    : styles.badgeNews}
                                >
                                  {pronouncement
                                    ? "Pronouncement"
                                    : "New Story"}
                                </span>
                                {pronouncement && authorName && (
                                  <span className={styles.newsAuthorRow}>
                                    <UserOutlined
                                      className={styles.newsAuthorIcon}
                                    />
                                    {authorName}
                                  </span>
                                )}
                              </div>
                              <span className={styles.newsTimestamp}>
                                <ClockCircleOutlined />
                                {timeAgo(item.createdAt)}
                              </span>
                            </div>
                            <h3 className={styles.newsItemTitle}>
                              {item.title}
                            </h3>
                            <p className={styles.newsItemBody}>{item.body}</p>
                          </article>
                        );
                      })}
                    </div>
                  )}
              </div>
            </div>
            <div className={styles.newStoryFooter}>
              <Button
                type="primary"
                className={styles.newStoryBtn}
                onClick={() => router.push(
                  `/scenarios/${scenarioId}/backroom/communicate?type=news_story`,
                )}
              >
                Post a New Story
              </Button>
            </div>
          </div>

          {/* ── Right: Messages ── */}
          <div className={styles.rightPanel}>
            {/* Pending section */}
            <div className={styles.panelHeader}>
              <h2 className={styles.panelTitle}>Pending Messages</h2>
              <p className={styles.panelSubtitle}>
                Approve or reject player communications
              </p>
            </div>

            <div className={styles.scrollSection}>
              {pendingMessages.length === 0 && !loading
                ? <p className={styles.emptyState}>No pending messages.</p>
                : (
                  <div className={styles.scrollList}>
                    {pendingMessages.map((message) => (
                      <div key={message.id} className={styles.messageCard}>
                        <div className={styles.messageCardHeader}>
                          {(() => {
                            const character = characters.find(
                              (c) =>
                                c.id === message.creatorId,
                            );

                            const portrait = portraitSrc(character);

                            return portrait
                              ? (
                                <img
                                  src={portrait}
                                  alt={character?.name ?? "Character"}
                                  className={styles.AvatarImage}
                                />
                              )
                              : (
                                <div className={styles.senderAvatar}>
                                  {initials(characterName(message.creatorId))}
                                </div>
                              );
                          })()}

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
                            onClick={() =>
                              handleMessageAction(
                                message.id,
                                CommsStatus.ACCEPTED,
                              )}
                          >
                            Approve
                          </Button>

                          <Button
                            className={styles.rejectBtn}
                            loading={actionLoading === message.id}
                            onClick={() =>
                              handleMessageAction(
                                message.id,
                                CommsStatus.REJECTED,
                              )}
                          >
                            Reject
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
            </div>
            {/* History section */}
            <div className={styles.panelHeader}>
              <h2 className={styles.panelTitle}>Message History</h2>

              <p className={styles.panelSubtitle}>
                Previously approved or rejected messages
              </p>
            </div>

            <div className={styles.scrollSection}>
              {messageHistory.length === 0 && !loading
                ? <p className={styles.emptyState}>No handled messages yet.</p>
                : (
                  <div className={styles.scrollList}>
                    {messageHistory.map((message) => (
                      <div
                        key={`hist-${message.id}`}
                        className={styles.messageCard}
                      >
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

                          <div style={{ marginLeft: "auto" }}>
                            <DirectiveBadge status={message.status} />
                          </div>
                        </div>

                        <p className={styles.messageBody}>
                          {message.body ?? message.title ?? ""}
                        </p>

                        {message.createdAt && (
                          <p
                            style={{
                              fontSize: 12,
                              color: "#6b7280",
                              margin: 0,
                            }}
                          >
                            {message.createdAt.slice(0, 19).replace("T", " ")}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
            </div>
          </div>
        </div>
      </div>
    </ConfigProvider>
  );
}
