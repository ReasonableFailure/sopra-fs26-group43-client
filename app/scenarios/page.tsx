"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Button,
  ConfigProvider,
  Dropdown,
  message,
  Modal,
  Spin,
  Tabs,
  Tag,
  theme,
} from "antd";
import type { MenuProps } from "antd";
import { MoreOutlined } from "@ant-design/icons";
import { useAuth } from "@/hooks/useAuth";
import { useApi } from "@/hooks/useApi";
import { useScenarios } from "@/hooks/useScenarios";
import { useEngagedScenarios } from "@/hooks/useEngagedScenarios";
import { ScenarioService } from "@/api/scenarioService";
import type { Scenario } from "@/types/scenario";
import { ScenarioStatus } from "@/types/scenario";
import type { Engagement, RoleType } from "@/types/engagement";
import { routeForEngagement } from "@/utils/engagementRouting";
import { UserAvatarMenu } from "@/components/UserAvatarMenu";
import { NavLogo } from "@/components/NavLogo";
import styles from "@/styles/scenarios.module.css";

const ROLE_COLORS: Record<RoleType, string> = {
  DIRECTOR: "purple",
  BACKROOMER: "geekblue",
  CHARACTER: "green",
};

const STATUS_COLORS: Record<ScenarioStatus, string> = {
  [ScenarioStatus.UNSTARTED]: "default",
  [ScenarioStatus.UNFROZEN]: "processing",
  [ScenarioStatus.FROZEN]: "warning",
  [ScenarioStatus.COMPLETED]: "default",
};

// User-facing progress label. FROZEN is collapsed into "In Progress"
// because, from a viewer's perspective, the scenario is still actively
// being played — it's just temporarily paused by the director.
const STATUS_PROGRESS_LABEL: Record<ScenarioStatus, string> = {
  [ScenarioStatus.UNSTARTED]: "Not Started",
  [ScenarioStatus.FROZEN]: "In Progress",
  [ScenarioStatus.UNFROZEN]: "In Progress",
  [ScenarioStatus.COMPLETED]: "Completed",
};

const STATUS_PROGRESS_COLOR: Record<ScenarioStatus, string> = {
  [ScenarioStatus.UNSTARTED]: "default",
  [ScenarioStatus.FROZEN]: "processing",
  [ScenarioStatus.UNFROZEN]: "processing",
  [ScenarioStatus.COMPLETED]: "success",
};

function ScenarioCard({
  scenario,
  engagement,
  onDelete,
}: {
  scenario: Scenario;
  engagement: Engagement | null;
  onDelete: (scenario: Scenario) => void;
}) {
  const router = useRouter();

  // Only the Director of this scenario can delete it. Surface the option
  // only when the user has a Director engagement here; the backend also
  // enforces this and will reject mismatched tokens.
  const isDirector = engagement?.roleType === "DIRECTOR";

  const moreMenu: MenuProps | undefined = isDirector
    ? {
      items: [
        {
          key: "delete",
          label: "Delete",
          danger: true,
          onClick: () => onDelete(scenario),
        },
      ],
    }
    : undefined;

  const handleView = () =>
    routeForEngagement(
      engagement,
      scenario.id,
      router,
      "push",
      scenario.status,
    );

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <h2 className={styles.cardTitle}>{scenario.title}</h2>
        {moreMenu && (
          <Dropdown menu={moreMenu} trigger={["click"]}>
            <Button
              type="text"
              icon={<MoreOutlined />}
              aria-label="More options"
            />
          </Dropdown>
        )}
      </div>
      <div className={styles.cardMeta}>
        <Tag color={STATUS_PROGRESS_COLOR[scenario.status]}>
          {STATUS_PROGRESS_LABEL[scenario.status]}
        </Tag>
      </div>
      <p className={styles.cardDesc}>
        {scenario.description ?? "No description provided."}
      </p>
      <div className={styles.cardFooter}>
        <Button type="link" onClick={handleView}>
          {engagement ? "Resume" : "View"}
        </Button>
      </div>
    </div>
  );
}

function EngagementCard({ engagement }: { engagement: Engagement }) {
  const router = useRouter();

  const handleOpen = () =>
    routeForEngagement(engagement, engagement.scenarioId, router);

  const roleLabel =
    engagement.roleType === "CHARACTER" && engagement.characterName
      ? `Character · ${engagement.characterName}`
      : engagement.roleType === "DIRECTOR"
      ? "Director"
      : "Backroomer";

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <h2 className={styles.cardTitle}>{engagement.scenarioTitle}</h2>
      </div>
      <div className={styles.cardMeta}>
        <Tag color={ROLE_COLORS[engagement.roleType]}>{roleLabel}</Tag>
        <Tag color={STATUS_COLORS[engagement.scenarioStatus]}>
          {engagement.scenarioStatus}
        </Tag>
        {engagement.finishTime && (
          <span className={styles.metaSecondary}>
            Ended {new Date(engagement.finishTime).toLocaleDateString()}
          </span>
        )}
      </div>
      <div className={styles.cardFooter}>
        <Button type="link" onClick={handleOpen}>
          Open
        </Button>
      </div>
    </div>
  );
}

export default function ScenariosPage() {
  const { token, userId, isAuthenticated, authReady } = useAuth();

  const router = useRouter();
  const api = useApi();
  const scenarioService = useMemo(() => new ScenarioService(api), [api]);
  const [messageApi, messageContextHolder] = message.useMessage();
  const [modal, modalContextHolder] = Modal.useModal();
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const { scenarios, loading, error } = useScenarios();
  const {
    engagements,
    loading: engagementsLoading,
    error: engagementsError,
    refetch: refetchEngagements,
  } = useEngagedScenarios(userId, token);

  const [localScenarios, setLocalScenarios] = useState<Scenario[] | null>(null);
  useEffect(() => {
    setLocalScenarios(scenarios);
  }, [scenarios]);

  const engagementByScenario = useMemo(() => {
    const map = new Map<number, Engagement>();
    (engagements ?? []).forEach((e) => map.set(e.scenarioId, e));
    return map;
  }, [engagements]);

  useEffect(() => {
    if (authReady && !isAuthenticated) {
      router.replace("/login");
    }
  }, [authReady, isAuthenticated, router]);

  if (!authReady || !isAuthenticated) return null;

  const handleDelete = (scenario: Scenario) => {
    modal.confirm({
      title: `Delete scenario "${scenario.title}"?`,
      content: "This cannot be undone.",
      okText: "Delete",
      okButtonProps: { danger: true },
      onOk: async () => {
        // Backend's DELETE /scenarios/{id} requires a Director token that
        // matches THIS scenario's director — not the user's bearer token.
        let directorToken: string | null = null;
        try {
          const stored = globalThis.localStorage.getItem(
            `scenario_${scenario.id}_directorToken`,
          );
          directorToken = stored ? (JSON.parse(stored) as string) : null;
        } catch {
          directorToken = null;
        }
        if (!directorToken) {
          messageApi.error(
            "Only the director can delete this scenario.",
          );
          return;
        }
        setDeletingId(scenario.id);
        try {
          await scenarioService.deleteScenario(
            scenario.id,
            `Director ${directorToken}`,
          );
          setLocalScenarios((prev) =>
            (prev ?? []).filter((s) => s.id !== scenario.id)
          );
          await refetchEngagements();
          messageApi.success("Scenario deleted");
        } catch (err) {
          messageApi.error(
            err instanceof Error ? err.message : "Failed to delete scenario",
          );
        } finally {
          setDeletingId(null);
        }
      },
    });
  };

  const allTab = (
    <>
      {error && <p className={styles.errorText}>{error}</p>}
      <Spin spinning={loading || deletingId !== null}>
        <div className={styles.cardList}>
          {!loading && (localScenarios?.length ?? 0) === 0 && (
            <p className={styles.emptyText}>
              No scenarios yet. Create your first one above.
            </p>
          )}
          {(localScenarios ?? []).map((scenario) => (
            <ScenarioCard
              key={scenario.id}
              scenario={scenario}
              engagement={engagementByScenario.get(scenario.id) ?? null}
              onDelete={handleDelete}
            />
          ))}
        </div>
      </Spin>
    </>
  );

  const myCrisesTab = (
    <>
      {engagementsError && (
        <p className={styles.errorText}>{engagementsError}</p>
      )}
      <Spin spinning={engagementsLoading}>
        <div className={styles.cardList}>
          {!engagementsLoading && (engagements?.length ?? 0) === 0 && (
            <p className={styles.emptyText}>
              You haven&apos;t joined any scenarios yet. Pick one from All
              Scenarios to get started.
            </p>
          )}
          {(engagements ?? []).map((engagement) => (
            <EngagementCard
              key={`${engagement.scenarioId}-${engagement.playerId}`}
              engagement={engagement}
            />
          ))}
        </div>
      </Spin>
    </>
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
          borderRadius: 12,
          fontSize: 14,
        },
        components: {
          Button: {
            colorPrimary: "#4f46e5",
            algorithm: true,
          },
        },
      }}
    >
      {messageContextHolder}
      {modalContextHolder}
      <div className={styles.pageRoot}>
        <nav className={styles.navbar}>
          <div className={styles.navLeft}>
            <NavLogo className={styles.logoMark} />
            <span className={styles.navTitle}>Crisis Manager</span>
          </div>
          <div className={styles.navRight}>
            <Button
              type="primary"
              onClick={() => router.push("/scenarios/create")}
            >
              Create New Scenario
            </Button>
            <UserAvatarMenu avatarClassName={styles.avatar} />
          </div>
        </nav>

        <main className={styles.pageBody}>
          <div className={styles.contentWrapper}>
            <div className={styles.pageHeader}>
              <h1 className={styles.heading}>Scenarios</h1>
              <p className={styles.subheading}>
                Browse all scenarios or jump back into the ones you&apos;re
                playing.
              </p>
            </div>

            <Tabs
              defaultActiveKey="all"
              items={[
                { key: "all", label: "All Scenarios", children: allTab },
                { key: "mine", label: "My Scenarios", children: myCrisesTab },
              ]}
            />
          </div>
        </main>
      </div>
    </ConfigProvider>
  );
}
