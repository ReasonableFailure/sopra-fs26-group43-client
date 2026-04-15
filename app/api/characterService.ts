import { ApiService } from "@/api/apiService";
import { Character } from "@/types/character";

export class CharacterService {
  constructor(private api: ApiService) {}

  getCharactersByScenario(scenarioId: number, token: string): Promise<Character[]> {
    return this.api.getWithToken<Character[]>(`/scenarios/${scenarioId}/characters`, token);
  }
}
