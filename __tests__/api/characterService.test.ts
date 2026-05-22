import { CharacterService } from "@/api/characterService";
import type { ApiService } from "@/api/apiService";

function makeMockApi() {
  return {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
    getWithToken: jest.fn(),
    postWithToken: jest.fn(),
    putWithToken: jest.fn(),
    deleteWithToken: jest.fn(),
  } as unknown as jest.Mocked<ApiService>;
}

describe("CharacterService", () => {
  it("getCharactersByScenario calls GET /characters/scenario/{scenarioId}", async () => {
    const api = makeMockApi();
    (api.getWithToken as jest.Mock).mockResolvedValueOnce([]);
    const service = new CharacterService(api);
    await service.getCharactersByScenario(3, "tok");
    expect(api.getWithToken).toHaveBeenCalledWith(
      "/characters/scenario/3",
      "tok",
    );
  });

  it("createCharacter calls POST /characters with the provided token", async () => {
    const api = makeMockApi();
    (api.postWithToken as jest.Mock).mockResolvedValueOnce({});
    const service = new CharacterService(api);
    const dto = {
      name: "Alice",
      title: null,
      description: null,
      portrait: null,
      secret: null,
      scenarioId: 1,
    };
    await service.createCharacter(dto, "Director director-tok");
    expect(api.postWithToken).toHaveBeenCalledWith(
      "/characters",
      dto,
      "Director director-tok",
    );
  });

  it("getCharacterPoints calls GET /characters/{s}/{c}/points", async () => {
    const api = makeMockApi();
    (api.getWithToken as jest.Mock).mockResolvedValueOnce({});
    const service = new CharacterService(api);
    await service.getCharacterPoints(1, 2, "tok");
    expect(api.getWithToken).toHaveBeenCalledWith(
      "/characters/1/2/points",
      "tok",
    );
  });

  it("buyMessage calls POST /scenarios/{s}/characters/{c}/messages with empty body", async () => {
    const api = makeMockApi();
    (api.postWithToken as jest.Mock).mockResolvedValueOnce({});
    const service = new CharacterService(api);
    await service.buyMessage(1, 2, "tok");
    expect(api.postWithToken).toHaveBeenCalledWith(
      "/scenarios/1/characters/2/messages",
      {},
      "tok",
    );
  });
});