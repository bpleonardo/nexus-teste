export const BASE_API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost/api';
export const CURRENCY_SYMBOLS: Record<string, string> = {
  BRL: 'R$',
  BTC: '₿',
  ETH: 'Ξ',
};
export const primaryCurrency = 'BRL';
export const KNOWN_CURRENCIES = Object.keys(CURRENCY_SYMBOLS);
