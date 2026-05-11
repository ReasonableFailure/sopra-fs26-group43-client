import { ApiService } from "@/api/apiService";
import type {
  Message,
  MessagePairDTO,
  MessagePostDTO,
  MessagePutDTO,
} from "@/types/message";

export class MessageService {
  constructor(private api: ApiService) {}

  createMessage(dto: MessagePostDTO, token: string): Promise<Message> {
    return this.api.postWithToken<Message>("/messages", dto, token);
  }

  getMessagePairsByScenario(
    scenarioId: number,
    token: string,
  ): Promise<MessagePairDTO[]> {
    return this.api.get<MessagePairDTO[]>(
      `/messages/scenario/${scenarioId}/pairs`,
      token,
    );
  }

  getMessagesBetween(
    charAId: number,
    charBId: number,
    token: string,
  ): Promise<Message[]> {
    return this.api.get<Message[]>(
      `/messages/between/${charAId}/${charBId}`,
      token,
    );
  }

  updateMessage(
    messageId: number,
    dto: MessagePutDTO,
    token: string,
  ): Promise<void> {
    return this.api.put<void>(`/messages/${messageId}`, dto, token);
  }
}
