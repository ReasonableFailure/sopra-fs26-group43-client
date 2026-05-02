"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useApi } from "@/hooks/useApi";
import useLocalStorage from "@/hooks/useLocalStorage";
import { User } from "@/types/user";
import { Button, Form, Input } from "antd";

interface LoginFields {
  username: string;
  password: string;
}

interface RegisterFields {
  username: string;
  password: string;
  bio?: string;
}

const Login: React.FC = () => {
  const router = useRouter();
  const apiService = useApi();
  const [loginForm] = Form.useForm<LoginFields>();
  const [registerForm] = Form.useForm<RegisterFields>();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [loading, setLoading] = useState(false);

  const { set: setToken } = useLocalStorage<string>("token", "");
  const { set: setUserId } = useLocalStorage<string>("userId", "");

  const handleLogin = async (values: LoginFields) => {
    setLoading(true);
    try {
      const response = await apiService.post<User>("/login", values);
      if (response.token) setToken(response.token);
      if (response.id) setUserId(String(response.id));
      router.push("/scenarios");
    } catch (error) {
      if (error instanceof Error) {
        alert(`Login failed:\n${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (values: RegisterFields) => {
    setLoading(true);
    try {
      const response = await apiService.post<User>("/users", {
        username: values.username,
        password: values.password,
        ...(values.bio?.trim() ? { bio: values.bio.trim() } : {}),
      });
      if (response.token) setToken(response.token);
      if (response.id) setUserId(String(response.id));
      router.push("/scenarios");
    } catch (error) {
      if (error instanceof Error) {
        alert(`Registration failed:\n${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const switchMode = (next: "login" | "register") => {
    loginForm.resetFields();
    registerForm.resetFields();
    setMode(next);
  };

  return (
    <div className="login-container">
      {mode === "login" ? (
        <Form
          form={loginForm}
          name="login"
          size="large"
          variant="outlined"
          onFinish={handleLogin}
          layout="vertical"
        >
          <Form.Item
            name="username"
            label="Username"
            rules={[{ required: true, message: "Please input your username!" }]}
          >
            <Input placeholder="Enter username" />
          </Form.Item>
          <Form.Item
            name="password"
            label="Password"
            rules={[{ required: true, message: "Please input your password!" }]}
          >
            <Input.Password placeholder="Enter password" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" className="login-button" loading={loading}>
              Login
            </Button>
          </Form.Item>
          <Form.Item style={{ textAlign: "center", marginBottom: 0 }}>
            <span style={{ color: "#9ca3af" }}>Don&apos;t have an account Register here!?&nbsp;</span>
            <Button type="link" style={{ padding: 0 }} onClick={() => switchMode("register")}>
              Sign up
            </Button>
          </Form.Item>
        </Form>
      ) : (
        <Form
          form={registerForm}
          name="register"
          size="large"
          variant="outlined"
          onFinish={handleRegister}
          layout="vertical"
        >
          <Form.Item
            name="username"
            label="Username"
            rules={[{ required: true, message: "Please input a username!" }]}
          >
            <Input placeholder="Choose a username" />
          </Form.Item>
          <Form.Item
            name="password"
            label="Password"
            rules={[{ required: true, message: "Please input a password!" }]}
          >
            <Input.Password placeholder="Choose a password" />
          </Form.Item>
          <Form.Item name="bio" label="Bio (optional)">
            <Input.TextArea
              placeholder="Tell us a little about yourself"
              rows={3}
              style={{ resize: "none" }}
            />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" className="login-button" loading={loading}>
              Sign up
            </Button>
          </Form.Item>
          <Form.Item style={{ textAlign: "center", marginBottom: 0 }}>
            <span style={{ color: "#9ca3af" }}>Already have an account? Login here!&nbsp;</span>
            <Button type="link" style={{ padding: 0 }} onClick={() => switchMode("login")}>
              Log in
            </Button>
          </Form.Item>
        </Form>
      )}
    </div>
  );
};

export default Login;
