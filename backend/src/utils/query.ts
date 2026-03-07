export function toNumber(
  value: unknown,
  defaultValue: number | null = null,
  opts?: { min?: number; max?: number }
): number | null {
  if (value === undefined || value === null || value === '') return defaultValue;
  const num = Number(value);
  if (!Number.isFinite(num)) return defaultValue;
  if (opts?.min !== undefined && num < opts.min) return opts.min;
  if (opts?.max !== undefined && num > opts.max) return opts.max;
  return num;
}

export function toBoolean(
  value: unknown,
  defaultValue: boolean | null = null
): boolean | null {
  if (value === undefined || value === null || value === '') return defaultValue;
  if (typeof value === 'boolean') return value;
  const str = String(value).toLowerCase();
  if (['1', 'true', 'yes', 'on'].includes(str)) return true;
  if (['0', 'false', 'no', 'off'].includes(str)) return false;
  return defaultValue;
}

export function toString(value: unknown, defaultValue: string | null = null): string | null {
  if (value === undefined || value === null) return defaultValue;
  const str = String(value).trim();
  return str === '' ? defaultValue : str;
}

