import type { Coupon } from '../types/coupon';

/** Zakres czasu dla filtrów „ten tydzień / miesiąc / rok”. */
export type TimeRange = 'week' | 'month' | 'year';

function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1, 0, 0, 0, 0);
}

function startOfYear(d: Date): Date {
  return new Date(d.getFullYear(), 0, 1, 0, 0, 0, 0);
}

/** Granice [start, end] dla wybranego zakresu względem „teraz”. */
export function getRangeBounds(range: TimeRange): { start: Date; end: Date } {
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  let start: Date;
  if (range === 'week') {
    // Ostatnie 7 dni (dziś − 6 … dziś), spójnie z wykresem
    start = new Date();
    start.setDate(start.getDate() - 6);
    start.setHours(0, 0, 0, 0);
  } else if (range === 'month') start = startOfMonth(new Date());
  else start = startOfYear(new Date());
  return { start, end };
}

/** Czy data dodania kuponu (ISO) mieści się w przedziale. */
export function couponInTimeRange(c: Coupon, start: Date, end: Date): boolean {
  const t = new Date(c.dataDodania).getTime();
  return t >= start.getTime() && t <= end.getTime();
}

export function filterCouponsByTimeRange(
  coupons: Coupon[],
  range: TimeRange
): Coupon[] {
  const { start, end } = getRangeBounds(range);
  return coupons.filter((c) => couponInTimeRange(c, start, end));
}
