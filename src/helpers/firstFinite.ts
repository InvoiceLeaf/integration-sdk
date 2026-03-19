/**
 * Returns the first finite number from the provided values, or `undefined` if none are finite.
 *
 * Useful for picking the best available numeric value from multiple optional sources
 * (e.g. totalAmount, netAmount, amountDue).
 *
 * @example
 * ```ts
 * firstFinite(item.totalAmount, item.netAmount, 0); // => first finite value
 * ```
 */
export function firstFinite(...values: Array<number | undefined>): number | undefined {
  for (const value of values) {
    if (Number.isFinite(value)) {
      return value as number;
    }
  }
  return undefined;
}
