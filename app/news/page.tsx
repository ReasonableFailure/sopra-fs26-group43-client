"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useApi } from "@/hooks/useApi";
import useLocalStorage from "@/hooks/useLocalStorage";
import { Button, Card, Tag, Typography, Spin } from "antd";
import { SettingOutlined, ClockCircleOutlined, FilterOutlined, UserOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

interface NewsItem {
  id: number;
  title: string;
  body: string;
  createdAt: string | null;
  authorId: number | null;
  likes: number | null;
  postURI: string | null;
}

const HARDCODED_NEWS: NewsItem[] = [
  { id: 1, title: "Breaking: Tensions Rise in the Mediterranean", body: "Naval forces have been spotted near the disputed waters, raising concerns among international observers...", createdAt: null, authorId: null, likes: null, postURI: null },
  { id: 2, title: "Official Statement on Trade Relations", body: "We hereby declare our intention to pursue diplomatic channels for resolving the current economic disputes...", createdAt: null, authorId: 1, likes: 12, postURI: null },
  { id: 3, title: "Economic Summit Concludes with Mixed Results", body: "Leaders from major powers concluded their three-day summit with partial agreements on climate policy...", createdAt: null, authorId: null, likes: null, postURI: null },
  { id: 4, title: "Declaration of Neutrality", body: "In light of recent developments, our nation maintains its position of strict neutrality in the ongoing conflict...", createdAt: null, authorId: 2, likes: 8, postURI: null },
  { id: 5, title: "Protests Erupt in Capital City", body: "Thousands gathered in the main square demanding government action on the rising cost of living...", createdAt: null, authorId: null, likes: null, postURI: null },
  { id: 6, title: "Military Readiness Alert", body: "All armed forces are hereby placed on heightened alert status effective immediately...", createdAt: null, authorId: 3, likes: 15, postURI: null },
  { id: 7, title: "Diplomatic Envoy Arrives for Peace Talks", body: "A special envoy from the United Nations has arrived to mediate discussions between conflicting parties...", createdAt: null, authorId: null, likes: null, postURI: null },
];

const AUTHOR_NAMES: Record<number, string> = { 1: "Ambassador Chen Wei", 2: "Prime Minister Sarah Johnson", 3: "General Marcus Stone" };
const TIME_AGO = ["2 hours ago", "3 hours ago", "5 hours ago", "6 hours ago", "8 hours ago", "10 hours ago", "12 hours ago"];

export default function NewsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const scenarioId = searchParams.get("scenarioId") || "5";
  const apiService = useApi();
  const { value: token } = useLocalStorage<string>("token", "");
  const { value: userId } = useLocalStorage<string>("userId", "");
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [initials, setInitials] = useState("JD");

  useEffect(() => {
    if (token) {
      apiService.get<NewsItem[]>(`/news/scenario/${scenarioId}`, token)
        .then(data => setNews(data.length > 0 ? data : HARDCODED_NEWS))
        .catch(() => setNews(HARDCODED_NEWS))
        .finally(() => setLoading(false));
      if (userId) {
        apiService.get<{ username: string }>(`/users/${userId}`, token)
          .then(u => { if (u.username) setInitials(u.username.slice(0, 2).toUpperCase()); })
          .catch(() => {});
      }
    } else {
      setNews(HARDCODED_NEWS);
      setLoading(false);
    }
  }, [token, scenarioId]);

  return (
    <div style={{ background: "#f8fafc", minHeight: "100vh" }}>
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "0 16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 0", borderBottom: "1px solid #e2e8f0" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ background: "#6c5ce7", borderRadius: 8, width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <SettingOutlined style={{ color: "#fff", fontSize: 16 }} />
            </div>
            <Text strong style={{ fontSize: 16, color: "#1a1a2e" }}>News & Pronouncements</Text>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <Button onClick={() => router.back()}>Back to Dashboard</Button>
            <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#6c5ce7", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 13 }}>{initials}</div>
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginTop: 24, marginBottom: 16 }}>
          <div>
            <Title level={2} style={{ color: "#1a1a2e", marginBottom: 4 }}>The Trojan War</Title>
            <Text style={{ color: "#64748b" }}>Stay updated with the latest developments</Text>
          </div>
          <Button icon={<FilterOutlined />}>Filter</Button>
        </div>

        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: 60 }}><Spin size="large" /></div>
        ) : (
          <div>
            {news.map((item, i) => (
              <Card key={item.id} style={{ marginBottom: 12, borderRadius: 10, border: "1px solid #e2e8f0", background: "#fff" }} bodyStyle={{ padding: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                      {item.authorId ? (
                        <>
                          <Tag color="purple" style={{ fontSize: 11 }}>Pronouncement</Tag>
                          <UserOutlined style={{ color: "#6c5ce7", fontSize: 11 }} />
                          <Text style={{ fontSize: 12, color: "#6c5ce7" }}>{AUTHOR_NAMES[item.authorId] || `Author #${item.authorId}`}</Text>
                        </>
                      ) : (
                        <Tag color="blue" style={{ fontSize: 11 }}>News Story</Tag>
                      )}
                    </div>
                    <Text strong style={{ color: "#1a1a2e", fontSize: 14 }}>{item.title}</Text>
                    <br />
                    <Text style={{ fontSize: 13, color: "#64748b" }}>{item.body}</Text>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 4, color: "#94a3b8", fontSize: 12, whiteSpace: "nowrap", marginLeft: 12 }}>
                    <ClockCircleOutlined />
                    <span>{item.createdAt ? new Date(item.createdAt).toLocaleString() : TIME_AGO[i % TIME_AGO.length]}</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
