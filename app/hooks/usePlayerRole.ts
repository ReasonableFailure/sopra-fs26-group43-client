import useLocalStorage from "@/hooks/useLocalStorage";
import { PlayerRole } from "@/types/playerRole";

export const usePlayerRole = (userId: number) => {
  const key = `playerRole_${userId}`;
  const { value: playerRole, set: setPlayerRole } = useLocalStorage<
    PlayerRole | null
  >(key, null);
  return { playerRole, setPlayerRole };
};
