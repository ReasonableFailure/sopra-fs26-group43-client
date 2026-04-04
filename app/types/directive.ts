/**
 * Directive types and helpers for the Crisis Manager application.
 *
 * Based on the M2 Class Diagram:
 *  - Communication (parent): id, title, bodyText
 *  - Directive (child):      author (Character), status (CommsStatus)
 *  - CommsStatus (enum):     Pending, Accepted, Rejected, Failed
 *
 * The file also re-exports a minimal Character interface used by Directive.
 * The full Character type should live in its own file once that entity is built.
 */

/* ------------------------------------------------------------------ */
/*  Enum                                                               */
/* ------------------------------------------------------------------ */

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

/* ------------------------------------------------------------------ */
/*  Related interfaces                                                 */
/* ------------------------------------------------------------------ */

/**
 * Minimal Character reference used inside a Directive.
 * Expand this or import from a dedicated character.ts once that type exists.
 */
export interface Character {
  id: number | null;
  name: string | null;
  title: string | null;
  description: string | null;
  portrait: string | null;
  secret: string | null;
  isAlive: boolean;
  actionPoints: number;
  messageCount: number;
}

/**
 * Communication is the abstract parent in the class diagram.
 * Directive, Message, Pronouncement, and NewsStory all extend it.
 */
export interface Communication {
  id: number | null;
  title: string | null;
  bodyText: string | null;
}

/* ------------------------------------------------------------------ */
/*  Directive – plain data interface (for API responses / state)       */
/* ------------------------------------------------------------------ */

/**
 * Represents a Directive as it comes from / goes to the REST API.
 * Use this when you only need the shape of the data (e.g. in useState).
 */
export interface Directive extends Communication {
  author: Character | null;
  status: CommsStatus | null;
}

/* ------------------------------------------------------------------ */
/*  DTOs – match the REST specification from the M2 report             */
/* ------------------------------------------------------------------ */

/** POST /directives – body sent when a player creates a directive. */
export interface DirectivePostDTO {
  title: string;
  bodyText: string;
  characterId: number; // the author's character id
  scenarioId: number;
}

/** GET /directives/{id} – shape returned by the server. */
export interface DirectiveGetDTO {
  id: number;
  title: string;
  bodyText: string;
  author: Character;
  status: CommsStatus;
}

/** PUT /directives/{id} – body sent when a backroomer responds. */
export interface DirectivePutDTO {
  status: CommsStatus; // ACCEPTED or REJECTED
  reason: string;      // backroomer's explanation
}

/* ------------------------------------------------------------------ */
/*  Directive helper class – wraps the data with convenience methods   */
/* ------------------------------------------------------------------ */

/**
 * DirectiveModel adds behaviour on top of the plain Directive data.
 * Use it in components that need to format, query, or transform a
 * directive rather than just display raw fields.
 *
 * Usage:
 *   const raw: DirectiveGetDTO = await apiService.get("/directives/1");
 *   const d = new DirectiveModel(raw);
 *   console.log(d.isPending());       // true / false
 *   console.log(d.getAuthorName());   // "Julius Caesar"
 *   console.log(d.getSummary(80));    // first 80 chars of body + "…"
 */
export class DirectiveModel {
  readonly id: number | null;
  readonly title: string | null;
  readonly bodyText: string | null;
  readonly author: Character | null;
  readonly status: CommsStatus | null;

  constructor(data: Directive) {
    this.id = data.id;
    this.title = data.title;
    this.bodyText = data.bodyText;
    this.author = data.author;
    this.status = data.status;
  }

  /* ---------- status queries ---------- */

  /** True while the backroom has not yet responded. */
  isPending(): boolean {
    return this.status === CommsStatus.PENDING;
  }

  /** True if the backroom accepted the directive. */
  isAccepted(): boolean {
    return this.status === CommsStatus.ACCEPTED;
  }

  /** True if the backroom rejected the directive. */
  isRejected(): boolean {
    return this.status === CommsStatus.REJECTED;
  }

  /** True if the directive delivery failed (system error, etc.). */
  isFailed(): boolean {
    return this.status === CommsStatus.FAILED;
  }

  /** True if the directive has received any final response. */
  isResolved(): boolean {
    return (
      this.status === CommsStatus.ACCEPTED ||
      this.status === CommsStatus.REJECTED ||
      this.status === CommsStatus.FAILED
    );
  }

  /* ---------- display helpers ---------- */

  /**
   * Returns the author's character name, or a fallback string
   * if the author data is missing.
   */
  getAuthorName(): string {
    return this.author?.name ?? "Unknown";
  }

  /**
   * Returns a human-readable status label suitable for UI badges.
   * e.g. "Pending", "Accepted", "Rejected", "Failed"
   */
  getStatusLabel(): string {
    if (!this.status) return "Unknown";
    // Capitalize first letter, lowercase the rest
    return this.status.charAt(0) + this.status.slice(1).toLowerCase();
  }

  /**
   * Maps the status to a colour string compatible with Ant Design's
   * Tag / Badge colour prop.
   */
  getStatusColor(): string {
    switch (this.status) {
      case CommsStatus.PENDING:
        return "orange";
      case CommsStatus.ACCEPTED:
        return "green";
      case CommsStatus.REJECTED:
        return "red";
      case CommsStatus.FAILED:
        return "default";
      default:
        return "default";
    }
  }

  /**
   * Returns a truncated preview of the body text.
   * Useful for list views where space is limited.
   *
   * @param maxLength – maximum character count (default 100)
   */
  getSummary(maxLength: number = 100): string {
    if (!this.bodyText) return "";
    if (this.bodyText.length <= maxLength) return this.bodyText;
    return this.bodyText.slice(0, maxLength).trimEnd() + "…";
  }

  /**
   * Formats the directive into a single-line description string.
   * e.g. "Send troops to Rome — Pending (by Julius Caesar)"
   */
  formatSelf(): string {
    const title = this.title ?? "Untitled";
    const status = this.getStatusLabel();
    const author = this.getAuthorName();
    return `${title} — ${status} (by ${author})`;
  }

  /** Returns a plain Directive object (e.g. for serialisation). */
  toData(): Directive {
    return {
      id: this.id,
      title: this.title,
      bodyText: this.bodyText,
      author: this.author,
      status: this.status,
    };
  }
}