"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button, ConfigProvider, message, Modal, Spin, theme } from "antd";
import { InfoCircleOutlined } from "@ant-design/icons";
import { useAuth } from "@/hooks/useAuth";
import { useApi } from "@/hooks/useApi";
import { useScenarioEngagement } from "../../../hooks/useScenarioEngagement";
import { CharacterService } from "@/api/characterService";
import { ScenarioService } from "@/api/scenarioService";
import { BackroomerService } from "@/api/backroomerService";
import { useCharacter } from "../../../hooks/useCharacter";
import { useBackroomer } from "@/hooks/useBackroomer";
import type { Character } from "@/types/character";
import type { BackroomerPostDTO } from "@/types/backroomer";
import type { Scenario } from "@/types/scenario";
import { ScenarioStatus } from "@/types/scenario";
import styles from "@/styles/lobby.module.css";
import { usePlayerRole } from "@/hooks/usePlayerRole";
import { UserAssignDTO } from "@/types/user";
import { portraitSrc } from "@/utils/portrait";
import { UserAvatarMenu } from "@/components/UserAvatarMenu";
import { NavLogo } from "@/components/NavLogo";

interface CharacterCardProps {
  character: Character;
  onSelect: () => void;
  disabled: boolean;
}

function CharacterCard({ character, onSelect, disabled }: CharacterCardProps) {
  const [open, setOpen] = useState(false);
  const description = character.description?.trim();
  const portrait = portraitSrc(character.portrait);
  const initialsFallback = (character.name ?? "?").slice(0, 2).toUpperCase();

  const handleSelect = () => {
    setOpen(false);
    onSelect();
  };

  return (
    <>
      <div
        className={styles.characterCard}
        onClick={() => setOpen(true)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setOpen(true);
          }
        }}
        role="button"
        tabIndex={0}
      >
        <div className={styles.cardHeader}>
          <div className={styles.cardText}>
            <h3 className={styles.characterName}>
              {character.name}
            </h3>

            <p className={styles.characterTitle}>
              {character.title ?? "No title provided."}
            </p>
          </div>

          <div className={styles.characterPortraitWrapper}>
            {portrait
              ? (
                <img
                  src={portrait}
                  alt={character.name ?? "Character portrait"}
                  className={styles.characterPortrait}
                />
              )
              : (
                <div className={styles.characterPortraitFallback}>
                  {initialsFallback}
                </div>
              )}
          </div>
        </div>

        <div className={styles.selectHint}>
          <InfoCircleOutlined className={styles.hintIcon} />
          <span className={styles.hintText}>
            {disabled ? "Submitting…" : "Click to view details"}
          </span>
        </div>
      </div>

      <Modal
        title={
          <span className={styles.popoverHeader}>
            {character.name ?? "Character"}
          </span>
        }
        open={open}
        onCancel={() => setOpen(false)}
        footer={null}
        width={520}
        className={styles.popoverOverlay}
        destroyOnHidden
      >
        <div className={styles.characterModalBody}>
          <div className={styles.characterModalPortraitWrap}>
            {portrait
              ? (
                <img
                  src={portrait}
                  alt={character.name ?? "Character portrait"}
                  className={styles.characterModalPortrait}
                />
              )
              : (
                <div className={styles.characterModalPortraitFallback}>
                  {initialsFallback}
                </div>
              )}
          </div>

          {character.title && (
            <div className={styles.popoverField}>
              <span className={styles.popoverLabel}>Title</span>
              <p className={styles.popoverValue}>{character.title}</p>
            </div>
          )}

          <div className={styles.popoverField}>
            <span className={styles.popoverLabel}>Description</span>
            <p className={styles.popoverValue}>
              {description ?? "No description provided."}
            </p>
          </div>

          <div className={styles.characterModalActions}>
            <Button
              type="primary"
              size="large"
              block
              loading={disabled}
              onClick={handleSelect}
            >
              Select this character
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}

export default function GameLobbyPage() {
  const { token, userId, isAuthenticated, authReady } = useAuth(); //contains prefix already
  const router = useRouter();
  const params = useParams();
  const scenarioId = Number(params.id);
  const api = useApi();
  const { setPlayerRole } = usePlayerRole(userId);

  const characterService = useMemo(() => new CharacterService(api), [api]);
  const backroomerService = useMemo(() => new BackroomerService(api), [api]);
  const scenarioService = useMemo(() => new ScenarioService(api), [api]);
  const { setCharacterId, setCharacterToken } = useCharacter(
    scenarioId,
  );
  const { setBackroomerId, setBackroomerToken } = useBackroomer(
    scenarioId,
  );
  const { engagement, loading: engagementLoading } = useScenarioEngagement(
    scenarioId,
    userId,
    token,
  );
  const [messageApi, contextHolder] = message.useMessage();

  const [characters, setCharacters] = useState<Character[]>([]);
  const [scenario, setScenario] = useState<Scenario | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (authReady && !isAuthenticated) {
      router.replace("/login");
    }
  }, [authReady, isAuthenticated, router]);

  // If the user already has a role in this scenario, send them to the right dashboard.
  useEffect(() => {
    if (!engagement) return;
    if (engagement.roleType === "DIRECTOR") {
      router.replace(`/scenarios/${scenarioId}`);
    } else if (engagement.roleType === "BACKROOMER") {
      router.replace(`/scenarios/${scenarioId}/backroom`);
    } else {
      router.replace(`/scenarios/${scenarioId}/player`);
    }
  }, [engagement, router, scenarioId]);

  // Fetch the scenario so the lobby can show its title/description AND
  // (for non-engaged viewers) redirect away from a COMPLETED scenario.
  // Combined into one fetch because both needs are satisfied by the
  // same GET; keeping them separate would double the request.
  useEffect(() => {
    if (engagementLoading || engagement || !scenarioId || !token) return;
    let cancelled = false;
    scenarioService
      .getScenarioById(scenarioId, token)
      .then((scen) => {
        if (cancelled) return;
        setScenario(scen);
        if (scen.status === ScenarioStatus.COMPLETED) {
          router.replace(`/scenarios/${scenarioId}/news`);
        }
      })
      .catch(() => {
        // Silent: leaving the user on the lobby is acceptable if the
        // status fetch fails. They'll see the regular error path below
        // if character loading also fails.
      });
    return () => {
      cancelled = true;
    };
  }, [
    engagement,
    engagementLoading,
    scenarioId,
    token,
    scenarioService,
    router,
  ]);

  useEffect(() => {
    if (!token || !scenarioId) return;

    let cancelled = false;

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const chars = await characterService.getCharactersByScenario(
          scenarioId,
          token,
        );
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
    if (!userId || userId === 0 || !character.id || !token) return;
    setSubmitting(true);
    try {
      const dto: UserAssignDTO = {
        id: userId,
      };
      const claimed = await characterService.assignCharacter(
        dto,
        token,
        character.id,
      );
      if (claimed.id) setCharacterId(claimed.id);
      if (claimed.token) setCharacterToken(claimed.token);
      setPlayerRole("character");
      router.push(`/scenarios/${scenarioId}/player`);
    } catch (err) {
      messageApi.error(
        err instanceof Error ? err.message : "Failed to claim character",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleSelectBackroomer = async () => {
    if (!userId || userId === 0 || !token) return;
    setSubmitting(true);
    try {
      const dto: BackroomerPostDTO = {
        id: userId,
      };
      const res = await backroomerService.createBackroomer(
        dto,
        scenarioId,
        token,
      );
      if (res?.id) setBackroomerId(res.id);
      if (res?.token) setBackroomerToken(res.token);
      setPlayerRole("backroomer");
      router.push(`/scenarios/${scenarioId}/backroom`);
    } catch (err) {
      messageApi.error(
        err instanceof Error ? err.message : "Failed to become backroomer",
      );
    } finally {
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
            <NavLogo className={styles.logoMark} />
            <span className={styles.navTitle}>Game Lobby</span>
          </div>
          <div className={styles.navRight}>
            <Button onClick={() => router.push("/scenarios")}>
              All Scenarios
            </Button>
            <UserAvatarMenu avatarClassName={styles.avatar} />
          </div>
        </nav>

        <main className={styles.pageBody}>
          {scenario && (
            <section className={styles.scenarioBrief}>
              <p className={styles.scenarioBriefEyebrow}>Scenario Brief</p>
              <h1 className={styles.scenarioBriefTitle}>{scenario.title}</h1>
              <p className={styles.scenarioBriefDescription}>
                {scenario.description?.trim()
                  ? scenario.description
                  : "No description provided for this scenario."}
              </p>
            </section>
          )}

          <Button
            type="primary"
            className={styles.backroomerButton}
            onClick={() => handleSelectBackroomer()}
          >
            Become Backroomer
          </Button>

          <h2 className={styles.sectionHeading}>Select Your Character</h2>
          <p className={styles.sectionSubheading}>
            Choose a character to begin your journey
          </p>

          {error && <p className={styles.errorText}>{error}</p>}

          <Spin spinning={loading}>
            <div className={styles.characterGrid}>
              {!loading && characters.length === 0 && (
                <p className={styles.emptyText}>
                  No characters available for this scenario.
                </p>
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
