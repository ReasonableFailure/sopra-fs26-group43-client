"use client";

import { useMemo } from "react";
import { useEngagedScenarios } from "@/hooks/useEngagedScenarios";

export const useMyEngagement = (
  scenarioId: number,
  userId: number | null,
  token: string,
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
