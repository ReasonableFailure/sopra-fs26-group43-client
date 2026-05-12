"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useApi } from "@/hooks/useApi";
import { UserService } from "@/api/userService";
import { Engagement } from "@/types/engagement";

export const useEngagedScenarios = (userId: number | null, token: string) => {
  const api = useApi();
  const userService = useMemo(() => new UserService(api), [api]);

  const [engagements, setEngagements] = useState<Engagement[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEngagements = useCallback(async () => {
    if (!token || userId == null) return;
    setLoading(true);
    setError(null);
    try {
      const data = await userService.getEngagements(userId, token);
      setEngagements(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch engagements",
      );
    } finally {
      setLoading(false);
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
    fetchEngagements();
  }, [fetchEngagements, token, userId]);

  return { engagements, loading, error, refetch: fetchEngagements };
};
