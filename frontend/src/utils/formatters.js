/**
 * Currency and Number Formatting Utility
 */

export const CURRENCIES = {
  INR: { symbol: '₹', code: 'INR', label: 'INR (₹)' },
  USD: { symbol: '$', code: 'USD', label: 'USD ($)' },
  EUR: { symbol: '€', code: 'EUR', label: 'EUR (€)' },
  GBP: { symbol: '£', code: 'GBP', label: 'GBP (£)' },
};

export const formatCurrency = (amount, currencyCode = 'INR') => {
  if (isNaN(amount) || amount === null || amount === undefined) return '0';
  const num = Math.round(Number(amount));

  if (currencyCode === 'INR') {
    // Indian formatting (Lakhs and Crores)
    return new Intl.NumberFormat('en-IN', {
      maximumFractionDigits: 0,
    }).format(num);
  }

  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 0,
  }).format(num);
};

export const formatWords = (amount, currencyCode = 'INR') => {
  const num = Math.round(Number(amount));
  if (isNaN(num) || num <= 0) return '';

  if (currencyCode === 'INR') {
    if (num >= 10000000) {
      return `₹ ${(num / 10000000).toFixed(2)} Cr`;
    }
    if (num >= 100000) {
      return `₹ ${(num / 100000).toFixed(2)} Lakh`;
    }
    if (num >= 1000) {
      return `₹ ${(num / 1000).toFixed(1)}k`;
    }
  } else {
    if (num >= 1000000) {
      return `${CURRENCIES[currencyCode]?.symbol || '$'}${(num / 1000000).toFixed(2)}M`;
    }
    if (num >= 1000) {
      return `${CURRENCIES[currencyCode]?.symbol || '$'}${(num / 1000).toFixed(1)}k`;
    }
  }
  return '';
};
