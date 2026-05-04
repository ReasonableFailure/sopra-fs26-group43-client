import useLocalStorage from "@/hooks/useLocalStorage";

export function useDirector(userId: number) {
  const key = `director_scenarios_${userId}`;
  const { value: directorId, set: setDirectorId, clear: clearDirectorId } =
    useLocalStorage<number | null>(key, null);
  const {
    value: directorToken,
    set: setDirectorToken,
    clear: clearDirectorToken,
  } = useLocalStorage<string | null>(key, null);
  return { directorId, directorToken, setDirectorToken, setDirectorId };
}
