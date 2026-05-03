"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Avatar, Button, ConfigProvider, message, Spin, theme } from "antd";
import { BellOutlined} from "@ant-design/icons";

import { useAuth } from "@/hooks/useAuth";
import { useApi } from "@/hooks/useApi";
import { usePolling } from "@/hooks/usePolling";
import { useSelectedCharacter } from "@/hooks/useSelectedCharacter";

import { CharacterService } from "@/api/characterService";
import { DirectiveService } from "@/api/directiveService";
import { ScenarioService } from "@/api/scenarioService";
import { NewsService } from "@/api/newsService";

import type { Character } from "@/types/character";
import type { Directive } from "@/types/directive";
import { CommsStatus } from "@/types/directive";
import type { Scenario } from "@/types/scenario";
import type { NewsGetDTO } from "@/types/news";

import styles from "@/styles/playerDashboard.module.css";

// ── Avatar color palette (cycles by character index) ──────────────
const AVATAR_GRADIENTS = [
  "linear-gradient(135deg, #059669, #10b981)",
  "linear-gradient(135deg, #d97706, #f59e0b)",
  "linear-gradient(135deg, #dc2626, #ef4444)",
  "linear-gradient(135deg, #7c3aed, #4f46e5)",
  "linear-gradient(135deg, #0369a1, #0ea5e9)",
  "linear-gradient(135deg, #be185d, #ec4899)",
];

function avatarGradient(index: number) {
  return AVATAR_GRADIENTS[index % AVATAR_GRADIENTS.length];
}

function initials(name: string | null): string {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

// ── Status label ───────────────────────────────────────────────────
function statusLabel(directive: Directive): { text: string; className: string } {
  switch (directive.status) {
    case CommsStatus.ACCEPTED:
      return { text: "Approved", className: styles.accepted };
    case CommsStatus.REJECTED:
      return { text: "Rejected", className: styles.rejected };
    case CommsStatus.FAILED:
      return { text: "Failed", className: styles.rejected };
    default:
      return { text: "Pending review", className: "" };
  }
}

export default function PlayerDashboardPage() {
  const { token, isAuthenticated, authReady } = useAuth();
  const router = useRouter();
  const params = useParams();
  const scenarioId = Number(params.id);

  const api = useApi();
  const characterService = useMemo(() => new CharacterService(api), [api]);
  const directiveService = useMemo(() => new DirectiveService(api), [api]);
  const scenarioService = useMemo(() => new ScenarioService(api), [api]);
  const newsService = useMemo(() => new NewsService(api), [api]);

  const { characterId } = useSelectedCharacter(scenarioId);

  const [characters, setCharacters] = useState<Character[]>([]);
  const [scenario, setScenario] = useState<Scenario | null>(null);
  const [staticLoading, setStaticLoading] = useState(true);
  const [likes, setLikes] = useState(0);
  const [messageCount, setMessageCount] = useState(0);
  const [messageApi, contextHolder] = message.useMessage();
  const [buying, setBuying] = useState(false);

  const enabled = isAuthenticated && !!scenarioId;

  const { data: directives, loading: directivesLoading } = usePolling<Directive[]>(
    () => directiveService.getDirectivesByScenario(scenarioId, token),
    5000,
    enabled,
  );

  const { data: newsItems, loading: newsLoading } = usePolling<NewsGetDTO[]>(
    () => newsService.getNewsByScenario(scenarioId, token),
    5000,
    enabled,
  );

  const { data: liveCharacter } = usePolling<Character>(
    () =>
      characterId? characterService.getCharacterPoints(scenarioId,characterId,token)
        : Promise.reject(),
    15000,
    enabled && !!characterId
  );

  const { data: liveScenario } = usePolling<Scenario>(
    () => scenarioService.getScenarioById(scenarioId, token),
    5000,
    enabled
  );

  const effectiveScenario = liveScenario ?? scenario;
  const isGameActive = effectiveScenario?.status === "UNFROZEN";

  const loading = staticLoading || directivesLoading || newsLoading;

  const STATUS_LABEL: Record<string, string> = {
    UNSTARTED: "Not Started",
    UNFROZEN: "Running",
    FROZEN: "Frozen",
    COMPLETED: "Completed",
  };

  const STATUS_COLOR: Record<string, string> = {
    UNSTARTED: "#6b7280",
    UNFROZEN: "#10b981",
    FROZEN: "#3b82f6",
    COMPLETED: "#ef4444",
  };

  useEffect(() => {
    if (authReady && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (!enabled) return;

    let cancelled = false;

    const fetchStatic = async () => {
      setStaticLoading(true);
      try {
        const [chars, scen] = await Promise.all([
          characterService.getCharactersByScenario(scenarioId, token),
          scenarioService.getScenarioById(scenarioId, token),
        ]);
        if (!cancelled) {
          setCharacters(chars);
          setScenario(scen);
        }
      } catch {
        // silently degrade — components show empty state
      } finally {
        if (!cancelled) setStaticLoading(false);
      }
    };

    fetchStatic();
    return () => { cancelled = true; };
  }, [enabled, scenarioId, token, characterService, scenarioService]);

  const selectedCharacter = characters.find((c) => c.id === characterId) ?? null;
  const isAlive = (liveCharacter?.alive ?? selectedCharacter?.alive) !== false;

  useEffect(() => {
    if (liveCharacter) {
      setLikes(liveCharacter.pointsBalance ?? 0);
      setMessageCount(liveCharacter.messageCount ?? 0);
      return;
    }

    if (selectedCharacter) {
      setLikes(selectedCharacter.pointsBalance ?? 0);
      setMessageCount(selectedCharacter.messageCount ?? 0);
    }
  }, [
    liveCharacter,
    selectedCharacter?.id,
    selectedCharacter?.pointsBalance,
    selectedCharacter?.messageCount,
  ]);

  if (!authReady || !isAuthenticated) return null;

  const myDirectives = (directives ?? []).filter(
    (d) => d.creatorId === characterId,
  );

  const latestNews = [...(newsItems ?? [])]
  .sort(
    (a, b) =>
      new Date(b.createdAt).getTime() -
      new Date(a.createdAt).getTime(),
  )
  .slice(0, 3);

  const exchangeRate = effectiveScenario?.exchangeRate ?? 10;

  const handleBuyMessage = async () => {
    if (!characterId) return;

    setBuying(true);

    try {
      const updated = await characterService.buyMessage(
        scenarioId,
        characterId,
        token
      );

      setLikes(updated.pointsBalance ?? 0);
      setMessageCount(updated.messageCount ?? 0);

      messageApi.success("Message purchased.");
    } catch (err) {
      messageApi.error(
        err instanceof Error ? err.message : "Purchase failed."
      );
    } finally {
      setBuying(false);
    }
  };

  function isPronouncement(item: NewsGetDTO) {
    return item.authorId !== null && item.authorId !== undefined;
  }

  function getAuthorName(
    authorId: number | null | undefined,
    characters: Character[],
  ) {
    if (!authorId) return "Unknown";
    return characters.find((c) => c.id === authorId)?.name ?? "Unknown";
  }

  function renderNewsText(item: NewsGetDTO, characters: Character[]) {
    const base = `${item.title}: ${item.body}`;

    if (!isPronouncement(item)) return base;

    const authorName = getAuthorName(item.authorId, characters);
    return `${base}\n- ${authorName}`;
  }

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
            <span className={styles.navTitle}>Character Dashboard</span>
          </div>
          {!isAlive && (
            <div style={{ color: "#ef4444", fontWeight: 600 }}>
              Your Character has Died.
            </div>
          )}
          <div className={styles.navRight}>
            <Button
              icon={<BellOutlined />}
              shape="circle"
              className={styles.bellButton}
            />
            <Avatar className={styles.navAvatar}>
              {initials(selectedCharacter?.name ?? null)}
            </Avatar>
          </div>
        </nav>

        <Spin spinning={loading} style={{ flex: 1 }}>
          <div className={styles.body}>
            {/* ── Left sidebar: My Directives ── */}
            <aside className={styles.leftSidebar}>
              <div className={styles.sidebarHeader}>
                <h2 className={styles.sidebarTitle}>My Directives</h2>
                <Button
                  type="primary"
                  disabled={!isGameActive || !isAlive}
                  style={{ opacity: isGameActive && isAlive ? 1 : 0.5 }}
                  onClick={() =>
                    router.push(`/scenarios/${scenarioId}/player/communicate?type=directive`)
                  }
                >
                  New Directive
                </Button>
              </div>

              <div className={styles.directiveList}>
                {myDirectives.length === 0 ? (
                  <p className={styles.emptyDirectives}>
                    No directives submitted yet.
                  </p>
                ) : (
                  myDirectives.map((d) => {
                    const { text, className } = statusLabel(d);
                    return (
                      <div
                        key={d.id}
                        className={styles.directiveCard}
                        style={{ cursor: "pointer" }}
                        onClick={() =>
                          router.push(
                            `/scenarios/${scenarioId}/player/directives/${d.id}`,
                          )
                        }
                      >
                        <div className={styles.directiveRow}>
                          <p className={styles.directiveTitle}>
                            {d.title ?? d.body ?? "Untitled"}
                          </p>
                          {d.createdAt && (
                            <span className={styles.directiveDay}>
                              {d.createdAt.slice(0, 10)}
                            </span>
                          )}
                        </div>
                        <p className={`${styles.directiveStatus} ${className}`}>
                          {text}
                        </p>
                      </div>
                    );
                  })
                )}
              </div>
            </aside>

            {/* ── Center ── */}
            <main className={styles.center}>
              {/* News Feed */}
              <div className={styles.centerHeader}>
                <h1 className={styles.sectionHeading}>News Feed</h1>
                <Button
                  type="primary"
                  disabled={!isGameActive || !isAlive}
                  style={{ opacity: isGameActive && isAlive ? 1 : 0.5 }}
                  onClick={() =>
                    router.push(`/scenarios/${scenarioId}/player/communicate?type=pronouncement`)
                  }
                >
                  Post Pronouncement
                </Button>
              </div>
              <p className={styles.sectionSubheading}>
                Stay updated with the latest from your fellow players
              </p>

              <div className={styles.newsFeedCard}>
              {latestNews.length === 0 ? (
                <div className={styles.newsFeedPlaceholder}>
                  <p className={styles.newsFeedPlaceholderTitle}>
                    No news yet
                  </p>
                  <p>News stories will appear here when published.</p>
                </div>
              ) : (
                <div>
                  {latestNews.map((item, index) => (
                    <div
                      key={item.id}
                      style={{
                        padding: "14px 0",
                        borderBottom:
                          index < latestNews.length - 1
                            ? "1px solid #e5e7eb"
                            : "none",
                        whiteSpace: "pre-line",
                        textAlign: "center",
                        color: "#000000",
                        fontSize: "14px",
                        lineHeight: 1.5,
                      }}
                    >
                      {renderNewsText(item, characters)}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: "12px",
                marginBottom: "16px",
                gap: "12px",
              }}
            >
              <div>
                {scenario?.mastodonProfileUrl && (
                  <Button
                    type="primary"
                    onClick={() =>
                      window.open(scenario.mastodonProfileUrl!, "_blank", "noopener,noreferrer")
                    }
                  >
                    Go to Mastodon
                  </Button>
                )}
              </div>

              <Button
                type="primary"
                onClick={() =>
                  router.push(`/scenarios/${scenarioId}/news`)
                }
              >
                See All News
              </Button>
            </div>
              {/* My Likes & My Messages */}
              <div className={styles.metricsRow}>
                <div className={styles.metricCard}>
                  <p className={styles.metricLabel}>Current Like Balance</p>
                  <p className={styles.metricValue}>{likes}</p>
                  <Button
                    type="primary"
                    className={styles.buyButton}
                    disabled={likes < exchangeRate}
                    onClick={handleBuyMessage}
                  >
                    Buy a message with {exchangeRate} Like{exchangeRate !== 1 ? "s" : ""}
                  </Button>
                </div>

                <div className={styles.metricCard}>
                  <p className={styles.metricLabel}>Current Available Messages</p>
                  <p className={styles.metricValue}>{messageCount}</p>
                </div>
              </div>
              <div className={styles.metricCard}>
                <p
                  className={styles.metricValue}
                  style={{
                    color: effectiveScenario
                      ? STATUS_COLOR[effectiveScenario.status]
                      : "#6b7280",
                  }}
                >
                  Day {effectiveScenario?.dayNumber ?? 0}
                </p>
                <p
                  style={{
                    marginTop: 8,
                    color: effectiveScenario
                      ? STATUS_COLOR[effectiveScenario.status]
                      : "#6b7280",
                    fontWeight: 500,
                  }}
                >
                  The Crisis is{" "}
                  {effectiveScenario
                    ? STATUS_LABEL[effectiveScenario.status]
                    : "Unknown"}
                </p>
              </div>
            </main>

            {/* ── Right sidebar: Character List ── */}
            <aside className={styles.rightSidebar}>
              <div className={styles.sidebarHeader}>
                <h2 className={styles.sidebarTitle}>Character List</h2>
              </div>

              <div className={styles.characterList}>
                {characters.length === 0 ? (
                  <p className={styles.emptyCharacters}>No characters loaded.</p>
                ) : (
                  [...characters]
                    .sort((a, b) => (a.id === characterId ? -1 : b.id === characterId ? 1 : 0))
                    .map((char, index) => {
                      const isMe = char.id === characterId;
                      return (
                        <div key={char.id ?? char.name} className={styles.characterRow}>
                          <div
                            className={styles.characterAvatar}
                            style={{ background: avatarGradient(index) }}
                            aria-label={char.name ?? "Character"}
                          >
                            {initials(char.name)}
                          </div>
                          <div className={styles.characterInfo}>
                            <p className={styles.characterName}>
                              {char.name ?? "Unknown"}
                              {isMe && (
                                <span className={styles.youBadge}>You</span>
                              )}
                            </p>
                            {char.title && (
                              <p className={styles.characterMeta}>{char.title}</p>
                            )}
                          </div>
                          <Button
                            type="primary"
                            className={styles.messageBtn}
                            onClick={() =>
                              router.push(
                                `/scenarios/${scenarioId}/player/characters/${char.id}`,
                              )
                            }
                          >
                            View
                          </Button>
                        </div>
                      );
                    })
                )}
              </div>
            </aside>
          </div>
        </Spin>
      </div>
    </ConfigProvider>
  );
}
