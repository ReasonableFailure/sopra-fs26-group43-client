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
    return await this.api.get<Character[]>(`/characters/${scenarioId}`, token);
  }

  public async createCharacter(
    dto: CharacterPostDTO,
    directorToken: string,
  ): Promise<Character> {
    return await this.api.postWithToken<Character>(
      "/characters",
      dto,
      directorToken,
    );
  }
  public async getCharacterPoints(
    scenarioId: number,
    characterId: number,
    token: string,
  ): Promise<Character> {
    return await this.api.get<Character>(
      `/characters/${scenarioId}/${characterId}/points`,
      token,
    );
  }

  public async buyMessage(
    scenarioId: number,
    characterId: number,
    token: string,
  ): Promise<Character> {
    return await this.api.postWithToken<Character>(
      `/characters/${scenarioId}/${characterId}/buy-message`,
      {},
      token,
    );
  }

  public async assignCharacter(
    dto: CharacterAssignDTO,
    directorToken: string,
    characterId: number,
  ): Promise<Character> {
    return await this.api.put<Character>(
      `/player/${characterId}`,
      dto,
      directorToken,
    );
  }

  public async modifyCharacter(
    dto: CharacterPutDTO,
    directorToken: string,
    characterId: number,
  ): Promise<void> {
    return await this.api.put<void>(
      `/characters/${characterId}`,
      dto,
      directorToken,
    );
  }

  claimCharacter(
    scenarioId: number,
    characterId: number,
    token: string,
  ): Promise<Character> {
    return this.api.postWithToken<Character>(
      `/scenarios/${scenarioId}/claim-character/${characterId}`,
      {},
      `Bearer ${token}`,
    );
  }

  becomeBackroomer(
    scenarioId: number,
    token: string,
  ): Promise<{ id: number; authToken: string }> {
    return this.api.postWithToken<{ id: number; authToken: string }>(
      `/scenarios/${scenarioId}/become-backroomer`,
      {},
      `Bearer ${token}`,
    );
  }
}
