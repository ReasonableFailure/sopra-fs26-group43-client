// this code is part of S2 to display a list of all registered users
// clicking on a user in this list will display /app/users/[id]/page.tsx
"use client"; // For components that need React hooks and browser APIs, SSR (server side rendering) has to be disabled. Read more here: https://nextjs.org/docs/pages/building-your-application/rendering/server-side-rendering

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useApi } from "@/hooks/useApi";
import useLocalStorage from "@/hooks/useLocalStorage";
import { UserService } from "@/api/userService";
import { User } from "@/types/user";
import { Button, Card, Table, Typography } from "antd";
import type { TableProps } from "antd";

const { Title } = Typography;

const columns: TableProps<User>["columns"] = [
  {
    title: "Username",
    dataIndex: "username",
    key: "username",
  },
  {
    title: "Status",
    dataIndex: "status",
    key: "status",
  },
  {
    title: "Id",
    dataIndex: "id",
    key: "id",
  },
];

const Dashboard: React.FC = () => {
  const router = useRouter();
  const api = useApi();
  const userService = useMemo(() => new UserService(api), [api]);
  const [users, setUsers] = useState<User[] | null>(null);
  const { value: token, clear: clearToken } = useLocalStorage<string>("token", "");
  const { value: userId, clear: clearUserId } = useLocalStorage<number>("userId", 0);

  const handleLogout = async (): Promise<void> => {
    try {
      if (userId && token) {
        await userService.logout(userId, token);
      }
    } catch (error) {
      console.error("Logout request failed:", error);
    } finally {
      clearToken();
      clearUserId();
      router.push("/login");
    }
  };

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const users: User[] = await userService.getAllUsers(token);
        setUsers(users);
        console.log("Fetched users:", users);
      } catch (error) {
        if (error instanceof Error) {
          alert(`Something went wrong while fetching users:\n${error.message}`);
        } else {
          console.error("An unknown error occurred while fetching users.");
        }
      }
    };

    fetchUsers();
  }, [userService, token]); // dependency apiService does not re-trigger the useEffect on every render because the hook uses memoization (check useApi.tsx in the hooks).
  // if the dependency array is left empty, the useEffect will trigger exactly once
  // if the dependency array is left away, the useEffect will run on every state change. Since we do a state change to users in the useEffect, this results in an infinite loop.
  // read more here: https://react.dev/reference/react/useEffect#specifying-reactive-dependencies

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
