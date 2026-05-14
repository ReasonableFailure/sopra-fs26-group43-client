export enum ScenarioStatus {
  UNSTARTED= "UNSTARTED",
  FROZEN = "FROZEN",
  UNFROZEN = "UNFROZEN",
  COMPLETED = "COMPLETED",
}

export interface Scenario {
  id: number;
  title: string;
  description: string | null;
  status: ScenarioStatus;
  dayNumber: number;
  exchangeRate: number;
  startingMessageCount: number;
  directorToken?: string; // returned by backend once ScenarioGetDTO includes it
  mastodonProfileUrl?: string | null;
  // ---- Backroom configuration & state (PR 2 — server-backed) ----
  maxBackroomers?: number;
  backroomerCount?: number;
  /** Server tells us whether a code is set; the code itself is never returned. */
  hasBackroomerCode?: boolean;
}

/** POST /scenarios */
export interface ScenarioPostDTO {
  title: string;
  description: string | null;
  exchangeRate: number;
  startingMessageCount: number;
}

/** PUT /scenarios/{id} */
export interface ScenarioPutDTO {
  title?: string;
  description?: string;
  exchangeRate?: number;
  startingMessageCount?: number;
  status?: ScenarioStatus;
  dayNumber?: number;
  /** New max number of backroomers. Omit to leave unchanged. */
  maxBackroomers?: number;
  /** New join code. Omit to leave unchanged. Empty string clears the code. */
  backroomerCode?: string;
}

export interface ScenarioMastodonDTO {
  mastodonBaseUrl: string;
  mastodonAccessToken: string;
}

/**
 * Director-controlled, client-side scenario configuration (persisted in
 * localStorage and scoped per scenarioId). Not sent to the backend.
 */
export interface ScenarioClientConfig {
  /** Maximum number of backroomers allowed to join. */
  maxBackroomers: number;
  /** Secret code a backroomer must supply to join (empty disables joining). */
  backroomerCode: string;
}
