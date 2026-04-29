"use client";

import {use, useEffect, useMemo, useState} from "react";
import { useParams, useRouter } from "next/navigation";
import { Avatar, Button, ConfigProvider, Spin, theme } from "antd";
import { InfoCircleOutlined, UserOutlined } from "@ant-design/icons";
import { useAuth } from "@/hooks/useAuth";
import { useApi } from "@/hooks/useApi";
import { CharacterService } from "@/api/characterService";
import { useSelectedCharacter } from "@/hooks/useSelectedCharacter";
import type {Character, CharacterAssignDTO} from "@/types/character";
import styles from "@/styles/lobby.module.css";
import {Backroomer} from "@/types/backroomer";

interface CharacterCardProps {
  character: Character;
  onSelect: () => void;
}

function CharacterCard({ character, onSelect }: CharacterCardProps) {
  return (
    <div className={styles.characterCard} onClick={onSelect} role="button" tabIndex={0}>
      <h3 className={styles.characterName}>{character.name}</h3>
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
  const { token, userId, isAuthenticated, authReady } = useAuth();
  const router = useRouter();
  const params = useParams();
  const scenarioId = Number(params.id);
  const api = useApi();

  const characterService = useMemo(() => new CharacterService(api), [api]);
  const { setCharacterId } = useSelectedCharacter(scenarioId);

  const [characters, setCharacters] = useState<Character[]>([]);
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

  const handleSelectCharacter = async (character: Character) => {
    //User is not being assigned to Role in Backend
    if(!userId || userId === 0 || !character.id || !token) return null;
    const dtoToAssign: CharacterAssignDTO = {
      toAssignId: userId
    };
   try{
     await characterService.assignCharacter(dtoToAssign,token,character.id);
     setCharacterId(character.id);
     router.push(`/scenarios/${scenarioId}/player`);
   } catch (error) {
     console.log(error);
   }
  };

  const handleSelectBackroomer = async (backroomer: Backroomer)=> {
    router.push(`/scenarios/${scenarioId}/backroom`);
  }

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
