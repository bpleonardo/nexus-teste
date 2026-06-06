import { CURRENCY_SYMBOLS } from './constants';

export const formatCurrency = (value: number, currency: string): string => {
  const symbol = CURRENCY_SYMBOLS[currency] || currency;

  if (currency === 'BRL') {
    return `${symbol} ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  return `${symbol} ${value.toFixed(8).replace(/\.?0+$/, '')}`;
};

export function getFirstAndLastName(fullName: string): string {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);

  if (parts.length === 0) return '';
  if (parts.length === 1) return parts[0];

  return `${parts[0]} ${parts[parts.length - 1]}`;
}

export function getInitials(fullName: string): string {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);

  if (parts.length === 0) return '';

  if (parts.length === 1) {
    return parts[0][0].toUpperCase();
  }

  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
