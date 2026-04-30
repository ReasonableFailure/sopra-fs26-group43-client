export interface Scenario {
  id: number | null;
  title: string | null;
  description: string | null;
  active: boolean;
  dayNumber: number;
  exchangeRate: number;
}

/** PUT /scenarios/{id} */
export interface ScenarioPutDTO {
  title?: string;
  description?: string;
  exchangeRate?: number;
  active?: boolean;
  dayNumber?: number;
}

/** /scenarios/{scenarioId}/mastodon */
export interface ScenarioMastodonDTO {
  mastodonBaseUrl: string;
  mastodonAccessToken: string;
}