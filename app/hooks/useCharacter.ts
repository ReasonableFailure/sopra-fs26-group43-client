import useLocalStorage from "@/hooks/useLocalStorage";

/**
 * Persists the character ID a player selected in the lobby,
 * keyed per (user, scenario) so different users in the same browser
 * — and the same user across scenarios — track independently.
 */
export function useCharacter(
  scenarioId: number,
) {
  const { value: characterId, set: setCharacterId } = useLocalStorage<
    number | null
  >(`scenario_${scenarioId}_characterId`, null);
  const { value: characterToken, set: setCharacterToken } = useLocalStorage<
    string | null
  >(`scenario_${scenarioId}_characterToken`, null);
  return { characterToken, setCharacterToken, characterId, setCharacterId };
}
