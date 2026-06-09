import { request } from './request';

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

export interface WithdrawRequest {
  currency: string;
  amount: number;
}

export interface QuoteResponse {
  amount: number;
  tax: number;
  quote: number;
}

export async function getBalance() {
  const response = await request<{ balance: Balance }>('/wallet/balance', {
    method: 'GET',
  });

  if (response.body?.success === false) {
    throw new Error(response.body.message);
  }

  return response.body?.data?.balance;
}

export async function getTransactions(
  limit: number = 5,
  cursor?: string | null,
  sort: string = 'desc',
) {
  const queryParams = new URLSearchParams({
    limit: limit.toString(),
    sort,
  });

  if (cursor) {
    queryParams.append('cursor', cursor);
  }

  const response = await request<{
    transactions: TransactionType[];
    total: number;
    nextCursor: string | null;
  }>(`/wallet/transactions?${queryParams.toString()}`, {
    method: 'GET',
  });

  if (!response.body || response.body?.success === false) {
    throw new Error(response.body?.message || 'Falha ao carregar transações.');
  }

  return response.body.data;
}

export async function getQuote(from: string, to: string, amount: number) {
  const response = await request<QuoteResponse>(`/wallet/quote/${from}/${to}?amount=${amount}`, {
    method: 'GET',
    needsAuth: false,
  });

  if (response.body?.success === false) {
    throw new Error(response.body.message);
  }

  return response.body?.data;
}

export async function executeSwap(from: string, to: string, amount: number) {
  const response = await request('/wallet/swap', {
    method: 'POST',
    body: JSON.stringify({ fromCurrency: from, toCurrency: to, amount }),
  });

  if (response.body?.success === false) {
    throw new Error(response.body.message);
  }
}

export async function withdraw(currency: string, amount: number) {
  const response = await request('/wallet/withdraw', {
    method: 'POST',
    body: JSON.stringify({ currency, amount }),
  });

  if (response.body?.success === false) {
    throw new Error(response.body.message);
  }
}
