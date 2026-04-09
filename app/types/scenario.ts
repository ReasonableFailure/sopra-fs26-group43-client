export interface Scenario {
  id: number;
  title: string;
  description: string | null;
  isActive: boolean;
  day: number;
  exchangeRate: number; // likes → action points conversion rate
}

/** POST /scenarios */
export interface ScenarioPostDTO {
  title: string;
  description: string | null;
  exchangeRate: number;
}

/** PUT /scenarios/{id} */
export interface ScenarioPutDTO {
  title?: string;
  description?: string;
  exchangeRate?: number;
  isActive?: boolean;
}
