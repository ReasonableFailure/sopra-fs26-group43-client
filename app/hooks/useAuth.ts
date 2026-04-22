"use client";

import { useCallback, useMemo } from "react";
import { useApi } from "@/hooks/useApi";
import useLocalStorage from "@/hooks/useLocalStorage";
import { UserService } from "@/api/userService";
import { UserLoginDTO, UserPostDTO } from "@/types/user";

export const useAuth = () => {
  const api = useApi();
  const userService = useMemo(() => new UserService(api), [api]);

  const { value: token, set: setToken, clear: clearToken, ready: tokenReady } = useLocalStorage<string>("token", "");
  const { value: userId, set: setUserId, clear: clearUserId, ready: userIdReady } = useLocalStorage<number>("userId", 0);

  const isAuthenticated = !!token;
  const authReady = tokenReady && userIdReady;

  const register = useCallback(async (data: UserPostDTO) => {
    const user = await userService.register(data);
    if (user.token) setToken(user.token);
    if (user.id) setUserId(user.id);
    return user;
  }, [userService, setToken, setUserId]);

  const login = useCallback(async (data: UserLoginDTO) => {
    const user = await userService.login(data);
    if (user.token) setToken(user.token);
    if (user.id) setUserId(user.id);
    return user;
  }, [userService, setToken, setUserId]);

  const logout = useCallback(async () => {
    if (token && userId) {
      await userService.logout(userId, token);
    }
    clearToken();
    clearUserId();
  }, [userService, token, userId, clearToken, clearUserId]);

  return { token, userId, isAuthenticated, authReady, register, login, logout };
};
