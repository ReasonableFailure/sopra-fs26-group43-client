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
    return await this.api.getWithToken<Character[]>(
      `/characters/scenario/${scenarioId}`,
      token, //TODO funny business
    );
  }

  public async createCharacter(
    dto: CharacterPostDTO,
    token: string,
  ): Promise<Character> {
    return await this.api.postWithToken<Character>(
      "/characters",
      dto,
      `Director ${token}`, //TODO funny business
    );
  }
  public async getCharacterPoints(
    scenarioId: number,
    characterId: number,
    token: string,
  ): Promise<Character> {
    return await this.api.getWithToken<Character>(
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
      `/scenarios/${scenarioId}/characters/${characterId}/messages`,
      {},
      token,
    );
  }

  updateCharacter(
    characterId: number,
    dto: CharacterPutDTO,
    token: string,
  ): Promise<void> {
    return this.api.putWithToken<void>(
      `/characters/${characterId}`,
      dto,
      `Director ${token}`, //TODO funny business
    );
  }

  public async assignCharacter(
    dto: CharacterAssignDTO,
    token: string,
    characterId: number,
  ): Promise<Character> {
    return await this.api.putWithToken<Character>(
      `/characters/${characterId}/assignment`,
      dto,
      `${token}`,
    );
  }

  public async modifyCharacter(
    dto: CharacterPutDTO,
    token: string,
    characterId: number,
  ): Promise<void> {
    return await this.api.putWithToken<void>(
      `/characters/${characterId}`,
      dto,
      `Director ${token}`, //TODO funny business
    );
  }

  getCharacterById(characterId: number, token: string): Promise<Character> {
    return this.api.getWithToken<Character>(
      `/characters/${characterId}`,
      token,
    );
  }
}
