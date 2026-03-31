export interface Character {
  id: number | null;
  name: string | null;
  title: string | null;
  description: string | null;
  isAlive: boolean;
  actionPoints: number;
  messageCount: number;
  secret: string | null;
}
