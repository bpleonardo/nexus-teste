import { InvalidCredentials, UserAlreadyExists } from './errors';
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

  const data = response.body;

  if (data?.success === false) {
    if (data.code === 'INVALID_CREDENTIALS') {
      throw new InvalidCredentials('Email ou senha inválidos.');
    }
    throw new Error(data.message);
  }

  const token = data?.data.token;

  if (!token) {
    throw new Error('Token de acesso não recebido. Tente novamente.');
  }

  setAccessToken(token);

  return token;
}

export async function refreshAccessToken(): Promise<string> {
  const response = await request<{ token: string }>('/auth/refresh', {
    method: 'POST',
    needsAuth: false, // The server does not read the access token for this endpoint.
  });

  const data = response.body;

  if (data?.success === false) {
    clearAccessToken();

    window.location.href = '/login?expired=1';

    throw new Error('Session expired. Please log in again.');
  }

  const newToken = data?.data.token;

  if (!newToken) {
    throw new Error('New token not received. Please try again.');
  }

  setAccessToken(newToken);

  return newToken;
}

export async function register(userData: {
  name: string;
  cpf: string;
  phone: string;
  street: string;
  number: string;
  city: string;
  state: string;
  zip: string;
  email: string;
  password: string;
}) {
  const response = await request<null>('/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      name: userData.name,
      cpf: userData.cpf,
      phone: `+55${userData.phone}`,
      email: userData.email,
      password: userData.password,
      address: {
        address: `${userData.street}, ${userData.number}`,
        city: userData.city,
        state: userData.state,
        country: 'BR',
        postalCode: userData.zip,
      },
    }),
    needsAuth: false,
  });

  const data = response.body;

  if (data?.success === false) {
    if (data.code === 'ALREADY_EXISTS') {
      throw new UserAlreadyExists('Um usuário com este email, CPF ou telefone já existe.');
    }
    throw new Error(data.message);
  }

  if (!(response.status === 201)) {
    throw new Error('Registro falhou. Tente novamente.');
  }

  window.location.href = '/login';
}
