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
    return this.api.get<User>(`/users/${id}`, `Bearer ${token}`);
  }

  getAllUsers(token: string): Promise<User[]> {
    return this.api.get<User[]>("/users", `Bearer ${token}`);
  }

  updateUser(id: number, data: UserPutDTO, token: string): Promise<void> {
    return this.api.put<void>(`/users/${id}`, data, `Bearer ${token}`);
  }

  logout(id: number, token: string): Promise<void> {
    return this.api.postWithToken<void>(`/logout/${id}`, {}, `Bearer ${token}`);
  }
}
