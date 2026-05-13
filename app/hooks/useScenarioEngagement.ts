"use client";

import { useMemo } from "react";
import { useEngagedScenarios } from "@/hooks/useEngagedScenarios";

//Give me my engagement for scenario scenarioId
export const useScenarioEngagement = (
  scenarioId: number,
  userId: number,
  token: string, //needs to belong to user
) => {
  const { engagements, loading, error, refetch } = useEngagedScenarios(
    userId,
    token,
  );
  const engagement = useMemo(
    () => engagements?.find((e) => e.scenarioId === scenarioId) ?? null,
    [engagements, scenarioId],
  );
  return { engagement, loading, error, refetch };
};
