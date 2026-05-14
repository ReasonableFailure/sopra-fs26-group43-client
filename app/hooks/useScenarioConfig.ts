"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * Configuration controlled by a Director for a given scenario.
 *
 * - maxBackroomers: maximum number of backroomers allowed to join. Defaults to 2.
 * - backroomerCode: secret code a backroomer must supply to join. Defaults to "".
 *
 * Persisted in localStorage and scoped per scenarioId so different scenarios
 * keep independent settings.
 */
export interface ScenarioConfig {
  maxBackroomers: number;
  backroomerCode: string;
}

const DEFAULT_CONFIG: ScenarioConfig = {
  maxBackroomers: 2,
  backroomerCode: "",
};

const configKey = (scenarioId: number | string) =>
  `scenarioConfig:${scenarioId}`;

const joinedKey = (scenarioId: number | string) =>
  `scenarioJoined:${scenarioId}`;

function readJSON<T>(key: string, fallback: T): T {
  try {
    const stored = globalThis.localStorage?.getItem(key);
    if (stored === null || stored === undefined) return fallback;
    return JSON.parse(stored) as T;
  } catch {
    return fallback;
  }
}

function writeJSON<T>(key: string, value: T): void {
  try {
    globalThis.localStorage?.setItem(key, JSON.stringify(value));
  } catch {
    // ignore storage failures (private mode, quota, SSR, etc.)
  }
}

/**
 * Hook for managing a director-controlled scenario configuration in
 * localStorage. Returns the current config, the number of backroomers
 * who have already joined, and helpers to mutate / inspect it.
 */
export function useScenarioConfig(scenarioId: number | string) {
  const [config, setConfig] = useState<ScenarioConfig>(() =>
    readJSON<ScenarioConfig>(configKey(scenarioId), DEFAULT_CONFIG)
  );
  const [joined, setJoined] = useState<number>(() =>
    readJSON<number>(joinedKey(scenarioId), 0)
  );

  // Re-sync when scenarioId changes
  useEffect(() => {
    setConfig(readJSON<ScenarioConfig>(configKey(scenarioId), DEFAULT_CONFIG));
    setJoined(readJSON<number>(joinedKey(scenarioId), 0));
  }, [scenarioId]);

  const updateConfig = useCallback(
    (partial: Partial<ScenarioConfig>) => {
      setConfig((prev) => {
        const next = { ...prev, ...partial };
        writeJSON(configKey(scenarioId), next);
        return next;
      });
    },
    [scenarioId],
  );

  const isCodeCorrect = useCallback(
    (candidate: string): boolean => {
      const expected = config.backroomerCode;
      // Director has not set a code: no one can join with a code
      if (!expected) return false;
      return candidate.trim() === expected;
    },
    [config.backroomerCode],
  );

  const canJoinBackroom = useCallback(
    (): boolean => joined < config.maxBackroomers,
    [joined, config.maxBackroomers],
  );

  const registerBackroomerJoin = useCallback(() => {
    setJoined((prev) => {
      const next = prev + 1;
      writeJSON(joinedKey(scenarioId), next);
      return next;
    });
  }, [scenarioId]);

  return {
    config,
    joined,
    updateConfig,
    isCodeCorrect,
    canJoinBackroom,
    registerBackroomerJoin,
  };
}

export default useScenarioConfig;
