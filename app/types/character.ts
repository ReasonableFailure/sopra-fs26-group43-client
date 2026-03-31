export interface Character {
  id: number | null;
  name: string | null;
  title: string | null;
  description: string | null;
  isAlive: boolean;
  actionPoints: number;
  messageCount: number;    // how many messages already sent
  messageSlots: number;    // total allowed messages, starts at 15
  secret: string | null;
}
