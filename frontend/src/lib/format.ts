const CURRENCY = process.env.NEXT_PUBLIC_CURRENCY ?? 'USD';

const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: CURRENCY });

export const formatPrice = (value: number | null | undefined): string => (value == null ? '' : money.format(value));

export const CURRENCY_CODE = CURRENCY;
