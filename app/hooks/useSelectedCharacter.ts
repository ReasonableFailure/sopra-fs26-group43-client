import useLocalStorage from "@/hooks/useLocalStorage";

/**
 * Persists the character ID a player selected in the lobby,
 * keyed per scenario so different scenarios track independently.
 */
export function useSelectedCharacter(scenarioId: number) {
  const key = `selectedCharacter_${scenarioId}`;
  const { value: characterId, set: setCharacterId } = useLocalStorage<number | null>(key, null);
  const { value: characterToken, set: setCharacterToken } = useLocalStorage<string | null>(key, null);
  return { characterToken, setCharacterToken, characterId, setCharacterId };
}
