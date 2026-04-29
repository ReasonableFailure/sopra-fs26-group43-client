import { ApiService } from "@/api/apiService";
import {Character, CharacterPostDTO, CharacterPutDTO} from "@/types/character";

export class CharacterService {
  constructor(private api: ApiService) {}

  getCharactersByScenario(scenarioId: number, token: string): Promise<Character[]> {
    return this.api.getWithToken<Character[]>(`/characters/${scenarioId}`, token);
  }

  createCharacter(dto: CharacterPostDTO, directorToken: string): Promise<Character> {
    return this.api.postWithToken<Character>("/characters", dto, `Director ${directorToken}`);
  }

  assignCharacter(dto:CharacterPutDTO, userToken: string, characterId: number) {
    return this.api.putWithToken(`/player/${characterId}`,dto,userToken);
  }
}
