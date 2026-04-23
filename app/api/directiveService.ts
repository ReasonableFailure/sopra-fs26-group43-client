import { ApiService } from "@/api/apiService";
import type { Directive, DirectivePostDTO, DirectivePutDTO } from "@/types/directive";

export class DirectiveService {
  constructor(private api: ApiService) {}

  getDirectivesByScenario(scenarioId: number, token: string): Promise<Directive[]> {
    return this.api.getWithToken<Directive[]>(`/directives/scenario/${scenarioId}`, token);
  }

  getDirectiveById(directiveId: number, token: string): Promise<Directive> {
    return this.api.getWithToken<Directive>(`/directives/${directiveId}`, token);
  }

  createDirective(dto: DirectivePostDTO, token: string): Promise<Directive> {
    return this.api.postWithToken<Directive>("/directives", dto, token);
  }

  updateDirective(directiveId: number, dto: DirectivePutDTO, token: string): Promise<void> {
    return this.api.putWithToken<void>(`/directives/${directiveId}`, dto, token);
  }
}
