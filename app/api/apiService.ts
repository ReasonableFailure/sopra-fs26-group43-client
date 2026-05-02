import { getApiDomain } from "@/utils/domain";
import { ApplicationError } from "@/types/error";

export class ApiService {
  private baseURL: string;
  private defaultHeaders: HeadersInit;

  constructor() {
    this.baseURL = getApiDomain();
    this.defaultHeaders = {
      "Content-Type": "application/json",
    };
  }

  /**
   * Helper function to check the response, parse JSON,
   * and throw an error if the response is not OK.
   *
   * @param res - The response from fetch.
   * @param errorMessage - A descriptive error message for this call.
   * @returns Parsed JSON data.
   * @throws ApplicationError if res.ok is false.
   */
  private async processResponse<T>(
    res: Response,
    errorMessage: string,
  ): Promise<T> {
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
        // If parsing fails, keep using res.statusText
      }
      const detailedMessage = `${errorMessage} (${res.status}: ${errorDetail})`;
      const error: ApplicationError = new Error(
        detailedMessage,
      ) as ApplicationError;
      error.info = JSON.stringify(
        { status: res.status, statusText: res.statusText },
        null,
        2,
      );
      error.status = res.status;
      throw error;
    }
    return res.headers.get("Content-Type")?.includes("application/json")
      ? (res.json() as Promise<T>)
      : Promise.resolve(res as T);
  }

  /**
   * GET request with Authorization header.
   * @param endpoint - The API endpoint (e.g. "/users").
   * @param token - The auth token.
   * @returns JSON data of type T.
   */
  public async get<T>(endpoint: string, token: string): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const res = await fetch(url, {
      method: "GET",
      headers: { ...this.defaultHeaders, Authorization: token },
    });
    return this.processResponse<T>(res, "An error occurred while fetching the data.\n");
  }

  /**
   * POST request with Authorization header.
   * @param endpoint - The API endpoint.
   * @param data - The payload to post.
   * @param token - The auth token.
   * @returns JSON data of type T.
   */
  public async postWithToken<T>(endpoint: string, data: unknown, token: string): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const res = await fetch(url, {
      method: "POST",
      headers: { ...this.defaultHeaders, Authorization: token },
      body: JSON.stringify(data),
    });
    return this.processResponse<T>(res, "An error occurred while posting the data.\n");
  }

  public async post<T>(endpoint: string, data: unknown): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const res = await fetch(url, {
      method: "POST",
      headers: this.defaultHeaders,
      body: JSON.stringify(data),
    });
    return this.processResponse(res, "Error on registration/login");
  }

  /**
   * PUT request with Authorization header.
   * @param endpoint - The API endpoint (e.g. "/users/123").
   * @param data - The payload to update.
   * @param token - The auth token.
   * @returns JSON data of type T.
   */
  public async put<T>(
    endpoint: string,
    data: unknown,
    token: string,
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const res = await fetch(url, {
      method: "PUT",
      headers: { ...this.defaultHeaders, Authorization: token },
      body: JSON.stringify(data),
    });
    return this.processResponse<T>(
      res,
      "An error occurred while updating the data.\n",
    );
  }

  /**
   * DELETE request with Authorization header.
   * @param endpoint - The API endpoint.
   * @param token - The auth token.
   * @returns JSON data of type T.
   */
  public async delete<T>(endpoint: string, token: string): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const res = await fetch(url, {
      method: "DELETE",
      headers: { ...this.defaultHeaders, Authorization: token },
    });
    return this.processResponse<T>(res, "An error occurred while deleting the data.\n");
  }
}
