import { ApiService } from "@/api/apiService";
import { Cabinet } from "@/types/cabinet";

export class CabinetService {
  constructor(private api: ApiService) {}

  getCabinetsByScenario(scenarioId: number, token: string): Promise<Cabinet[]> {
    return this.api.getWithToken<Cabinet[]>(`/scenarios/${scenarioId}/cabinets`, token);
  }
}
