export interface Character {
  id: number | null;
  name: string | null;
  title: string | null;
  description: string | null;
  secret: string | null;
  isAlive: boolean;
  messageCount: number;
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

