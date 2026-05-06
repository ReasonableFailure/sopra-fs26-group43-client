"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useApi } from "@/hooks/useApi";
import useLocalStorage from "@/hooks/useLocalStorage";
import { UserService } from "@/api/userService";
import { User } from "@/types/user";
import { Button, Card, Descriptions, Form, Input } from "antd";

interface EditFormFields {
  username: string;
  bio: string;
  password: string;
}

const Profile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const api = useApi();
  const userService = useMemo(() => new UserService(api), [api]);

  const { value: token } = useLocalStorage<string>("token", "");
  const { value: userId } = useLocalStorage<string>("userId", "");

  const [user, setUser] = useState<User | null>(null);
  const [editing, setEditing] = useState(false);
  const [form] = Form.useForm<EditFormFields>();

  const isOwner = userId === id;

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const data = await userService.getUser(Number(id), token);
        setUser(data);
      } catch (error) {
        if (error instanceof Error) {
          alert(`Failed to load user profile:\n${error.message}`);
        }
      }
    };

    if (id) fetchUser();
  }, [userService, id, token]);

  const handleEdit = async (values: EditFormFields) => {
    try {
      await userService.updateUser(Number(id), values, token);
      setEditing(false);
      router.refresh();
    } catch (error) {
      if (error instanceof Error) {
        alert(`Failed to update profile:\n${error.message}`);
      }
    }
  };

  return (
    <div className="card-container">
      <Card
        title="User Profile"
        loading={!user}
        className="dashboard-container"
        extra={isOwner && !editing && (
          <Button
            type="default"
            onClick={() => setEditing(true)}
          >
            Edit
          </Button>
        )}
      >
        {user && !editing && (
          <Descriptions column={1}>
            <Descriptions.Item label="Id">{user.id}</Descriptions.Item>
            <Descriptions.Item label="Username">
              {user.username}
            </Descriptions.Item>
            <Descriptions.Item label="Bio">{user.bio}</Descriptions.Item>
            <Descriptions.Item label="Status">{user.status}</Descriptions.Item>
          </Descriptions>
        )}

        {user && editing && (
          <Form
            form={form}
            layout="vertical"
            initialValues={{
              username: user.username ?? "",
              bio: user.bio ?? "",
            }}
            onFinish={handleEdit}
          >
            <Form.Item
              name="username"
              label="Username"
              rules={[{ required: true, message: "Please enter a username" }]}
            >
              <Input placeholder="Username" />
            </Form.Item>
            <Form.Item
              name="bio"
              label="Bio"
            >
              <Input placeholder="Bio" />
            </Form.Item>
            <Form.Item
              name="password"
              label="New Password"
              rules={[{
                required: true,
                message: "Please enter a new password",
              }]}
            >
              <Input.Password placeholder="New password" />
            </Form.Item>
            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                style={{ marginRight: 8 }}
              >
                Save
              </Button>
              <Button onClick={() => setEditing(false)}>Cancel</Button>
            </Form.Item>
          </Form>
        )}
      </Card>
    </div>
  );
};

export default Profile;
