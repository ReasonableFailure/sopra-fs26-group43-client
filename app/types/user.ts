export enum UserStatus {
  ONLINE = "ONLINE",
  OFFLINE = "OFFLINE",
}

export interface User {
  id: number;
  username: string | null;
  token: string | null;
  status: UserStatus | null;
  bio: string | null;
  name: string | null;
  /** Profile picture as data URL (or null). */
  profilePic: string | null;
  playing: boolean | null;
  creationDate: string | null;
}

/** POST /users – register a new account */
export interface UserPostDTO {
  username: string;
  password: string;
  bio?: string;
}

/** POST /login */
export interface UserLoginDTO {
  username: string;
  password: string;
}

/**
 * PUT /users/{id} – every field is optional. A field that's omitted
 * keeps its current value server-side. Sending an empty string clears
 * the corresponding text field (or pic).
 */
export interface UserPutDTO {
  username?: string;
  password?: string;
  bio?: string;
  name?: string;
  profilePic?: string | null;
}

export interface UserAssignDTO {
  id: number;
}
