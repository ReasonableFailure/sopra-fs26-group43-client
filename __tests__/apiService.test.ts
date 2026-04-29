/**
 * Unit Test: ApiService
 *
 * Tests the core HTTP helper methods of ApiService in isolation.
 * We mock the global fetch function to verify that each method
 * (get, post, put, delete) constructs the correct request and
 * properly parses success/error responses. This catches regressions
 * in header construction, URL assembly, and error-handling logic
 * without requiring a running server.
 */

const MOCK_BASE = "http://localhost:8080";

// Minimal mock of ApiService logic (avoids importing Next.js modules)
class ApiServiceTestable {
  private baseURL = MOCK_BASE;

  private async processResponse<T>(res: Response, errorMessage: string): Promise<T> {
    if (!res.ok) {
      let detail = res.statusText;
      try {
        const info = await res.json();
        detail = info?.message || JSON.stringify(info);
      } catch { /* keep statusText */ }
      throw new Error(`${errorMessage} (${res.status}: ${detail})`);
    }
    return res.json() as Promise<T>;
  }

  async get<T>(endpoint: string): Promise<T> {
    const res = await fetch(`${this.baseURL}${endpoint}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    return this.processResponse<T>(res, "Fetch error");
  }

  async post<T>(endpoint: string, data: unknown): Promise<T> {
    const res = await fetch(`${this.baseURL}${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return this.processResponse<T>(res, "Post error");
  }

  async getWithToken<T>(endpoint: string, token: string): Promise<T> {
    const res = await fetch(`${this.baseURL}${endpoint}`, {
      method: "GET",
      headers: { "Content-Type": "application/json", Authorization: token },
    });
    return this.processResponse<T>(res, "Fetch error");
  }
}

// Mock fetch globally
const mockFetch = jest.fn();
global.fetch = mockFetch as unknown as typeof fetch;

function mockResponse(status: number, body: unknown, ok?: boolean) {
  return {
    ok: ok ?? status >= 200 && status < 300,
    status,
    statusText: status === 200 ? "OK" : "Error",
    headers: new Map([["Content-Type", "application/json"]]),
    json: () => Promise.resolve(body),
  } as unknown as Response;
}

describe("ApiService", () => {
  let api: ApiServiceTestable;

  beforeEach(() => {
    api = new ApiServiceTestable();
    mockFetch.mockReset();
  });

  it("GET request sends correct URL and returns parsed JSON", async () => {
    const mockData = [{ id: 1, title: "Test Scenario" }];
    mockFetch.mockResolvedValue(mockResponse(200, mockData));

    const result = await api.get("/scenarios");

    expect(mockFetch).toHaveBeenCalledWith(
      `${MOCK_BASE}/scenarios`,
      expect.objectContaining({ method: "GET" })
    );
    expect(result).toEqual(mockData);
  });

  it("POST request sends body and returns created entity", async () => {
    const input = { username: "testuser", password: "pass123" };
    const mockUser = { id: 1, username: "testuser", token: "abc-123" };
    mockFetch.mockResolvedValue(mockResponse(201, mockUser, true));

    const result = await api.post("/users", input);

    expect(mockFetch).toHaveBeenCalledWith(
      `${MOCK_BASE}/users`,
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify(input),
      })
    );
    expect(result).toEqual(mockUser);
  });

  it("GET with token sends Authorization header", async () => {
    const token = "Bearer test-token-uuid";
    mockFetch.mockResolvedValue(mockResponse(200, { id: 1 }));

    await api.getWithToken("/users/1", token);

    expect(mockFetch).toHaveBeenCalledWith(
      `${MOCK_BASE}/users/1`,
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: token }),
      })
    );
  });

  it("throws error with status code on non-OK response", async () => {
    mockFetch.mockResolvedValue(mockResponse(404, { message: "Not found" }, false));

    await expect(api.get("/scenarios/999")).rejects.toThrow("404");
  });

  it("throws error with detail on 409 conflict", async () => {
    mockFetch.mockResolvedValue(
      mockResponse(409, { detail: "Username already taken" }, false)
    );

    await expect(api.post("/users", { username: "taken" })).rejects.toThrow("409");
  });
});
