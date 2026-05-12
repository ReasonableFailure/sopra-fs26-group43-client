import { ScenarioStatus } from "@/types/scenario";

export type RoleType = "DIRECTOR" | "BACKROOMER" | "CHARACTER";

export interface Engagement {
  scenarioId: number;
  scenarioTitle: string;
  scenarioStatus: ScenarioStatus;
  finishTime: string | null;
  roleType: RoleType;
  playerId: number;
  characterName: string | null;
}
