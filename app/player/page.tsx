"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useApi } from "@/hooks/useApi";
import useLocalStorage from "@/hooks/useLocalStorage";
import { Button, Card, Typography, List, Tag, Avatar } from "antd";
import { SettingOutlined, BellOutlined, StarOutlined, RightOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

const DIRECTIVES = [
  { title: "Send a troop to Rome.", day: "Day 8", status: "Rejected", note: "weather condition is not..." },
  { title: "Send a troop to Rome.", day: "Day 7", status: "Approved", note: "" },
  { title: "Send a troop to Rome.", day: "Day 6", status: "Approved", note: "" },
];

const NEWS_ITEMS = [
  "Day 8: A placeholder for a news message.",
  "Day 7: Another placeholder for news.",
  "Day 6: Yet another placeholder for a news message.",
  "Day 5: Yet another placeholder for a news message.",
  "Day 5: Yet another placeholder for a news message.",
  "Day 4: Yet another placeholder for a news message.",
  "Day 3: Yet another placeholder for a news message.",
  "Day 2: Yet another placeholder for a news message.",
  "Day 1: Yet another placeholder for a news message.",
  "Day 0: All players ready. Game starts.",
];

const OTHER_CHARS = [
  { initials: "DK", color: "#1a1a2e", name: "Dark Knight", sub: "Level 45 • Warrior" },
  { initials: "LM", color: "#f59e0b", name: "Light Mage", sub: "Level 38 • Mage" },
  { initials: "SR", color: "#ef4444", name: "Soul Reaper", sub: "Level 50 • Assassin" },
];

export default function PlayerPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const scenarioId = searchParams.get("scenarioId") || "5";
  const characterId = searchParams.get("characterId");

  return (
    <div style={{ background: "#f8fafc", minHeight: "100vh" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 0", borderBottom: "1px solid #e2e8f0" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ background: "#6c5ce7", borderRadius: 8, width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <SettingOutlined style={{ color: "#fff", fontSize: 16 }} />
            </div>
            <Text strong style={{ fontSize: 16, color: "#1a1a2e" }}>Player Dashboard</Text>
          </div>
          <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#6c5ce7", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 13 }}>JD</div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "220px 1fr 220px", gap: 16, paddingTop: 20 }}>
          {/* Left: Directives */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <Text strong style={{ color: "#1a1a2e" }}>My Directives</Text>
              <Button type="primary" size="small" onClick={() => router.push(`/editor?scenarioId=${scenarioId}&type=directive`)}>New Directive</Button>
            </div>
            {DIRECTIVES.map((d, i) => (
              <Card key={i} style={{ marginBottom: 8, border: "1px solid #e2e8f0", borderRadius: 8, cursor: "pointer" }} bodyStyle={{ padding: "10px 12px" }}
                onClick={() => router.push(`/directive/${i + 1}`)}>
                <Text strong style={{ fontSize: 13, color: "#1a1a2e" }}>{d.title}</Text>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 2 }}>
                  <Text style={{ fontSize: 12, color: "#64748b" }}>{d.day}</Text>
                </div>
                <Text style={{ fontSize: 12, color: d.status === "Approved" ? "#22c55e" : "#ef4444" }}>{d.status}</Text>
                {d.note && <Text style={{ fontSize: 11, color: "#94a3b8", display: "block" }}>{d.note}</Text>}
              </Card>
            ))}
          </div>

          {/* Center: News + Action Points */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <Text strong style={{ color: "#1a1a2e", fontSize: 15 }}>News Feed</Text>
              <Button type="primary" size="small" onClick={() => router.push(`/editor?scenarioId=${scenarioId}&type=pronouncement`)}>Post Pronouncement</Button>
            </div>
            <Text style={{ fontSize: 12, color: "#64748b", display: "block", marginBottom: 10 }}>Stay updated with the latest from your fellow players</Text>
            <Card style={{ border: "1px solid #e2e8f0", borderRadius: 10, background: "#fff", marginBottom: 16 }} bodyStyle={{ padding: "12px 16px" }}>
              {NEWS_ITEMS.map((n, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: i < NEWS_ITEMS.length - 1 ? "1px solid #f1f5f9" : "none" }}>
                  <Text style={{ fontSize: 13, color: "#1a1a2e" }}>{n}</Text>
                  <StarOutlined style={{ color: "#94a3b8", fontSize: 13 }} />
                </div>
              ))}
            </Card>

            <Text strong style={{ color: "#1a1a2e", fontSize: 15 }}>My Action Points</Text>
            <Text style={{ display: "block", fontSize: 12, color: "#64748b", marginBottom: 10 }}>Purchase action points with likes to your pronouncements</Text>
            <Card style={{ border: "1px solid #e2e8f0", borderRadius: 10, background: "#fff" }} bodyStyle={{ padding: 16 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: 8, alignItems: "center" }}>
                <Card style={{ border: "1px solid #e2e8f0", borderRadius: 8, textAlign: "center" }} bodyStyle={{ padding: 12 }}>
                  <Text strong style={{ color: "#1a1a2e" }}>Likes</Text>
                  <br />
                  <Title level={3} style={{ color: "#1a1a2e", margin: 0 }}>21</Title>
                </Card>
                <div style={{ textAlign: "center" }}>
                  <Button type="primary" size="small">Buy</Button>
                  <div style={{ borderTop: "1px solid #94a3b8", margin: "4px 0" }} />
                  <Text style={{ fontSize: 11, color: "#94a3b8" }}>with 10 likes</Text>
                </div>
                <Card style={{ border: "1px solid #e2e8f0", borderRadius: 8, textAlign: "center" }} bodyStyle={{ padding: 12 }}>
                  <Text strong style={{ color: "#1a1a2e" }}>Action Points</Text>
                  <br />
                  <Title level={3} style={{ color: "#1a1a2e", margin: 0 }}>4</Title>
                </Card>
              </div>
            </Card>
          </div>

          {/* Right: Character List */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <Text strong style={{ color: "#1a1a2e" }}>Character List</Text>
              <BellOutlined style={{ color: "#94a3b8", fontSize: 16 }} />
            </div>
            {OTHER_CHARS.map((c, i) => (
              <Card key={i} style={{ marginBottom: 8, border: "1px solid #e2e8f0", borderRadius: 8 }} bodyStyle={{ padding: "10px 12px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Avatar style={{ background: c.color, flexShrink: 0 }}>{c.initials}</Avatar>
                  <div style={{ flex: 1 }}>
                    <Text strong style={{ fontSize: 13, color: "#1a1a2e" }}>{c.name}</Text>
                    <br />
                    <Text style={{ fontSize: 11, color: "#64748b" }}>{c.sub}</Text>
                  </div>
                  <Button type="primary" size="small" onClick={() => router.push(`/chat?scenarioId=${scenarioId}&with=${i}`)}>Message</Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
