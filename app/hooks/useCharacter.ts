import useLocalStorage from "@/hooks/useLocalStorage";

/**
 * Persists the character ID a player selected in the lobby,
 * keyed per (user, scenario) so different users in the same browser
 * — and the same user across scenarios — track independently.
 */
export function useCharacter(
  scenarioId: number,
  userId: number | null,
) {
  const suffix = userId ? `${userId}_${scenarioId}` : `guest_${scenarioId}`;
  const { value: characterId, set: setCharacterId } = useLocalStorage<
    number | null
  >(`selectedCharacter_${suffix}_id`, null);
  const { value: characterToken, set: setCharacterToken } = useLocalStorage<
    string | null
  >(`selectedCharacter_${suffix}_token`, null);
  return { characterToken, setCharacterToken, characterId, setCharacterId };
}
