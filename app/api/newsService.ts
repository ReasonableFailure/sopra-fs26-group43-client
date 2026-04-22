import { ApiService } from "@/api/apiService";
import type { NewsGetDTO, NewsPostDTO, Pronouncement } from "@/types/news";

export class NewsService {
  constructor(private api: ApiService) {}

  createPronouncement(dto: NewsPostDTO, token: string): Promise<Pronouncement> {
    return this.api.postWithToken<Pronouncement>("/news", dto, token);
  }

  getNewsByScenario(scenarioId: number, token: string): Promise<NewsGetDTO[]> {
    return this.api.getWithToken<NewsGetDTO[]>(`/news/scenario/${scenarioId}`, token);
  }
}
