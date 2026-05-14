import useLocalStorage from "@/hooks/useLocalStorage";

/**
 * Persists the backroomer ID a player selected in the lobby,
 * keyed per scenario so different scenarios track independently.
 */
export function useBackroomer(scenarioId: number) {
  const {
    value: backroomerId,
    set: setBackroomerId,
    ready: readyBackroomerId,
  } = useLocalStorage<
    number | null
  >(`scenario_${scenarioId}_backroomerId`, null);
  const {
    value: backroomerToken,
    set: setBackroomerToken,
    ready: readyBackroomerToken,
  } = useLocalStorage<
    string | null
  >(`scenario_${scenarioId}_backroomerToken`, null);
  return {
    backroomerId,
    setBackroomerId,
    backroomerToken,
    setBackroomerToken,
    readyBackroomerId,
    readyBackroomerToken,
  };
}
