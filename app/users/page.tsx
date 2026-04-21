"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useApi } from "@/hooks/useApi";
import useLocalStorage from "@/hooks/useLocalStorage";
import { User } from "@/types/user";
import { Button, Card, Table, Typography } from "antd";
import type { TableProps } from "antd";

const { Title } = Typography;

const columns: TableProps<User>["columns"] = [
  { title: "Username", dataIndex: "username", key: "username" },
  { title: "Id", dataIndex: "id", key: "id" },
  { title: "Status", dataIndex: "status", key: "status" },
];

const Dashboard: React.FC = () => {
  const router = useRouter();
  const apiService = useApi();
  const [users, setUsers] = useState<User[] | null>(null);
  const { value: token, clear: clearToken } = useLocalStorage<string>("token", "");
  const { clear: clearUserId } = useLocalStorage<string>("userId", "");

  const handleLogout = () => {
    clearToken();
    clearUserId();
    router.push("/login");
  };

  useEffect(() => {
    if (!token) { router.push("/login"); return; }
    apiService.get<User[]>("/users", token)
      .then(data => setUsers(data))
      .catch(() => setUsers([]));
  }, [token]);

  return (
    <div style={{ background: "#f8fafc", minHeight: "100vh", padding: 32 }}>
      <Card style={{ maxWidth: 800, margin: "0 auto", border: "1px solid #e2e8f0", borderRadius: 12 }}>
        <Title level={3} style={{ color: "#1a1a2e" }}>All Users</Title>
        <Table<User>
          columns={columns}
          dataSource={users || []}
          loading={!users}
          rowKey="id"
          onRow={(row) => ({ onClick: () => router.push(`/users/${row.id}`), style: { cursor: "pointer" } })}
        />
        <Button onClick={handleLogout} type="primary" style={{ marginTop: 16 }}>Logout</Button>
      </Card>
    </div>
  );
};

export default Dashboard;
