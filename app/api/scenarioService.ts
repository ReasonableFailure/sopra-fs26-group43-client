import { ApiService } from "@/api/apiService";
import { Scenario, ScenarioPostDTO } from "@/types/scenario";

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
}
