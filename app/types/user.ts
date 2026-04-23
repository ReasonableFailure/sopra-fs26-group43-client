export enum UserStatus {
  ONLINE = "ONLINE",
  OFFLINE = "OFFLINE",
}

export interface User {
  id: number | null;
  username: string | null;
  token: string | null;
  status: UserStatus | null;
  bio: string | null;
  playing: boolean | null;
  creationDate: string | null;
  isPlaying: boolean;
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

/** PUT /users/{id} */
export interface UserPutDTO {
  username?: string;
  password?: string;
  bio?: string;
}

/** POST /login */
export interface UserLoginDTO {
  username: string;
  password: string;
}

/** PUT /users/{id} */
export interface UserPutDTO {
  username?: string;
  password?: string;
  bio?: string;
}