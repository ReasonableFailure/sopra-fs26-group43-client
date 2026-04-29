import { ApiService } from "@/api/apiService";
import {Character, CharacterPostDTO, CharacterPutDTO} from "@/types/character";

export class CharacterService {
  constructor(private api: ApiService) {}

  getCharactersByScenario(scenarioId: number, token: string): Promise<Character[]> {
    return this.api.get<Character[]>(`/characters/${scenarioId}`, token);
  }

  createCharacter(dto: CharacterPostDTO, directorToken: string): Promise<Character> {
    return this.api.postWithToken<Character>("/characters", dto, `Director ${directorToken}`);
  }
  getCharacterPoints(scenarioId: number, characterId: number,token: string): Promise<Character> {
    return this.api.get<Character>(`/characters/${scenarioId}/${characterId}/points`,token);
  }

  buyMessage(scenarioId: number, characterId: number,token: string): Promise<Character> {
    return this.api.postWithToken<Character>(`/characters/${scenarioId}/${characterId}/buy-message`,{},`Role ${token}`
    );
  }

 assignCharacter(dto:CharacterPutDTO, userToken: string, characterId: number) {
    return this.api.put(`/player/${characterId}`,dto,`Bearer ${userToken}`);
  }

  modifyCharacter(dto: CharacterPutDTO, directorToken: string, characterId: number) {
    return this.api.putWithToken(`/player/${characterId}`,dto, `Director ${directorToken}`);
  }
}
