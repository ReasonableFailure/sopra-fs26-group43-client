"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Avatar, Button, ConfigProvider, Spin, theme } from "antd";
import { UserOutlined } from "@ant-design/icons";
import { useAuth } from "@/hooks/useAuth";
import { useApi } from "@/hooks/useApi";
import { usePolling } from "@/hooks/usePolling";
import { CharacterService } from "@/api/characterService";
import { DirectiveService } from "@/api/directiveService";
import { MessageService } from "@/api/messageService";
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
    return <span className={`${styles.badge} ${styles.badgeRejected}`}>Denied</span>;
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

  const [characters, setCharacters] = useState<Character[]>([]);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  const enabled = isAuthenticated && !!scenarioId;

  const { data: directives, loading: directivesLoading } = usePolling<Directive[]>(
    () => directiveService.getDirectivesByScenario(scenarioId, token),
    5000,
    enabled,
  );

  const [messages, setMessages] = useState<Message[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(false);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;

    const fetchMessages = async () => {
      setMessagesLoading(true);
      try {
        const pairs = await messageService.getMessagePairsByScenario(scenarioId, token);
        const arrays = await Promise.all(
          pairs.map((p) => messageService.getMessagesBetween(p.roleAId, p.roleBId, token)),
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

  const loading = directivesLoading || messagesLoading;

  useEffect(() => {
    if (authReady && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    characterService.getCharactersByScenario(scenarioId, token)
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
      await messageService.updateMessage(messageId, { status }, token);
    } catch {
      // silently ignore — message stays in list
    } finally {
      setActionLoading(null);
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
                <div>
                  <h2 className={styles.panelTitle}>Directives</h2>
                  <p className={styles.panelSubtitle}>Review and manage player directives</p>
                </div>
                <Button
                  type="primary"
                  size="small"
                  onClick={() => router.push(`/scenarios/${scenarioId}/backroom/communicate?type=news_story`)}
                >
                  New Story
                </Button>
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
