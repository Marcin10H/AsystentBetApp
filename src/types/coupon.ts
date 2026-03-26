/**
 * Status kuponu po rozliczeniu u bukmachera.
 * W_GRZE — zakład jeszcze nie rozliczony.
 */
export type CouponStatus = 'W_GRZE' | 'WYGRANY' | 'PRZEGRANY';

/** Pojedynczy kupon bukmacherski zapisany lokalnie w aplikacji. */
export interface Coupon {
  id: string;
  nazwaBukmachera: string;
  stawka: number;
  kurs: number;
  potencjalnaWygrana: number;
  dataDodania: string;
  status: CouponStatus;
}
