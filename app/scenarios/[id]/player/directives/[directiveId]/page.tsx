"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Avatar, Button, ConfigProvider, Spin, theme } from "antd";
import {
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  InfoCircleOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { useAuth } from "@/hooks/useAuth";
import { useApi } from "@/hooks/useApi";
import { useSelectedCharacter } from "@/hooks/useSelectedCharacter";
import { CharacterService } from "@/api/characterService";
import { DirectiveService } from "@/api/directiveService";
import type { Character } from "@/types/character";
import type { Directive } from "@/types/directive";
import { CommsStatus } from "@/types/directive";
import styles from "@/styles/directiveDetail.module.css";

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

function StatusBadge({ status }: { status: CommsStatus | null }) {
  switch (status) {
    case CommsStatus.ACCEPTED:
      return <span className={styles.badgeApproved}>Approved</span>;
    case CommsStatus.REJECTED:
      return <span className={styles.badgeRejected}>Rejected</span>;
    case CommsStatus.FAILED:
      return <span className={styles.badgeRejected}>Failed</span>;
    default:
      return <span className={styles.badgePending}>Pending Review</span>;
  }
}

function approvalStatusText(status: CommsStatus | null): string {
  switch (status) {
    case CommsStatus.ACCEPTED:
      return "Your directive has been approved by the backroom team and will start to affect the scenario from next round.";
    case CommsStatus.REJECTED:
      return "Your directive has been rejected by the backroom team.";
    case CommsStatus.FAILED:
      return "Your directive failed to be processed.";
    default:
      return "Your directive is awaiting review by the backroom team.";
  }
}

export default function DirectiveDetailPage() {
  const { token, isAuthenticated, authReady } = useAuth();
  const router = useRouter();
  const params = useParams();
  const scenarioId = Number(params.id);
  const directiveId = Number(params.directiveId);

  const api = useApi();
  const directiveService = useMemo(() => new DirectiveService(api), [api]);
  const characterService = useMemo(() => new CharacterService(api), [api]);

  const { characterId } = useSelectedCharacter(scenarioId);
  const [myCharacter, setMyCharacter] = useState<Character | null>(null);
  const [directive, setDirective] = useState<Directive | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authReady && !isAuthenticated) router.replace("/login");
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (!isAuthenticated || !scenarioId || !directiveId) return;
    let cancelled = false;
    setLoading(true);

    const fetchData = async () => {
      try {
        const [dir, chars] = await Promise.all([
          directiveService.getDirectiveById(directiveId, `Role ${token}`),
          characterService.getCharactersByScenario(scenarioId, token),
        ]);
        if (cancelled) return;
        setDirective(dir);
        setMyCharacter(chars.find((c) => c.id === characterId) ?? null);
      } catch {
        // silently degrade
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchData();
    return () => { cancelled = true; };
  }, [isAuthenticated, scenarioId, directiveId, characterId, token, directiveService, characterService]);

  if (!authReady || !isAuthenticated) return null;

  const isResolved =
    directive?.status === CommsStatus.ACCEPTED ||
    directive?.status === CommsStatus.REJECTED ||
    directive?.status === CommsStatus.FAILED;

  const statusIconClass =
    directive?.status === CommsStatus.ACCEPTED
      ? styles.sectionIconGreen
      : directive?.status === CommsStatus.REJECTED || directive?.status === CommsStatus.FAILED
      ? styles.sectionIconRed
      : styles.sectionIconGray;

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
            <Button onClick={() => router.push(`/scenarios/${scenarioId}/player`)}>
              Back to Dashboard
            </Button>
            <Avatar className={styles.navAvatar}>
              {initials(myCharacter?.name ?? null)}
            </Avatar>
          </div>
        </nav>

        <Spin spinning={loading}>
          <div className={styles.pageBody}>
            {/* Page header */}
            <div className={styles.pageHeader}>
              <div>
                <h1 className={styles.pageTitle}>Directive Details</h1>
                <p className={styles.pageSubtitle}>
                  Review your submitted directive and its current status
                </p>
              </div>
              <Button
                type="primary"
                onClick={() =>
                  router.push(`/scenarios/${scenarioId}/player/communicate?type=directive`)
                }
              >
                New Directive
              </Button>
            </div>

            {/* Main card */}
            <div className={styles.card}>
              {/* Status row */}
              <div className={styles.cardMeta}>
                <div className={styles.metaLeft}>
                  <StatusBadge status={directive?.status ?? null} />
                  {directive?.createdAt && (
                    <span className={styles.submittedAt}>
                      <CalendarOutlined />
                      {formatDate(directive.createdAt)}
                    </span>
                  )}
                </div>
                {myCharacter?.name && (
                  <div className={styles.metaRight}>
                    <UserOutlined />
                    Submitted by {myCharacter.name}
                  </div>
                )}
              </div>

              {/* Title & body */}
              <h2 className={styles.directiveTitle}>
                {directive?.title ?? "Untitled Directive"}
              </h2>
              <p className={styles.directiveBody}>
                {directive?.body ?? ""}
              </p>

              {/* Approval Status section */}
              <div className={styles.sectionRow}>
                <div className={`${styles.sectionIcon} ${statusIconClass}`}>
                  {directive?.status === CommsStatus.ACCEPTED ? (
                    <CheckCircleOutlined />
                  ) : directive?.status === CommsStatus.REJECTED ||
                    directive?.status === CommsStatus.FAILED ? (
                    <CloseCircleOutlined />
                  ) : (
                    <ClockCircleOutlined />
                  )}
                </div>
                <div className={styles.sectionContent}>
                  <p className={styles.sectionTitle}>Approval Status</p>
                  <p className={styles.sectionText}>
                    {approvalStatusText(directive?.status ?? null)}
                  </p>
                  {directive?.response && (
                    <>
                      <p className={styles.sectionTitle} style={{ marginTop: 16 }}>
                        Backroom Notes
                      </p>
                      <p className={styles.sectionText}>{directive.response}</p>
                    </>
                  )}
                  {isResolved && directive?.createdAt && (
                    <span className={styles.sectionTimestamp}>
                      <CalendarOutlined />
                      {formatDate(directive.createdAt)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Spin>
      </div>
    </ConfigProvider>
  );
}
