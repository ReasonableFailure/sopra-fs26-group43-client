"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Avatar, Button, ConfigProvider, Spin, message, theme } from "antd";
import { InfoCircleOutlined, UserOutlined } from "@ant-design/icons";
import { useAuth } from "@/hooks/useAuth";
import { useApi } from "@/hooks/useApi";
import { useMyEngagement } from "@/hooks/useMyEngagement";
import { CharacterService } from "@/api/characterService";
import { useSelectedCharacter } from "@/hooks/useSelectedCharacter";
import { routeForEngagement } from "@/utils/engagementRouting";
import type { Character } from "@/types/character";
import styles from "@/styles/lobby.module.css";

interface CharacterCardProps {
  character: Character;
  onSelect: () => void;
  disabled: boolean;
}

function CharacterCard({ character, onSelect, disabled }: CharacterCardProps) {
  return (
    <div
      className={styles.characterCard}
      onClick={disabled ? undefined : onSelect}
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-disabled={disabled}
      style={disabled ? { opacity: 0.55, cursor: "not-allowed" } : undefined}
    >
      <h3 className={styles.characterName}>{character.name}</h3>
      <p className={styles.characterDesc}>
        {character.description ?? "No description provided."}
      </p>
      <div className={styles.selectHint}>
        <InfoCircleOutlined className={styles.hintIcon} />
        <span className={styles.hintText}>
          {disabled ? "Submitting…" : "Click to select"}
        </span>
      </div>
    </div>
  );
}

export default function GameLobbyPage() {
  const { token, userId, isAuthenticated, authReady } = useAuth();
  const router = useRouter();
  const params = useParams();
  const scenarioId = Number(params.id);
  const api = useApi();
  const [messageApi, contextHolder] = message.useMessage();

  const characterService = useMemo(() => new CharacterService(api), [api]);
  const { setCharacterId } = useSelectedCharacter(scenarioId);
  const { engagement, loading: engagementLoading } = useMyEngagement(
    scenarioId,
    userId,
    token,
  );

  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (authReady && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated, authReady, router]);

  // Auto-redirect when the user already has a role in this scenario.
  useEffect(() => {
    if (engagementLoading || !engagement) return;
    routeForEngagement(engagement, scenarioId, router, "replace");
  }, [engagement, engagementLoading, scenarioId, router]);

  useEffect(() => {
    if (!token || !scenarioId) return;

    let cancelled = false;

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const chars = await characterService.getCharactersByScenario(scenarioId, token);
        if (!cancelled) {
          setCharacters(chars);
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
  }, [token, scenarioId, characterService]);

  if (!authReady || !isAuthenticated) return null;
  // While we resolve whether the user already has a role, don't flash the lobby UI.
  if (engagementLoading || engagement) return null;

  const handleSelectCharacter = async (character: Character) => {
    if (character.id == null || submitting) return;
    setSubmitting(true);
    try {
      const claimed = await characterService.claimCharacter(
        scenarioId,
        character.id,
        token,
      );
      const claimedId = claimed.id ?? character.id;
      setCharacterId(claimedId);
      router.push(`/scenarios/${scenarioId}/player`);
    } catch (err) {
      messageApi.error(err instanceof Error ? err.message : "Failed to claim character");
      setSubmitting(false);
    }
  };

  const handleBecomeBackroomer = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      await characterService.becomeBackroomer(scenarioId, token);
      router.push(`/scenarios/${scenarioId}/backroom`);
    } catch (err) {
      messageApi.error(err instanceof Error ? err.message : "Failed to become Backroomer");
      setSubmitting(false);
    }
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
      {contextHolder}
      <div className={styles.pageRoot}>
        <nav className={styles.navbar}>
          <div className={styles.navLeft}>
            <div className={styles.logoMark} aria-hidden="true" />
            <span className={styles.navTitle}>Game Lobby</span>
            <Button onClick={() => router.push("/scenarios")}>
              All Scenarios
            </Button>
          </div>
          <div>
            <Avatar icon={<UserOutlined />} className={styles.avatar} />
          </div>
        </nav>

        <main className={styles.pageBody}>
          <Button
            type="primary"
            className={styles.backroomerButton}
            loading={submitting}
            onClick={handleBecomeBackroomer}
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
                  disabled={submitting}
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
