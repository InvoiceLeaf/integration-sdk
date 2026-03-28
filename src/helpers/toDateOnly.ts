/**
 * Converts a date string to `YYYY-MM-DD` format, or returns `undefined` if invalid.
 *
 * @example
 * ```ts
 * toDateOnly('2024-03-15T10:30:00Z'); // => '2024-03-15'
 * toDateOnly('not-a-date');           // => undefined
 * toDateOnly(undefined);              // => undefined
 * ```
 */
export function toDateOnly(value: string | undefined): string | undefined {
  if (!value) {
    return undefined;
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return undefined;
  }
  return date.toISOString().slice(0, 10);
}

/**
 * Converts a Unix timestamp (milliseconds) to `YYYY-MM-DD` format, or returns `undefined` if invalid.
 *
 * @example
 * ```ts
 * toDateOnlyFromTimestamp(1710489600000); // => '2024-03-15'
 * toDateOnlyFromTimestamp(undefined);     // => undefined
 * ```
 */
export function toDateOnlyFromTimestamp(value: number | undefined): string | undefined {
  if (!Number.isFinite(value)) {
    return undefined;
  }
  const date = new Date(value as number);
  if (Number.isNaN(date.getTime())) {
    return undefined;
  }
  return date.toISOString().slice(0, 10);
}
