import { request } from '../request';

export interface BalanceResponse {
  balance: Balance;
}

export interface Balance {
  [currency: string]: number;
  totalInBRL: number;
}

export interface TransactionType {
  type: 'DEPOSIT' | 'SWAP' | 'WITHDRAW';
  originToken: string;
  destinationToken: string | null;
  originAmount: number;
  destinationAmount: number | null;
  tax: number | null;
  date: string;
}

export interface TransactionsResponse {
  transactions: TransactionType[];
  total: number;
  nextCursor: string | null;
}

export interface QuoteResponse {
  amount: number;
  tax: number;
  quote: number;
}

export interface WithdrawRequest {
  currency: string;
  amount: number;
}

export async function getBalance() {
  const response = await request<BalanceResponse>('/wallet/balance', {
    method: 'GET',
  });

  if (response.body?.success === false) {
    throw new Error(response.body.message);
  }

  return response.body?.data?.balance;
}

export async function getTransactions(limit: number = 5) {
  const response = await request<TransactionsResponse>(
    `/wallet/transactions?limit=${limit}&sort=desc`,
    {
      method: 'GET',
      needsAuth: true,
    },
  );

  if (response.body?.success === false) {
    throw new Error(response.body.message);
  }

  return response.body?.data?.transactions || [];
}

export async function getPaginatedTransactions(
  limit: number = 15,
  cursor?: string | null,
  sort: string = 'desc',
) {
  let url = `/wallet/transactions?limit=${limit}&sort=${sort}`;
  if (cursor) {
    url += `&cursor=${cursor}`;
  }

  const response = await request<TransactionsResponse>(url, {
    method: 'GET',
    needsAuth: true,
  });

  if (response.body?.success === false) {
    throw new Error(response.body.message);
  }

  return response.body?.data;
}

export async function getQuote(from: string, to: string, amount: number) {
  const response = await request<QuoteResponse>(`/wallet/quote/${from}/${to}?amount=${amount}`, {
    method: 'GET',
  });

  if (response.body?.success === false) {
    throw new Error(response.body.message);
  }

  return response.body?.data;
}

export async function executeSwap(from: string, to: string, amount: number) {
  const response = await request<{ transactionId: string }>('/wallet/swap', {
    method: 'POST',
    body: JSON.stringify({ fromCurrency: from, toCurrency: to, amount }),
    needsAuth: true,
  });

  if (response.body?.success === false) {
    throw new Error(response.body.message);
  }

  return response.body?.data;
}

export async function withdraw(currency: string, amount: number) {
  const response = await request<{ transactionId: string }>('/wallet/withdraw', {
    method: 'POST',
    body: JSON.stringify({ currency, amount }),
    needsAuth: true,
  });

  if (response.body?.success === false) {
    throw new Error(response.body.message);
  }

  return response.body?.data;
}

export async function logout() {
  const response = await request<null>('/auth/logout', {
    method: 'POST',
    needsAuth: true,
  });

  if (response.body?.success === false) {
    throw new Error(response.body.message);
  }
}
