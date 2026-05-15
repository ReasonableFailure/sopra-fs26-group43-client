"use client";

import { useCallback, useMemo } from "react";
import { useApi } from "@/hooks/useApi";
import useLocalStorage from "@/hooks/useLocalStorage";
import { UserService } from "@/api/userService";
import { User, UserLoginDTO, UserPostDTO } from "@/types/user";

export const useAuth = () => {
  const api = useApi();
  const userService = useMemo(() => new UserService(api), [api]);

  const { value: token, set: setToken, clear: clearToken, ready: tokenReady } =
    useLocalStorage<string>("token", "");
  const {
    value: userId,
    set: setUserId,
    clear: clearUserId,
    ready: userIdReady,
  } = useLocalStorage<number>("userId", 0);

  const isAuthenticated = !!token;
  const authReady = tokenReady && userIdReady;

  const register = useCallback(async (data: UserPostDTO): Promise<User> => {
    //Prefix for auth already added
    const user = await userService.register(data);
    if (user.token) setToken(`Bearer ${user.token}`);
    if (user.id) setUserId(user.id);
    return user;
  }, [userService, setToken, setUserId]);

  const login = useCallback(async (data: UserLoginDTO): Promise<User> => {
    //Prefix for auth already added
    const user = await userService.login(data);
    if (user.token) setToken(`Bearer ${user.token}`);
    if (user.id) setUserId(user.id);
    return user;
  }, [userService, setToken, setUserId]);

  const logout = useCallback(async (): Promise<void> => {
    if (token && userId) {
      try {
        await userService.logout(userId, token);
      } catch {
        // even if BE logout fails, we still wipe local state below
      }
    }
    // Wipe every key that holds per-session state so the next user
    // doesn't inherit the previous user's role / character / tokens.
    try {
      const SESSION_PREFIXES = [
        "playerRole",
        "selectedCharacter_",
        "backroomer_",
        "director_scenarios_",
      ];
      // Per-scenario role tokens live under keys like
      // `scenario_${scenarioId}_directorToken/Id`,
      // `scenario_${scenarioId}_backroomerToken/Id`,
      // `scenario_${scenarioId}_characterToken/Id`.
      // We must wipe these on logout so the next user on this browser
      // doesn't inherit the previous user's per-scenario credentials.
      const SESSION_SUFFIXES = [
        "_directorToken",
        "_directorId",
        "_backroomerToken",
        "_backroomerId",
        "_characterToken",
        "_characterId",
      ];
      const toRemove: string[] = [];
      for (let i = 0; i < globalThis.localStorage.length; i++) {
        const k = globalThis.localStorage.key(i);
        if (!k) continue;
        if (SESSION_PREFIXES.some((p) => k.startsWith(p))) {
          toRemove.push(k);
        } else if (
          k.startsWith("scenario_") &&
          SESSION_SUFFIXES.some((s) => k.endsWith(s))
        ) {
          toRemove.push(k);
        }
      }
      toRemove.forEach((k) => globalThis.localStorage.removeItem(k));
    } catch {
      // ignore — localStorage may be unavailable (SSR / privacy mode)
    }
    clearToken();
    clearUserId();
  }, [userService, token, userId, clearToken, clearUserId]);

  return {
    token,
    userId,
    isAuthenticated,
    authReady,
    register,
    login,
    logout,
    setToken,
    setUserId,
    clearToken,
    clearUserId,
    userIdReady,
  };
};
