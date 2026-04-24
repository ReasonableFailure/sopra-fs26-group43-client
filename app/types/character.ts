export interface Character {
  id: number | null;
  name: string | null;
  title: string | null;
  description: string | null;
  secret: string | null;
  isAlive: boolean;
  messageCount: number;
  actionPoints: number;
}
