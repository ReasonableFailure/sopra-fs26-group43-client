import { ApiService } from "@/api/apiService";
import {
  Character,
  CharacterPostDTO,
  CharacterPutDTO,
} from "@/types/character";

export class CharacterService {
  constructor(private api: ApiService) {}

  getCharactersByScenario(
    scenarioId: number,
    token: string,
  ): Promise<Character[]> {
    return this.api.getWithToken<Character[]>(
      `/characters/scenario/${scenarioId}`,
      token,
    );
  }

  createCharacter(
    dto: CharacterPostDTO,
    directorToken: string,
  ): Promise<Character> {
    return this.api.postWithToken<Character>(
      "/characters",
      dto,
      `Director ${directorToken}`,
    );
  }

  getCharacterPoints(
    scenarioId: number,
    characterId: number,
    token: string,
  ): Promise<Character> {
    return this.api.getWithToken<Character>(
      `/characters/${scenarioId}/${characterId}/points`,
      token,
    );
  }

  buyMessage(
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

  updateCharacter(
    characterId: number,
    dto: CharacterPutDTO,
    directorToken: string,
  ): Promise<void> {
    return this.api.putWithToken<void>(
      `/characters/${characterId}`,
      dto,
      `Director ${directorToken}`,
    );
  }

  getCharacterById(characterId: number, token: string): Promise<Character> {
    return this.api.getWithToken<Character>(
      `/characters/${characterId}`,
      token,
    );
  }
}
