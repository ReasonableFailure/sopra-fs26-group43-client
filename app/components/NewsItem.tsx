"use client";

import { ClockCircleOutlined, UserOutlined } from "@ant-design/icons";
import type { NewsGetDTO } from "@/types/news";
import styles from "@/styles/newsCard.module.css";

function timeAgo(iso: string | null | undefined): string {
  if (!iso) return "";
  const diff = Date.now() - new Date(iso).getTime();
  if (Number.isNaN(diff)) return "";
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min${mins === 1 ? "" : "s"} ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hr${hrs === 1 ? "" : "s"} ago`;
  const days = Math.floor(hrs / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}

interface NewsItemProps {
  item: NewsGetDTO;
  /** Resolved sender name for pronouncements; ignored for news stories. */
  authorName?: string | null;
}

/**
 * Single news-feed entry. Renders identically across Director,
 * Backroomer, and Character dashboards so the visual language is
 * consistent regardless of viewer.
 */
export function NewsItem({ item, authorName }: NewsItemProps) {
  const isPronouncement = item.authorId !== null && item.authorId !== undefined;

  return (
    <article className={styles.newsItem}>
      <div className={styles.newsItemTop}>
        <div className={styles.newsItemTopLeft}>
          <span
            className={isPronouncement
              ? styles.badgePronouncement
              : styles.badgeNews}
          >
            {isPronouncement ? "Pronouncement" : "News Story"}
          </span>
          {isPronouncement && authorName && (
            <span className={styles.newsAuthorRow}>
              <UserOutlined className={styles.newsAuthorIcon} />
              {authorName}
            </span>
          )}
        </div>
        <span className={styles.newsTimestamp}>
          <ClockCircleOutlined />
          {timeAgo(item.createdAt)}
        </span>
      </div>
      <h3 className={styles.newsItemTitle}>{item.title}</h3>
      <p className={styles.newsItemBody}>{item.body}</p>
    </article>
  );
}

/** Optional list wrapper for callers that want the shared list styling. */
export function NewsList({ children }: { children: React.ReactNode }) {
  return <div className={styles.newsList}>{children}</div>;
}
