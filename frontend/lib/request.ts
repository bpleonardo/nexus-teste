import { BASE_API_URL } from './constants';
import { getAccessToken, refreshAccessToken } from './auth';

interface ErrorResponse {
  success: false;
  code: string;
  message: string;
  data?: { errors?: Record<string, string[]> };
}

interface SuccessResponse<T> {
  success: true;
  data: T;
}

interface RequestOptions extends Omit<RequestInit, 'headers'> {
  headers?: Record<string, string>;
  needsAuth?: boolean;
}

export type ApiResponse<T> = SuccessResponse<T> | ErrorResponse;

export async function request<T>(
  url: string,
  options: RequestOptions = { needsAuth: true },
): Promise<ApiResponse<T>> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (options.needsAuth) {
    const token = getAccessToken();

    if (!token) {
      window.history.pushState({}, '', '/login');
    }

    headers['Authorization'] = `Bearer ${token}`;
  }

  let response = await fetch(`${BASE_API_URL}${url}`, {
    ...options,
    headers,
  });

  let data = (await response.json()) as ApiResponse<T>;

  // Check if token is invalid
  if (
    options.needsAuth &&
    response.status === 401 &&
    data.success === false &&
    data.code === 'INVALID_TOKEN'
  ) {
    // Try to refresh the token
    const newToken = await refreshAccessToken();

    headers['Authorization'] = `Bearer ${newToken}`;

    // Retry the request
    response = await fetch(`${BASE_API_URL}${url}`, {
      ...options,
      headers,
    });

    data = await response.json();
  }

  return data;
}
