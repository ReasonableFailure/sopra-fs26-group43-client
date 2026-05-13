import { ScenarioService } from "@/api/scenarioService";
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

describe("ScenarioService", () => {
  it("getScenarios calls GET /scenarios with the token", async () => {
    const api = makeMockApi();
    (api.getWithToken as jest.Mock).mockResolvedValueOnce([]);
    const service = new ScenarioService(api);
    await service.getScenarios("tok");
    expect(api.getWithToken).toHaveBeenCalledWith("/scenarios", "tok");
  });

  it("getScenarioById calls GET /scenarios/{id}", async () => {
    const api = makeMockApi();
    (api.getWithToken as jest.Mock).mockResolvedValueOnce({});
    const service = new ScenarioService(api);
    await service.getScenarioById(42, "tok");
    expect(api.getWithToken).toHaveBeenCalledWith("/scenarios/42", "tok");
  });

  it("createScenario calls POST /scenarios", async () => {
    const api = makeMockApi();
    (api.postWithToken as jest.Mock).mockResolvedValueOnce({ id: 1 });
    const service = new ScenarioService(api);
    const payload = {
      title: "T",
      description: null,
      exchangeRate: 10,
      startingMessageCount: 15,
    };
    await service.createScenario(payload, "tok");
    expect(api.postWithToken).toHaveBeenCalledWith(
      "/scenarios",
      payload,
      "tok",
    );
  });

  it("updateMastodonConfig calls PUT /scenarios/{id}/mastodon", async () => {
    const api = makeMockApi();
    (api.putWithToken as jest.Mock).mockResolvedValueOnce(undefined);
    const service = new ScenarioService(api);
    await service.updateMastodonConfig(
      7,
      { mastodonBaseUrl: "https://m.example", mastodonAccessToken: "abc" },
      "tok",
    );
    expect(api.putWithToken).toHaveBeenCalledWith(
      "/scenarios/7/mastodon",
      { mastodonBaseUrl: "https://m.example", mastodonAccessToken: "abc" },
      "tok",
    );
  });

  it("updateScenario calls PUT /scenarios/{id}", async () => {
    const api = makeMockApi();
    (api.putWithToken as jest.Mock).mockResolvedValueOnce(undefined);
    const service = new ScenarioService(api);
    await service.updateScenario(7, { dayNumber: 2 }, "tok");
    expect(api.putWithToken).toHaveBeenCalledWith(
      "/scenarios/7",
      { dayNumber: 2 },
      "tok",
    );
  });
});
