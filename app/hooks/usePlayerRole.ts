import useLocalStorage from "@/hooks/useLocalStorage";
import { PlayerRole } from "@/types/playerRole";

export const usePlayerRole = () => {
  const { value: playerRole, set: setPlayerRole } = useLocalStorage<
    PlayerRole | null
  >(
    `playerRole`,
    null,
  );
  return { playerRole, setPlayerRole };
};
