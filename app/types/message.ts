import { CommsStatus } from "@/types/directive";

export interface Message {
  id: number | null;
  title: string | null;
  body: string | null;
  createdAt: string | null;
  status: CommsStatus | null;
  creatorId: number | null;
  recipientId: number | null;
  /**
   * True once the recipient has fetched the conversation containing this
   * message (server-side flag — see MessageService.getMessagesBetween).
   * False on creation and until the recipient role opens the conversation.
   */
  seenByRecipient: boolean;
}

/** POST /messages */
export interface MessagePostDTO {
  title: string;
  body: string;
  creatorId: number;
  recipientId: number;
  scenarioId: number;
}

/** PUT /messages/{id} */
export interface MessagePutDTO {
  status: CommsStatus;
}

/** GET /messages/scenario/{scenarioId}/pairs */
export interface MessagePairDTO {
  roleAId: number;
  roleBId: number;
}
