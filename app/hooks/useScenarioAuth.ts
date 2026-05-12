import { useAuth } from "@/hooks/useAuth";
import { useBackroomer } from "@/hooks/useBackroomer";
import { useDirector } from "@/hooks/useDirector";
import { usePlayerRole } from "@/hooks/usePlayerRole";
import { useSelectedCharacter } from "@/hooks/useSelectedCharacter";

/**
 * Returns the Authorization header to use for scenario-scoped API calls.
 * The backend's PlayerService.validate accepts player-typed tokens
 * ("Role <token>", "Backroomer <token>", "Director <token>") for any
 * endpoint marked validate(..., "any"|"Role"|"Backroomer"|"Director").
 *
 * The role-typed token strings are produced by the backend (see
 * PlayerDTOMapper.addPrefix / addRolePrefix) and stored verbatim, so
 * we just return the stored string.
 *
 * For pre-engagement flows (lobby, scenario create/list) callers should
 * still use `Bearer ${userToken}` directly.
 */
export function useScenarioAuthHeader(scenarioId: number): string | null {
  const { token, userId } = useAuth();
  const { playerRole } = usePlayerRole(userId);
  const { characterToken } = useSelectedCharacter(scenarioId, userId);
  const { backroomerToken } = useBackroomer(scenarioId, userId ?? 0);
  const { directorToken } = useDirector(userId ?? 0);

  if (playerRole === "character" && characterToken) return characterToken;
  if (playerRole === "backroomer" && backroomerToken) return backroomerToken;
  if (playerRole === "director" && directorToken) return directorToken;
  return token ? `Bearer ${token}` : null;
}
