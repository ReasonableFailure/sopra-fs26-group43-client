import useLocalStorage from "@/hooks/useLocalStorage";
import { PlayerRole } from "@/types/playerRole";

export const usePlayerRole = (_userId: number) => {
  const key = `playerRole`;
  const { value: playerRole, set: setPlayerRole, ready: readyPlayerRole } =
    useLocalStorage<
      PlayerRole | null
    >(key, null);
  return { playerRole, setPlayerRole, readyPlayerRole };
};
