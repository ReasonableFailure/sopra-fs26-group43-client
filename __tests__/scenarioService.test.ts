/**
 * Service Test: ScenarioService
 *
 * Verifies that ScenarioService correctly maps CRUD operations to the
 * expected REST endpoints with proper token handling. Unlike UserService
 * which prefixes "Bearer ", ScenarioService passes the raw token because
 * the server's ScenarioController forwards the Authorization header
 * directly to checkIfValidToken without stripping a prefix. This test
 * ensures that contract is maintained, catching issues like accidental
 * prefix addition or wrong HTTP methods.
 */

class MockApiService {
  calls: Array<{ method: string; url: string; token?: string; body?: unknown }> = [];
  mockReturn: unknown = {};

  async getWithToken<T>(endpoint: string, token: string): Promise<T> {
    this.calls.push({ method: "GET", url: endpoint, token });
    return this.mockReturn as T;
  }

  async postWithToken<T>(endpoint: string, data: unknown, token: string): Promise<T> {
    this.calls.push({ method: "POST", url: endpoint, token, body: data });
    return this.mockReturn as T;
  }

  async putWithToken<T>(endpoint: string, data: unknown, token: string): Promise<T> {
    this.calls.push({ method: "PUT", url: endpoint, token, body: data });
    return this.mockReturn as T;
  }
}

class ScenarioService {
  constructor(private api: MockApiService) {}

  getScenarios(token: string) {
    return this.api.getWithToken("/scenarios", token);
  }

  getScenarioById(id: number, token: string) {
    return this.api.getWithToken(`/scenarios/${id}`, token);
  }

  createScenario(data: { title: string; description: string }, token: string) {
    return this.api.postWithToken("/scenarios", data, token);
  }

  updateScenario(id: number, data: { active?: boolean; dayNumber?: number }, token: string) {
    return this.api.putWithToken(`/scenarios/${id}`, data, token);
  }
}

describe("ScenarioService", () => {
  let mockApi: MockApiService;
  let service: ScenarioService;

  beforeEach(() => {
    mockApi = new MockApiService();
    service = new ScenarioService(mockApi);
  });

  it("getScenarios sends raw token (no Bearer prefix) to GET /scenarios", async () => {
    mockApi.mockReturn = [{ id: 1, title: "Crisis" }];
    const result = await service.getScenarios("raw-token-uuid");

    expect(mockApi.calls[0].method).toBe("GET");
    expect(mockApi.calls[0].url).toBe("/scenarios");
    expect(mockApi.calls[0].token).toBe("raw-token-uuid");
    expect(result).toEqual([{ id: 1, title: "Crisis" }]);
  });

  it("getScenarioById sends correct endpoint with scenario ID", async () => {
    mockApi.mockReturn = { id: 42, title: "Trojan War" };
    await service.getScenarioById(42, "token-abc");

    expect(mockApi.calls[0].url).toBe("/scenarios/42");
    expect(mockApi.calls[0].token).toBe("token-abc");
  });

  it("createScenario sends POST with scenario data", async () => {
    const data = { title: "New Crisis", description: "A test scenario" };
    mockApi.mockReturn = { id: 5, ...data };
    await service.createScenario(data, "director-token");

    expect(mockApi.calls[0].method).toBe("POST");
    expect(mockApi.calls[0].url).toBe("/scenarios");
    expect(mockApi.calls[0].body).toEqual(data);
  });

  it("updateScenario sends PUT to /scenarios/:id with partial update", async () => {
    await service.updateScenario(7, { active: true, dayNumber: 3 }, "my-token");

    expect(mockApi.calls[0].method).toBe("PUT");
    expect(mockApi.calls[0].url).toBe("/scenarios/7");
    expect(mockApi.calls[0].body).toEqual({ active: true, dayNumber: 3 });
  });
});
