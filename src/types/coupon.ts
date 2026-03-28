export type CouponStatus = 'W_GRZE' | 'WYGRANY' | 'PRZEGRANY';

export interface Coupon {
  id: string;
  nazwaBukmachera: string;
  stawka: number;
  kurs: number;
  potencjalnaWygrana: number;
  dataDodania: string;
  status: CouponStatus;
  freebet?: boolean; // jeśli true, stawka nie idzie do bilansu
}
