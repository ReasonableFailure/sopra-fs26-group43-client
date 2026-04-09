export interface NewsStory {
  id: number | null;
  title: string | null;
  body: string | null;
  createdAt: string | null; // ISO timestamp
  postURI: string | null;   // Mastodon post URL
  scenarioId: number | null;
}

export interface Pronouncement {
  id: number | null;
  title: string | null;
  body: string | null;
  createdAt: string | null; // ISO timestamp
  postURI: string | null;   // Mastodon post URL
  likes: number;
  authorId: number | null;  // character id
}

/** POST /news */
export interface NewsPostDTO {
  title: string;
  body: string;
  scenarioId: number;
}
