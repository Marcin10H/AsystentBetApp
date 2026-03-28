import type { Coupon } from '../types/coupon';
import {
  filterCouponsByTimeRange,
  type TimeRange,
} from './dateRange';

export function couponsInRange(coupons: Coupon[], range: TimeRange): Coupon[] {
  return filterCouponsByTimeRange(coupons, range);
}

export function sumStakes(list: Coupon[]): number {
  return list.reduce((s, c) => {
    // Freebet = nie odejmujemy od bilansu jak własnej gotówki.
    if (c.freebet) return s;
    return s + (Number.isFinite(c.stawka) ? c.stawka : 0);
  }, 0);
}

/** Wszystkie stawki z pola stawka (własne + freebet — do podglądu). */
export function sumStakesAll(list: Coupon[]): number {
  return list.reduce((s, c) => s + (Number.isFinite(c.stawka) ? c.stawka : 0), 0);
}

export function sumStakesFreebetOnly(list: Coupon[]): number {
  return list.reduce((s, c) => {
    if (!c.freebet) return s;
    return s + (Number.isFinite(c.stawka) ? c.stawka : 0);
  }, 0);
}

/** Np. "12.00 PLN (3.00 PLN)" gdy jest freebet; samo "12.00 PLN" gdy nie. */
export function formatStakesWithFreebetHint(list: Coupon[]): string {
  const total = sumStakesAll(list);
  const fb = sumStakesFreebetOnly(list);
  const t = total.toFixed(2);
  if (fb <= 0) return `${t} PLN`;
  return `${t} PLN (${fb.toFixed(2)} PLN)`;
}

export function sumWinnings(list: Coupon[]): number {
  return list
    .filter((c) => c.status === 'WYGRANY')
    .reduce((s, c) => s + (Number.isFinite(c.potencjalnaWygrana) ? c.potencjalnaWygrana : 0), 0);
}

export function totalBalance(list: Coupon[]): number {
  // W sumStakes freebety już są pominięte.
  return sumWinnings(list) - sumStakes(list);
}

/**
 * ROI od sumy nominalnych stawek (własne + freebet), spójnej z „Suma stawek (w tym freebet)”.
 * Zysk = wygrane − ta suma — wygrana z freebetu liczy się normalnie, nominal freebetu jest w mianowniku.
 */
export function roiPercent(list: Coupon[]): number {
  const stakesAll = sumStakesAll(list);
  if (stakesAll <= 0) return 0;
  const profit = sumWinnings(list) - stakesAll;
  return (profit / stakesAll) * 100;
}

export function winRatePercent(list: Coupon[]): number {
  const settled = list.filter((c) => c.status === 'WYGRANY' || c.status === 'PRZEGRANY');
  const wins = settled.filter((c) => c.status === 'WYGRANY').length;
  const losses = settled.filter((c) => c.status === 'PRZEGRANY').length;
  const denom = wins + losses;
  if (denom === 0) return 0;
  return (wins / denom) * 100;
}

export type ChartPoint = { label: string; value: number };

export function formatDayMonthLabel(d: Date): string {
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  return `${dd}.${mm}`;
}

const MONTH_LABELS_PL = [
  'Sty',
  'Lut',
  'Mar',
  'Kwi',
  'Maj',
  'Cze',
  'Lip',
  'Sie',
  'Wrz',
  'Paź',
  'Lis',
  'Gru',
];

export function cumulativeProfitSeries(
  coupons: Coupon[],
  range: TimeRange
): ChartPoint[] {
  const now = new Date();
  const todayEnd = new Date(now);
  todayEnd.setHours(23, 59, 59, 999);

  if (range === 'week') {
    const start = new Date(now);
    start.setDate(start.getDate() - 6);
    start.setHours(0, 0, 0, 0);

    const inWindow = coupons.filter((c) => {
      const t = new Date(c.dataDodania);
      return t >= start && t <= todayEnd;
    });

    const points: ChartPoint[] = [];
    let cum = 0;
    for (let i = 0; i < 7; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      const dayStart = new Date(d);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(d);
      dayEnd.setHours(23, 59, 59, 999);
      const inDay = inWindow.filter((c) => {
        const t = new Date(c.dataDodania);
        return t >= dayStart && t <= dayEnd;
      });
      cum += netForCoupons(inDay);
      points.push({
        label: formatDayMonthLabel(d),
        value: Math.round(cum * 100) / 100,
      });
    }
    return points;
  }

  if (range === 'month') {
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
    const inWindow = coupons.filter((c) => {
      const t = new Date(c.dataDodania);
      return t >= monthStart && t <= todayEnd;
    });

    const points: ChartPoint[] = [];
    let cum = 0;
    const cursor = new Date(monthStart);
    while (cursor <= todayEnd) {
      const dayStart = new Date(cursor);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(cursor);
      dayEnd.setHours(23, 59, 59, 999);
      const inDay = inWindow.filter((c) => {
        const t = new Date(c.dataDodania);
        return t >= dayStart && t <= dayEnd;
      });
      cum += netForCoupons(inDay);
      points.push({
        label: formatDayMonthLabel(cursor),
        value: Math.round(cum * 100) / 100,
      });
      cursor.setDate(cursor.getDate() + 1);
    }
    return points;
  }

  const year = now.getFullYear();
  const inYear = coupons.filter((c) => new Date(c.dataDodania).getFullYear() === year);

  const points: ChartPoint[] = [];
  let cum = 0;
  for (let m = 0; m < 12; m++) {
    const ms = new Date(year, m, 1, 0, 0, 0, 0);
    const me = new Date(year, m + 1, 0, 23, 59, 59, 999);
    const inMonth = inYear.filter((c) => {
      const t = new Date(c.dataDodania);
      return t >= ms && t <= me;
    });
    cum += netForCoupons(inMonth);
    points.push({
      label: MONTH_LABELS_PL[m],
      value: Math.round(cum * 100) / 100,
    });
  }
  return points;
}

// Netto w kawałku czasu — używane do skumulowanego wykresu.
function netForCoupons(slice: Coupon[]): number {
  const stakes = sumStakes(slice);
  const wins = slice
    .filter((c) => c.status === 'WYGRANY')
    .reduce((s, c) => s + c.potencjalnaWygrana, 0);
  return wins - stakes;
}
