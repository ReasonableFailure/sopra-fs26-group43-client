"use client";
import { useRouter } from "next/navigation";
import { Button, Card, Col, Row, Typography } from "antd";

const { Title, Text } = Typography;

const CHARACTERS = [
  { name: "Shadow Weaver", cabinet: "The Obsidian Council", description: "Master of illusions and deception, capable of bending reality to their will in the darkest corners" },
  { name: "Crimson Blade", cabinet: "The Iron Vanguard", description: "Elite warrior with unmatched combat prowess and strategic battlefield dominance" },
  { name: "Mystic Oracle", cabinet: "The Ethereal Sanctum", description: "Seer of futures and keeper of ancient wisdom, wielding powerful divination magic" },
  { name: "Storm Caller", cabinet: "The Tempest Legion", description: "Commander of elemental forces, summoning devastating weather phenomena at will" },
  { name: "Void Walker", cabinet: "The Abyss Collective", description: "Traveler between dimensions, harnessing the power of the void itself" },
  { name: "Phoenix Knight", cabinet: "The Radiant Order", description: "Immortal guardian rising from ashes, wielding flames of purification and rebirth" },
  { name: "Frost Sentinel", cabinet: "The Glacial Bastion", description: "Protector of frozen realms, commanding ice and snow with absolute precision" },
  { name: "Arcane Architect", cabinet: "The Spellforge Syndicate", description: "Builder of magical constructs and master of reality-altering enchantments" },
  { name: "Night Stalker", cabinet: "The Shadow Covenant", description: "Silent assassin moving through darkness, striking fear into the hearts of enemies" },
  { name: "Terra Warden", cabinet: "The Earthbound Circle", description: "Guardian of nature and stone, channelling the raw power of the living earth" },
  { name: "Celestial Sage", cabinet: "The Astral Conclave", description: "Keeper of cosmic knowledge, drawing power from the stars and celestial bodies" },
  { name: "Blood Reaver", cabinet: "The Crimson Pact", description: "Warrior who grows stronger with each fallen foe, feeding on the essence of battle" },
];

export default function LobbyPage() {
  const router = useRouter();
  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: 32 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8, padding: "12px 0", borderBottom: "1px solid #f0f0f0" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Text strong style={{ fontSize: 16 }}>Game Lobby</Text>
        </div>
        <Button shape="circle">JD</Button>
      </div>
      <Button type="primary" style={{ marginBottom: 24, background: "#6c5ce7", borderColor: "#6c5ce7" }}>Become Backroomer</Button>
      <Title level={3}>Select Your Character</Title>
      <Text type="secondary">Choose a character to begin your journey</Text>
      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        {CHARACTERS.map((c, i) => (
          <Col xs={24} sm={12} md={8} key={i}>
            <Card hoverable style={{ height: "100%" }}>
              <Text strong>{c.name}</Text><br />
              <Text type="secondary" style={{ fontSize: 12, color: "#6c5ce7" }}>{"\u2B50"} {c.cabinet}</Text><br />
              <Text style={{ fontSize: 13 }}>{c.description}</Text>
              <div style={{ marginTop: 8, color: "#999", fontSize: 12 }}>{"\u{1F552}"} Hover to select</div>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
}
