import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { App as AntdApp, ConfigProvider } from "antd";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import "@/styles/globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Crisis Simulator",
  description: "sopra-fs26-group43",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <ConfigProvider
          theme={{
            token: {
              colorPrimary: "#6c5ce7",
              borderRadius: 8,
              colorText: "#1a1a2e",
              fontSize: 14,
              colorBgContainer: "#ffffff",
              colorBorder: "#e2e8f0",
              colorTextSecondary: "#64748b",
            },
            components: {
              Button: {
                colorPrimary: "#6c5ce7",
                controlHeight: 38,
              },
              Input: {
                colorBorder: "#e2e8f0",
                colorTextPlaceholder: "#94a3b8",
              },
              Form: {
                labelColor: "#1a1a2e",
              },
              Card: {
                colorBgContainer: "#ffffff",
              },
              Table: {
                colorBgContainer: "#ffffff",
              },
            },
          }}
        >
          <AntdRegistry>
            <AntdApp>{children}</AntdApp>
          </AntdRegistry>
        </ConfigProvider>
      </body>
    </html>
  );
}
