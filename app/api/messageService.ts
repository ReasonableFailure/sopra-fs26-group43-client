import { ApiService } from "@/api/apiService";
import type {
  Message,
  MessagePairDTO,
  MessagePostDTO,
  MessagePutDTO,
} from "@/types/message";

export class MessageService {
  constructor(private api: ApiService) {}

  async createMessage(dto: MessagePostDTO, token: string): Promise<Message> {
    return await this.api.postWithToken<Message>("/messages", dto, token);
  }

  async getMessagePairsByScenario(
    scenarioId: number,
    token: string,
  ): Promise<MessagePairDTO[]> {
    return await this.api.getWithToken<MessagePairDTO[]>(
      `/messages/scenario/${scenarioId}/pairs`,
      token,
    );
  }

  /**
   * Read-only inbox for a Role within a scenario. Returns every message
   * addressed to that character (any status). Used by the Character
   * Dashboard to compute the unread-message indicator. Does NOT mark
   * messages as seen — `getMessagesBetween` does that side effect.
   */
  async getCharacterInbox(
    characterId: number,
    scenarioId: number,
    token: string,
  ): Promise<Message[]> {
    return await this.api.getWithToken<Message[]>(
      `/messages/character/${characterId}/inbox?scenarioId=${scenarioId}`,
      token,
    );
  }

  getMessagesBetween(
    charAId: number,
    charBId: number,
    token: string,
  ): Promise<Message[]> {
    return this.api.getWithToken<Message[]>(
      `/messages/between/${charAId}/${charBId}`,
      token,
    );
  }

  updateMessage(
    messageId: number,
    dto: MessagePutDTO,
    token: string,
  ): Promise<void> {
    return this.api.putWithToken<void>(`/messages/${messageId}`, dto, token);
  }

  deleteMessage(messageId: number, token: string): Promise<void> {
    return this.api.deleteWithToken<void>(`/messages/${messageId}`, token);
  }
}
