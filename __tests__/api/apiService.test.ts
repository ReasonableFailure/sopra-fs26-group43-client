import { ApiService } from "@/api/apiService";

// Module-level fetch mock typed once.
const fetchMock = jest.fn();
(globalThis as unknown as { fetch: jest.Mock }).fetch = fetchMock;

function mockJsonResponse(body: unknown, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    statusText: status === 200 ? "OK" : "Error",
    headers: { get: () => "application/json" },
    json: async () => body,
  } as unknown as Response;
}

function mockTextResponse(status: number, statusText: string, body: unknown) {
  return {
    ok: false,
    status,
    statusText,
    headers: { get: () => "application/json" },
    json: async () => body,
  } as unknown as Response;
}

describe("ApiService", () => {
  let api: ApiService;

  beforeEach(() => {
    fetchMock.mockReset();
    api = new ApiService();
  });

  it("get(): sends GET with the JSON content-type header and parses JSON", async () => {
    fetchMock.mockResolvedValueOnce(mockJsonResponse({ ok: true }));
    const result = await api.get<{ ok: boolean }>("/ping");
    expect(result).toEqual({ ok: true });
    const call = fetchMock.mock.calls[0];
    expect(call[0]).toMatch(/\/ping$/);
    expect(call[1].method).toBe("GET");
    expect(call[1].headers).toMatchObject({
      "Content-Type": "application/json",
    });
  });

  it("post(): sends POST with stringified body", async () => {
    fetchMock.mockResolvedValueOnce(mockJsonResponse({ id: 1 }));
    const data = { name: "test" };
    await api.post<{ id: number }>("/things", data);
    const call = fetchMock.mock.calls[0];
    expect(call[1].method).toBe("POST");
    expect(call[1].body).toBe(JSON.stringify(data));
  });

  it("put(): sends PUT with stringified body", async () => {
    fetchMock.mockResolvedValueOnce(mockJsonResponse({}));
    await api.put<unknown>("/things/1", { name: "renamed" });
    expect(fetchMock.mock.calls[0][1].method).toBe("PUT");
  });

  it("delete(): sends DELETE", async () => {
    fetchMock.mockResolvedValueOnce(mockJsonResponse({}));
    await api.delete<unknown>("/things/1");
    expect(fetchMock.mock.calls[0][1].method).toBe("DELETE");
  });

  it("getWithToken(): adds the Authorization header verbatim", async () => {
    fetchMock.mockResolvedValueOnce(mockJsonResponse({ ok: true }));
    await api.getWithToken<{ ok: boolean }>("/protected", "Bearer abc");
    const call = fetchMock.mock.calls[0];
    expect(call[1].headers).toMatchObject({
      Authorization: "Bearer abc",
    });
  });

  it("postWithToken(): adds Authorization header and JSON body", async () => {
    fetchMock.mockResolvedValueOnce(mockJsonResponse({ id: 9 }));
    await api.postWithToken<{ id: number }>("/things", { x: 1 }, "Director t-1");
    const call = fetchMock.mock.calls[0];
    expect(call[1].method).toBe("POST");
    expect(call[1].headers).toMatchObject({
      Authorization: "Director t-1",
    });
    expect(call[1].body).toBe(JSON.stringify({ x: 1 }));
  });

  it("putWithToken(): adds Authorization header and JSON body", async () => {
    fetchMock.mockResolvedValueOnce(mockJsonResponse({}));
    await api.putWithToken<unknown>("/things/1", { x: 2 }, "Bearer abc");
    expect(fetchMock.mock.calls[0][1].method).toBe("PUT");
    expect(fetchMock.mock.calls[0][1].headers).toMatchObject({
      Authorization: "Bearer abc",
    });
  });

  it("deleteWithToken(): adds Authorization header", async () => {
    fetchMock.mockResolvedValueOnce(mockJsonResponse({}));
    await api.deleteWithToken<unknown>("/things/1", "Bearer abc");
    expect(fetchMock.mock.calls[0][1].method).toBe("DELETE");
    expect(fetchMock.mock.calls[0][1].headers).toMatchObject({
      Authorization: "Bearer abc",
    });
  });

  it("throws an ApplicationError with the server's message field on non-OK responses", async () => {
    fetchMock.mockResolvedValueOnce(
      mockTextResponse(404, "Not Found", { message: "Scenario not found" }),
    );
    await expect(api.get("/scenarios/99")).rejects.toMatchObject({
      message: expect.stringContaining("Scenario not found"),
      status: 404,
    });
  });

  it("falls back to statusText when the error body has no message field", async () => {
    fetchMock.mockResolvedValueOnce(
      mockTextResponse(500, "Internal Server Error", { foo: "bar" }),
    );
    await expect(api.get("/boom")).rejects.toMatchObject({
      status: 500,
    });
  });
});
