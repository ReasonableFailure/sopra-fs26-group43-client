"use client";

import { useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  App,
  Avatar,
  Button,
  ConfigProvider,
  Modal,
  Spin,
  Table,
  theme,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { UserOutlined } from "@ant-design/icons";

import { useAuth } from "@/hooks/useAuth";
import { useApi } from "@/hooks/useApi";
import { usePolling } from "@/hooks/usePolling";

import { CharacterService } from "@/api/characterService";
import type { Character } from "@/types/character";

import styles from "@/styles/playerTable.module.css";
import { useDirector } from "@/hooks/useDirector";
import { usePlayerRole } from "@/hooks/usePlayerRole";

export default function PlayerStatisticsPage() {
  const { isAuthenticated, authReady, userId, userIdReady } = useAuth();
  const router = useRouter();
  const params = useParams();
  const scenarioId = Number(params.id);
  const { directorToken } = useDirector(scenarioId);
  const { message } = App.useApp();
  const directorAuth = directorToken ? `Director ${directorToken}` : "Wrong";
  const [modal, contextHolder] = Modal.useModal();

  const api = useApi();
  const characterService = useMemo(
    () => new CharacterService(api),
    [api],
  );

  const handleKill = (character: Character) => {
    modal.confirm({
      title: `Eliminate ${character.name}?`,
      content: "This action cannot be undone.",
      okText: "Kill",
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await characterService.updateCharacter(
            character.id!,
            { alive: false },
            directorAuth,
          );
          message.success({
            content: `${character.name} eliminated`,
            style: {
              color: "#111827",
            },
          });
        } catch {
          message.error({
            content: "Failed to eliminate character",
            style: {
              color: "#111827",
            },
          });
        }
      },
    });
  };

  const enabled = isAuthenticated && !!scenarioId;

  // GET /characters/{scenarioId} requires Bearer (see PlayerService.validate).
  const { data: characters, loading } = usePolling<Character[]>(
    () => characterService.getCharactersByScenario(scenarioId, directorAuth),
    5000,
    enabled,
  );

  useEffect(() => {
    if (authReady && !isAuthenticated) {
      router.replace("/login");
    }
    if (!userIdReady) {
      return;
    } else if (
      userIdReady &&
      globalThis.localStorage[`playerRole_${userId}`] !== '"director"'
    ) { //this is so hacky... but it works
      alert("Only a director may access this view!");
      router.replace(`/scenarios/${scenarioId}/lobby`);
    }
  }, [authReady, isAuthenticated, userId, userIdReady, router]);

  if (!authReady || !isAuthenticated) return null;

  const columns: ColumnsType<Character> = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
    },
    {
      title: "Directives",
      dataIndex: "numberDirectives",
      key: "numberDirectives",
    },
    {
      title: "Messages Sent",
      dataIndex: "numberMessages",
      key: "numberMessages",
    },
    {
      title: "Pronouncements",
      dataIndex: "numberPronouncements",
      key: "numberPronouncements",
    },
    {
      title: "Total Text Length",
      dataIndex: "totalTextLength",
      key: "totalTextLength",
    },
    {
      title: "Kill",
      key: "kill",
      render: (_, record) => {
        if (!record.alive) {
          return (
            <span style={{ color: "#6b7280", fontWeight: 500 }}>
              Dead
            </span>
          );
        }

        return (
          <Button danger onClick={() => handleKill(record)}>
            Kill
          </Button>
        );
      },
    },
  ];

  return (
    <ConfigProvider
      theme={{
        algorithm: theme.defaultAlgorithm,
        token: {
          colorBgContainer: "#ffffff",
          colorText: "#111827",
          colorBorder: "#e5e7eb",
          colorPrimary: "#4f46e5",
          borderRadius: 8,
        },
      }}
    >
      <div className={styles.pageRoot}>
        {contextHolder}
        {/* NAVBAR */}
        <nav className={styles.navbar}>
          <div className={styles.navLeft}>
            <div className={styles.logoMark} />
            <span className={styles.navTitle}>
              Player Overview
            </span>
          </div>

          <div className={styles.navRight}>
            <Button
              onClick={() => router.push(`/scenarios/${scenarioId}`)}
            >
              Back to Dashboard
            </Button>
            <Avatar icon={<UserOutlined />} />
          </div>
        </nav>

        <main className={styles.pageBody}>
          <Spin spinning={loading}>
            <div className={styles.contentWrapper}>
              {/* TABLE */}
              <div className={styles.card}>
                <Table
                  dataSource={characters ?? []}
                  columns={columns}
                  rowKey="id"
                  pagination={{ pageSize: 8 }}
                />
              </div>
            </div>
          </Spin>
        </main>
      </div>
    </ConfigProvider>
  );
}
