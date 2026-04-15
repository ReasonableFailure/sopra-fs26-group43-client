import useLocalStorage from "@/hooks/useLocalStorage";

/**
 * Tracks the IDs of scenarios created by this user in localStorage.
 * Used client-side to determine if the current user is the director
 * of a scenario without a backend call.
 */
export function useDirectedScenarios() {
  const { value: directedIds, set: setDirectedIds } = useLocalStorage<number[]>(
    "directedScenarios",
    [],
  );

  const addDirectedScenario = (id: number) => {
    if (!directedIds.includes(id)) {
      setDirectedIds([...directedIds, id]);
    }
  };

  const isDirector = (id: number) => directedIds.includes(id);

  return { addDirectedScenario, isDirector };
}
