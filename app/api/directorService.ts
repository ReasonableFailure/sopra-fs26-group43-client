import { ApiService } from "@/api/apiService";
import { Director, DirectorGetDTO, DirectorPutDTO } from "@/types/director";
export class DirectorService {
  constructor(private api: ApiService) {}

  public async becomeDirector(dto: DirectorPutDTO, token: string) {
    return this.api.put<DirectorGetDTO>(`/directors`, dto, token);
  }
}
