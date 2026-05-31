export const MONEY_SCALE_OPTIONS = [
  { group: 'Nepali Scale', options: [
    { value: 'HAZAR',  label: 'Hazar (हजार) — 1,000' },
    { value: 'LAKH',   label: 'Lakh (लाख) — 1,00,000' },
    { value: 'CRORE',  label: 'Crore (करोड) — 1,00,00,000' },
    { value: 'ARAB',   label: 'Arab (अरब) — 1,00,00,00,000' },
    { value: 'KHARAB', label: 'Kharab (खरब) — 1,00,00,00,00,000' },
  ]},
  { group: 'English Scale', options: [
    { value: 'THOUSAND', label: 'Thousand — 1,000' },
    { value: 'MILLION',  label: 'Million — 1,000,000' },
    { value: 'BILLION',  label: 'Billion — 1,000,000,000' },
    { value: 'TRILLION', label: 'Trillion — 1,000,000,000,000' },
  ]},
];

const SCALES: Record<string, { divisor: number; suffix: string; label: string }> = {
  HAZAR:    { divisor: 1_000,               suffix: 'K',  label: 'Hazar' },
  LAKH:     { divisor: 100_000,             suffix: 'L',  label: 'Lakh' },
  CRORE:    { divisor: 10_000_000,          suffix: 'Cr', label: 'Crore' },
  ARAB:     { divisor: 1_000_000_000,       suffix: 'Ar', label: 'Arab' },
  KHARAB:   { divisor: 100_000_000_000,     suffix: 'Kb', label: 'Kharab' },
  THOUSAND: { divisor: 1_000,               suffix: 'K',  label: 'Thousand' },
  MILLION:  { divisor: 1_000_000,           suffix: 'M',  label: 'Million' },
  BILLION:  { divisor: 1_000_000_000,       suffix: 'B',  label: 'Billion' },
  TRILLION: { divisor: 1_000_000_000_000,   suffix: 'T',  label: 'Trillion' },
};

export function formatMoney(
  value: number,
  scale: string,
  currencySymbol = '',
  decimals = 2,
): string {
  const s = SCALES[scale] ?? SCALES.CRORE;
  const formatted = (value / s.divisor).toFixed(decimals);
  return `${currencySymbol}${formatted} ${s.suffix}`;
}

export function getScaleLabel(scale: string): string {
  return SCALES[scale]?.label ?? scale;
}

export function getScaleSuffix(scale: string): string {
  return SCALES[scale]?.suffix ?? '';
}
