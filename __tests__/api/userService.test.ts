import { UserService } from "@/api/userService";
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

describe("UserService", () => {
  it("register calls POST /users (no token)", async () => {
    const api = makeMockApi();
    (api.post as jest.Mock).mockResolvedValueOnce({});
    const service = new UserService(api);
    await service.register({ username: "u", password: "p" } as never);
    expect(api.post).toHaveBeenCalledWith("/users", {
      username: "u",
      password: "p",
    });
  });

  it("login calls POST /login (no token)", async () => {
    const api = makeMockApi();
    (api.post as jest.Mock).mockResolvedValueOnce({});
    const service = new UserService(api);
    await service.login({ username: "u", password: "p" } as never);
    expect(api.post).toHaveBeenCalledWith("/login", {
      username: "u",
      password: "p",
    });
  });

  it("getUser calls GET /users/{id} with Bearer-prefixed token", async () => {
    const api = makeMockApi();
    (api.getWithToken as jest.Mock).mockResolvedValueOnce({});
    const service = new UserService(api);
    await service.getUser(5, "abc");
    expect(api.getWithToken).toHaveBeenCalledWith("/users/5", "Bearer abc");
  });

  it("getAllUsers calls GET /users with Bearer-prefixed token", async () => {
    const api = makeMockApi();
    (api.getWithToken as jest.Mock).mockResolvedValueOnce([]);
    const service = new UserService(api);
    await service.getAllUsers("abc");
    expect(api.getWithToken).toHaveBeenCalledWith("/users", "Bearer abc");
  });

  it("updateUser calls PUT /users/{id} with Bearer-prefixed token", async () => {
    const api = makeMockApi();
    (api.putWithToken as jest.Mock).mockResolvedValueOnce(undefined);
    const service = new UserService(api);
    await service.updateUser(5, { username: "new" } as never, "abc");
    expect(api.putWithToken).toHaveBeenCalledWith(
      "/users/5",
      { username: "new" },
      "Bearer abc",
    );
  });

  it("logout calls POST /logout/{id} with Bearer-prefixed token and empty body", async () => {
    const api = makeMockApi();
    (api.postWithToken as jest.Mock).mockResolvedValueOnce(undefined);
    const service = new UserService(api);
    await service.logout(5, "abc");
    expect(api.postWithToken).toHaveBeenCalledWith(
      "/logout/5",
      {},
      "Bearer abc",
    );
  });
});
