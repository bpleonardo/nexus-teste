import { CURRENCY_SYMBOLS } from './constants';

export const formatCurrency = (value: number, currency: string): string => {
  const symbol = CURRENCY_SYMBOLS[currency] || currency;

  if (currency === 'BRL') {
    return `${symbol} ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  return `${symbol} ${value.toFixed(8).replace(/\.?0+$/, '')}`;
};
