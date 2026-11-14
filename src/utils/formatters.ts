import { Language } from '../types/os';

const BANGLA_DIGITS = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];

const EN_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const BN_MONTHS = [
  'জানু',
  'ফেব্রু',
  'মার্চ',
  'এপ্রিল',
  'মে',
  'জুন',
  'জুলাই',
  'আগস্ট',
  'সেপ্টে',
  'অক্টো',
  'নভে',
  'ডিসে',
];

export function toBanglaDigits(value: string | number): string {
  return String(value).replace(/\d/g, (d) => BANGLA_DIGITS[Number(d)]);
}

export function formatNumberForLocale(value: string | number, language: Language): string {
  return language === 'bn' ? toBanglaDigits(value) : String(value);
}

/**
 * Formats ISO date strings (e.g. "2026-11-12") into "12 Nov 2026" (or Bangla equivalent).
 */
export function formatEditorialDate(isoDate: string, language: Language): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(isoDate.trim());
  if (!match) {
    return formatNumberForLocale(isoDate, language);
  }
  const year = match[1];
  const monthIdx = Math.max(0, Math.min(11, parseInt(match[2], 10) - 1));
  const day = parseInt(match[3], 10);

  if (language === 'bn') {
    return `${toBanglaDigits(day)} ${BN_MONTHS[monthIdx]} ${toBanglaDigits(year)}`;
  }
  return `${day} ${EN_MONTHS[monthIdx]} ${year}`;
}
