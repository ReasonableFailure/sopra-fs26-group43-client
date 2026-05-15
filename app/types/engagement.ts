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
  /**
   * The player's role-typed token. Server only returns this for the
   * authenticated user's own engagements. Used to restore per-scenario
   * role-token localStorage after a re-login so "Resume" works without
   * a separate manual lookup.
   */
  token: string | null;
}
