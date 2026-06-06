import { BASE_API_URL } from './constants';
import { InvalidCredentials } from './errors';
import { request } from './request';

export function setAccessToken(token: string): void {
  // Tokens are safe to be stored in localStorage since they are short-lived and
  // can only be refreshed using a refresh token, which is stored in an HttpOnly cookie.
  localStorage.setItem('accessToken', token);
}

export function getAccessToken(): string | null {
  return localStorage.getItem('accessToken');
}

export function clearAccessToken(): void {
  localStorage.removeItem('accessToken');
}

export async function login(email: string, password: string, remember: boolean): Promise<string> {
  const response = await request<{ token: string }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password, persist: remember }),
    needsAuth: false,
  });

  if (response.success === false) {
    if (response.code === 'INVALID_CREDENTIALS') {
      throw new InvalidCredentials('Email ou senha inválidos.');
    }
    throw new Error(response.message);
  }

  const token = response.data.token;

  setAccessToken(token);

  return token;
}

export async function refreshAccessToken(): Promise<string> {
  const response = await request<{ token: string }>('/auth/refresh', {
    method: 'POST',
    needsAuth: false, // The server does not read the access token for this endpoint.
  });

  if (response.success === false) {
    clearAccessToken();

    window.history.pushState({}, '', '/login?expired=1');

    throw new Error('Session expired. Please log in again.');
  }

  const newToken = response.data.token;

  setAccessToken(newToken);

  return newToken;
}
