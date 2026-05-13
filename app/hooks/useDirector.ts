import useLocalStorage from "@/hooks/useLocalStorage";

export function useDirector(id: number) {
  const { value: directorId, set: setDirectorId } = useLocalStorage<
    number | null
  >(`director_scenarios_${id}_id`, null);
  const { value: directorToken, set: setDirectorToken } = useLocalStorage<
    string | null
  >(`director_scenarios_${id}_token`, null);
  return { directorId, directorToken, setDirectorToken, setDirectorId };
}
