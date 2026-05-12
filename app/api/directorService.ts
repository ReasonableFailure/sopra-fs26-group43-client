import { ApiService } from "@/api/apiService";
import { Director, DirectorGetDTO, DirectorPostDTO } from "@/types/director";
export class DirectorService {
  constructor(private api: ApiService) {}

  public async becomeDirector(dto: DirectorPostDTO, token: string) {
    return await this.api.postWithToken<DirectorGetDTO>(
      `/directors`,
      dto,
      token,
    );
  }
}
