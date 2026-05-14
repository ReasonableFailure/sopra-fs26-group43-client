import useLocalStorage from "@/hooks/useLocalStorage";

/**
 * Tracks which scenarios the current user has directed.
 *
 * IMPORTANT — hydration race:
 * `useLocalStorage` cannot read browser storage until `useEffect` runs on
 * the client, so on the very first render `directedIds` is the empty
 * default and `isDirector(...)` returns false even for a real director.
 * Callers that gate UI on `isDirector(...)` MUST check the `ready` flag
 * before deciding to redirect; otherwise a legitimate director is bounced
 * during the first paint.
 */
export function useDirectedScenarios(userId: number | null) {
  const { value: directedIds, set: setDirectedIds, ready } = useLocalStorage<
    number[]
  >(
    userId ? `directedScenarios_${userId}` : "directedScenarios_guest",
    [],
  );

  const addDirectedScenario = (id: number) => {
    if (!directedIds.includes(id)) {
      setDirectedIds([...directedIds, id]);
    }
  };

  const isDirector = (id: number) => directedIds.includes(id);

  return { addDirectedScenario, isDirector, ready };
}
