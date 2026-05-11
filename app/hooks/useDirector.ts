import useLocalStorage from "@/hooks/useLocalStorage";

export function useDirector(userId: number) {
  const key = `director_scenarios_${userId}`;
  const { value: directorId, set: setDirectorId, clear: _clearDirectorId } =
    useLocalStorage<number | null>(key, null);
  const {
    value: directorToken,
    set: setDirectorToken,
    clear: _clearDirectorToken,
  } = useLocalStorage<string | null>(key, null);
  return { directorId, directorToken, setDirectorToken, setDirectorId };
}
