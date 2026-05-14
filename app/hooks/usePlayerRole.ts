import useLocalStorage from "@/hooks/useLocalStorage";
import { PlayerRole } from "@/types/playerRole";


  export const usePlayerRole = (userId: number | undefined) => {
    const key = userId ? `playerRole_${userId}` : null;

    const { value, set, ready } = useLocalStorage<PlayerRole | null>(
        key || "temp", // Fallback key
        null
    );

    // If there's no userId yet, the hook is NOT truly ready
    return {
      playerRole: value,
      setPlayerRole: set,
      readyPlayerRole: ready && !!userId
    };

};
