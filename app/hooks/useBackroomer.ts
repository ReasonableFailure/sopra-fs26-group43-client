import useLocalStorage from "@/hooks/useLocalStorage";

/**
 * Persists the character ID a player selected in the lobby,
 * keyed per scenario so different scenarios track independently.
 */
export function useBackroomer(scenarioId: number) {
  const key = `backroomer_${scenarioId}`;
  const { value: backroomerId, set: setBackroomerId } = useLocalStorage<
    number | null
  >(key, null);
  const { value: backroomerToken, set: setBackroomerToken } = useLocalStorage<
    string | null
  >(key, null);
  return { backroomerId, setBackroomerId, backroomerToken, setBackroomerToken };
}
