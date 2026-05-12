import useLocalStorage from "@/hooks/useLocalStorage";

export function useDirector(userId: number) {
  const { value: directorId, set: setDirectorId } = useLocalStorage<
    number | null
  >(`director_scenarios_${userId}_id`, null);
  const { value: directorToken, set: setDirectorToken } = useLocalStorage<
    string | null
  >(`director_scenarios_${userId}_token`, null);
  return { directorId, directorToken, setDirectorToken, setDirectorId };
}
