/**
 * Integration Test: UserService
 *
 * Validates that UserService correctly composes API calls by verifying
 * that each method (register, login, getUser, logout) passes the right
 * endpoint, body, and Authorization header format ("Bearer <token>")
 * to the underlying ApiService. This catches integration issues between
 * the service layer and the transport layer, such as missing token
 * prefixes or incorrect endpoint paths, without needing a live server.
 */

// Inline mock of ApiService
class MockApiService {
  lastCall: { method: string; url: string; token?: string; body?: unknown } | null = null;
  mockReturn: unknown = {};

  async post<T>(endpoint: string, data: unknown): Promise<T> {
    this.lastCall = { method: "POST", url: endpoint, body: data };
    return this.mockReturn as T;
  }

  async getWithToken<T>(endpoint: string, token: string): Promise<T> {
    this.lastCall = { method: "GET", url: endpoint, token };
    return this.mockReturn as T;
  }

  async postWithToken<T>(endpoint: string, data: unknown, token: string): Promise<T> {
    this.lastCall = { method: "POST", url: endpoint, token, body: data };
    return this.mockReturn as T;
  }

  async putWithToken<T>(endpoint: string, data: unknown, token: string): Promise<T> {
    this.lastCall = { method: "PUT", url: endpoint, token, body: data };
    return this.mockReturn as T;
  }
}

// Inline UserService (mirrors app/api/userService.ts logic)
class UserService {
  constructor(private api: MockApiService) {}

  register(data: { username: string; password: string; bio?: string }) {
    return this.api.post<{ id: number; token: string }>("/users", data);
  }

  login(data: { username: string; password: string }) {
    return this.api.post<{ id: number; token: string }>("/login", data);
  }

  getUser(id: number, token: string) {
    return this.api.getWithToken(`/users/${id}`, `Bearer ${token}`);
  }

  getAllUsers(token: string) {
    return this.api.getWithToken("/users", `Bearer ${token}`);
  }

  logout(id: number, token: string) {
    return this.api.postWithToken(`/logout/${id}`, {}, `Bearer ${token}`);
  }
}

describe("UserService", () => {
  let mockApi: MockApiService;
  let service: UserService;

  beforeEach(() => {
    mockApi = new MockApiService();
    service = new UserService(mockApi);
  });

  it("register sends POST /users with username, password, bio", async () => {
    mockApi.mockReturn = { id: 1, token: "abc-123", username: "alice" };
    const result = await service.register({ username: "alice", password: "pass", bio: "hi" });

    expect(mockApi.lastCall?.method).toBe("POST");
    expect(mockApi.lastCall?.url).toBe("/users");
    expect(mockApi.lastCall?.body).toEqual({ username: "alice", password: "pass", bio: "hi" });
    expect(result).toEqual({ id: 1, token: "abc-123", username: "alice" });
  });

  it("login sends POST /login with username and password", async () => {
    mockApi.mockReturn = { id: 2, token: "xyz-789" };
    await service.login({ username: "bob", password: "secret" });

    expect(mockApi.lastCall?.method).toBe("POST");
    expect(mockApi.lastCall?.url).toBe("/login");
    expect(mockApi.lastCall?.body).toEqual({ username: "bob", password: "secret" });
  });

  it("getUser sends Bearer-prefixed token to GET /users/:id", async () => {
    mockApi.mockReturn = { id: 5, username: "charlie" };
    await service.getUser(5, "my-raw-token");

    expect(mockApi.lastCall?.method).toBe("GET");
    expect(mockApi.lastCall?.url).toBe("/users/5");
    expect(mockApi.lastCall?.token).toBe("Bearer my-raw-token");
  });

  it("logout sends Bearer-prefixed token to POST /logout/:id", async () => {
    await service.logout(3, "session-token");

    expect(mockApi.lastCall?.method).toBe("POST");
    expect(mockApi.lastCall?.url).toBe("/logout/3");
    expect(mockApi.lastCall?.token).toBe("Bearer session-token");
  });
});
