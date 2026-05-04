"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Avatar, Button, ConfigProvider, Select, Spin, theme } from "antd";
import {
  ClockCircleOutlined,
  FilterOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { useAuth } from "@/hooks/useAuth";
import { useApi } from "@/hooks/useApi";
import { NewsService } from "@/api/newsService";
import { CharacterService } from "@/api/characterService";
import { ScenarioService } from "@/api/scenarioService";
import type { NewsGetDTO } from "@/types/news";
import type { Character } from "@/types/character";
import styles from "@/styles/newsPage.module.css";
import { usePlayerRole } from "@/hooks/usePlayerRole";

type FilterType = "all" | "news" | "pronouncement";

function timeAgo(iso: string | null): string {
  if (!iso) return "";
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} minute${mins === 1 ? "" : "s"} ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hour${hrs === 1 ? "" : "s"} ago`;
  const days = Math.floor(hrs / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}

function TypeBadge({ isPronouncement }: { isPronouncement: boolean }) {
  return isPronouncement
    ? <span className={styles.badgePronouncement}>Pronouncement</span>
    : <span className={styles.badgeNews}>News Story</span>;
}

interface FeedCardProps {
  item: NewsGetDTO;
  authorName: string | null;
}

function FeedCard({ item, authorName }: FeedCardProps) {
  const isPronouncement = item.authorId !== null;
  return (
    <div className={styles.card}>
      <div className={styles.cardTop}>
        <div className={styles.cardTopLeft}>
          <TypeBadge isPronouncement={isPronouncement} />
          {isPronouncement && authorName && (
            <span className={styles.authorRow}>
              <UserOutlined className={styles.authorIcon} />
              <span className={styles.authorName}>{authorName}</span>
            </span>
          )}
        </div>
        <span className={styles.timestamp}>
          <ClockCircleOutlined className={styles.clockIcon} />
          {timeAgo(item.createdAt)}
        </span>
      </div>
      <h2 className={styles.cardTitle}>{item.title}</h2>
      <p className={styles.cardBody}>{item.body}</p>
    </div>
  );
}

export default function NewsPage() {
  const { token, isAuthenticated, authReady } = useAuth();
  const router = useRouter();
  const params = useParams();
  const scenarioId = Number(params.id);
  const { playerRole } = usePlayerRole();

  const api = useApi();
  const newsService = useMemo(() => new NewsService(api), [api]);
  const characterService = useMemo(() => new CharacterService(api), [api]);
  const scenarioService = useMemo(() => new ScenarioService(api), [api]);

  const [newsItems, setNewsItems] = useState<NewsGetDTO[]>([]);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [scenarioTitle, setScenarioTitle] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>("all");

  useEffect(() => {
    if (authReady && !isAuthenticated) router.replace("/login");
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (!isAuthenticated || !scenarioId) return;
    let cancelled = false;
    setLoading(true);

    Promise.all([
      newsService.getNewsByScenario(scenarioId, `${playerRole} ${token}`),
      characterService.getCharactersByScenario(
        scenarioId,
        `${playerRole} ${token}`,
      ),
      scenarioService.getScenarioById(scenarioId, `${playerRole} ${token}`),
    ])
      .then(([news, chars, scenario]) => {
        if (cancelled) return;
        setNewsItems(news);
        setCharacters(chars);
        setScenarioTitle(scenario.title);
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
    token,
    newsService,
    characterService,
    scenarioService,
    playerRole,
  ]);

  if (!authReady || !isAuthenticated) return null;

  const authorName = (authorId: number | null): string | null => {
    if (authorId === null) return null;
    return characters.find((c) => c.id === authorId)?.name ?? null;
  };

  const filtered = newsItems.filter((item) => {
    if (filter === "news") return item.authorId === null;
    if (filter === "pronouncement") return item.authorId !== null;
    return true;
  });

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
            <span className={styles.navTitle}>News &amp; Pronouncements</span>
          </div>
          <div className={styles.navRight}>
            <Button onClick={() => router.back()}>
              Back to Dashboard
            </Button>
            <Avatar icon={<UserOutlined />} className={styles.avatar} />
          </div>
        </nav>

        <main className={styles.pageBody}>
          <div className={styles.contentWrapper}>
            <div className={styles.pageHeader}>
              <div>
                <h1 className={styles.heading}>
                  {scenarioTitle ?? "Loading…"}
                </h1>
                <p className={styles.subheading}>
                  Stay updated with the latest developments
                </p>
              </div>
              <Select
                value={filter}
                onChange={(v) => setFilter(v as FilterType)}
                suffixIcon={<FilterOutlined />}
                style={{ width: 140 }}
                options={[
                  { value: "all", label: "All" },
                  { value: "news", label: "News Story" },
                  { value: "pronouncement", label: "Pronouncement" },
                ]}
              />
            </div>

            <Spin spinning={loading}>
              <div className={styles.feed}>
                {!loading && filtered.length === 0 && (
                  <p className={styles.empty}>No items to display.</p>
                )}
                {filtered.map((item) => (
                  <FeedCard
                    key={item.id}
                    item={item}
                    authorName={authorName(item.authorId)}
                  />
                ))}
              </div>
            </Spin>
          </div>
        </main>
      </div>
    </ConfigProvider>
  );
}
