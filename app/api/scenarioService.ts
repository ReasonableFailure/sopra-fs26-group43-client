import { ApiService } from "@/api/apiService";
import { Scenario, ScenarioPostDTO, ScenarioPutDTO, ScenarioMastodonDTO } from "@/types/scenario";

export interface BackroomerJoinResult {
  /** Auth token to use for subsequent backroomer-only requests
   *  (already prefixed by the backend with "Backroomer "). */
  authToken: string;
  id: number;
}

export class ScenarioService {
  constructor(private api: ApiService) {}

  getScenarios(token: string): Promise<Scenario[]> {
    return this.api.getWithToken<Scenario[]>("/scenarios", token);
  }

  getScenarioById(id: number, token: string): Promise<Scenario> {
    return this.api.getWithToken<Scenario>(`/scenarios/${id}`, token);
  }

  createScenario(data: ScenarioPostDTO, token: string): Promise<Scenario> {
    return this.api.postWithToken<Scenario>("/scenarios", data, token);
  }

  updateMastodonConfig(scenarioId: number, data: ScenarioMastodonDTO, token: string): Promise<void> {
    return this.api.putWithToken<void>(`/scenarios/${scenarioId}/mastodon`, data, token);
  }

  updateScenario(scenarioId: number,data: Partial<ScenarioPutDTO>,token: string): Promise<void> {
    return this.api.putWithToken<void>(`/scenarios/${scenarioId}`, data, token);
  }

  /**
   * Attempt to become a backroomer for this scenario.
   * The Authorization header must be the user's bearer token
   * (i.e. "Bearer <userToken>"). The body carries the join code.
   * Returns the freshly issued backroomer auth token on success.
   */
  joinBackroom(
    scenarioId: number,
    code: string,
    userToken: string,
  ): Promise<BackroomerJoinResult> {
    return this.api.postWithToken<BackroomerJoinResult>(
      `/scenarios/${scenarioId}/backroomers`,
      { code },
      `Bearer ${userToken}`,
    );
  }
}
