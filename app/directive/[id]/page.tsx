"use client";
import { useRouter } from "next/navigation";
import { Button, Card, Tag, Typography } from "antd";
import { SettingOutlined, CheckCircleOutlined, InfoCircleOutlined, ArrowLeftOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

export default function DirectiveDetailPage() {
  const router = useRouter();

  return (
    <div style={{ background: "#f8fafc", minHeight: "100vh" }}>
      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "0 16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 0", borderBottom: "1px solid #e2e8f0" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ background: "#6c5ce7", borderRadius: 8, width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <SettingOutlined style={{ color: "#fff", fontSize: 16 }} />
            </div>
            <Text strong style={{ fontSize: 16, color: "#1a1a2e" }}>News Feed</Text>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <Button onClick={() => router.back()}>Back to Dashboard</Button>
            <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#6c5ce7", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 13 }}>JD</div>
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginTop: 24, marginBottom: 20 }}>
          <div>
            <Title level={2} style={{ color: "#1a1a2e", marginBottom: 4 }}>Directive Details</Title>
            <Text style={{ color: "#64748b" }}>Review your submitted directive and its current status</Text>
          </div>
          <Button type="primary" onClick={() => router.push("/editor?type=directive")}>New Directive</Button>
        </div>

        <Card style={{ borderRadius: 12, border: "1px solid #e2e8f0", background: "#fff" }} bodyStyle={{ padding: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <Tag color="green" style={{ borderRadius: 20, padding: "2px 12px" }}>Approved</Tag>
              <Text style={{ color: "#94a3b8", fontSize: 13 }}>⏰ Submitted 3 hours ago</Text>
            </div>
            <Text style={{ color: "#64748b", fontSize: 13 }}>A Submitted by John Doe</Text>
          </div>

          <Title level={3} style={{ color: "#1a1a2e", marginBottom: 12 }}>Establish Trade Embargo with Northern Alliance</Title>
          <Text style={{ color: "#475569", lineHeight: 1.6 }}>
            In response to recent aggressive military posturing and violations of international maritime law, I hereby propose the immediate implementation of a comprehensive trade embargo against the Northern Alliance. This directive aims to apply economic pressure while maintaining diplomatic channels for peaceful resolution.
          </Text>

          <Card style={{ marginTop: 24, border: "1px solid #e2e8f0", borderRadius: 10, background: "#f0fdf4" }} bodyStyle={{ padding: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <CheckCircleOutlined style={{ color: "#22c55e", fontSize: 18 }} />
              <Text strong style={{ color: "#1a1a2e" }}>Approval Status</Text>
            </div>
            <Text style={{ color: "#475569" }}>Your directive has been approved by the backroom team and will start to affect the scenario from next round.</Text>
            <br />
            <Text style={{ color: "#94a3b8", fontSize: 12 }}>⏰ Approved 2 minutes ago</Text>
          </Card>

          <Card style={{ marginTop: 16, border: "1px solid #e2e8f0", borderRadius: 10, background: "#f8fafc" }} bodyStyle={{ padding: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <InfoCircleOutlined style={{ color: "#6c5ce7", fontSize: 18 }} />
              <Text strong style={{ color: "#1a1a2e" }}>Backroom Notes</Text>
            </div>
            <Text style={{ color: "#475569" }}>Compromised approval: we&apos;ve made minor adjustments to the timeline to coordinate with our allies&apos; sanctions packages.</Text>
            <br />
            <Text style={{ color: "#94a3b8", fontSize: 12 }}>⏰ Sent to you 2 minutes ago</Text>
          </Card>
        </Card>
      </div>
    </div>
  );
}
