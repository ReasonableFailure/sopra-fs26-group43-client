import { ApiService } from "@/api/apiService";
import { User, UserLoginDTO, UserPostDTO, UserPutDTO } from "@/types/user";

export class UserService {
  constructor(private api: ApiService) {}

  register(data: UserPostDTO): Promise<User> {
    return this.api.post<User>("/users", data);
  }

  login(data: UserLoginDTO): Promise<User> {
    return this.api.post<User>("/login", data);
  }

  getUser(id: number, token: string): Promise<User> {
    return this.api.getWithToken<User>(`/users/${id}`, token);
  }

  getAllUsers(token: string): Promise<User[]> {
    return this.api.getWithToken<User[]>("/users", token);
  }

  updateUser(id: number, data: UserPutDTO, token: string): Promise<void> {
    return this.api.putWithToken<void>(`/users/${id}`, data, token);
  }

  logout(id: number, token: string): Promise<void> {
    return this.api.postWithToken<void>(`/logout/${id}`, {}, token);
  }
}
