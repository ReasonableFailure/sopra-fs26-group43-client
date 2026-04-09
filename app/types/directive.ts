import { Character } from "@/types/character";

/**
 * Mirrors the «Enumeration» CommsStatus from the class diagram.
 * Tracks the lifecycle of a directive after submission.
 */
export enum CommsStatus {
  PENDING = "PENDING",
  ACCEPTED = "ACCEPTED",
  REJECTED = "REJECTED",
  FAILED = "FAILED",
}

export type { Character };

/**
 * Communication is the abstract parent in the class diagram.
 * Directive, Message, Pronouncement, and NewsStory all extend it.
 *
 * Field names match the backend Communication entity (body, createdAt).
 */
export interface Communication {
  id: number | null;
  title: string | null;
  body: string | null;
  createdAt: string | null; // Java Instant serializes to ISO 8601
}

/*  Directive – plain data interface (for API responses / state)       */

/**
 * Represents a Directive as it comes from / goes to the REST API.
 * Use this when you only need the shape of the data (e.g. in useState).
 */
export interface Directive extends Communication {
  creator: Character | null;
  status: CommsStatus | null;
}

/* ------------------------------------------------------------------ */
/*  DTOs – match the REST specification from the M2 report             */
/* ------------------------------------------------------------------ */

/** POST /directives – body sent when a player creates a directive. */
export interface DirectivePostDTO {
  title: string;
  body: string;
  characterId: number; // the creator's character id
  scenarioId: number;
}

/** GET /directives/{id} – shape returned by the server. */
export interface DirectiveGetDTO {
  id: number;
  title: string;
  body: string;
  createdAt: string;
  creator: Character;
  status: CommsStatus;
}

/** PUT /directives/{id} – body sent when a backroomer responds. */
export interface DirectivePutDTO {
  status: CommsStatus; // ACCEPTED or REJECTED
  reason: string;      // backroomer's explanation
}
