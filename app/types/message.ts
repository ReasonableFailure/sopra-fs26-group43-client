export interface Message {
  id: number | null;
  senderId: number | null;
  recipientId: number | null;
  bodyText: string | null;
  senderName: string | null;
  recipientName: string | null;
}

export interface MessagePostDTO {
  senderId: number;
  recipientId: number;
  bodyText: string;
}
