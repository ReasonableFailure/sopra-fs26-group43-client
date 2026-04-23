import { ApiService } from "@/api/apiService";
import type { NewsGetDTO, NewsPostDTO } from "@/types/news";

export class NewsService {
  constructor(private api: ApiService) {}

  createPronouncement(dto: NewsPostDTO, token: string): Promise<NewsGetDTO> {
    return this.api.postWithToken<NewsGetDTO>("/news", dto, token);
  }

  getNewsByScenario(scenarioId: number, token: string): Promise<NewsGetDTO[]> {
    return this.api.getWithToken<NewsGetDTO[]>(`/news/scenario/${scenarioId}`, token);
  }

  likeNews(newsId: number, roleId: number, token: string): Promise<NewsGetDTO> {
  return this.api.postWithToken<NewsGetDTO>(`/news/like/${newsId}/${roleId}`,{},token);
}
}
