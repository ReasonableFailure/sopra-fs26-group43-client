import { ApiService } from "@/api/apiService";
import {Character, CharacterPostDTO, CharacterPutDTO, CharacterAssignDTO} from "@/types/character";

export class CharacterService {
  constructor(private api: ApiService) {}

  getCharactersByScenario(scenarioId: number, token: string): Promise<Character[]> {
    return this.api.get<Character[]>(`/characters/${scenarioId}`, token);
  }

  createCharacter(dto: CharacterPostDTO, directorToken: string): Promise<Character> {
    return this.api.postWithToken<Character>("/characters", dto, directorToken);
  }
  getCharacterPoints(scenarioId: number, characterId: number,token: string): Promise<number> {
    return this.api.get<number>(`/characters/${scenarioId}/${characterId}/points`,token);
  }

  buyMessage(scenarioId: number, characterId: number,token: string): Promise<number> {
    return this.api.postWithToken<number>(`/characters/${scenarioId}/${characterId}/buy-message`,{},token
    );
  }

 assignCharacter(dto:CharacterAssignDTO, userToken: string, characterId: number):Promise<Character> {
    return this.api.put<Character>(`/player/${characterId}`,dto,userToken);
  }

  modifyCharacter(dto: CharacterPutDTO, directorToken: string, characterId: number):Promise<void>{
    return this.api.put<void>(`/player/${characterId}`,dto, directorToken);
  }
}
