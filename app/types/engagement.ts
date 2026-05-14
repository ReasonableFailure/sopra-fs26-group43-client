import { ScenarioStatus } from "@/types/scenario";

export type RoleType = "DIRECTOR" | "BACKROOMER" | "CHARACTER"; //TODO: import playerRole type instead

export interface Engagement {
  scenarioId: number;
  scenarioTitle: string;
  scenarioStatus: ScenarioStatus;
  finishTime: string | null;
  roleType: RoleType;
  playerId: number;
  characterName: string | null;
}
