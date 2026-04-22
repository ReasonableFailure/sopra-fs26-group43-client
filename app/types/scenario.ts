export interface Scenario {
  id: number;
  title: string;
  description: string | null;
  active: boolean;
  dayNumber: number;
  exchangeRate: number;
  directorToken?: string; // returned by backend once ScenarioGetDTO includes it
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
  active?: boolean;
  dayNumber?: number;
}
