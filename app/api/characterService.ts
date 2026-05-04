import { ApiService } from "@/api/apiService";
import {
  Character,
  CharacterAssignDTO,
  CharacterPostDTO,
  CharacterPutDTO,
} from "@/types/character";

export class CharacterService {
  constructor(private api: ApiService) {}

  public async getCharactersByScenario(
    scenarioId: number,
    token: string,
  ): Promise<Character[]> {
    return this.api.get<Character[]>(`/characters/${scenarioId}`, token);
  }

  public async createCharacter(
    dto: CharacterPostDTO,
    directorToken: string,
  ): Promise<Character> {
    return this.api.postWithToken<Character>("/characters", dto, directorToken);
  }
  public async getCharacterPoints(
    scenarioId: number,
    characterId: number,
    token: string,
  ): Promise<Character> {
    return this.api.get<Character>(
      `/characters/${scenarioId}/${characterId}/points`,
      token,
    );
  }

  public async buyMessage(
    scenarioId: number,
    characterId: number,
    token: string,
  ): Promise<Character> {
    return this.api.postWithToken<Character>(
      `/characters/${scenarioId}/${characterId}/buy-message`,
      {},
      token,
    );
  }

  public async assignCharacter(
    dto: CharacterAssignDTO,
    userToken: string,
    characterId: number,
  ): Promise<Character> {
    return this.api.put<Character>(`/player/${characterId}`, dto, userToken);
  }

  public async modifyCharacter(
    dto: CharacterPutDTO,
    directorToken: string,
    characterId: number,
  ): Promise<void> {
    return this.api.put<void>(`/player/${characterId}`, dto, directorToken);
  }
}
