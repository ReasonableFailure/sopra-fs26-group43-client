import { getApiDomain } from "@/utils/domain";
import { ApplicationError } from "@/types/error";

export class ApiService {
  private baseURL: string;

  constructor() {
    this.baseURL = getApiDomain();
  }

  private getHeaders(token?: string | null): HeadersInit {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    return headers;
  }

  private async processResponse<T>(res: Response, errorMessage: string): Promise<T> {
    if (!res.ok) {
      let errorDetail = res.statusText;
      try {
        const errorInfo = await res.json();
        if (errorInfo?.message) {
          errorDetail = errorInfo.message;
        } else {
          errorDetail = JSON.stringify(errorInfo);
        }
      } catch {
        // keep statusText
      }
      const detailedMessage = `${errorMessage} (${res.status}: ${errorDetail})`;
      const error: ApplicationError = new Error(detailedMessage) as ApplicationError;
      error.info = JSON.stringify({ status: res.status, statusText: res.statusText }, null, 2);
      error.status = res.status;
      throw error;
    }
    return res.headers.get("Content-Type")?.includes("application/json")
      ? (res.json() as Promise<T>)
      : Promise.resolve(res as T);
  }

  public async get<T>(endpoint: string, token?: string | null): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const res = await fetch(url, { method: "GET", headers: this.getHeaders(token) });
    return this.processResponse<T>(res, "An error occurred while fetching the data.");
  }

  public async post<T>(endpoint: string, data: unknown, token?: string | null): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const res = await fetch(url, { method: "POST", headers: this.getHeaders(token), body: JSON.stringify(data) });
    return this.processResponse<T>(res, "An error occurred while posting the data.");
  }

  public async put<T>(endpoint: string, data: unknown, token?: string | null): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const res = await fetch(url, { method: "PUT", headers: this.getHeaders(token), body: JSON.stringify(data) });
    return this.processResponse<T>(res, "An error occurred while updating the data.");
  }

  public async delete<T>(endpoint: string, token?: string | null): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const res = await fetch(url, { method: "DELETE", headers: this.getHeaders(token) });
    return this.processResponse<T>(res, "An error occurred while deleting the data.");
  }
}
