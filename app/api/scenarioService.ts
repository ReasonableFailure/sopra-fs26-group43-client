import { ApiService } from "@/api/apiService";
import { Scenario, ScenarioPostDTO, ScenarioPutDTO, ScenarioMastodonDTO } from "@/types/scenario";

export class ScenarioService {
  constructor(private api: ApiService) {}

  getScenarios(token: string): Promise<Scenario[]> {
    return this.api.get<Scenario[]>("/scenarios", token);
  }

  getScenarioById(id: number, token: string): Promise<Scenario> {
    return this.api.get<Scenario>(`/scenarios/${id}`, token);
  }

  createScenario(data: ScenarioPostDTO, token: string): Promise<Scenario> {
    return this.api.postWithToken<Scenario>("/scenarios", data, token);
  }

  updateMastodonConfig(scenarioId: number, data: ScenarioMastodonDTO, token: string): Promise<void> {
    return this.api.put<void>(`/scenarios/${scenarioId}/mastodon`, data, token);
  }

  updateScenario(scenarioId: number,data: Partial<ScenarioPutDTO>,token: string): Promise<void> {
    return this.api.put<void>(`/scenarios/${scenarioId}`, data, token);
  }
}
