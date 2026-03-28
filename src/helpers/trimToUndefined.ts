/**
 * Trims whitespace from a string and returns `undefined` if the result is empty.
 *
 * @example
 * ```ts
 * trimToUndefined('  hello  '); // => 'hello'
 * trimToUndefined('   ');       // => undefined
 * trimToUndefined(undefined);   // => undefined
 * ```
 */
export function trimToUndefined(value: string | undefined): string | undefined {
  if (!value) {
    return undefined;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}
