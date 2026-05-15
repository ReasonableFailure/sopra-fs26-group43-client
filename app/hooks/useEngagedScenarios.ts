"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useApi } from "@/hooks/useApi";
import { UserService } from "@/api/userService";
import { Engagement } from "@/types/engagement";

/**
 * Restores per-scenario role tokens to localStorage so the dashboards
 * find them after a logout/login (when useAuth.logout wipes them).
 *
 * Token keys are intentionally the same ones `useDirector`,
 * `useBackroomer`, `useCharacter` read — writing here is the canonical
 * way to "rehydrate" a returning user's role context.
 */
function persistEngagementTokens(items: Engagement[]) {
  try {
    for (const e of items) {
      if (!e.token) continue;
      const keys: Record<typeof e.roleType, [string, string]> = {
        DIRECTOR: [
          `scenario_${e.scenarioId}_directorToken`,
          `scenario_${e.scenarioId}_directorId`,
        ],
        BACKROOMER: [
          `scenario_${e.scenarioId}_backroomerToken`,
          `scenario_${e.scenarioId}_backroomerId`,
        ],
        CHARACTER: [
          `scenario_${e.scenarioId}_characterToken`,
          `scenario_${e.scenarioId}_characterId`,
        ],
      };
      const [tokenKey, idKey] = keys[e.roleType];
      globalThis.localStorage.setItem(tokenKey, JSON.stringify(e.token));
      globalThis.localStorage.setItem(idKey, JSON.stringify(e.playerId));
    }
  } catch {
    // localStorage may be unavailable (SSR / privacy mode)
  }
}

/**
 * Returns every scenario the user is engaged in (any role). Polls every
 * 5s so newly-claimed engagements or status changes (FROZEN/COMPLETED)
 * show up on the My Scenarios tab without a manual refresh. Also keeps
 * the per-scenario role tokens in localStorage rehydrated on each tick.
 */
export const useEngagedScenarios = (userId: number | null, token: string) => {
  const api = useApi();
  const userService = useMemo(() => new UserService(api), [api]);

  const [engagements, setEngagements] = useState<Engagement[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Hold the latest fetch promise in a ref so manual refetch() and the
  // poll loop share the same code path without races.
  const inFlightRef = useRef<Promise<void> | null>(null);

  const fetchEngagements = useCallback(async () => {
    if (!token || userId == null) {
      setEngagements(null);
      setError(null);
      setLoading(false);
      return;
    }
    const run = (async () => {
      try {
        const data = await userService.getEngagements(userId, token);
        setEngagements(data);
        setError(null);
        persistEngagementTokens(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch engagements",
        );
      } finally {
        setLoading(false);
      }
    })();
    inFlightRef.current = run;
    try {
      await run;
    } finally {
      // Always clear so the next poll tick can run; otherwise the ref
      // would hold a long-completed promise and the loop would stall.
      if (inFlightRef.current === run) {
        inFlightRef.current = null;
      }
    }
  }, [userService, userId, token]);

  useEffect(() => {
    if (!token || !userId) {
      // Drop the previous user's data so the next user doesn't see it.
      setEngagements(null);
      setError(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    fetchEngagements();
    const id = setInterval(() => {
      // Skip if a previous poll is still in flight to avoid stampeding.
      if (inFlightRef.current) return;
      fetchEngagements();
    }, 5000);
    return () => clearInterval(id);
  }, [fetchEngagements, token, userId]);

  return { engagements, loading, error, refetch: fetchEngagements };
};
