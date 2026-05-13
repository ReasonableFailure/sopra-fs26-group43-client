import useLocalStorage from "@/hooks/useLocalStorage";

export function useDirector(scenarioId: number) {
  const { value: directorId, set: setDirectorId } = useLocalStorage<
    number | null
  >(`scenario_${scenarioId}_directorId`, null);
  const { value: directorToken, set: setDirectorToken } = useLocalStorage<
    string | null
  >(`scenario_${scenarioId}_directorToken`, null);
  return { directorId, directorToken, setDirectorToken, setDirectorId };
}
