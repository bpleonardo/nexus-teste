import { request, redirect } from './request';
import { InvalidCredentials, UserAlreadyExists } from '../errors';

export function setAccessToken(token: string): void {
  // Tokens are kinda safe to be stored in localStorage since they are short-lived and
  // can only be refreshed using a refresh token, which is stored in a HttpOnly cookie.
  localStorage.setItem('accessToken', token);
}

export function getAccessToken(): string | null {
  return localStorage.getItem('accessToken');
}

export function clearAccessToken(): void {
  localStorage.removeItem('accessToken');
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

  redirect('/login');
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
    throw new Error('Chave de acesso não recebida. Tente novamente.');
  }

  setAccessToken(token);

  return token;
}

// We use this global variable to prevent multiple calls to
// request from refreshing the token.
// Due to race conditions, this could end in an revoked token being stored.
let refreshPromise: Promise<string> | null = null;

export async function refreshAccessToken(): Promise<string> {
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

      redirect('/login?expired=1');
    }

    const newToken = data?.data.token;

    if (!newToken) {
      clearAccessToken();

      redirect('/login?expired=1');
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

export async function logout(): Promise<never> {
  try {
    await request('/logout', { method: 'POST' });
  } catch (err) {
    // WARNING: This does not invalidate refresh tokens and keeps them stored.
    // We can't do anything about it since only the server can interact with them.
    // Ideally, we would indicate this error to the user, but, in my opinion,
    // this would make for bad UX. (What do you mean I can't log out?)
    console.error('Exception when logging out, nuking access token instead.', err);
  }

  clearAccessToken();

  redirect('/login');
}
