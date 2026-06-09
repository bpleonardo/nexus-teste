import { redirect } from 'next/navigation';

import { BASE_API_URL } from '../constants';
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

type ApiResponse<T> = SuccessResponse<T> | ErrorResponse;

interface ResponseData<T> {
  status: number;
  body: ApiResponse<T> | null;
}

export async function request<T>(
  url: string,
  options: RequestOptions = {},
): Promise<ResponseData<T>> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  options.needsAuth = options.needsAuth ?? true; // Default to true if not specified

  if (options.needsAuth) {
    const token = getAccessToken();

    if (!token) {
      redirect('/login');
    }

    headers['Authorization'] = `Bearer ${token}`;
  }

  let response = await fetch(`${BASE_API_URL}${url}`, {
    ...options,
    headers,
  });

  let data: ApiResponse<T> | null = null;

  if (response.headers.get('Content-Type')?.includes('application/json')) {
    data = await response.json();
  }

  // Check if token is invalid
  if (options.needsAuth && !response.ok && response.status === 401) {
    if (data?.success === false && data.code === 'INVALID_TOKEN') {
      // Try to refresh the token
      const newToken = await refreshAccessToken();

      headers['Authorization'] = `Bearer ${newToken}`;

      // Retry the request
      response = await fetch(`${BASE_API_URL}${url}`, {
        ...options,
        headers,
      });

      if (response.headers.get('Content-Type')?.includes('application/json')) {
        data = await response.json();
      }
    } else if (data?.success === false && data.code === 'MISSING_TOKEN') {
      // If token is missing, redirect to login
      redirect('/login');
    }
  }

  return { status: response.status, body: data };
}
