"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useApi } from "@/hooks/useApi";
import useLocalStorage from "@/hooks/useLocalStorage";
import { User } from "@/types/user";
import { Button, Form, Input, Tabs, Typography, Alert } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

interface RegisterFields {
  username: string;
  password: string;
  bio?: string;
}

interface LoginFields {
  username: string;
  password: string;
}

const LoginPage: React.FC = () => {
  const router = useRouter();
  const apiService = useApi();
  const [loginForm] = Form.useForm();
  const [registerForm] = Form.useForm();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { set: setToken } = useLocalStorage<string>("token", "");
  const { set: setUserId } = useLocalStorage<string>("userId", "");

  const handleLogin = async (values: LoginFields) => {
    setError(null);
    setLoading(true);
    try {
      const response = await apiService.post<User>("/login", values);
      if (response.token) {
        setToken(response.token);
      }
      if (response.id) {
        setUserId(String(response.id));
      }
      router.push("/");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (values: RegisterFields) => {
    setError(null);
    setLoading(true);
    try {
      const response = await apiService.post<User>("/users", values);
      if (response.token) {
        setToken(response.token);
      }
      if (response.id) {
        setUserId(String(response.id));
      }
      router.push("/");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <Title level={2} style={{ color: "#6c5ce7", margin: 0 }}>🌐 Crisis Simulator</Title>
          <Text type="secondary">Multi-player diplomatic crisis game</Text>
        </div>
        {error && <Alert message={error} type="error" style={{ marginBottom: 16 }} closable onClose={() => setError(null)} />}
        <Tabs
          defaultActiveKey="login"
          onChange={() => setError(null)}
          items={[
            {
              key: "login",
              label: "Login",
              children: (
                <Form form={loginForm} layout="vertical" onFinish={handleLogin}>
                  <Form.Item name="username" label="Username" rules={[{ required: true, message: "Please enter username" }]}>
                    <Input prefix={<UserOutlined />} placeholder="Enter username" />
                  </Form.Item>
                  <Form.Item name="password" label="Password" rules={[{ required: true, message: "Please enter password" }]}>
                    <Input.Password prefix={<LockOutlined />} placeholder="Enter password" />
                  </Form.Item>
                  <Form.Item>
                    <Button type="primary" htmlType="submit" loading={loading} style={{ width: "100%" }}>
                      Login
                    </Button>
                  </Form.Item>
                </Form>
              ),
            },
            {
              key: "register",
              label: "Register",
              children: (
                <Form form={registerForm} layout="vertical" onFinish={handleRegister}>
                  <Form.Item name="username" label="Username" rules={[{ required: true, message: "Please enter username" }]}>
                    <Input prefix={<UserOutlined />} placeholder="Choose a username" />
                  </Form.Item>
                  <Form.Item name="password" label="Password" rules={[{ required: true, message: "Please enter password" }]}>
                    <Input.Password prefix={<LockOutlined />} placeholder="Choose a password" />
                  </Form.Item>
                  <Form.Item name="bio" label="Bio (optional)">
                    <Input placeholder="Short bio" />
                  </Form.Item>
                  <Form.Item>
                    <Button type="primary" htmlType="submit" loading={loading} style={{ width: "100%" }}>
                      Register
                    </Button>
                  </Form.Item>
                </Form>
              ),
            },
          ]}
        />
      </div>
    </div>
  );
};

export default LoginPage;
