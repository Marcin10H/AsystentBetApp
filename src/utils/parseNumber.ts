/** Parsuje liczbę z pola tekstowego (przecinek lub kropka jako separator). */
export function parseNumberInput(raw: string): number {
  const n = parseFloat(raw.replace(',', '.').trim());
  return Number.isFinite(n) ? n : NaN;
}
