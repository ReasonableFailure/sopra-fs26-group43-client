export interface Message {
  id: number | null;
  title: string | null;
  body: string | null;
  createdAt: string | null;
  status: string | null;
  creatorId: number | null;
  recipientId: number | null;
}

export interface Directive {
  id: number | null;
  title: string | null;
  body: string | null;
  createdAt: string | null;
  status: string | null;
  creatorId: number | null;
}
