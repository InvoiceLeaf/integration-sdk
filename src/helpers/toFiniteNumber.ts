/**
 * Returns the value if it is a finite number, otherwise returns the fallback.
 *
 * @example
 * ```ts
 * toFiniteNumber(42, 0);        // => 42
 * toFiniteNumber(undefined, 0); // => 0
 * toFiniteNumber(NaN, 0);       // => 0
 * ```
 */
export function toFiniteNumber(value: number | undefined, fallback: number): number {
  if (Number.isFinite(value)) {
    return value as number;
  }
  return fallback;
}
