/**
 * Converts an unknown error value into a human-readable string.
 *
 * For `Error` instances, returns `.message`. For anything else, falls back to `String(error)`.
 *
 * @example
 * ```ts
 * toErrorMessage(new Error('boom'));   // => 'boom'
 * toErrorMessage('string error');      // => 'string error'
 * toErrorMessage(42);                  // => '42'
 * ```
 */
export function toErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
}
