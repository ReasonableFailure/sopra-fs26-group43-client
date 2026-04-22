import { CommsStatus } from "@/types/directive";

export interface Message {
  id: number | null;
  title: string | null;
  body: string | null;
  createdAt: string | null;
  status: CommsStatus | null;
  creatorId: number | null;
  recipientId: number | null;
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
