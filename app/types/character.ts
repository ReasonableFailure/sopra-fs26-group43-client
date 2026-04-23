export interface Character {
  id: number | null;
  name: string | null;
  title: string | null;
  description: string | null;
  portrait: string | null; // base64 data URI or URL
  secret: string | null;   // only visible to the owning player and backroomers
  isAlive: boolean;
  actionPoints: number;
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
  userId?: number;   // links character to a user account
}
