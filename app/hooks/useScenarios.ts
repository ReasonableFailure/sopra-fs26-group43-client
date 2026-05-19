"use client";

import { useMemo } from "react";
import { useApi } from "@/hooks/useApi";
import { ScenarioService } from "@/api/scenarioService";
import { Scenario } from "@/types/scenario";
import { useAuth } from "@/hooks/useAuth";
import { usePolling } from "@/hooks/usePolling";

/**
 * Polls GET /scenarios so newly-created scenarios show up on the All
 * Scenarios tab without a manual refresh. 5s cadence matches the rest
 * of the app's polling.
 */
export const useScenarios = () => {
  const api = useApi();
  const scenarioService = useMemo(() => new ScenarioService(api), [api]);
  const { token } = useAuth();

  const { data, loading, error } = usePolling<Scenario[]>(
    () => scenarioService.getScenarios(token),
    60000,
    !!token,
  );

  return { scenarios: data, loading, error };
};
