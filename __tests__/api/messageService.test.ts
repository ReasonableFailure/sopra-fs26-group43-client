import { MessageService } from "@/api/messageService";
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

describe("MessageService", () => {
  it("createMessage calls POST /messages", async () => {
    const api = makeMockApi();
    (api.postWithToken as jest.Mock).mockResolvedValueOnce({});
    const service = new MessageService(api);
    const dto = {
      title: "T",
      body: "B",
      creatorId: 1,
      recipientId: 2,
      scenarioId: 1,
    };
    await service.createMessage(dto, "tok");
    expect(api.postWithToken).toHaveBeenCalledWith("/messages", dto, "tok");
  });

  it("getMessagePairsByScenario calls GET /messages/scenario/{id}/pairs", async () => {
    const api = makeMockApi();
    (api.getWithToken as jest.Mock).mockResolvedValueOnce([]);
    const service = new MessageService(api);
    await service.getMessagePairsByScenario(3, "tok");
    expect(api.getWithToken).toHaveBeenCalledWith(
      "/messages/scenario/3/pairs",
      "tok",
    );
  });

  it("getMessagesBetween calls GET /messages/between/{a}/{b}", async () => {
    const api = makeMockApi();
    (api.getWithToken as jest.Mock).mockResolvedValueOnce([]);
    const service = new MessageService(api);
    await service.getMessagesBetween(1, 2, "tok");
    expect(api.getWithToken).toHaveBeenCalledWith(
      "/messages/between/1/2",
      "tok",
    );
  });

  it("updateMessage calls PUT /messages/{id} with status", async () => {
    const api = makeMockApi();
    (api.putWithToken as jest.Mock).mockResolvedValueOnce(undefined);
    const service = new MessageService(api);
    await service.updateMessage(9, { status: CommsStatus.ACCEPTED }, "tok");
    expect(api.putWithToken).toHaveBeenCalledWith(
      "/messages/9",
      { status: CommsStatus.ACCEPTED },
      "tok",
    );
  });
});
