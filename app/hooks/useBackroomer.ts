import useLocalStorage from "@/hooks/useLocalStorage";

/**
 * Persists the character ID a player selected in the lobby,
 * keyed per scenario so different scenarios track independently.
 */
export function useBackroomer(scenarioId: number, userId: number | null) {
  const suffix = userId ? `${userId}_${scenarioId}` : `guest_${scenarioId}`;
  const { value: backroomerId, set: setBackroomerId } = useLocalStorage<
    number | null
  >(`backroomer_${suffix}_id`, null);
  const { value: backroomerToken, set: setBackroomerToken } = useLocalStorage<
    string | null
  >(`backroomer_${suffix}_token`, null);
  return { backroomerId, setBackroomerId, backroomerToken, setBackroomerToken };
}
