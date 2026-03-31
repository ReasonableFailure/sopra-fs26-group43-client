export interface Scenario {
  id: number | null;
  title: string | null;
  description: string | null;
  isActive: boolean;
  day: number;
  exchangeRate: number;
}
