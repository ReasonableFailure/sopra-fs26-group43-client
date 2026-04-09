import { CommsStatus } from "@/types/directive";

export interface Message {
  id: number | null;
  title: string | null;
  body: string | null;
  createdAt: string | null;  // ISO timestamp
  status: CommsStatus | null;
  creatorId: number | null;  // character id — matches backend field name "creator"
  recipientId: number | null; // character id
}

/** POST /messages */
export interface MessagePostDTO {
  title: string;
  body: string;
  creatorId: number;
  recipientId: number;
  scenarioId: number;
}

/** PUT /messages/{id} — backroomer approves or rejects */
export interface MessagePutDTO {
  status: CommsStatus;
  reason: string | null;
}
