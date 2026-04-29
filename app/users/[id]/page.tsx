"use client";
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useApi } from "@/hooks/useApi";
import useLocalStorage from "@/hooks/useLocalStorage";
import { User } from "@/types/user";
import { Button, Card, Avatar, Tag, Typography, Spin } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

const Profile: React.FC = () => {
  const { id } = useParams();
  const router = useRouter();
  const apiService = useApi();
  const { value: token } = useLocalStorage<string>("token", "");
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) { router.push("/login"); return; }
    apiService.get<User>(`/users/${id}`, token)
      .then(data => setUser(data))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, [id, token]);

  if (loading) return <div style={{ display: "flex", justifyContent: "center", padding: 80 }}><Spin size="large" /></div>;

  const initials = user?.username ? user.username.slice(0, 2).toUpperCase() : "??";

  return (
    <div style={{ background: "#f8fafc", minHeight: "100vh", padding: 32 }}>
      <div style={{ maxWidth: 500, margin: "0 auto" }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => router.back()} style={{ marginBottom: 16 }}>Back</Button>
        <Card style={{ border: "1px solid #e2e8f0", borderRadius: 16, background: "#fff" }} bodyStyle={{ padding: 32, textAlign: "center" }}>
          <Avatar size={80} style={{ background: "#6c5ce7", fontSize: 28, fontWeight: 700 }}>{initials}</Avatar>
          <Title level={3} style={{ color: "#1a1a2e", marginTop: 16, marginBottom: 4 }}>{user?.username || "Unknown"}</Title>
          <Tag color={user?.status === "ONLINE" ? "green" : "default"}>{user?.status || "OFFLINE"}</Tag>
          {user?.bio && (
            <div style={{ marginTop: 16, textAlign: "left", borderTop: "1px solid #e2e8f0", paddingTop: 16 }}>
              <Text strong style={{ color: "#1a1a2e" }}>Bio</Text>
              <br />
              <Text style={{ color: "#64748b" }}>{user.bio}</Text>
            </div>
          )}
          {user?.creationDate && (
            <div style={{ marginTop: 12, textAlign: "left" }}>
              <Text strong style={{ color: "#1a1a2e" }}>Member since</Text>
              <br />
              <Text style={{ color: "#64748b" }}>{new Date(user.creationDate).toLocaleDateString()}</Text>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Profile;
