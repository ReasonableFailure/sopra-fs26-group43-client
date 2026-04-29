import { ApiService } from "@/api/apiService";
import { Character, CharacterPostDTO } from "@/types/character";

export class CharacterService {
  constructor(private api: ApiService) {}

  getCharactersByScenario(scenarioId: number, token: string): Promise<Character[]> {
    return this.api.getWithToken<Character[]>(`/characters/${scenarioId}`, token);
  }

  createCharacter(dto: CharacterPostDTO, directorToken: string): Promise<Character> {
    return this.api.postWithToken<Character>("/characters", dto, `Director ${directorToken}`);
  }
  getCharacterPoints(scenarioId: number, characterId: number,token: string): Promise<Character> {
    return this.api.getWithToken<Character>(`/characters/${scenarioId}/${characterId}/points`,token);
  }

  buyMessage(scenarioId: number, characterId: number,token: string): Promise<Character> {
  return this.api.postWithToken<Character>(`/characters/${scenarioId}/${characterId}/buy-message`,{},token
  );
}
}
