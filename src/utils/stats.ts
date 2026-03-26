import type { Coupon } from '../types/coupon';
import {
  filterCouponsByTimeRange,
  type TimeRange,
} from './dateRange';

/** Kupony w danym zakresie czasu (po dataDodania). */
export function couponsInRange(coupons: Coupon[], range: TimeRange): Coupon[] {
  return filterCouponsByTimeRange(coupons, range);
}

/** Suma wszystkich stawek w zbiorze kuponów. */
export function sumStakes(list: Coupon[]): number {
  return list.reduce((s, c) => s + (Number.isFinite(c.stawka) ? c.stawka : 0), 0);
}

/**
 * Suma „wygranych” — dla statusu WYGRANY traktujemy potencjalnaWygrana
 * jako faktyczną wypłatę po rozliczeniu.
 */
export function sumWinnings(list: Coupon[]): number {
  return list
    .filter((c) => c.status === 'WYGRANY')
    .reduce((s, c) => s + (Number.isFinite(c.potencjalnaWygrana) ? c.potencjalnaWygrana : 0), 0);
}

/** Bilans: wpływy z wygranych minus łączna suma stawek (ten sam zbiór kuponów). */
export function totalBalance(list: Coupon[]): number {
  return sumWinnings(list) - sumStakes(list);
}

/**
 * ROI w %: (bilans / suma stawek) * 100.
 * Przy braku stawek zwracamy 0, żeby uniknąć dzielenia przez zero.
 */
export function roiPercent(list: Coupon[]): number {
  const stakes = sumStakes(list);
  if (stakes <= 0) return 0;
  return (totalBalance(list) / stakes) * 100;
}

/** Skuteczność: wygrane / (wygrane + przegrane), bez W_GRZE. Wynik 0–100 %. */
export function winRatePercent(list: Coupon[]): number {
  const settled = list.filter((c) => c.status === 'WYGRANY' || c.status === 'PRZEGRANY');
  const wins = settled.filter((c) => c.status === 'WYGRANY').length;
  const losses = settled.filter((c) => c.status === 'PRZEGRANY').length;
  const denom = wins + losses;
  if (denom === 0) return 0;
  return (wins / denom) * 100;
}

export type ChartPoint = { label: string; value: number };

/** Etykieta dnia na oś X: zawsze DD.MM (np. 01.03, 24.03). */
export function formatDayMonthLabel(d: Date): string {
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  return `${dd}.${mm}`;
}

/** Skrócone nazwy miesięcy na oś X (rok). */
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

/**
 * Seria pod wykres zysku/straty — zależnie od filtra czasu:
 * - tydzień: zawsze 7 punktów (dziś − 6 … dziś), skumulowanie dzienne
 * - miesiąc: od 1. dnia miesiąca do dziś, dzień po dniu, skumulowanie
 * - rok: zawsze 12 punktów (Sty…Gru), skumulowany bilans po miesiącach
 */
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

  /* Rok: 12 punktów (Sty…Gru), skumulowany bilans w obrębie każdego miesiąca. */
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

/** Dzienny / miesięczny netto: wygrane (WYGRANY) minus wszystkie stawki w tym okresie. */
function netForCoupons(slice: Coupon[]): number {
  const stakes = sumStakes(slice);
  const wins = slice
    .filter((c) => c.status === 'WYGRANY')
    .reduce((s, c) => s + c.potencjalnaWygrana, 0);
  return wins - stakes;
}
