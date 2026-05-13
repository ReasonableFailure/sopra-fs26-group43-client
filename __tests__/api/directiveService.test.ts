import { DirectiveService } from "@/api/directiveService";
import { CommsStatus } from "@/types/directive";
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

describe("DirectiveService", () => {
  it("getDirectivesByScenario calls GET /directives/scenario/{id}", async () => {
    const api = makeMockApi();
    (api.getWithToken as jest.Mock).mockResolvedValueOnce([]);
    const service = new DirectiveService(api);
    await service.getDirectivesByScenario(5, "tok");
    expect(api.getWithToken).toHaveBeenCalledWith(
      "/directives/scenario/5",
      "tok",
    );
  });

  it("getDirectiveById calls GET /directives/{id}", async () => {
    const api = makeMockApi();
    (api.getWithToken as jest.Mock).mockResolvedValueOnce({});
    const service = new DirectiveService(api);
    await service.getDirectiveById(42, "tok");
    expect(api.getWithToken).toHaveBeenCalledWith("/directives/42", "tok");
  });

  it("createDirective calls POST /directives", async () => {
    const api = makeMockApi();
    (api.postWithToken as jest.Mock).mockResolvedValueOnce({});
    const service = new DirectiveService(api);
    const dto = { title: "T", body: "B", creatorId: 1, scenarioId: 1 };
    await service.createDirective(dto, "tok");
    expect(api.postWithToken).toHaveBeenCalledWith("/directives", dto, "tok");
  });

  it("updateDirective calls PUT /directives/{id} with status + response", async () => {
    const api = makeMockApi();
    (api.putWithToken as jest.Mock).mockResolvedValueOnce(undefined);
    const service = new DirectiveService(api);
    const dto = { status: CommsStatus.ACCEPTED, response: "ok" };
    await service.updateDirective(7, dto, "tok");
    expect(api.putWithToken).toHaveBeenCalledWith("/directives/7", dto, "tok");
  });
});
