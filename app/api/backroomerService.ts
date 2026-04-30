import { ApiService } from "@/api/apiService";
import {BackroomerPostDTO, Backroomer} from "@/types/backroomer";

export class BackroomerService{
    constructor(private api: ApiService) {
    }

    createBackroomer(dto: BackroomerPostDTO, userToken: string): Promise<Backroomer>{
        return this.api.postWithToken(`/backroomers`, dto, userToken);
    }
}