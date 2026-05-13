import { NewsService } from "@/api/newsService";
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

describe("NewsService", () => {
  it("createPronouncement calls POST /news with authorId", async () => {
    const api = makeMockApi();
    (api.postWithToken as jest.Mock).mockResolvedValueOnce({});
    const service = new NewsService(api);
    const dto = { title: "T", body: "B", scenarioId: 1, authorId: 9 };
    await service.createPronouncement(dto, "tok");
    expect(api.postWithToken).toHaveBeenCalledWith("/news", dto, "tok");
  });

  it("createNewsStory calls POST /news without authorId", async () => {
    const api = makeMockApi();
    (api.postWithToken as jest.Mock).mockResolvedValueOnce({});
    const service = new NewsService(api);
    const dto = { title: "T", body: "B", scenarioId: 1 };
    await service.createNewsStory(dto, "tok");
    expect(api.postWithToken).toHaveBeenCalledWith("/news", dto, "tok");
  });

  it("getNewsByScenario calls GET /news/scenario/{id}", async () => {
    const api = makeMockApi();
    (api.getWithToken as jest.Mock).mockResolvedValueOnce([]);
    const service = new NewsService(api);
    await service.getNewsByScenario(11, "tok");
    expect(api.getWithToken).toHaveBeenCalledWith(
      "/news/scenario/11",
      "tok",
    );
  });
});
