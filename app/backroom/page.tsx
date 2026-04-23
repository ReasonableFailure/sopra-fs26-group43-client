"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { Button, Card, Tag, Typography, Avatar, List } from "antd";
import { SettingOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

const DIRECTIVES = [
  { initials: "DK", color: "#6c5ce7", name: "Dark Knight", directive: "Send troops to Rome", day: "Day 8", status: "Pending" },
  { initials: "LM", color: "#f59e0b", name: "Light Mage", directive: "Form alliance with Egypt", day: "Day 7", status: "Responded" },
  { initials: "SR", color: "#ef4444", name: "Soul Reaper", directive: "Gather intelligence on enemy", day: "Day 6", status: "Pending" },
  { initials: "SA", color: "#3b82f6", name: "Shadow Archer", directive: "Defend northern border", day: "Day 5", status: "Responded" },
  { initials: "FW", color: "#22c55e", name: "Fire Warrior", directive: "Negotiate trade agreement", day: "Day 4", status: "Pending" },
  { initials: "IM", color: "#8b5cf6", name: "Ice Mage", directive: "Scout enemy territory", day: "Day 3", status: "Responded" },
  { initials: "TK", color: "#f97316", name: "Thunder Knight", directive: "Recruit new soldiers", day: "Day 2", status: "Pending" },
  { initials: "WA", color: "#06b6d4", name: "Wind Assassin", directive: "Sabotage enemy supplies", day: "Day 1", status: "Responded" },
];

const PENDING_MSGS = [
  { initials: "DK", color: "#6c5ce7", name: "Dark Knight", to: "Light Mage", body: "I propose we coordinate our attacks on the eastern front. My troops are ready to move at dawn..." },
  { initials: "SR", color: "#ef4444", name: "Soul Reaper", to: "Shadow Archer", body: "The intelligence I gathered suggests the enemy is planning a major offensive. We should fortify..." },
  { initials: "FW", color: "#22c55e", name: "Fire Warrior", to: "Ice Mage", body: "Your magical support would be invaluable in the upcoming battle. Can we discuss strategy..." },
  { initials: "TK", color: "#f97316", name: "Thunder Knight", to: "Wind Assassin", body: "I need your stealth expertise to infiltrate the enemy camp and gather information about..." },
];

export default function BackroomPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const scenarioId = searchParams.get("scenarioId") || "5";

  return (
    <div style={{ background: "#f8fafc", minHeight: "100vh" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 0", borderBottom: "1px solid #e2e8f0" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ background: "#6c5ce7", borderRadius: 8, width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <SettingOutlined style={{ color: "#fff", fontSize: 16 }} />
            </div>
            <Text strong style={{ fontSize: 16, color: "#1a1a2e" }}>Backroom Dashboard</Text>
          </div>
          <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#6c5ce7", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 13 }}>GM</div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, paddingTop: 20 }}>
          {/* Left: Directives */}
          <div>
            <Title level={3} style={{ color: "#1a1a2e", marginBottom: 4 }}>Directives</Title>
            <Text style={{ color: "#64748b", fontSize: 13, display: "block", marginBottom: 12 }}>Review and manage player directives</Text>
            <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 80px", padding: "8px 16px", borderBottom: "1px solid #e2e8f0" }}>
                <Text style={{ fontSize: 11, color: "#94a3b8", textTransform: "uppercase", fontWeight: 600 }}>PLAYER NAME</Text>
                <Text style={{ fontSize: 11, color: "#94a3b8", textTransform: "uppercase", fontWeight: 600 }}>DIRECTIVE TITLE</Text>
                <Text style={{ fontSize: 11, color: "#94a3b8", textTransform: "uppercase", fontWeight: 600 }}>STATUS</Text>
              </div>
              {DIRECTIVES.map((d, i) => (
                <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 80px", padding: "12px 16px", borderBottom: i < DIRECTIVES.length - 1 ? "1px solid #f1f5f9" : "none", cursor: "pointer" }}
                  onClick={() => router.push(`/editor?scenarioId=${scenarioId}&type=response&directive=${i}`)}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <Avatar size="small" style={{ background: d.color, fontSize: 11 }}>{d.initials}</Avatar>
                    <Text style={{ fontSize: 13, color: "#1a1a2e" }}>{d.name}</Text>
                  </div>
                  <div>
                    <Text style={{ fontSize: 13, color: "#1a1a2e" }}>{d.directive}</Text>
                    <br />
                    <Text style={{ fontSize: 11, color: "#94a3b8" }}>{d.day}</Text>
                  </div>
                  <Tag color={d.status === "Responded" ? "green" : "orange"}>{d.status}</Tag>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Pending Messages */}
          <div>
            <Title level={3} style={{ color: "#1a1a2e", marginBottom: 4 }}>Pending Messages</Title>
            <Text style={{ color: "#64748b", fontSize: 13, display: "block", marginBottom: 12 }}>Approve or reject player communications</Text>
            {PENDING_MSGS.map((m, i) => (
              <Card key={i} style={{ marginBottom: 12, border: "1px solid #e2e8f0", borderRadius: 10, background: "#fff" }} bodyStyle={{ padding: 16 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                  <Avatar style={{ background: m.color, fontSize: 12 }}>{m.initials}</Avatar>
                  <div>
                    <Text strong style={{ color: "#1a1a2e", fontSize: 14 }}>{m.name}</Text>
                    <br />
                    <Text style={{ color: "#64748b", fontSize: 12 }}>To: {m.to}</Text>
                  </div>
                </div>
                <Text style={{ color: "#475569", fontSize: 13 }}>{m.body}</Text>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 12 }}>
                  <Button style={{ background: "#22c55e", color: "#fff", border: "none", borderRadius: 6 }}>Approve</Button>
                  <Button danger style={{ borderRadius: 6 }}>Reject</Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
