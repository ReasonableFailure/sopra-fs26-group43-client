import type { useRouter } from "next/navigation";
import type { Engagement } from "@/types/engagement";
import { ScenarioStatus } from "@/types/scenario";

type AppRouter = ReturnType<typeof useRouter>;

export function routeForEngagement(
  engagement: Engagement | null,
  scenarioId: number,
  router: AppRouter,
  navigate: "push" | "replace" = "push",
  scenarioStatus: ScenarioStatus | null = null,
) {
  const target = pathForEngagement(engagement, scenarioId, scenarioStatus);
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

function pathForEngagement(
  engagement: Engagement | null,
  scenarioId: number,
  scenarioStatus: ScenarioStatus | null,
): string {
  // Engaged users always go to their own dashboard, regardless of status.
  if (engagement) {
    if (engagement.roleType === "DIRECTOR") return `/scenarios/${scenarioId}`;
    if (engagement.roleType === "BACKROOMER") {
      return `/scenarios/${scenarioId}/backroom`;
    }
    return `/scenarios/${scenarioId}/player`;
  }
  // Non-engaged viewer of a completed scenario: there's nothing left to
  // join — drop them into the news feed which acts as an after-action view.
  if (scenarioStatus === ScenarioStatus.COMPLETED) {
    return `/scenarios/${scenarioId}/news`;
  }
  return `/scenarios/${scenarioId}/lobby`;
}
