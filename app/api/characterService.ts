import { ApiService } from "@/api/apiService";
import { Character, CharacterPostDTO } from "@/types/character";

export class CharacterService {
  constructor(private api: ApiService) {}

  getCharactersByScenario(scenarioId: number, token: string): Promise<Character[]> {
    return this.api.getWithToken<Character[]>(`/characters/${scenarioId}`, token);
  }

  createCharacter(dto: CharacterPostDTO, token: string): Promise<Character> {
    return this.api.postWithToken<Character>("/characters", dto, token);
  }
}
