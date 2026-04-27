export interface Scenario {
  id: number;
  title: string;
  description: string | null;
  active: boolean;
  dayNumber: number;
  exchangeRate: number;
  startingMessageCount: number;
  directorToken?: string; // returned by backend once ScenarioGetDTO includes it
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
  active?: boolean;
  dayNumber?: number;
}

export interface ScenarioMastodonDTO {
  mastodonBaseUrl: string;
  mastodonAccessToken: string;
}
