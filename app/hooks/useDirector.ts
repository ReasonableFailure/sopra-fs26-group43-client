import useLocalStorage from "@/hooks/useLocalStorage";

export function useDirector(scenarioId: number) {
  const { value: directorId, set: setDirectorId, ready: readyDirectorId } =
    useLocalStorage<
      number | null
    >(`scenario_${scenarioId}_directorId`, null);
  const {
    value: directorToken,
    set: setDirectorToken,
    ready: readyDirectorToken,
  } = useLocalStorage<
    string | null
  >(`scenario_${scenarioId}_directorToken`, null);
  return {
    directorId,
    directorToken,
    setDirectorToken,
    setDirectorId,
    readyDirectorId,
    readyDirectorToken,
  };
}
