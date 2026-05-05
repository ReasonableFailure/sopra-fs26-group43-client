"use client";

import { useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Avatar,
  Button,
  ConfigProvider,
  message,
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

export default function PlayerStatisticsPage() {
  const { token, isAuthenticated, authReady } = useAuth();
  const router = useRouter();
  const params = useParams();
  const scenarioId = Number(params.id);

  const api = useApi();
  const characterService = useMemo(
    () => new CharacterService(api),
    [api],
  );

  const handleKill = (character: Character) => {
    Modal.confirm({
      title: `Eliminate ${character.name}?`,
      content: "This action cannot be undone.",
      okText: "Kill",
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await characterService.updateCharacter(
            character.id!,
            { alive: false },
            token,
          );
          message.success(`${character.name} eliminated`);
        } catch {
          message.error("Failed to eliminate character");
        }
      },
    });
  };

  const enabled = isAuthenticated && !!scenarioId;

  const { data: characters, loading } = usePolling<Character[]>(
    () =>
      characterService.getCharactersByScenario(
        scenarioId,
        token,
      ),
    5000,
    enabled,
  );

  useEffect(() => {
    if (authReady && !isAuthenticated) {
      router.replace("/login");
    }
  }, [authReady, isAuthenticated, router]);

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
        {/* NAVBAR */}
        <nav className={styles.navbar}>
          <div className={styles.navLeft}>
            <div className={styles.logoMark} />
            <span className={styles.navTitle}>
              Player Statistics
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
