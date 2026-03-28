/**
 * Clamps a numeric value to an integer within the given `[min, max]` range.
 *
 * Returns `fallback` when the input is not a finite number.
 *
 * @example
 * ```ts
 * toBoundedInt(7.9, 5, 1, 10);  // => 7
 * toBoundedInt(undefined, 5, 1, 10); // => 5
 * toBoundedInt(100, 5, 1, 10);  // => 10
 * ```
 */
export function toBoundedInt(
  value: number | undefined,
  fallback: number,
  min: number,
  max: number
): number {
  if (!Number.isFinite(value)) {
    return fallback;
  }
  const rounded = Math.floor(value as number);
  if (rounded < min) {
    return min;
  }
  if (rounded > max) {
    return max;
  }
  return rounded;
}
