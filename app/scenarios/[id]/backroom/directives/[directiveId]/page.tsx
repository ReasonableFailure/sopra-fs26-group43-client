"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button, ConfigProvider, Spin, theme } from "antd";
import {
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { useAuth } from "@/hooks/useAuth";
import { useApi } from "@/hooks/useApi";
import { CharacterService } from "@/api/characterService";
import { DirectiveService } from "@/api/directiveService";
import type { Character } from "@/types/character";
import type { Directive } from "@/types/directive";
import { CommsStatus } from "@/types/directive";
import styles from "@/styles/directiveDetail.module.css";

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
      return <span className={styles.badgeRejected}>Denied</span>;
    case CommsStatus.FAILED:
      return <span className={styles.badgeRejected}>Failed</span>;
    default:
      return <span className={styles.badgePending}>Pending Review</span>;
  }
}

export default function BackroomDirectiveDetailPage() {
  const { token, isAuthenticated, authReady } = useAuth();
  const router = useRouter();
  const params = useParams();
  const scenarioId = Number(params.id);
  const directiveId = Number(params.directiveId);

  const api = useApi();
  const directiveService = useMemo(() => new DirectiveService(api), [api]);
  const characterService = useMemo(() => new CharacterService(api), [api]);

  const [directive, setDirective] = useState<Directive | null>(null);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authReady && !isAuthenticated) router.replace("/login");
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (!isAuthenticated || !scenarioId || !directiveId) return;
    let cancelled = false;
    setLoading(true);
    Promise.all([
      directiveService.getDirectiveById(directiveId, `Backroomer ${token}`),
      characterService.getCharactersByScenario(
        scenarioId,
        `Backroomer ${token}`,
      ),
    ])
      .then(([dir, chars]) => {
        if (cancelled) return;
        setDirective(dir);
        setCharacters(chars);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [
    isAuthenticated,
    scenarioId,
    directiveId,
    token,
    directiveService,
    characterService,
  ]);

  if (!authReady || !isAuthenticated) return null;

  const creatorName =
    characters.find((c) => c.id === directive?.creatorId)?.name ?? "Unknown";

  const isResolved = directive?.status === CommsStatus.ACCEPTED ||
    directive?.status === CommsStatus.REJECTED ||
    directive?.status === CommsStatus.FAILED;

  const statusIconClass = directive?.status === CommsStatus.ACCEPTED
    ? styles.sectionIconGreen
    : directive?.status === CommsStatus.REJECTED ||
        directive?.status === CommsStatus.FAILED
    ? styles.sectionIconRed
    : styles.sectionIconGray;

  const approvalText = directive?.status === CommsStatus.ACCEPTED
    ? "This directive has been approved."
    : directive?.status === CommsStatus.REJECTED
    ? "This directive has been denied."
    : directive?.status === CommsStatus.FAILED
    ? "This directive failed to be processed."
    : "This directive is awaiting a response.";

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
        <nav className={styles.navbar}>
          <div className={styles.navLeft}>
            <div className={styles.logoMark} aria-hidden="true" />
            <span className={styles.navTitle}>Backroom Dashboard</span>
          </div>
          <div className={styles.navRight}>
            <Button
              onClick={() => router.push(`/scenarios/${scenarioId}/backroom`)}
            >
              Back to Dashboard
            </Button>
          </div>
        </nav>

        <Spin spinning={loading}>
          <div className={styles.pageBody}>
            <div className={styles.pageHeader}>
              <div>
                <h1 className={styles.pageTitle}>Directive Details</h1>
                <p className={styles.pageSubtitle}>
                  Review the submitted directive and its response
                </p>
              </div>
              {directive?.status === CommsStatus.PENDING && (
                <Button
                  type="primary"
                  onClick={() =>
                    router.push(
                      `/scenarios/${scenarioId}/backroom/communicate?type=response&directiveId=${directiveId}`,
                    )}
                >
                  Respond
                </Button>
              )}
            </div>

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
                <div className={styles.metaRight}>
                  <UserOutlined />
                  Submitted by {creatorName}
                </div>
              </div>

              {/* Title & body */}
              <h2 className={styles.directiveTitle}>
                {directive?.title ?? "Untitled Directive"}
              </h2>
              <p className={styles.directiveBody}>{directive?.body ?? ""}</p>

              {/* Approval Status */}
              <div className={styles.sectionRow}>
                <div className={`${styles.sectionIcon} ${statusIconClass}`}>
                  {directive?.status === CommsStatus.ACCEPTED
                    ? <CheckCircleOutlined />
                    : directive?.status === CommsStatus.REJECTED ||
                        directive?.status === CommsStatus.FAILED
                    ? <CloseCircleOutlined />
                    : <ClockCircleOutlined />}
                </div>
                <div className={styles.sectionContent}>
                  <p className={styles.sectionTitle}>Approval Status</p>
                  <p className={styles.sectionText}>{approvalText}</p>
                  {directive?.response && (
                    <>
                      <p
                        className={styles.sectionTitle}
                        style={{ marginTop: 16 }}
                      >
                        Response Message
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
