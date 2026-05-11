import { ApiService } from "@/api/apiService";
import { Backroomer, BackroomerPostDTO } from "@/types/backroomer";

export class BackroomerService {
  constructor(private api: ApiService) {
  }

  createBackroomer(
    dto: BackroomerPostDTO,
    userToken: string,
  ): Promise<Backroomer> {
    return this.api.postWithToken<Backroomer>(`/backroomers`, dto, userToken);
  }
}
