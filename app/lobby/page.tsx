"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useApi } from "@/hooks/useApi";
import { Character } from "@/types/character";
import { Button, Card, Col, Row, Spin, Typography, Empty, message } from "antd";

const { Title, Text } = Typography;

export default function LobbyPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const scenarioId = searchParams.get("scenarioId") || "1";
  const apiService = useApi();
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);
  const [selecting, setSelecting] = useState(false);

  useEffect(() => {
    const fetchCharacters = async () => {
      try {
        const data = await apiService.get<Character[]>(`/characters/${scenarioId}/`);
        setCharacters(data);
      } catch {
        setCharacters([]);
      } finally {
        setLoading(false);
      }
    };
    fetchCharacters();
  }, [scenarioId]);

  const handleSelectCharacter = async (characterId: number | null) => {
    if (!characterId) return;
    setSelecting(true);
    try {
      const userId = localStorage.getItem("userId");
      await apiService.put(`/characters/${characterId}`, { userId });
      message.success("Character selected!");
      router.push(`/users/${userId}`);
    } catch {
      message.error("Failed to select character");
    } finally {
      setSelecting(false);
    }
  };

  const handleBecomeBackroomer = () => {
    message.info("Joined as Backroomer");
    const userId = localStorage.getItem("userId");
    router.push(`/users/${userId}`);
  };

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: 80 }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: 32 }}>
      <Title level={2}>Game Lobby</Title>
      <Button
        type="primary"
        style={{ marginBottom: 24, background: "#6c5ce7" }}
        onClick={handleBecomeBackroomer}
      >
        Become Backroomer
      </Button>
      <Title level={3}>Select Your Character</Title>
      <Text type="secondary">Choose a character to begin your journey</Text>
      {characters.length === 0 ? (
        <Empty description="No characters available" style={{ marginTop: 48 }} />
      ) : (
        <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
          {characters.map((c) => (
            <Col xs={24} sm={12} md={8} key={c.id}>
              <Card
                hoverable
                style={{ height: "100%" }}
                onClick={() => handleSelectCharacter(c.id)}
              >
                <Title level={5} style={{ margin: 0 }}>{c.name}</Title>
                <Text type="secondary" style={{ fontSize: 12 }}>{c.title}</Text>
                <br />
                <Text style={{ fontSize: 13 }}>{c.description}</Text>
                <div style={{ marginTop: 8, color: "#999", fontSize: 12 }}>
                  Click to select
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </div>
  );
}
