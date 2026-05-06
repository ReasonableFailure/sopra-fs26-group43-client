"use client";

import { useEffect, useMemo, useState } from "react";
import { useApi } from "@/hooks/useApi";
import { ScenarioService } from "@/api/scenarioService";
import { Scenario } from "@/types/scenario";
import {useAuth} from "@/hooks/useAuth";

export const useScenarios = (userType: string) => {
  const api = useApi();
  const scenarioService = useMemo(() => new ScenarioService(api), [api]);
  const {token} = useAuth();
  const [scenarios, setScenarios] = useState<Scenario[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userType) return;

    let cancelled = false;

    const fetch = async () => {
      setLoading(true);
      setError(null);
      try {
        if(token){
          const data = await scenarioService.getScenarios(userType + token);
          if (!cancelled) setScenarios(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Failed to fetch scenarios",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetch();
    return () => {
      cancelled = true;
    };
  }, [scenarioService, userType, token]);

  return { scenarios, loading, error };
};
