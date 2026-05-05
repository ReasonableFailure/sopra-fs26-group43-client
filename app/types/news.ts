export interface NewsStory {
  id: number | null;
  title: string | null;
  body: string | null;
  createdAt: string | null;
  scenarioId: number | null;
}

export interface Pronouncement {
  id: number | null;
  title: string | null;
  body: string | null;
  createdAt: string | null;
  likes: number;
  authorId: number | null;
}

/** GET /news/{id} and GET /news/scenario/{id} */
export interface NewsGetDTO {
  id: number;
  title: string;
  body: string;
  createdAt: string;
  authorId: number | null;  // null for news stories, set for pronouncements
  likes: number | null;
}

/** POST /news */
export interface NewsPostDTO {
  title: string;
  body: string;
  scenarioId: number;
  authorId?: number;
}
