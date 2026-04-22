"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Avatar, Button, ConfigProvider, Spin, theme } from "antd";
import { BellOutlined, FileTextOutlined } from "@ant-design/icons";
import { useAuth } from "@/hooks/useAuth";
import { useApi } from "@/hooks/useApi";
import { usePolling } from "@/hooks/usePolling";
import { useSelectedCharacter } from "@/hooks/useSelectedCharacter";
import { CharacterService } from "@/api/characterService";
import { DirectiveService } from "@/api/directiveService";
import { ScenarioService } from "@/api/scenarioService";
import type { Character } from "@/types/character";
import type { Directive } from "@/types/directive";
import { CommsStatus } from "@/types/directive";
import type { Scenario } from "@/types/scenario";
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
      return { text: `Rejected: ${directive.body ?? ""}`, className: styles.rejected };
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

  const { characterId } = useSelectedCharacter(scenarioId);

  const [characters, setCharacters] = useState<Character[]>([]);
  const [scenario, setScenario] = useState<Scenario | null>(null);
  const [staticLoading, setStaticLoading] = useState(true);

  const enabled = isAuthenticated && !!scenarioId;

  const { data: directives, loading: directivesLoading } = usePolling<Directive[]>(
    () => directiveService.getDirectivesByScenario(scenarioId, token),
    5000,
    enabled,
  );

  const loading = staticLoading || directivesLoading;

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

  if (!authReady || !isAuthenticated) return null;

  const selectedCharacter = characters.find((c) => c.id === characterId) ?? null;

  // Filter directives to the selected character
  const myDirectives = (directives ?? []).filter(
    (d) => d.creatorId === characterId,
  );

  const exchangeRate = scenario?.exchangeRate ?? 10;
  const actionPoints = selectedCharacter?.actionPoints ?? 0;

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
        {/* Navbar */}
        <nav className={styles.navbar}>
          <div className={styles.navLeft}>
            <div className={styles.logoMark} aria-hidden="true" />
            <span className={styles.navTitle}>Player Dashboard</span>
          </div>
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
                  size="small"
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
                  onClick={() =>
                    router.push(`/scenarios/${scenarioId}/player/pronouncement/new`)
                  }
                >
                  Post Pronouncement
                </Button>
              </div>
              <p className={styles.sectionSubheading}>
                Stay updated with the latest from your fellow players
              </p>

              <div className={styles.newsFeedCard}>
                <div className={styles.newsFeedPlaceholder}>
                  <div className={styles.newsFeedPlaceholderIcon}>
                    <FileTextOutlined />
                  </div>
                  <p className={styles.newsFeedPlaceholderTitle}>
                    News Feed coming soon
                  </p>
                  <p>
                    News stories will appear here once the Mastodon integration
                    is connected.
                  </p>
                </div>
              </div>

              {/* My Action Points */}
              <div className={styles.actionPointsHeader}>
                <h2 className={styles.sectionHeading}>My Action Points</h2>
                <p className={styles.sectionSubheading}>
                  Purchase action points with likes to your pronouncements
                </p>
              </div>

              <div className={styles.apCards}>
                <div className={styles.apCard}>
                  <p className={styles.apLabel}>Likes</p>
                  <p className={styles.apValue}>0</p>
                </div>

                <div className={styles.apArrow}>
                  <Button
                    className={styles.apBuyButton}
                    onClick={() => alert("Buy action points — not yet implemented")}
                  >
                    Buy
                  </Button>
                  <div className={styles.apArrowLine} />
                  <span className={styles.apExchangeText}>
                    with {exchangeRate} likes
                  </span>
                </div>

                <div className={styles.apCard}>
                  <p className={styles.apLabel}>Action Points</p>
                  <p className={styles.apValue}>{actionPoints}</p>
                </div>
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
                  characters.map((char, index) => (
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
                        </p>
                        {char.title && (
                          <p className={styles.characterMeta}>{char.title}</p>
                        )}
                      </div>
                      <Button
                        type="primary"
                        size="small"
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
                  ))
                )}
              </div>
            </aside>
          </div>
        </Spin>
      </div>
    </ConfigProvider>
  );
}
