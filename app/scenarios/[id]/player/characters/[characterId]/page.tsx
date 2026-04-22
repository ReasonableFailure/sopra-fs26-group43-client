"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button, ConfigProvider, Spin, theme } from "antd";
import {
  CalendarOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { useAuth } from "@/hooks/useAuth";
import { useApi } from "@/hooks/useApi";
import { useSelectedCharacter } from "@/hooks/useSelectedCharacter";
import { CharacterService } from "@/api/characterService";
import { CabinetService } from "@/api/cabinetService";
import { MessageService } from "@/api/messageService";
import type { Character } from "@/types/character";
import type { Cabinet } from "@/types/cabinet";
import type { Message } from "@/types/message";
import { CommsStatus } from "@/types/directive";
import styles from "@/styles/characterProfile.module.css";

function initials(name: string | null): string {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function formatDate(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toISOString().replace("T", " ").slice(0, 19);
}

export default function CharacterProfilePage() {
  const { token, isAuthenticated, authReady } = useAuth();
  const router = useRouter();
  const params = useParams();
  const scenarioId = Number(params.id);
  const targetCharId = Number(params.characterId);

  const api = useApi();
  const characterService = useMemo(() => new CharacterService(api), [api]);
  const cabinetService = useMemo(() => new CabinetService(api), [api]);
  const messageService = useMemo(() => new MessageService(api), [api]);

  const { characterId: myCharacterId } = useSelectedCharacter(scenarioId);

  const [targetCharacter, setTargetCharacter] = useState<Character | null>(null);
  const [cabinet, setCabinet] = useState<Cabinet | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authReady && !isAuthenticated) router.replace("/login");
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (!isAuthenticated || !scenarioId || !targetCharId) return;
    let cancelled = false;
    setLoading(true);

    const fetchData = async () => {
      try {
        const [chars, cabinets, msgs] = await Promise.all([
          characterService.getCharactersByScenario(scenarioId, token),
          cabinetService.getCabinetsByScenario(scenarioId, token),
          messageService.getMessagesByScenario(scenarioId, token),
        ]);
        if (cancelled) return;

        const char = chars.find((c) => c.id === targetCharId) ?? null;
        setTargetCharacter(char);

        if (char?.cabinetId) {
          setCabinet(cabinets.find((c) => c.id === char.cabinetId) ?? null);
        }

        const filtered = msgs
          .filter(
            (m) =>
              (m.creatorId === myCharacterId && m.recipientId === targetCharId) ||
              (m.creatorId === targetCharId && m.recipientId === myCharacterId),
          )
          .sort((a, b) => {
            if (!a.createdAt || !b.createdAt) return 0;
            return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          });
        setMessages(filtered);
      } catch {
        // silently degrade
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchData();
    return () => { cancelled = true; };
  }, [isAuthenticated, scenarioId, targetCharId, myCharacterId, token, characterService, cabinetService, messageService]);

  if (!authReady || !isAuthenticated) return null;

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
            <span className={styles.navTitle}>
              Character Profile &amp; Communication Log
            </span>
          </div>
          <Button onClick={() => router.push(`/scenarios/${scenarioId}/player`)}>
            Back to Dashboard
          </Button>
        </nav>

        <Spin spinning={loading} style={{ flex: 1 }}>
          <div className={styles.body}>
            {/* ── Left panel: Character Profile ── */}
            <aside className={styles.leftPanel}>
              <div className={styles.profileCard}>
                {targetCharacter?.portrait ? (
                  <img
                    src={targetCharacter.portrait}
                    alt={targetCharacter.name ?? ""}
                    className={styles.avatarImg}
                  />
                ) : (
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
                    {targetCharacter?.description ?? "No description available."}
                  </p>
                </div>

                <div className={styles.fieldGroup}>
                  <p className={styles.fieldLabel}>Cabinet</p>
                  <p className={styles.cabinetValue}>
                    {cabinet?.cabinetName ?? "—"}
                  </p>
                </div>

                <div className={styles.fieldGroup}>
                  <p className={styles.fieldLabel}>Status</p>
                  <span
                    className={
                      targetCharacter?.isAlive !== false
                        ? styles.statusAlive
                        : styles.statusDead
                    }
                  >
                    {targetCharacter?.isAlive !== false ? "Active" : "Eliminated"}
                  </span>
                </div>
              </div>
            </aside>

            {/* ── Right panel: Communication Log ── */}
            <main className={styles.rightPanel}>
              <div className={styles.logHeader}>
                <h1 className={styles.logTitle}>Communication Log</h1>
                <p className={styles.logSubtitle}>All messages and transmissions</p>
              </div>

              <div className={styles.messageList}>
                {messages.length === 0 ? (
                  <p className={styles.emptyLog}>No messages yet.</p>
                ) : (
                  messages.map((msg) => {
                    const isMine = msg.creatorId === myCharacterId;
                    const senderName = isMine
                      ? "You"
                      : (targetCharacter?.name ?? "Unknown");

                    return (
                      <div key={msg.id} className={styles.messageCard}>
                        <div className={styles.messageHeader}>
                          <span className={styles.messageSender}>{senderName}</span>
                          {isMine && msg.status === CommsStatus.ACCEPTED && (
                            <span className={styles.badgeSent}>
                              <CheckCircleOutlined /> Sent
                            </span>
                          )}
                          {isMine && msg.status === CommsStatus.FAILED && (
                            <span className={styles.badgeFailed}>
                              <CloseCircleOutlined /> Failed
                            </span>
                          )}
                          {isMine && msg.status === CommsStatus.REJECTED && (
                            <span className={styles.badgeFailed}>
                              <CloseCircleOutlined /> Rejected
                            </span>
                          )}
                          {isMine && msg.status === CommsStatus.PENDING && (
                            <span className={styles.badgePending}>Pending</span>
                          )}
                        </div>

                        <div className={styles.messageTimestamp}>
                          <CalendarOutlined className={styles.calIcon} />
                          <span>{formatDate(msg.createdAt)}</span>
                        </div>

                        <p className={styles.messageBody}>{msg.body}</p>

                        {isMine &&
                          (msg.status === CommsStatus.FAILED ||
                            msg.status === CommsStatus.REJECTED) &&
                          msg.reason && (
                            <div className={styles.failureBox}>
                              <div className={styles.failureHeader}>
                                <ExclamationCircleOutlined />
                                <span>Failure Reason</span>
                              </div>
                              <p className={styles.failureReason}>{msg.reason}</p>
                            </div>
                          )}
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
                  onClick={() =>
                    router.push(
                      `/scenarios/${scenarioId}/player/communicate?recipient=${targetCharId}`,
                    )
                  }
                >
                  New Message
                </Button>
              </div>
            </main>
          </div>
        </Spin>
      </div>
    </ConfigProvider>
  );
}
