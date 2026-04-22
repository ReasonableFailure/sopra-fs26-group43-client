"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Avatar, Button, ConfigProvider, Spin, theme } from "antd";
import { InfoCircleOutlined, StarFilled, UserOutlined } from "@ant-design/icons";
import { useAuth } from "@/hooks/useAuth";
import { useApi } from "@/hooks/useApi";
import { CharacterService } from "@/api/characterService";
import { CabinetService } from "@/api/cabinetService";
import { useSelectedCharacter } from "@/hooks/useSelectedCharacter";
import type { Character } from "@/types/character";
import type { Cabinet } from "@/types/cabinet";
import styles from "@/styles/lobby.module.css";

interface CharacterCardProps {
  character: Character;
  cabinetName: string;
  onSelect: () => void;
}

function CharacterCard({ character, cabinetName, onSelect }: CharacterCardProps) {
  return (
    <div className={styles.characterCard} onClick={onSelect} role="button" tabIndex={0}>
      <h3 className={styles.characterName}>{character.name}</h3>
      {cabinetName && (
        <div className={styles.cabinetRow}>
          <StarFilled className={styles.starIcon} />
          <span className={styles.cabinetName}>{cabinetName}</span>
        </div>
      )}
      <p className={styles.characterDesc}>
        {character.description ?? "No description provided."}
      </p>
      <div className={styles.selectHint}>
        <InfoCircleOutlined className={styles.hintIcon} />
        <span className={styles.hintText}>Hover to select</span>
      </div>
    </div>
  );
}

export default function GameLobbyPage() {
  const { token, isAuthenticated, authReady } = useAuth();
  const router = useRouter();
  const params = useParams();
  const scenarioId = Number(params.id);
  const api = useApi();

  const characterService = useMemo(() => new CharacterService(api), [api]);
  const cabinetService = useMemo(() => new CabinetService(api), [api]);
  const { setCharacterId } = useSelectedCharacter(scenarioId);

  const [characters, setCharacters] = useState<Character[]>([]);
  const [cabinets, setCabinets] = useState<Cabinet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authReady && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (!token || !scenarioId) return;

    let cancelled = false;

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [chars, cabs] = await Promise.all([
          characterService.getCharactersByScenario(scenarioId, token),
          cabinetService.getCabinetsByScenario(scenarioId, token),
        ]);
        if (!cancelled) {
          setCharacters(chars);
          setCabinets(cabs);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load lobby");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchData();
    return () => {
      cancelled = true;
    };
  }, [token, scenarioId, characterService, cabinetService]);

  if (!authReady || !isAuthenticated) return null;

  const getCabinetName = (cabinetId: number | null): string => {
    if (cabinetId === null) return "";
    return cabinets.find((c) => c.id === cabinetId)?.cabinetName ?? "";
  };

  const handleSelectCharacter = (character: Character) => {
    if (character.id === null) return;
    setCharacterId(character.id);
    router.push(`/scenarios/${scenarioId}/player`);
  };

  return (
    <ConfigProvider
      theme={{
        algorithm: theme.defaultAlgorithm,
        token: {
          colorBgContainer: "#ffffff",
          colorText: "#111827",
          colorTextSecondary: "#6b7280",
          colorBorder: "#e5e7eb",
          colorPrimary: "#4f46e5",
          borderRadius: 8,
          fontSize: 14,
        },
        components: {
          Button: {
            colorPrimary: "#4f46e5",
            algorithm: true,
          },
        },
      }}
    >
      <div className={styles.pageRoot}>
        <nav className={styles.navbar}>
          <div className={styles.navLeft}>
            <div className={styles.logoMark} aria-hidden="true" />
            <span className={styles.navTitle}>Game Lobby</span>
          </div>
          <div>
            <Avatar icon={<UserOutlined />} className={styles.avatar} />
          </div>
        </nav>

        <main className={styles.pageBody}>
          <Button
            type="primary"
            className={styles.backroomerButton}
            onClick={() => router.push(`/scenarios/${scenarioId}/backroom`)}
          >
            Become Backroomer
          </Button>

          <h1 className={styles.sectionHeading}>Select Your Character</h1>
          <p className={styles.sectionSubheading}>Choose a character to begin your journey</p>

          {error && <p className={styles.errorText}>{error}</p>}

          <Spin spinning={loading}>
            <div className={styles.characterGrid}>
              {!loading && characters.length === 0 && (
                <p className={styles.emptyText}>No characters available for this scenario.</p>
              )}
              {characters.map((character) => (
                <CharacterCard
                  key={character.id ?? character.name}
                  character={character}
                  cabinetName={getCabinetName(character.cabinetId)}
                  onSelect={() => handleSelectCharacter(character)}
                />
              ))}
            </div>
          </Spin>
        </main>
      </div>
    </ConfigProvider>
  );
}
