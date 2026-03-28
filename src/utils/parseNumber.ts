export function parseNumberInput(raw: string): number {
  const n = parseFloat(raw.replace(',', '.').trim()); // PL często wpisuje przecinek
  return Number.isFinite(n) ? n : NaN;
}
