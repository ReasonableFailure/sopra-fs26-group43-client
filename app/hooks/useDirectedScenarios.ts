import useLocalStorage from "@/hooks/useLocalStorage";

export function useDirectedScenarios(userId: number | null) {
  const { value: directedIds, set: setDirectedIds } = useLocalStorage<number[]>(
    userId ? `directedScenarios_${userId}` : "directedScenarios_guest",
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
