import { ApiService } from "@/api/apiService";
import { Scenario } from "@/types/scenario";

export class ScenarioService {
  constructor(private api: ApiService) {}

  getScenarios(token: string): Promise<Scenario[]> {
    return this.api.getWithToken<Scenario[]>("/scenarios", token);
  }
}
