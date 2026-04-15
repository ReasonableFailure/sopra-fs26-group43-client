import { ApiService } from "@/api/apiService";
import type { Message, MessagePutDTO } from "@/types/message";

export class MessageService {
  constructor(private api: ApiService) {}

  getMessagesByScenario(scenarioId: number, token: string): Promise<Message[]> {
    return this.api.getWithToken<Message[]>(`/scenarios/${scenarioId}/messages`, token);
  }

  updateMessage(messageId: number, dto: MessagePutDTO, token: string): Promise<void> {
    return this.api.putWithToken<void>(`/messages/${messageId}`, dto, token);
  }
}
