"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { usePolling } from "@/hooks/usePolling";
import { ScenarioService } from "@/api/scenarioService";
import { Scenario } from "@/types/scenario";
import { Button, ConfigProvider, Spin, theme } from "antd";
import {
  CalendarOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { useAuth } from "@/hooks/useAuth";
import { useApi } from "@/hooks/useApi";
import { useCharacter } from "../../../../../hooks/useCharacter";
import { CharacterService } from "@/api/characterService";
import { MessageService } from "@/api/messageService";
import type { Character } from "@/types/character";
import type { Message } from "@/types/message";
import { CommsStatus } from "@/types/directive";
import { initials } from "@/helpers/helperFunctions";
import { portraitSrc } from "@/utils/portrait";
import styles from "@/styles/characterProfile.module.css";
import { NavLogo } from "@/components/NavLogo";

function formatDate(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toISOString().replace("T", " ").slice(0, 19);
}

export default function CharacterProfilePage() {
  const { isAuthenticated, authReady } = useAuth();
  const router = useRouter();
  const params = useParams();
  const scenarioId = Number(params.id);
  const { characterToken } = useCharacter(scenarioId);
  const characterAuth = characterToken ? `Role ${characterToken}` : "Wrong";
  const targetCharId = Number(params.characterId);

  const api = useApi();
  const characterService = useMemo(() => new CharacterService(api), [api]);
  const messageService = useMemo(() => new MessageService(api), [api]);
  const scenarioService = useMemo(() => new ScenarioService(api), [api]);

  const { characterId: myCharacterId } = useCharacter(
    scenarioId,
  );

  const [targetCharacter, setTargetCharacter] = useState<Character | null>(
    null,
  );
  const [charsLoading, setCharsLoading] = useState(true);

  const enabled = isAuthenticated && !!scenarioId;

  // GET /scenarios/{id} requires Bearer (see PlayerService.validate).
  const { data: liveScenario } = usePolling<Scenario>(
    () => scenarioService.getScenarioById(scenarioId, characterAuth),
    5000,
    enabled,
  );

  const { data: liveCharacter } = usePolling<Character>(
    () =>
      myCharacterId
        ? characterService.getCharacterById(myCharacterId, characterAuth)
        : Promise.reject(),
    5000,
    enabled && !!myCharacterId,
  );

  // Poll messages so that incoming approvals/rejections show up without a
  // manual refresh. Sort oldest→newest so the conversation flows naturally.
  const { data: rawMessages, loading: messagesLoading } = usePolling<Message[]>(
    () =>
      myCharacterId
        ? messageService.getMessagesBetween(
          myCharacterId,
          targetCharId,
          characterAuth,
        )
        : Promise.reject(),
    5000,
    enabled && !!myCharacterId && !!targetCharId,
  );
  const messages = useMemo(() => {
    if (!rawMessages) return [];
    return [...rawMessages].sort((a, b) => {
      if (!a.createdAt || !b.createdAt) return 0;
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });
  }, [rawMessages]);

  const effectiveScenario = liveScenario ?? null;
  const isGameActive = effectiveScenario?.status === "UNFROZEN";
  const isAlive = liveCharacter?.alive ?? true;
  const isOwnProfile = targetCharId === myCharacterId;
  const loading = charsLoading || messagesLoading;

  useEffect(() => {
    if (authReady && !isAuthenticated) router.replace("/login");
  }, [authReady, isAuthenticated, router]);

  // One-shot fetch for the target character profile (it doesn't change
  // mid-session in a way the user needs to see live).
  useEffect(() => {
    if (!isAuthenticated || !scenarioId || !targetCharId) return;
    let cancelled = false;
    setCharsLoading(true);
    characterService
      .getCharactersByScenario(scenarioId, characterAuth)
      .then((chars) => {
        if (cancelled) return;
        setTargetCharacter(chars.find((c) => c.id === targetCharId) ?? null);
      })
      .catch(() => {
        // silently degrade — empty profile shows fallback text
      })
      .finally(() => {
        if (!cancelled) setCharsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [
    isAuthenticated,
    scenarioId,
    targetCharId,
    characterAuth,
    characterService,
  ]);

  if (!authReady || !isAuthenticated) return null;

  // Recipient must not see a message until the backroomer approves it.
  // Outgoing messages stay visible (with their existing status badges).
  // The backend already filters this for Role tokens, but we also filter
  // client-side as defense in depth (and to keep UI consistent if the
  // server response order changes).
  const visibleMessages = messages.filter(
    (m) => m.creatorId === myCharacterId || m.status === CommsStatus.ACCEPTED,
  );

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
            <NavLogo className={styles.logoMark} />
            <span className={styles.navTitle}>
              Character Profile &amp; Communication Log
            </span>
          </div>
          {!isAlive && (
            <div
              style={{ color: "#ef4444", fontWeight: 600, marginBottom: 12 }}
            >
              Your Character has Died.
            </div>
          )}
          <Button
            onClick={() => router.push(`/scenarios/${scenarioId}/player`)}
          >
            Back to Dashboard
          </Button>
        </nav>

        <Spin spinning={loading} style={{ flex: 1 }}>
          <div
            className={`${styles.body} ${
              isOwnProfile ? styles.bodySinglePanel : ""
            }`}
          >
            {/* ── Left panel: Character Profile ── */}
            <aside
              className={`${styles.leftPanel} ${
                isOwnProfile ? styles.leftPanelExpanded : ""
              }`}
            >
              <div className={styles.profileCard}>
                {portraitSrc(targetCharacter?.portrait)
                  ? (
                    <img
                      src={portraitSrc(targetCharacter?.portrait)!}
                      alt={targetCharacter?.name ?? ""}
                      className={styles.avatarImg}
                    />
                  )
                  : (
                    <div className={styles.avatarFallback}>
                      {initials(targetCharacter?.name ?? null)}
                    </div>
                  )}

                <h2 className={styles.characterName}>
                  {targetCharacter?.name ?? "—"}
                </h2>

                <hr className={styles.divider} />

                <div className={styles.fieldGroup}>
                  <p className={styles.fieldLabel}>Description</p>
                  <p className={styles.fieldValue}>
                    {targetCharacter?.description ??
                      "No description available."}
                  </p>
                </div>

                {isOwnProfile && (
                  <div className={styles.fieldGroup}>
                    <p className={styles.fieldLabel}>Secret</p>
                    <p className={styles.fieldValue}>
                      {targetCharacter?.secret ?? "No secret assigned."}
                    </p>
                  </div>
                )}

                <div className={styles.fieldGroup}>
                  <p className={styles.fieldLabel}>Status</p>
                  <span
                    className={targetCharacter?.alive !== false
                      ? styles.statusAlive
                      : styles.statusDead}
                  >
                    {targetCharacter?.alive !== false ? "Alive" : "Dead"}
                  </span>
                </div>
              </div>
            </aside>

            {/* ── Right panel: Communication Log ── */}
            {!isOwnProfile && (
              <main className={styles.rightPanel}>
                <div className={styles.logHeader}>
                  <h1 className={styles.logTitle}>Communication Log</h1>
                  <p className={styles.logSubtitle}>
                    All messages and transmissions
                  </p>
                </div>

                <div className={styles.messageList}>
                  {visibleMessages.length === 0
                    ? <p className={styles.emptyLog}>No messages yet.</p>
                    : (
                      visibleMessages.map((msg) => {
                        const isMine = msg.creatorId === myCharacterId;
                        const senderName = isMine
                          ? "You"
                          : (targetCharacter?.name ?? "Unknown");

                        return (
                          <div key={msg.id} className={styles.messageCard}>
                            <div className={styles.messageHeader}>
                              <span className={styles.messageSender}>
                                {senderName}
                              </span>
                              {isMine && msg.status === CommsStatus.ACCEPTED &&
                                (
                                  <span className={styles.badgeSent}>
                                    <CheckCircleOutlined /> Sent
                                  </span>
                                )}
                              {isMine && msg.status === CommsStatus.FAILED && (
                                <span className={styles.badgeFailed}>
                                  <CloseCircleOutlined /> Failed
                                </span>
                              )}
                              {isMine && msg.status === CommsStatus.REJECTED &&
                                (
                                  <span className={styles.badgeFailed}>
                                    <CloseCircleOutlined /> Rejected
                                  </span>
                                )}
                              {isMine && msg.status === CommsStatus.PENDING && (
                                <span className={styles.badgePending}>
                                  Pending
                                </span>
                              )}
                            </div>

                            <div className={styles.messageTimestamp}>
                              <CalendarOutlined className={styles.calIcon} />
                              <span>{formatDate(msg.createdAt)}</span>
                            </div>

                            <p className={styles.messageBody}>{msg.body}</p>
                          </div>
                        );
                      })
                    )}
                </div>

                {/* Sticky footer: New Message */}
                <div className={styles.footer}>
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    className={styles.newMessageBtn}
                    disabled={!isGameActive || !isAlive}
                    style={{ opacity: isGameActive && isAlive ? 1 : 0.5 }}
                    onClick={() =>
                      router.push(
                        `/scenarios/${scenarioId}/player/communicate?type=direct_message&recipient=${targetCharId}`,
                      )}
                  >
                    New Message
                  </Button>
                </div>
              </main>
            )}
          </div>
        </Spin>
      </div>
    </ConfigProvider>
  );
}
