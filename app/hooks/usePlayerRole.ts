import useLocalStorage from "@/hooks/useLocalStorage";
import { PlayerRole } from "@/types/playerRole";

export const usePlayerRole = (userId: number | null) => {
  const key = userId ? `playerRole_${userId}` : "playerRole_guest";
  const { value: playerRole, set: setPlayerRole } = useLocalStorage<
    PlayerRole | null
  >(key, null);
  return { playerRole, setPlayerRole };
};
