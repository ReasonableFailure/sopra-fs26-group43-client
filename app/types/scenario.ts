export interface Scenario {
  id: number | null;
  title: string | null;
  description: string | null;
  active: boolean;
  dayNumber: number;
  exchangeRate: number;
}
