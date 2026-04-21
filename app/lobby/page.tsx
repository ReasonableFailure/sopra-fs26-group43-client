"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useApi } from "@/hooks/useApi";
import useLocalStorage from "@/hooks/useLocalStorage";
import { Character } from "@/types/character";
import { Button, Card, Col, Row, Typography, Tag, Spin } from "antd";
import { SettingOutlined, StarFilled, ClockCircleOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

const HARDCODED_CHARS: Character[] = [
  { id: 1, name: "Shadow Weaver", title: "The Obsidian Council", description: "Master of illusions and deception, capable of bending reality to their will in the darkest corners", secret: null, isAlive: true, messageCount: 0, actionPoints: 10 },
  { id: 2, name: "Crimson Blade", title: "The Iron Vanguard", description: "Elite warrior with unmatched combat prowess and strategic battlefield dominance", secret: null, isAlive: true, messageCount: 0, actionPoints: 10 },
  { id: 3, name: "Mystic Oracle", title: "The Ethereal Sanctum", description: "Seer of futures and keeper of ancient wisdom, wielding powerful divination magic", secret: null, isAlive: true, messageCount: 0, actionPoints: 10 },
  { id: 4, name: "Storm Caller", title: "The Tempest Legion", description: "Commander of elemental forces, summoning devastating weather phenomena at will", secret: null, isAlive: true, messageCount: 0, actionPoints: 10 },
  { id: 5, name: "Void Walker", title: "The Abyss Collective", description: "Traveler between dimensions, harnessing the power of the void itself", secret: null, isAlive: true, messageCount: 0, actionPoints: 10 },
  { id: 6, name: "Phoenix Knight", title: "The Radiant Order", description: "Immortal guardian rising from ashes, wielding flames of purification and rebirth", secret: null, isAlive: true, messageCount: 0, actionPoints: 10 },
  { id: 7, name: "Frost Sentinel", title: "The Glacial Bastion", description: "Protector of frozen realms, commanding ice and snow with absolute precision", secret: null, isAlive: true, messageCount: 0, actionPoints: 10 },
  { id: 8, name: "Arcane Architect", title: "The Spellforge Syndicate", description: "Builder of magical constructs and master of reality-altering enchantments", secret: null, isAlive: true, messageCount: 0, actionPoints: 10 },
  { id: 9, name: "Night Stalker", title: "The Shadow Covenant", description: "Silent assassin moving through darkness, striking fear into the hearts of enemies", secret: null, isAlive: true, messageCount: 0, actionPoints: 10 },
  { id: 10, name: "Terra Warden", title: "The Earthbound Circle", description: "Guardian of nature and stone, channelling the raw power of the living earth", secret: null, isAlive: true, messageCount: 0, actionPoints: 10 },
  { id: 11, name: "Celestial Sage", title: "The Astral Conclave", description: "Keeper of cosmic knowledge, drawing power from the stars and celestial bodies", secret: null, isAlive: true, messageCount: 0, actionPoints: 10 },
  { id: 12, name: "Blood Reaver", title: "The Crimson Pact", description: "Warrior who grows stronger with each fallen foe, feeding on the essence of battle", secret: null, isAlive: true, messageCount: 0, actionPoints: 10 },
];

export default function LobbyPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const scenarioId = searchParams.get("scenarioId") || "5";
  const apiService = useApi();
  const { value: token } = useLocalStorage<string>("token", "");
  const { value: userId } = useLocalStorage<string>("userId", "");
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);
  const [initials, setInitials] = useState("JD");

  useEffect(() => {
    if (token) {
      apiService.get<Character[]>(`/characters/${scenarioId}`, token)
        .then(data => setCharacters(data.length > 0 ? data : HARDCODED_CHARS))
        .catch(() => setCharacters(HARDCODED_CHARS))
        .finally(() => setLoading(false));
      if (userId) {
        apiService.get<{ username: string }>(`/users/${userId}`, token)
          .then(u => { if (u.username) setInitials(u.username.slice(0, 2).toUpperCase()); })
          .catch(() => {});
      }
    } else {
      setCharacters(HARDCODED_CHARS);
      setLoading(false);
    }
  }, [token, scenarioId]);

  return (
    <div style={{ background: "#f8fafc", minHeight: "100vh" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 0", borderBottom: "1px solid #e2e8f0" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ background: "#6c5ce7", borderRadius: 8, width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <SettingOutlined style={{ color: "#fff", fontSize: 16 }} />
            </div>
            <Text strong style={{ fontSize: 16, color: "#1a1a2e" }}>Game Lobby</Text>
          </div>
          <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#6c5ce7", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 13 }}>{initials}</div>
        </div>

        <div style={{ paddingTop: 20 }}>
          <Button
            type="primary"
            style={{ marginBottom: 24 }}
            onClick={() => router.push(`/backroom?scenarioId=${scenarioId}`)}
          >
            Become Backroomer
          </Button>
        </div>

        <Title level={3} style={{ color: "#1a1a2e", marginBottom: 4 }}>Select Your Character</Title>
        <Text style={{ color: "#64748b" }}>Choose a character to begin your journey</Text>

        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: 60 }}><Spin size="large" /></div>
        ) : (
          <Row gutter={[16, 16]} style={{ marginTop: 24, marginBottom: 32 }}>
            {characters.map((c, i) => (
              <Col xs={24} sm={12} md={8} key={i}>
                <Card
                  hoverable
                  style={{ height: "100%", borderRadius: 10, border: "1px solid #e2e8f0", background: "#fff", cursor: "pointer" }}
                  bodyStyle={{ padding: 16 }}
                  onClick={() => router.push(`/player?scenarioId=${scenarioId}&characterId=${c.id}`)}
                >
                  <Text strong style={{ color: "#1a1a2e", fontSize: 14 }}>{c.name}</Text>
                  <br />
                  <div style={{ display: "flex", alignItems: "center", gap: 4, margin: "4px 0 8px" }}>
                    <StarFilled style={{ color: "#6c5ce7", fontSize: 11 }} />
                    <Text style={{ fontSize: 12, color: "#6c5ce7" }}>{c.title}</Text>
                  </div>
                  <Text style={{ fontSize: 13, color: "#475569" }}>{c.description}</Text>
                  <div style={{ marginTop: 8, color: "#94a3b8", fontSize: 12, display: "flex", alignItems: "center", gap: 4 }}>
                    <ClockCircleOutlined />
                    <span>Hover to select</span>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </div>
    </div>
  );
}
