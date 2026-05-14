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
