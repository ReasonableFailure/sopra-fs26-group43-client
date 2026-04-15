import { ApiService } from "@/api/apiService";
import type { Directive } from "@/types/directive";

export class DirectiveService {
  constructor(private api: ApiService) {}

  getDirectivesByScenario(scenarioId: number, token: string): Promise<Directive[]> {
    return this.api.getWithToken<Directive[]>(`/scenarios/${scenarioId}/directives`, token);
  }
}
