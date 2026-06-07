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
    body: JSON.stringify({ email, password, persistent: remember }),
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

// We use this global variable to prevent multiple calls to
// request from refreshing the token. This would make only the last one valid in the API.
let refreshPromise: Promise<string | null> | null = null;

export async function refreshAccessToken(): Promise<string | null> {
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    const response = await request<{ token: string }>('/auth/refresh', {
      method: 'POST',
      needsAuth: false,
    });

    const data = response.body;

    if (data?.success === false) {
      clearAccessToken();

      window.location.href = '/login?expired=1';

      return null;
    }

    const newToken = data?.data.token;

    if (!newToken) {
      throw new Error('New token not received. Please try again.');
    }

    setAccessToken(newToken);

    return newToken;
  })();

  try {
    return await refreshPromise;
  } finally {
    refreshPromise = null;
  }
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
