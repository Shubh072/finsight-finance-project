export interface CurrencyInfo {
  code: string;
  symbol: string;
  name: string;
  rate: number; // Exchange rate relative to USD
}

export const CURRENCIES: Record<string, CurrencyInfo> = {
  USD: { code: "USD", symbol: "$", name: "USD - United States Dollar ($)", rate: 1.0 },
  EUR: { code: "EUR", symbol: "€", name: "EUR - Euro (€)", rate: 0.92 },
  GBP: { code: "GBP", symbol: "£", name: "GBP - British Pound (£)", rate: 0.78 },
  INR: { code: "INR", symbol: "₹", name: "INR - Indian Rupee (₹)", rate: 83.5 },
  CAD: { code: "CAD", symbol: "CA$", name: "CAD - Canadian Dollar (CA$)", rate: 1.37 },
  AUD: { code: "AUD", symbol: "A$", name: "AUD - Australian Dollar (A$)", rate: 1.52 },
  JPY: { code: "JPY", symbol: "¥", name: "JPY - Japanese Yen (¥)", rate: 154.5 },
  CHF: { code: "CHF", symbol: "CHF ", name: "CHF - Swiss Franc (CHF)", rate: 0.89 },
};

export function getCurrencySymbol(code: string = "USD"): string {
  if (!code) return "$";
  const upper = code.trim().toUpperCase();
  return CURRENCIES[upper]?.symbol || "$";
}

export function getCurrencyRate(code: string = "USD"): number {
  if (!code) return 1.0;
  const upper = code.trim().toUpperCase();
  return CURRENCIES[upper]?.rate || 1.0;
}

export function formatCurrency(
  amount: number,
  currencyCodeOrSymbol: string = "USD",
  convertRate: boolean | number = false
): string {
  let symbol = "$";
  if (!currencyCodeOrSymbol) {
    symbol = "$";
  } else if (CURRENCIES[currencyCodeOrSymbol.trim().toUpperCase()]) {
    symbol = CURRENCIES[currencyCodeOrSymbol.trim().toUpperCase()].symbol;
  } else {
    symbol = currencyCodeOrSymbol;
  }

  let rate = 1.0;
  if (typeof convertRate === "number") {
    rate = convertRate;
  } else if (typeof convertRate === "boolean" && convertRate) {
    rate = getCurrencyRate(currencyCodeOrSymbol);
  }

  const val = (amount || 0) * rate;

  const formatted = Math.abs(val).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

  return `${val < 0 ? "-" : ""}${symbol}${formatted}`;
}
