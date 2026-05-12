import type { useRouter } from "next/navigation";
import type { Engagement } from "@/types/engagement";

type AppRouter = ReturnType<typeof useRouter>;

export function routeForEngagement(
  engagement: Engagement | null,
  scenarioId: number,
  router: AppRouter,
  navigate: "push" | "replace" = "push",
) {
  const target = pathForEngagement(engagement, scenarioId);
  if (engagement && engagement.roleType === "CHARACTER") {
    try {
      globalThis.localStorage.setItem(
        `selectedCharacter_${scenarioId}`,
        JSON.stringify(engagement.playerId),
      );
    } catch (err) {
      console.error("Failed to persist selected character", err);
    }
  }
  if (navigate === "replace") {
    router.replace(target);
  } else {
    router.push(target);
  }
}

function pathForEngagement(engagement: Engagement | null, scenarioId: number): string {
  if (!engagement) return `/scenarios/${scenarioId}/lobby`;
  if (engagement.roleType === "DIRECTOR") return `/scenarios/${scenarioId}`;
  if (engagement.roleType === "BACKROOMER") return `/scenarios/${scenarioId}/backroom`;
  return `/scenarios/${scenarioId}/player`;
}
