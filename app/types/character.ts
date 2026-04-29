export interface Character {
  id: number | null;
  name: string | null;
  title: string | null;
  description: string | null;
  portrait: string | null; // base64 data URI or URL
  secret: string | null;   // only visible to the owning player and backroomers
  isAlive: boolean;
  totalPoints: number;
  pointsBalance: number;
  messageCount: number;
  numberDirectives: number;
  numberMessages: number;
  numberPronouncements: number;
  totalTextLength: number;
}

/** POST /characters */
export interface CharacterPostDTO {
  name: string;
  title: string | null;
  description: string | null;
  portrait: string | null;
  secret: string | null;
  scenarioId: number;
}

/** PUT /characters/{id} — matches backend CharacterPutDTO */
export interface CharacterPutDTO {
  name?: string;
  title?: string;
  description?: string;
  portrait?: string; // base64 string; backend stores as byte[]
  secret?: string;
}
 export interface CharacterAssignDTO {
  toAssignId: number | null;
 }

