export enum CommsStatus {
  PENDING = "PENDING",
  ACCEPTED = "ACCEPTED",
  REJECTED = "REJECTED",
  FAILED = "FAILED",
}

export enum DirectiveCategory {
  MILITARY = "MILITARY",
  POLITICAL = "POLITICAL",
  PUBLIC = "PUBLIC",
  INTELLIGENCE = "INTELLIGENCE",
  OTHER = "OTHER",
}

export interface Communication {
  id: number | null;
  title: string | null;
  body: string | null;
  createdAt: string | null;
}

export interface Directive extends Communication {
  creatorId: number | null;
  status: CommsStatus | null;
  response: string | null;
  category: DirectiveCategory | null;
}

/** POST /directives */
export interface DirectivePostDTO {
  title: string;
  body: string;
  creatorId: number;
  scenarioId: number;
  category: DirectiveCategory;
}

/** GET /directives/{id} */
export interface DirectiveGetDTO {
  id: number;
  title: string;
  body: string;
  createdAt: string;
  creatorId: number;
  status: CommsStatus;
  response: string | null;
  category: DirectiveCategory;
}

/** PUT /directives/{id} */
export interface DirectivePutDTO {
  status: CommsStatus;
  response: string;
}
